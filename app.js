const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();

//const authRoutes = require('./routes/auth');
const userRoute = require('./routes/user');

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


//app.use('/auth', authRoutes);
app.use(`/user`, userRoute);

const port = process.env.PORT;
const DB_URL = process.env.MONGO_URL

mongoose
    .connect(DB_URL, {
        dbName: 'microshop'
    })
    .then(() => {
        console.log('database connection successful');
    })
    .catch((err) => {
        console.error('database connection error', err);
    });

app.listen(port, () => {
  console.log(`authentication service running on port ${port}`);
});