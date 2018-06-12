const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const nodeMailer = require('nodemailer');


const productRoutes = require('./api/routes/products');
const orderRoutes = require('./api/routes/orders');
const userRoutes = require('./api/routes/user');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://rain:' + process.env.MONGO_ATLAS_PW + '@node-rest-shop-shard-00-00-xcn1e.mongodb.net:27017,node-rest-shop-shard-00-01-xcn1e.mongodb.net:27017,node-rest-shop-shard-00-02-xcn1e.mongodb.net:27017/test?ssl=true&replicaSet=node-rest-shop-shard-0&authSource=admin',
    {
        useMongoClient: true
    });

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.render('index');
});

app.post('/send-email', function (req, res) {
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'raineerdelarita@gmail.com',
            pass: 'delarita'
        }
    });
    let mailOptions = {
        from: 'raineerdelarita@gmail.com', // sender address
        to: req.body.to, // list of receivers
        subject: req.body.subject, // Subject line
        text: req.body.body, // plain text body
        html: '<b>NodeJS Email Tutorial</b>' // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
        res.render('index');
    });
});
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type,Accept, Authorization"
    );
    if(req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Methods','PUT, POST, ,PATCH, DELETE, GET');
            return res.status(200).json({});
    }
    next();
});



app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use("/user", userRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
});




module.exports = app;