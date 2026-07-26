const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// SIGNUP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        //KARIM: CHANGE, CHECK IF THE USER PUTS NAME EMAIL AND PASSWORD
        if (!name || !email || !password) {
            return res.status(400).json({error: 'Name, email, and password are required'});
        }

        // KARIM: CHANGE, ENSURE PASSWORD LENGTH FEATURE
        if (password.length < 6) {
            return res.status(400).json({error: 'Password must be at least 6 characters or more'});
        }

        // check if the user exists
        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({error: 'User already exists'});
        }

         // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const userData = {
            name,
            email,
            password: hashedPassword,
            garden: [],
            createdAt: new Date()
        };

        const result = await User.create(userData);

       // fetch the user with _id
        const user = await User.findById(result.insertedId);

        // Generate JWT
        const token = jwt.sign(
            { email: user.email, userId: user._id.toString()},
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {id: user._id, name: user.name, email: user.email, garden: user.garden}
        });
    } catch (error) {
        console.error('Signup error:', error);

        //KARIM: CHANGE, HANDLES EDGE CASE IF PEOPLE WITH THE SAME EMAIL SIGN UP AT SAME TIME
        if (error.code === 11000) {
            return res.status(400).json({error: 'An account with this email already exists'});
        }

        res.status(500).json({error: 'Server error'});
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        //KARIM: CHANGE, CHECK IF EMAIL AND PASSWORD ARE PROVIDED
        if (!email || !password) {
            return res.status(400).json({error: 'Email and password are required'});
        }

        // find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({error: 'Invalid credentials'});
        }

        // check the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {return res.status(401).json({error: 'Invalid credentials'});
        }

        // generate JWT
        const token = jwt.sign({email: user.email, userId: user._id.toString()},process.env.JWT_SECRET,{ expiresIn: '7d'});

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name, email: user.email, garden: user.garden }
        });
    } catch (error) {
        console.error('Login error:', error);

        res.status(500).json({error: 'Server error'});
    }
});

module.exports = router;
