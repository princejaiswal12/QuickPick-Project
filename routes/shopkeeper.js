const express = require('express');
const router = express.Router();
const upload = require('../utils/multer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

function requireAuth(req, res, next) {
    if(!req.session?.user) return res.redirect('/login');
    next();
}

function requireShopkeeper(req, res, next) {
    if(!req.session?.user || req.session.user.role !== 'shopkeeper') return res.redirect('/login');
    next();
}

// dashboard
router.get('/dashboard', requireAuth, requireShopkeeper, async (req, res) => {
    const shop = await User.findById(req.session.user.id);
    const products = await Product.find({ shop: shop._id });
    const orders = await Order.find({ shop: shop._id }).populate('customer').sort({ createdAt: -1 });
    res.render('shopkeeper-dashboard', { shop, products, orders });
});

// add product (with image)
router.post('/product/add', requireAuth, requireShopkeeper, upload.single('image'), async (req, res) => {
    const { name, price, qty, description } = req.body;
    const imagePath = req.file ? '/public/uploads/' + req.file.filename : null;

    await Product.create({
        shop: req.session.user.id,
        name, price: Number(price), qty: Number(qty), description, image: imagePath
    });

    res.redirect('/shop/dashboard');
});

// edit product (form is in dashboard, we use _method=PUT)
router.put('/product/:id', requireAuth, requireShopkeeper, upload.single('image'), async (req, res) => {
    const id = req.params.id;
    const { name, price, qty, description } = req.body;
    const update = { name, price: Number(price), qty: Number(qty), description };
    if(req.file) update.image = '/public/uploads/' + req.file.filename;
    await Product.findByIdAndUpdate(id, update);
    res.redirect('/shop/dashboard');
});

// delete product
router.delete('/product/:id', requireAuth, requireShopkeeper, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/shop/dashboard');
});

// accept/reject order (basic)
router.post('/order/:id/status', requireAuth, requireShopkeeper, async (req, res) => {
    const { status } = req.body; // accepted/rejected/shipped/delivered
    await Order.findByIdAndUpdate(req.params.id, { status });
    res.redirect('/shop/dashboard');
});

module.exports = router;
