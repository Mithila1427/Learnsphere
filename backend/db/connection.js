import { Sequelize } from 'sequelize';
import 'dotenv/config'; // This loads the .env file

// This code now reads from your .env file
const sequelize = new Sequelize(
  process.env.DB_NAME, // 'learnsphere'
  process.env.DB_USER, // 'learnsphere_user'
  process.env.DB_PASS, // 'P@ssword123!'
  {
    host: process.env.DB_HOST, // 'localhost'
    port: 1433, // Default SQL port
    dialect: 'mssql',
    dialectOptions: {
      options: {
        // This is still important!
        instanceName: 'SQLEXPRESS', 
        
        // We set encrypt to false for local dev
        encrypt: false,
        trustServerCertificate: true
      }
    },
    logging: console.log
  }
);

// Test the connection
async function testDbConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to MSSQL has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  }
}

testDbConnection();

export default sequelize;

