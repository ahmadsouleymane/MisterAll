// migration.js
import "dotenv/config"; // pour charger MONGO_URI
import mongoose from "mongoose";
import UserModel from "./models/userModel.js";
import CourseModel from "./models/courseModel.js";

const MONGO_URI = process.env.MONGO_URI;

async function migrate() {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI non défini dans .env");
    }

    // Connexion à Mongo
    await mongoose.connect(MONGO_URI);
    console.log("✅ Mongo connecté");

    // Récupérer tous les users
    const users = await UserModel.find();

    for (const user of users) {
      // Compter les cours existants pour ce user
      const count = await CourseModel.countDocuments({
        user_id: user._id.toString() // ⚡ important : String
      });

      // Mettre à jour addedCourses
      await UserModel.findByIdAndUpdate(user._id, {
        addedCourses: count
      });

      console.log(`User ${user._id} → ${count} cours`);
    }

    console.log("🎉 Migration terminée");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur migration :", err.message);
    process.exit(1);
  }
}

migrate();
