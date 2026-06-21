require('dotenv').config();

const app = require('./src/app');
const { connectDB } = require('./src/database/connection');
const { initDb } = require('./src/database/initDb');

const PORT = process.env.PORT || 9000;

async function startServer() {
  try {
    await connectDB();
    await initDb();

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();