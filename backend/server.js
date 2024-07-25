const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Create a connection to the database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password12345',
    database: 'VolunteerManagement'
});

// Connect to the database
db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

app.use((req, res, next) => {
    req.user = req.headers['x-user-email'];
    next();
});

// Registration endpoint
app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            res.status(500).send('Server error.');
        } else {
            const query = 'INSERT INTO UserCredentials (email, password) VALUES (?, ?)';
            db.query(query, [email, hash], (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        res.status(400).send('User already exists.');
                    } else {
                        res.status(500).send('Server error.');
                    }
                } else {
                    res.status(201).send('User registered successfully.');
                }
            });
        }
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT password FROM UserCredentials WHERE email = ?';

    db.query(query, [email], (err, results) => {
        if (err) {
            res.status(500).send('Server error.');
        } else if (results.length === 0) {
            res.status(401).send('Invalid email or password.');
        } else {
            const hashedPassword = results[0].password;
            bcrypt.compare(password, hashedPassword, (err, result) => {
                if (result) {
                    res.status(200).send('Login successful.');
                } else {
                    res.status(401).send('Invalid email or password.');
                }
            });
        }
    });
});

// Get user profile endpoint
app.get('/profile/:email', (req, res) => {
    const { email } = req.params;
    const query = 'SELECT * FROM UserProfile WHERE user_id = (SELECT id FROM UserCredentials WHERE email = ?)';

    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching profile:', err);
            res.status(500).send('Server error.');
        } else if (results.length === 0) {
            res.status(404).send('User not found.');
        } else {
            const profile = {
                user_id: results[0].user_id,
                full_name: results[0].full_name,
                address: results[0].address,
                address2: results[0].address2,
                city: results[0].city,
                state: results[0].state,
                zipcode: results[0].zipcode,
                skills: results[0].skills,
                preferences: results[0].preferences,
                availability_start: results[0].availability_start,
                availability_end: results[0].availability_end
            };
            res.status(200).json(profile);
        }
    });
});

// Update user profile endpoint
app.put('/profile/:email', (req, res) => {
    const { email } = req.params;
    const profile = req.body;

    const checkQuery = 'SELECT * FROM UserProfile WHERE user_id = (SELECT id FROM UserCredentials WHERE email = ?)';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking profile:', err);
            res.status(500).send('Server error.');
        } else if (results.length === 0) {
            const insertQuery = `
                INSERT INTO UserProfile (user_id, full_name, address, address2, city, state, zipcode, skills, preferences, availability_start, availability_end)
                VALUES ((SELECT id FROM UserCredentials WHERE email = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(insertQuery, [email, profile.full_name, profile.address, profile.address2, profile.city, profile.state, profile.zipcode, profile.skills, profile.preferences, profile.availability_start, profile.availability_end], (err, results) => {
                if (err) {
                    console.error('Error inserting profile:', err);
                    res.status(500).send('Server error.');
                } else {
                    res.status(201).send('Profile created successfully.');
                }
            });
        } else {
            const updateQuery = `
                UPDATE UserProfile
                SET full_name = ?, address = ?, address2 = ?, city = ?, state = ?, zipcode = ?, skills = ?, preferences = ?, availability_start = ?, availability_end = ?
                WHERE user_id = (SELECT id FROM UserCredentials WHERE email = ?)
            `;
            db.query(updateQuery, [profile.full_name, profile.address, profile.address2, profile.city, profile.state, profile.zipcode, profile.skills, profile.preferences, profile.availability_start, profile.availability_end, email], (err, results) => {
                if (err) {
                    console.error('Error updating profile:', err);
                    res.status(500).send('Server error.');
                } else {
                    res.status(200).send('Profile updated successfully.');
                }
            });
        }
    });
});

// Get all user logins endpoint
app.get('/logins', (req, res) => {
    const query = 'SELECT email FROM UserCredentials';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching user logins:', err);
            res.status(500).send('Server error.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Get all users endpoint
app.get('/users', (req, res) => {
    const query = 'SELECT email FROM UserCredentials';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).send('Server error.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Create an event endpoint
app.post('/events', (req, res) => {
    const { name, description, location, requiredSkills, urgency, eventDates } = req.body;
    const [event_start_date, event_end_date] = eventDates[0].split(' to ');

    console.log('Event creation request body:', req.body);

    const query = `INSERT INTO EventDetails (event_name, description, location, required_skills, urgency, event_start_date, event_end_date)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [name, description, location, requiredSkills.join(','), urgency, event_start_date, event_end_date], (err, results) => {
        if (err) {
            console.error('Error inserting event:', err);
            res.status(500).send('Server error.');
        } else {
            // Create a notification for the event with a blank email
            const notificationQuery = `INSERT INTO Notifications (email, message) VALUES (?, ?)`;
            const message = `A new event "${name}" has been created.`;
            db.query(notificationQuery, ['', message], (err, results) => {
                if (err) {
                    console.error('Error creating notification:', err);
                    res.status(500).send('Server error.');
                } else {
                    res.status(200).send('Event created successfully.');
                }
            });
        }
    });
});

// Get all events endpoint
app.get('/events', (req, res) => {
    const query = 'SELECT * FROM EventDetails';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching events:', err);
            res.status(500).send('Server error.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Endpoint to delete an event
app.delete('/events/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM EventDetails WHERE event_id = ?';
    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting event:', err);
            res.status(500).send('Server error.');
        } else {
            res.status(200).send('Event deleted successfully.');
        }
    });
});

// Match volunteer to event endpoint
app.post('/match-volunteer', (req, res) => {
    const { email, eventId } = req.body;
    const query = `
        INSERT INTO VolunteerHistory (user_id, event_id)
        VALUES ((SELECT id FROM UserCredentials WHERE email = ?), ?)
    `;
    db.query(query, [email, eventId], (err, results) => {
        if (err) {
            console.error('Error matching volunteer:', err);
            res.status(500).send('Server error.');
        } else {
            res.status(201).send('Volunteer matched successfully.');
        }
    });
});

// Endpoint to fetch volunteer history
app.get('/history/:email', (req, res) => {
    const { email } = req.params;
    const query = `
        SELECT e.event_name, e.description AS eventDescription, e.location, e.required_skills AS requiredSkills,
               e.urgency, e.event_start_date, e.event_end_date, v.status
        FROM VolunteerHistory v
        JOIN EventDetails e ON v.event_id = e.event_id
        WHERE v.email = ?;
    `;
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching volunteer history:', err);
            res.status(500).send('Server error.');
        } else {
            res.status(200).json(results);
        }
    });
});

// Fetch unread notifications for a user
app.get('/notifications/:email', (req, res) => {
    const { email } = req.params;
    const queryGetUserId = 'SELECT id FROM UserCredentials WHERE email = ?';
    const queryGetUnreadNotifications = `
        SELECT n.* FROM Notifications n
        LEFT JOIN UserNotifications un ON n.id = un.notification_id AND un.user_id = ?
        WHERE un.is_read IS NULL OR un.is_read = FALSE;
    `;

    db.query(queryGetUserId, [email], (err, userResults) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            res.status(500).send('Server error.');
        } else if (userResults.length === 0) {
            console.log('User not found for email:', email);
            res.status(404).send('User not found.');
        } else {
            const userId = userResults[0].id;
            db.query(queryGetUnreadNotifications, [userId], (err, results) => {
                if (err) {
                    console.error('Error fetching notifications:', err);
                    res.status(500).send('Server error.');
                } else {
                    res.status(200).json(results);
                }
            });
        }
    });
});

// Mark notification as read
app.put('/notifications/:email/:id', (req, res) => {
    const { email, id } = req.params;
    const queryGetUserId = 'SELECT id FROM UserCredentials WHERE email = ?';
    const queryMarkAsRead = `
        INSERT INTO UserNotifications (user_id, notification_id, is_read)
        VALUES ((SELECT id FROM UserCredentials WHERE email = ?), ?, TRUE)
        ON DUPLICATE KEY UPDATE is_read = TRUE;
    `;

    db.query(queryGetUserId, [email], (err, userResults) => {
        if (err) {
            console.error('Error fetching user ID:', err);
            res.status(500).send('Server error.');
        } else if (userResults.length === 0) {
            console.log('User not found for email:', email);
            res.status(404).send('User not found.');
        } else {
            const userId = userResults[0].id;
            db.query(queryMarkAsRead, [email, id], (err, results) => {
                if (err) {
                    console.error('Error marking notification as read:', err);
                    res.status(500).send('Server error.');
                } else {
                    res.status(200).send('Notification marked as read.');
                }
            });
        }
    });
});

app.get('/matching-events/:email', (req, res) => {
    const { email } = req.params;

    const queryGetUserProfile = `
        SELECT skills, availability_start, availability_end
        FROM UserProfile
        WHERE user_id = (SELECT id FROM UserCredentials WHERE email = ?)
    `;

    db.query(queryGetUserProfile, [email], (err, userProfileResults) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            res.status(500).send('Server error.');
        } else if (userProfileResults.length === 0) {
            res.status(404).send('User profile not found.');
        } else {
            const userSkills = userProfileResults[0].skills.split(',');
            const userAvailabilityStart = new Date(userProfileResults[0].availability_start);
            const userAvailabilityEnd = new Date(userProfileResults[0].availability_end);

            const queryGetMatchingEvents = `
                SELECT e.*
                FROM EventDetails e
                WHERE e.event_start_date <= ? AND e.event_end_date >= ?
                AND EXISTS (
                    SELECT 1
                    FROM (
                        SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(e.required_skills, ',', numbers.n), ',', -1)) AS skill
                        FROM
                        (SELECT 1 n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) numbers
                        WHERE numbers.n <= LENGTH(e.required_skills) - LENGTH(REPLACE(e.required_skills, ',', '')) + 1
                    ) AS eventSkills
                    WHERE eventSkills.skill IN (?)
                )
            `;

            db.query(queryGetMatchingEvents, [userAvailabilityEnd, userAvailabilityStart, userSkills], (err, eventResults) => {
                if (err) {
                    console.error('Error fetching matching events:', err);
                    res.status(500).send('Server error.');
                } else {
                    res.status(200).json(eventResults);
                }
            });
        }
    });
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
