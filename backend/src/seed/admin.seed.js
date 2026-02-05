import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({
      email: "admin@system.com"
    });

    if (adminExists) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "System Admin",
      email: "admin@system.com",
      password: hashedPassword,
      role: "ADMIN",
      permissions: [
        "TRAVEL_MANAGEMENT",
        "LECTURE_TRANSACTION"
      ]
    });

    console.log("Admin user created successfully");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAdmin();
