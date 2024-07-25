const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

const userRoute = require('../routes/user');
const productRoute = require('../routes/product');

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(`/user`, userRoute);
app.use(`/product`, productRoute);

const DB_URL = process.env.MONGO_URL

const connectDb = () => {
    if (!DB_URL) {
        throw new Error('MONGO_URL environment variable is not set');
    }
    return mongoose
        .connect(DB_URL, {
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