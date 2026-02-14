const mongoose = require("mongoose");
require("dotenv").config();

const dbUri = process.env.MONGODB;
const initializeDatabase = async () => {
  await mongoose
    .connect(dbUri)
    .then(() => console.log("Database connected successfully"))
    .catch((err) => console.log("Faailed to connect database", err));
};

module.exports = { initializeDatabase };
