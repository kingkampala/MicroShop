const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

const userRoute = require('../routes/user');
const productRoute = require('../routes/product');
const orderRoute = require('../routes/order');

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(`/user`, userRoute);
app.use(`/product`, productRoute);
app.use(`/order`, orderRoute);


const connectDb = () => {
    const mongoUrl = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI : process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error('MongoDb URL environment variable is not set');
    }
    return mongoose
        .connect(mongoUrl, {
            dbName: process.env.NODE_ENV === 'test' ? 'microshop' : 'microshop-main',
            bufferCommands: false
        })
        .then(() => {
            console.log(`connected to ${process.env.NODE_ENV === 'test' ? 'test' : 'development'} database`);
        })
        .catch((err) => {
            console.error('database connection error:', err);
        });
}

module.exports = { app, connectDb };