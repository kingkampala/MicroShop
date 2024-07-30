const { app, connectDb } = require('../src/app');
require('dotenv').config();

const { MONGO_URL } = process.env;
const port = process.env.PORT || 4000;

const startServer = async () => {
    try {
      await connectDb(MONGO_URL);
  
      app.listen(port, () => {
        console.log(`server running on port ${port}`);
      });
    } catch (error) {
      console.error('error starting the server:', error);
    }
};
  
startServer();