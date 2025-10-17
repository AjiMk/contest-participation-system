import { sequelize } from './database';

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  } finally {
    await sequelize.close();
  }
}

testConnection();
