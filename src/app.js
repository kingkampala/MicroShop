const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

const userRoute = require('../routes/user');
const productRoute = require('../routes/product');
const orderRoute = require('../routes/order');

const User = require('../model/user');
const { setCache } = require('../cache/service');

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(`/user`, userRoute);
app.use(`/product`, productRoute);
app.use(`/order`, orderRoute);

const warmCache = async () => {
    const users = await User.find({});
    await setCache('users', users, 3600);
};

warmCache()
    .then(() => 
        console.log('cache warmed'))
    .catch((err) => 
        console.error('cache warming error', err));

    const { MONGO_URL } = process.env;

const connectDb = () => {
    if (!MONGO_URL) {
        throw new Error('MONGO_URL environment variable is not set');
    }
    return mongoose
        .connect(MONGO_URL, {
            dbName: 'microshop'
        })
        .then(() => {
            console.log('database connection successful');
        })
        .catch((err) => {
            console.error('database connection error', err);
        });
}

module.exports = { app, connectDb };