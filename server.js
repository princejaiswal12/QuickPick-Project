const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const dotenv = require('dotenv');
const methodOverride = require('method-override');

dotenv.config();

const app = express();

// connect to mongo
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(()=> console.log('Mongo connected'))
  .catch(err => console.error('Mongo connection error', err));

// session
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// static
app.use('/public', express.static(path.join(__dirname, 'public')));

// parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// make session user available in views
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    next();
});

// routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customer');
const shopRoutes = require('./routes/shopkeeper');
const productRoutes = require('./routes/product');

app.use('/', authRoutes);
app.use('/customer', customerRoutes);
app.use('/shop', shopRoutes);
app.use('/products', productRoutes);

// homepage
app.get('/', (req, res) => {
    res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Server running on ${PORT}`));
