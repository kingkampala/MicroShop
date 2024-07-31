const { app, connectDb } = require('../src/app');
require('dotenv').config();

const { MONGO_URL } = process.env;
//const port = process.env.PORT || 4000;

const startServer = async () => {
    try {
      await connectDb(MONGO_URL);
  
      app.listen(8080, '0.0.0.0', () => {
        console.log(`server running on port ${8080}`);
      });
    } catch (error) {
      console.error('error starting the server:', error);
    }
};
  
startServer();