document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.querySelector('.dropdown-content');
  
    dropdown.addEventListener('click', function(event) {
      event.preventDefault();
      dropdownContent.classList.toggle('show');
    });
  
    window.onclick = function(event) {
      if (!event.target.matches('.dropbtn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
          const openDropdown = dropdowns[i];
          if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
          }
        }
      }
    };
  
    const skillsSelect = document.getElementById('skills');
    const selectedSkillsContainer = document.getElementById('selected-skills');
    skillsSelect.addEventListener('change', function() {
      const selectedSkill = skillsSelect.options[skillsSelect.selectedIndex].text;
      const skillButton = document.createElement('button');
      skillButton.textContent = selectedSkill;
      skillButton.classList.add('skill-button');
      skillButton.addEventListener('click', function() {
        selectedSkillsContainer.removeChild(skillButton);
      });
      selectedSkillsContainer.appendChild(skillButton);
    });
  
    const requiredSkillsSelect = document.getElementById('required-skills');
    const selectedRequiredSkillsContainer = document.getElementById('selected-required-skills');
    requiredSkillsSelect.addEventListener('change', function() {
      const selectedSkill = requiredSkillsSelect.options[requiredSkillsSelect.selectedIndex].text;
      const skillButton = document.createElement('button');
      skillButton.textContent = selectedSkill;
      skillButton.classList.add('skill-button');
      skillButton.addEventListener('click', function() {
        selectedRequiredSkillsContainer.removeChild(skillButton);
      });
      selectedRequiredSkillsContainer.appendChild(skillButton);
    });
  
    const addAvailabilityButton = document.getElementById('add-availability');
    const availabilityStartInput = document.getElementById('availability-start');
    const availabilityEndInput = document.getElementById('availability-end');
    const selectedDatesContainer = document.getElementById('selected-dates');
  
    function isDateRangeOverlap(startDate1, endDate1, startDate2, endDate2) {
      return (startDate1 <= endDate2) && (startDate2 <= endDate1);
    }
  
    function isDateRangeDuplicate(startDate, endDate, dateRanges) {
      return dateRanges.some(range => {
        const [existingStartDate, existingEndDate] = range.split(' to ').map(date => new Date(date));
        return (new Date(startDate).getTime() === existingStartDate.getTime() && new Date(endDate).getTime() === existingEndDate.getTime());
      });
    }
  
    addAvailabilityButton.addEventListener('click', function() {
      const startDate = availabilityStartInput.value;
      const endDate = availabilityEndInput.value;
      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          alert('End date cannot be before start date.');
        } else {
          const dateRanges = Array.from(selectedDatesContainer.children).map(button => button.textContent);
          if (isDateRangeDuplicate(startDate, endDate, dateRanges)) {
            alert('This date range is already selected.');
          } else if (dateRanges.some(range => {
            const [existingStartDate, existingEndDate] = range.split(' to ').map(date => new Date(date));
            return isDateRangeOverlap(new Date(startDate), new Date(endDate), existingStartDate, existingEndDate);
          })) {
            alert('This date range overlaps with an existing range.');
          } else {
            const dateRange = `${startDate} to ${endDate}`;
            const dateButton = document.createElement('button');
            dateButton.textContent = dateRange;
            dateButton.classList.add('date-button');
            dateButton.addEventListener('click', function() {
              selectedDatesContainer.removeChild(dateButton);
            });
            selectedDatesContainer.appendChild(dateButton);
            availabilityStartInput.value = '';
            availabilityEndInput.value = '';
          }
        }
      } else {
        alert('Please select both start and end dates.');
      }
    });
  
    const addEventDateButton = document.getElementById('add-event-date');
    const eventStartDateInput = document.getElementById('event-start-date');
    const eventEndDateInput = document.getElementById('event-end-date');
    const selectedEventDatesContainer = document.getElementById('selected-event-dates');
  
    addEventDateButton.addEventListener('click', function() {
      const startDate = eventStartDateInput.value;
      const endDate = eventEndDateInput.value;
      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          alert('End date cannot be before start date.');
        } else {
          const dateRanges = Array.from(selectedEventDatesContainer.children).map(button => button.textContent);
          if (isDateRangeDuplicate(startDate, endDate, dateRanges)) {
            alert('This date range is already selected.');
          } else if (dateRanges.some(range => {
            const [existingStartDate, existingEndDate] = range.split(' to ').map(date => new Date(date));
            return isDateRangeOverlap(new Date(startDate), new Date(endDate), existingStartDate, existingEndDate);
          })) {
            alert('This date range overlaps with an existing range.');
          } else {
            const dateRange = `${startDate} to ${endDate}`;
            const dateButton = document.createElement('button');
            dateButton.textContent = dateRange;
            dateButton.classList.add('date-button');
            dateButton.addEventListener('click', function() {
              selectedEventDatesContainer.removeChild(dateButton);
            });
            selectedEventDatesContainer.appendChild(dateButton);
            eventStartDateInput.value = '';
            eventEndDateInput.value = '';
          }
        }
      } else {
        alert('Please select both start and end dates.');
      }
    });
  
    window.showSection = function(sectionId) {
      const sections = document.querySelectorAll('.content-section');
      sections.forEach(section => {
        section.style.display = 'none';
      });
      document.getElementById(sectionId).style.display = 'block';
    };
  
    showSection('login');
  
    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
  
      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        location.reload(); // Refresh the page
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
  
      fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        if (data === "Login successful.") {
          localStorage.setItem('email', email);
          showSection('profile');
          fetchProfile(email);
          fetchNotifications(email);
          fetchVolunteerHistory(email); // Add this line to fetch volunteer history
          fetchEvents(); // Fetch events after login
          fetchAdminEvents(); // Fetch admin events after login
          location.reload(); // Refresh the page
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    function formatDate(dateString) {
      const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      return new Date(dateString).toLocaleDateString('en-CA', options);
    }
  
    function fetchProfile(email) {
      fetch(`http://localhost:3000/profile/${email}`)
      .then(response => response.json())
      .then(profile => {
        document.getElementById('full-name').value = profile.full_name || '';
        document.getElementById('address-1').value = profile.address || '';
        document.getElementById('address-2').value = profile.address2 || '';
        document.getElementById('city').value = profile.city || '';
        document.getElementById('state').value = profile.state || '';
        document.getElementById('zip').value = profile.zipcode || '';
        document.getElementById('preferences').value = profile.preferences || '';
        selectedSkillsContainer.innerHTML = '';
        if (profile.skills) {
          profile.skills.split(',').forEach(skill => {
            const skillButton = document.createElement('button');
            skillButton.textContent = skill;
            skillButton.classList.add('skill-button');
            skillButton.addEventListener('click', function() {
              selectedSkillsContainer.removeChild(skillButton);
            });
            selectedSkillsContainer.appendChild(skillButton);
          });
        }
        selectedDatesContainer.innerHTML = '';
        if (profile.availability_start && profile.availability_end) {
          const dateButton = document.createElement('button');
          dateButton.textContent = `${formatDate(profile.availability_start)} to ${formatDate(profile.availability_end)}`;
          dateButton.classList.add('date-button');
          dateButton.addEventListener('click', function() {
            selectedDatesContainer.removeChild(dateButton);
          });
          selectedDatesContainer.appendChild(dateButton);
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    }
  
    const profileForm = document.getElementById('profile-form');
    profileForm.addEventListener('submit', function(event) {
      event.preventDefault();
      const email = localStorage.getItem('email');
      const profile = {
        full_name: document.getElementById('full-name').value,
        address: document.getElementById('address-1').value,
        address2: document.getElementById('address-2').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipcode: document.getElementById('zip').value,
        preferences: document.getElementById('preferences').value,
        skills: Array.from(selectedSkillsContainer.children).map(button => button.textContent).join(','),
        availability_start: selectedDatesContainer.children[0] ? selectedDatesContainer.children[0].textContent.split(' to ')[0] : '',
        availability_end: selectedDatesContainer.children[0] ? selectedDatesContainer.children[0].textContent.split(' to ')[1] : ''
      };
  
      fetch(`http://localhost:3000/profile/${email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        fetchProfile(email); // Fetch the updated profile
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    const eventManagementForm = document.getElementById('event-management-form');
    eventManagementForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const eventDetails = {
        name: document.getElementById('event-name').value,
        description: document.getElementById('event-description').value,
        location: document.getElementById('location').value,
        requiredSkills: Array.from(selectedRequiredSkillsContainer.children).map(button => button.textContent),
        urgency: document.getElementById('urgency').value,
        eventDates: Array.from(selectedEventDatesContainer.children).map(button => button.textContent)
      };
  
      fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventDetails)
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        fetchAdminEvents(); // Fetch the updated list of admin events
        fetchNotifications(localStorage.getItem('email')); // Fetch notifications after event creation
        showSection('event-management');
        location.reload(); // Refresh the page
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    const volunteerMatchingForm = document.getElementById('volunteer-matching-form');
    volunteerMatchingForm.addEventListener('submit', function(event) {
      event.preventDefault();
  
      const email = document.getElementById('volunteer-name').value;
      const eventId = document.getElementById('matched-event').value;
  
      fetch('http://localhost:3000/match-volunteer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, eventId })
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        fetchVolunteerHistory(email); // Fetch volunteer history after matching
        location.reload(); // Refresh the page
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    function fetchVolunteerHistory(email) {
      fetch(`http://localhost:3000/history/${email}`)
      .then(response => response.json())
      .then(history => {
        const historyTableBody = document.querySelector('#history-table tbody');
        historyTableBody.innerHTML = '';
        if (history.length === 0) {
          document.getElementById('empty-message').style.display = 'block';
        } else {
          document.getElementById('empty-message').style.display = 'none';
          history.forEach(record => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${record.event_name}</td>
              <td>${record.event_description}</td>
              <td>${record.location}</td>
              <td>${record.required_skills.join(', ')}</td>
              <td>${record.urgency}</td>
              <td>${record.event_date}</td>
              <td>${record.status}</td>
            `;
            historyTableBody.appendChild(row);
          });
        }
      })
      .catch(error => {
        console.error('Error fetching volunteer history:', error);
      });
    }
  
    function fetchNotifications(email) {
      fetch(`http://localhost:3000/notifications/${email}`)
      .then(response => response.json())
      .then(notifications => {
        const notificationList = document.getElementById('notification-list');
        const notificationIndicator = document.getElementById('notification-indicator');
        notificationList.innerHTML = '';
        if (notifications.length > 0) {
          notificationIndicator.style.display = 'inline';
        } else {
          notificationIndicator.style.display = 'none';
        }
        notifications.forEach(notification => {
          const notificationItem = document.createElement('div');
          notificationItem.classList.add('notification-item');
          notificationItem.innerHTML = `
            <span class="notification-message">${notification.message}</span>
            <button class="delete-notification
            <button class="delete-notification" data-notification-id="${notification.id}">x</button>
        `;
        notificationList.appendChild(notificationItem);
      });

      // Re-bind delete notification buttons
      document.querySelectorAll('.delete-notification').forEach(button => {
        button.addEventListener('click', function(event) {
          const notificationId = this.getAttribute('data-notification-id');
          const email = localStorage.getItem('email');
          markNotificationAsRead(email, notificationId);
        });
      });
    })
    .catch(error => {
      console.error('Error fetching notifications:', error);
    });
  }

  function markNotificationAsRead(email, notificationId) {
    fetch(`http://localhost:3000/notifications/${email}/${notificationId}`, {
      method: 'PUT'
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      location.reload(); // Refresh the page
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  function fetchAdminEvents() {
    fetch('http://localhost:3000/events')
    .then(response => response.json())
    .then(events => {
      const adminEventsContainer = document.getElementById('admin-events-container');
      adminEventsContainer.innerHTML = '';
      events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `
          <h3>${event.event_name}</h3>
          <p>${event.description}</p>
          <p>Location: ${event.location}</p>
          <p>Required Skills: ${event.required_skills}</p>
          <p>Urgency: ${event.urgency}</p>
          <p>Start Date: ${event.event_start_date}</p>
          <p>End Date: ${event.event_end_date}</p>
          <button onclick="deleteEvent(${event.event_id})">Delete</button>
        `;
        adminEventsContainer.appendChild(eventDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching admin events:', error);
    });
  }

  function fetchEvents() {
    fetch('http://localhost:3000/events')
    .then(response => response.json())
    .then(events => {
      const eventsContainer = document.getElementById('events-container');
      eventsContainer.innerHTML = '';
      events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `
          <h3>${event.event_name}</h3>
          <p>${event.description}</p>
          <p>Location: ${event.location}</p>
          <p>Required Skills: ${event.required_skills}</p>
          <p>Urgency: ${event.urgency}</p>
          <p>Start Date: ${event.event_start_date}</p>
          <p>End Date: ${event.event_end_date}</p>
        `;
        eventsContainer.appendChild(eventDiv);
      });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
  }

  window.deleteEvent = function(eventId) {
    fetch(`http://localhost:3000/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      fetchAdminEvents(); // Refresh the list of admin events
      fetchNotifications(localStorage.getItem('email')); // Refresh notifications
      fetchEvents(); // Refresh the list of events
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

  window.fetchMatchingEvents = function() {
    const volunteerEmail = document.getElementById('volunteer-name').value;

    fetch(`http://localhost:3000/matching-events/${volunteerEmail}`)
    .then(response => response.json())
    .then(events => {
      const matchedEventSelect = document.getElementById('matched-event');
      matchedEventSelect.innerHTML = '<option>Select Event</option>';
      events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.event_id;
        option.textContent = event.event_name;
        matchedEventSelect.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error fetching matching events:', error);
    });
  };

  // Fetch users and populate volunteer dropdown
  fetch('http://localhost:3000/users')
  .then(response => response.json())
  .then(users => {
    const volunteerNameSelect = document.getElementById('volunteer-name');
    volunteerNameSelect.innerHTML = '<option>Select User</option>';
    users.forEach(user => {
      const option = document.createElement('option');
      option.value = user.email;
      option.textContent = user.email;
      volunteerNameSelect.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error fetching users:', error);
  });

  const email = localStorage.getItem('email');
  if (email) {
    fetchProfile(email);
    fetchNotifications(email);
    fetchVolunteerHistory(email);
    fetchEvents(); // Fetch events if already logged in
    fetchAdminEvents(); // Fetch admin events if already logged in
    showSection('profile'); // Show profile section if already logged in
  } else {
    showSection('login'); // Show login section if not logged in
  }
});
