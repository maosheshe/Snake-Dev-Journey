const { sequelize } = require('../models');

async function checkSchema() {
  try {
    const [userColumns] = await sequelize.query("DESCRIBE Users");
    console.log("Users Table Columns:");
    console.table(userColumns);

    const [articleColumns] = await sequelize.query("DESCRIBE Articles");
    console.log("Articles Table Columns:");
    console.table(articleColumns);
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking schema:", error);
    process.exit(1);
  }
}

checkSchema();
