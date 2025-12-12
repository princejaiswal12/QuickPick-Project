const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const upload = require('../utils/multer');

// Render login page
router.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// handle login
router.post('/login', async (req, res) => {
    try {
        const { role, email, password } = req.body;
        const user = await User.findOne({ email, role });
        if(!user) return res.render('login', { error: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if(!match) return res.render('login', { error: 'Invalid credentials' });

        // set session
        req.session.user = { id: user._id, role: user.role, name: user.name };
        // redirect according to role
        if(user.role === 'shopkeeper') return res.redirect('/shop/dashboard');
        else return res.redirect('/customer/dashboard');
    } catch (err) {
        console.error(err);
        res.render('login', { error: 'Server error' });
    }
});

// render register page
router.get('/register', (req, res) => {
    res.render('register', { error: null });
});

// handle register - multipart for shop logo
router.post('/register', upload.single('shopLogo'), async (req, res) => {
    try {
        const { role, name, email, password, phone, address, city, shopName, shopAddress, shopCategory, gstNumber } = req.body;
        const existing = await User.findOne({ email });
        if(existing) return res.render('register', { error: 'Email already registered' });

        const hashed = await bcrypt.hash(password, 10);

        const userData = {
            role, name, email, password: hashed, phone
        };

        if(role === 'customer') {
            userData.address = address;
            userData.city = city;
        } else if(role === 'shopkeeper') {
            userData.shopName = shopName;
            userData.shopAddress = shopAddress;
            userData.shopCategory = shopCategory;
            userData.gstNumber = gstNumber;
            if(req.file) userData.shopLogo = '/public/uploads/' + req.file.filename;
        }

        const user = await User.create(userData);
        req.session.user = { id: user._id, role: user.role, name: user.name };

        if(user.role === 'shopkeeper') return res.redirect('/shop/dashboard');
        else return res.redirect('/customer/dashboard');

    } catch(err) {
        console.error(err);
        res.render('register', { error: 'Server error' });
    }
});

// logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
