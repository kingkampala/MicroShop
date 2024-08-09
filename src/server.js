const { app, connectDb } = require('../src/app');
const User = require('../model/user');
require('dotenv').config();

const { setCache } = require('../cache/service');

const { MONGO_URL } = process.env;
const port = process.env.PORT || 2810;

const startServer = async () => {
    try {
      await connectDb(MONGO_URL);

      const warmCache = async () => {
        const users = await User.find({});
        await setCache('users', users, 3600);
      };
      
      warmCache()
          .then(() =>
              console.log('cache warmed'))
          .catch((err) => 
              console.error('cache warming error', err));
  
      app.listen(port, '0.0.0.0', () => {
        console.log(`server running on port ${port}`);
      });
    } catch (error) {
      console.error('error starting the server', error);
    }
};

startServer();