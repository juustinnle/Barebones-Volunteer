const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

let users = [];
let events = [];
let notifications = [];

// Registration endpoint
app.post('/register', [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const userExists = users.some(user => user.email === email);
  if (userExists) {
    return res.status(400).send('User already exists.');
  }

  users.push({ email, password, profile: {}, volunteerHistory: [] });
  res.status(201).send('User registered successfully.');
});

// Login endpoint
app.post('/login', [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const user = users.find(user => user.email === email && user.password === password);
  if (!user) {
    return res.status(401).send('Invalid email or password.');
  }

  res.status(200).send('Login successful.');
});

// Get user profile endpoint
app.get('/profile/:email', (req, res) => {
  const { email } = req.params;
  const user = users.find(user => user.email === email);
  if (!user) {
    return res.status(404).send('User not found.');
  }
  res.status(200).json(user.profile);
});

// Update user profile endpoint
app.put('/profile/:email', [
  body('profile.fullName').isLength({ max: 50 }).withMessage('Full Name must be less than 50 characters long.'),
  body('profile.address1').isLength({ max: 100 }).withMessage('Address 1 must be less than 100 characters long.'),
  body('profile.address2').optional().isLength({ max: 100 }).withMessage('Address 2 must be less than 100 characters long.'),
  body('profile.city').isLength({ max: 100 }).withMessage('City must be less than 100 characters long.'),
  body('profile.state').isLength({ min: 2, max: 2 }).withMessage('State must be a 2-letter code.'),
  body('profile.zip').isLength({ min: 5, max: 9 }).withMessage('Zip Code must be between 5 and 9 characters long.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.params;
  const { profile } = req.body;
  const userIndex = users.findIndex(user => user.email === email);
  if (userIndex === -1) {
    return res.status(404).send('User not found.');
  }
  users[userIndex].profile = profile;
  res.status(200).send('Profile updated successfully.');
});

// Create event endpoint
app.post('/events', [
  body('name').notEmpty().withMessage('Event name is required.'),
  body('description').notEmpty().withMessage('Event description is required.'),
  body('location').notEmpty().withMessage('Event location is required.'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one required skill is required.'),
  body('urgency').notEmpty().withMessage('Event urgency is required.'),
  body('eventDates').isArray({ min: 1 }).withMessage('At least one event date is required.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, location, requiredSkills, urgency, eventDates } = req.body;
  const newEvent = {
    id: `${Date.now()}`, // Ensure the event has an ID
    name,
    description,
    location,
    requiredSkills,
    urgency,
    eventDates
  };
  events.push(newEvent);

  users.forEach(user => {
    notifications.push({
      email: user.email,
      message: `New event: ${name}`
    });
  });

  res.status(201).json(newEvent); // Return the new event, including its ID
});

// Get all events endpoint
app.get('/events', (req, res) => {
  res.status(200).json(events);
});

// Delete event endpoint
app.delete('/events/:id', (req, res) => {
  console.log('Delete event request received:', req.params.id); // Log the request
  const { id } = req.params;
  const eventIndex = events.findIndex(event => event.id === id);

  if (eventIndex === -1) {
    return res.status(404).send('Event not found.');
  }

  events.splice(eventIndex, 1);
  res.status(200).send('Event deleted successfully.');
});

// Create notification endpoint
app.post('/notifications', [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('message').notEmpty().withMessage('Notification message is required.')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, message } = req.body;
  notifications.push({ email, message });
  res.status(201).send('Notification created successfully.');
});

// Get notifications for a user endpoint
app.get('/notifications/:email', (req, res) => {
  const { email } = req.params;
  const userNotifications = notifications.filter(notification => notification.email === email);
  res.status(200).json(userNotifications);
});

// Get all users endpoint
app.get('/users', (req, res) => {
  res.status(200).json(users);
});

// Delete notification endpoint
app.delete('/notifications/:email/:message', (req, res) => {
  const { email, message } = req.params;
  const notificationIndex = notifications.findIndex(notification => notification.email === email && notification.message === message);

  if (notificationIndex === -1) {
    return res.status(404).send('Notification not found.');
  }

  notifications.splice(notificationIndex, 1);
  res.status(200).send('Notification deleted successfully.');
});

// Get matching events for a user
app.get('/matching-events/:email', (req, res) => {
  const { email } = req.params;
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).send('User not found.');
  }

  const userSkills = user.profile.skills || [];
  const userAvailability = user.profile.availability || [];

  const isDateOverlap = (startDate1, endDate1, startDate2, endDate2) => {
    return (startDate1 <= endDate2) && (startDate2 <= endDate1);
  };

  const matchingEvents = events.filter(event => {
    const eventDates = event.eventDates.map(dates => dates.split(' to '));
    return event.requiredSkills.some(skill => userSkills.includes(skill)) &&
           eventDates.some(([eventStart, eventEnd]) => {
             return userAvailability.some(dateRange => {
               const [availStart, availEnd] = dateRange.split(' to ');
               return isDateOverlap(new Date(eventStart), new Date(eventEnd), new Date(availStart), new Date(availEnd));
             });
           });
  });

  res.status(200).json(matchingEvents);
});

// Match volunteer to an event endpoint
app.post('/match-volunteer', [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('eventId').notEmpty().withMessage('Event ID is required.')
], (req, res) => {
  console.log('Match volunteer request received:', req.body); // Log the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, eventId } = req.body;
  const user = users.find(user => user.email === email);
  const event = events.find(event => event.id === eventId);

  if (!user) {
    return res.status(404).send('User not found.');
  }
  if (!event) {
    return res.status(404).send('Event not found.');
  }

  const alreadyMatched = user.volunteerHistory.some(history => history.eventId === eventId);
  if (alreadyMatched) {
    return res.status(400).send('Volunteer already matched to this event.');
  }

  user.volunteerHistory.push({
    eventId: event.id,
    eventName: event.name,
    eventDescription: event.description,
    location: event.location,
    requiredSkills: event.requiredSkills,
    urgency: event.urgency,
    dates: event.eventDates,
    status: 'Registered'
  });

  notifications.push({
    email: user.email,
    message: `You have been matched to the event: ${event.name}`
  });

  res.status(200).send('Volunteer matched to event successfully.');
});

// Get volunteer history endpoint
app.get('/history/:email', (req, res) => {
  const { email } = req.params;
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.status(404).send('User not found.');
  }

  res.status(200).json(user.volunteerHistory);
});

// Test endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server only if this script is run directly (not imported)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

module.exports = app; // Export the app for testing
