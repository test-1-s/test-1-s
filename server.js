const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from .env file

const app = express();
const port = 3000;

app.use(express.json());

const users = []; // This should be replaced with a database

// Register route
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = { username: req.body.username, password: hashedPassword, role: 'user' };
        users.push(user);
        res.status(201).send('User Registered');
    } catch {
        res.status(500).send();
    }
});

// Login route
app.post('/login', async (req, res) => {
    const user = users.find(user => user.username === req.body.username);
    if (user == null) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET);
            res.json({ accessToken: accessToken });
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Middleware to authorize role
function authorizeRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) {
            return res.sendStatus(403);
        }
        next();
    }
}

// Protect routes for event management
app.post('/events', authenticateToken, authorizeRole('admin'), (req, res) => {
    // Code to add event
    res.send('Event added');
});

app.put('/events/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    // Code to edit event
    res.send('Event edited');
});

app.delete('/events/:id', authenticateToken, authorizeRole('admin'), (req, res) => {
    // Code to delete event
    res.send('Event deleted');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
