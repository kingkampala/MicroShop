const { app, connectDb } = require('../src/app');
require('dotenv').config();

const { MONGO_URL } = process.env;
const port = process.env.PORT || 2810;

const startServer = async () => {
    try {
      await connectDb(MONGO_URL);
  
      app.listen(port, '0.0.0.0', (error), () => {
        console.log(`server running on port ${port}`);
      });
    } catch (error) {
      console.error(`error starting the server: ${error.message}`);
    }
};

startServer();