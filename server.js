const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();  // Load environment variables from .env file

const app = express();
const port = 3000;

app.use(express.json());

const users = []; // This should be replaced with a database

app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = { username: req.body.username, password: hashedPassword, role: 'user' };
    users.push(user);
    res.status(201).send('User Registered');
});

app.post('/login', async (req, res) => {
    const user = users.find(user => user.username === req.body.username);
    if (user == null) {
        return res.status(400).send('Cannot find user');
    }
    try {
        if(await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.ACCESS_TOKEN_SECRET);
            res.json({ accessToken: accessToken });
        } else {
            res.send('Not Allowed');
        }
    } catch {
        res.status(500).send();
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
