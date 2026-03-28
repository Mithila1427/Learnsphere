import bcrypt from "bcryptjs";
import User from "./models/User.js"; // Import your SEQUELIZE User model
import sequelize from "./db/connection.js"; // Import your SEQUELIZE connection
import dotenv from "dotenv";
dotenv.config();

const users = [
  { name: "Student One", email: "student1@gmail.com", password: "Student@123", role: "student" },
  { name: "Teacher One", email: "teacher1@gmail.com", password: "Teacher@123", role: "teacher" },
];

const seedDB = async () => {
  try {
    console.log("Connecting to DB...");
    await sequelize.authenticate();
    
    // Sync model - ensure table exists. 'force: true' will drop it first.
    console.log("Syncing User model (dropping existing table)...");
    await User.sync({ force: true });

    // Use User.destroy with truncate for a clean wipe (safer than drop)
    // await User.destroy({ where: {}, truncate: true });
    
    console.log("Hashing passwords...");
    const salt = await bcrypt.genSalt(10);

    const preparedUsers = await Promise.all(users.map(async u => ({
      username: u.name,
      email: u.email,
      passwordHash: await bcrypt.hash(u.password, salt),
      role: u.role
    })));

    // Use Sequelize's bulkCreate instead of insertMany
    console.log("Seeding users...");
    await User.bulkCreate(preparedUsers);
    
    console.log("✅ Users seeded successfully!");
    
  } catch (err) {
    console.error("❌ Error seeding database:", err);
  } finally {
    // Close the database connection
    await sequelize.close();
    console.log("Database connection closed.");
  }
};

seedDB();