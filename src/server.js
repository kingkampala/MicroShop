const { app, connectDb } = require('../src/app');
const port = process.env.PORT || 2810;

const { MONGO_URL } = process.env;

const startServer = async () => {
    try {
      await connectDb(MONGO_URL);
  
      app.listen(port, () => {
        console.log(`authentication service running on port ${port}`);
      });
    } catch (error) {
      console.error('error starting the server:', error);
    }
};
  
startServer();