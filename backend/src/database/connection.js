const sql = require('mssql');
const dbConfig = require('../config/db.config');

let dbPool = null;

async function connectDB() {
  try {
    console.log(`Attempting connection to SQL Server: ${dbConfig.server}:${dbConfig.port}...`);
    dbPool = await sql.connect(dbConfig);
    console.log(`Connected directly to target database: ${dbConfig.database}`);
    return dbPool;
  } catch (directErr) {
    console.log('Direct connection failed, attempting to connect to master to create database...', directErr.message);

    const masterConfig = { ...dbConfig, database: 'master' };
    const masterPool = await sql.connect(masterConfig);

    await masterPool.request().query(`
      IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${dbConfig.database}')
      BEGIN
        CREATE DATABASE [${dbConfig.database}]
      END
    `);

    await sql.close();

    dbPool = await sql.connect(dbConfig);
    console.log(`Database [${dbConfig.database}] verified/created and connected.`);
    return dbPool;
  }
}

function getPool() {
  if (!dbPool) {
    throw new Error('Database pool is not initialized. Call connectDB() first.');
  }

  return dbPool;
}

module.exports = {
  sql,
  connectDB,
  getPool
};