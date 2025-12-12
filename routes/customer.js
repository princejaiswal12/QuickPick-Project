const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

function requireAuth(req, res, next) {
    if(!req.session?.user) return res.redirect('/login');
    next();
}

router.get('/dashboard', requireAuth, async (req, res) => {
    // show shops as cards
    const shops = await User.find({ role: 'shopkeeper' });
    res.render('customer-dashboard', { shops });
});

// shop products page (query by shopId)
router.get('/shop/:shopId', requireAuth, async (req, res) => {
    const shopId = req.params.shopId;
    const shop = await User.findById(shopId);
    if(!shop) return res.redirect('/customer/dashboard');

    const products = await Product.find({ shop: shopId });
    res.render('shop-products', { shop, products });
});

/* CART in session:
   req.session.cart = { shopId: '...', items: [{productId, name, price, qty}], total }
*/

// add to cart
router.post('/cart/add', requireAuth, async (req, res) => {
    const { productId, qty = 1 } = req.body;
    const product = await Product.findById(productId);
    if(!product) return res.status(404).send('Product not found');

    // init cart
    if(!req.session.cart) {
        req.session.cart = { shopId: product.shop.toString(), items: [], total: 0 };
    }

    // ensure same shop
    if(req.session.cart.shopId !== product.shop.toString()) {
        return res.status(400).send('Cart contains items from another shop. Clear cart first.');
    }

    const existing = req.session.cart.items.find(i => i.productId === productId);
    const price = product.price;
    if(existing) {
        existing.qty += Number(qty);
    } else {
        req.session.cart.items.push({ productId, name: product.name, price, qty: Number(qty) });
    }

    // recalc
    req.session.cart.total = req.session.cart.items.reduce((s,i) => s + i.qty * i.price, 0);
    res.redirect('/customer/cart');
});

// view cart
router.get('/cart', requireAuth, async (req, res) => {
    const cart = req.session.cart || { items: [], total: 0 };
    res.render('cart', { cart });
});

// place order
router.post('/cart/checkout', requireAuth, async (req, res) => {
    const cart = req.session.cart;
    if(!cart || !cart.items.length) return res.redirect('/customer/cart');

    // build order items
    const orderItems = cart.items.map(i => ({ product: i.productId, qty: i.qty, price: i.price }));
    const OrderModel = require('../models/Order');

    const order = await OrderModel.create({
        customer: req.session.user.id,
        shop: cart.shopId,
        items: orderItems,
        total: cart.total
    });

    // clear cart
    req.session.cart = null;

    res.render('order-success', { order });
});

module.exports = router;
