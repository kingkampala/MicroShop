const { app, connectDb } = require('../src/app');
require('dotenv').config();

/*const { MONGO_URL } = process.env;
const port = process.env.PORT || 2810;*/

const { MONGO_URL, PORT = 3000 } = process.env;

console.log(`Starting server with MONGO_URL: ${MONGO_URL}`);
console.log(`Listening on port: ${PORT}`);

const startServer = async () => {
    try {
      await connectDb(MONGO_URL);
  
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('error starting the server:', error);
    }
};

startServer();