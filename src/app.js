const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const app = express();

const userRoute = require('../route/user');
const productRoute = require('../route/product');
const orderRoute = require('../route/order');
const searchRoute = require('../route/search');
const swaggerRoute = require('../route/swagger');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(`/user`, userRoute);
app.use(`/product`, productRoute);
app.use(`/order`, orderRoute);
app.use(`/search`, searchRoute);
app.use(`/api-docs`, swaggerRoute);

const connectDb = () => {
    const mongoUrl = process.env.NODE_ENV === 'test' ? process.env.MONGO_URI : process.env.MONGO_URL;

    if (!mongoUrl) {
        throw new Error('MongoDb URL environment variable is not set');
    }
    return mongoose
        .connect(mongoUrl, {
            dbName: process.env.NODE_ENV === 'test' ? 'microshop' : 'microshop-main',
            bufferCommands: true
        })
        .then(() => {
            console.log(`connected to ${process.env.NODE_ENV === 'test' ? 'test' : 'development'} database`);
        })
        .catch((err) => {
            console.error('database connection error:', err);
        });
}

module.exports = { app, connectDb };