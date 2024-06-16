// Function to decode JWT token
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// Function to check user role and adjust UI
function checkUserRole() {
    const token = localStorage.getItem('token');
    if (token) {
        const user = parseJwt(token);
        if (user && user.role === 'admin') {
            document.getElementById('admin-controls').style.display = 'block';
        } else {
            document.getElementById('admin-controls').style.display = 'none';
        }
    } else {
        window.location.href = '/login.html';
    }
}

window.onload = checkUserRole;

document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
});

function addDot() {
    const mapContainer = document.getElementById('map-container');

    const x = parseInt(document.getElementById('x-coord').value);
    const y = parseInt(document.getElementById('y-coord').value);

    if (isNaN(x) || isNaN(y) || x < 0 || x > 1000 || y < 0 || y > 1000) {
        alert('Please enter valid coordinates between 0 and 1000.');
        return;
    }

    // Convert 1km x 1km to 500px x 500px scale
    const scaledX = (x / 1000) * 500;
    const scaledY = (y / 1000) * 500;

    // Create a new dot element
    const dot = document.createElement('div');
    dot.classList.add('dot');
    dot.style.left = `${scaledX}px`;
    dot.style.top = `${scaledY}px`;
    dot.setAttribute('data-x', x);
    dot.setAttribute('data-y', y);

    // Add event listener to show popup on click
    dot.addEventListener('click', function(event) {
        event.stopPropagation();  // Prevent click from reaching map container
        showPopup(scaledX, scaledY, dot);
    });

    // Append the dot to the map container
    mapContainer.appendChild(dot);
}

function showPopup(x, y, dot) {
    // Remove any existing popup
    const existingPopup = document.querySelector('.popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.style.left = `${x + 10}px`; // Offset by 10px to the right of the dot
    popup.style.top = `${y + 10}px`;  // Offset by 10px below the dot

    // Header
    const header = document.createElement('div');
    header.classList.add('popup-header');
    header.textContent = 'Event Details';
    popup.appendChild(header);

    // Table
    const table = document.createElement('table');
    const tableHeader = `
        <tr>
            <th>Property</th>
            <th>Value</th>
        </tr>
    `;
    table.innerHTML = tableHeader;

    // Event text
    const storedText = dot.getAttribute('data-text');
    const textRow = document.createElement('tr');
    textRow.innerHTML = `<td>Event</td><td>${storedText ? storedText : 'No event details available'}</td>`;
    table.appendChild(textRow);

    // Coordinates
    const coordsRow = document.createElement('tr');
    coordsRow.innerHTML = `<td>Coordinates</td><td>(${dot.getAttribute('data-x')}, ${dot.getAttribute('data-y')})</td>`;
    table.appendChild(coordsRow);

    // Date and time
    const storedDateTime = dot.getAttribute('data-datetime');
    const storedTimeZone = dot.getAttribute('data-timezone') || 'UTC';
    const formattedDateTime = storedDateTime ? new Date(storedDateTime).toLocaleString() : 'No date and time set';
    const dateTimeRow = document.createElement('tr');
    dateTimeRow.innerHTML = `<td>Date & Time</td><td>${formattedDateTime} ${storedTimeZone}</td>`;
    table.appendChild(dateTimeRow);

    popup.appendChild(table);

    // Event button
    const eventButton = document.createElement('button');
    eventButton.textContent = storedText ? 'Edit Event' : 'Add Event';
    eventButton.addEventListener('click', function() {
        showModal(dot, eventButton.textContent);
        popup.remove();  // Hide popup when "Add/Edit Event" is clicked
    });

    // Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        dot.remove();
        popup.remove();
    });

    // Append buttons to popup
    popup.appendChild(eventButton);
    popup.appendChild(deleteButton);

    // Append popup to the map container
    document.getElementById('map-container').appendChild(popup);

    // Show popup
    popup.style.display = 'block';

    // Close popup when clicking outside
    document.addEventListener('click', function(event) {
        if (!popup.contains(event.target) && event.target !== dot) {
            popup.remove();
        }
    }, { once: true });
}

function showModal(dot, action) {
    // Remove any existing modal
    const existingModal = document.querySelector('.modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal
    const modal = document.createElement('div');
    modal.classList.add('modal');

    // Add content to modal
    const heading = document.createElement('h2');
    heading.textContent = action;
    modal.appendChild(heading);

    // Textbox
    const textBox = document.createElement('input');
    textBox.type = 'text';
    textBox.placeholder = 'Enter event details';
    const existingText = dot.getAttribute('data-text');
    if (existingText) {
        textBox.value = existingText;
    }
    modal.appendChild(textBox);

    // Color picker
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = dot.style.backgroundColor || '#ff0000'; // Default to red if no color is set
    modal.appendChild(colorInput);

    // Date and time picker
    const dateTimeInput = document.createElement('input');
    dateTimeInput.type = 'datetime-local';
    const existingDateTime = dot.getAttribute('data-datetime');
    if (existingDateTime) {
        dateTimeInput.value = existingDateTime;
    }
    modal.appendChild(dateTimeInput);

    // Time zone selector
    const timeZoneSelect = document.createElement('select');
    const timeZones = [
        'UTC-12:00', 'UTC-11:00', 'UTC-10:00', 'UTC-09:00', 'UTC-08:00', 'UTC-07:00', 'UTC-06:00', 
        'UTC-05:00', 'UTC-04:00', 'UTC-03:00', 'UTC-02:00', 'UTC-01:00', 'UTC+00:00', 'UTC+01:00', 
        'UTC+02:00', 'UTC+03:00', 'UTC+04:00', 'UTC+05:00', 'UTC+06:00', 'UTC+07:00', 'UTC+08:00', 
        'UTC+09:00', 'UTC+10:00', 'UTC+11:00', 'UTC+12:00'
    ];
    timeZones.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone;
        option.textContent = zone;
        timeZoneSelect.appendChild(option);
    });
    const existingTimeZone = dot.getAttribute('data-timezone');
    if (existingTimeZone) {
        timeZoneSelect.value = existingTimeZone;
    }
    modal.appendChild(timeZoneSelect);

    // Save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', function() {
        dot.setAttribute('data-text', textBox.value);
        dot.setAttribute('data-datetime', dateTimeInput.value);
        dot.setAttribute('data-timezone', timeZoneSelect.value);
        dot.style.backgroundColor = colorInput.value;
        alert(`Event saved: ${textBox.value}`);
        modal.style.display = 'none';

        // Remove popup if visible
        const existingPopup = document.querySelector('.popup');
        if (existingPopup) {
            existingPopup.remove();
        }
    });

    // Cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Append buttons to modal
    modal.appendChild(saveButton);
    modal.appendChild(cancelButton);

    // Append modal to body
    document.body.appendChild(modal);

    // Show modal
    modal.style.display = 'block';
}

function toggleDots() {
    const dots = document.querySelectorAll('.dot');
    const toggleButton = document.getElementById('toggle-dots');
    if (toggleButton.textContent === 'Hide Dots') {
        dots.forEach(dot => dot.style.display = 'none');
        toggleButton.textContent = 'Show Dots';
    } else {
        dots.forEach(dot => dot.style.display = 'block');
        toggleButton.textContent = 'Hide Dots';
    }
}

function searchDot() {
    const searchX = parseInt(document.getElementById('search-x-coord').value);
    const searchY = parseInt(document.getElementById('search-y-coord').value);

    if (isNaN(searchX) || isNaN(searchY) || searchX < 0 || searchX > 1000 || searchY < 0 || searchY > 1000) {
        alert('Please enter valid coordinates between 0 and 1000.');
        return;
    }

    const dots = document.querySelectorAll('.dot');
    let found = false;

    dots.forEach(dot => {
        const dotX = parseInt(dot.getAttribute('data-x'));
        const dotY = parseInt(dot.getAttribute('data-y'));

        if (dotX === searchX && dotY === searchY) {
            dot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            dot.style.backgroundColor = 'green';
            setTimeout(() => {
                dot.style.backgroundColor = dot.getAttribute('data-color') || 'red';
            }, 2000);
            found = true;
        }
    });

    if (!found) {
        alert('Dot not found at the specified coordinates.');
    }
}

function generateRandomDots() {
    const mapContainer = document.getElementById('map-container');

    for (let i = 0; i < 10; i++) {
        const x = Math.floor(Math.random() * 1000);
        const y = Math.floor(Math.random() * 1000);
        const text = `Random Event ${i + 1}`;
        const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        // Convert 1km x 1km to 500px x 500px scale
        const scaledX = (x / 1000) * 500;
        const scaledY = (y / 1000) * 500;

        // Create a new dot element
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.style.left = `${scaledX}px`;
        dot.style.top = `${scaledY}px`;
        dot.style.backgroundColor = color;
        dot.setAttribute('data-x', x);
        dot.setAttribute('data-y', y);
        dot.setAttribute('data-text', text);
        dot.setAttribute('data-color', color);

        // Add event listener to show popup on click
        dot.addEventListener('click', function(event) {
            event.stopPropagation();  // Prevent click from reaching map container
            showPopup(scaledX, scaledY, dot);
        });

        // Append the dot to the map container
        mapContainer.appendChild(dot);
    }
}

// Handle form submission for login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.accessToken);
        window.location.href = '/index.html';
    } else {
        alert(data.message);
    }
});

// Handle form submission for registration
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('User registered successfully');
        window.location.href = '/login.html';
    } else {
        alert('Failed to register');
    }
});

