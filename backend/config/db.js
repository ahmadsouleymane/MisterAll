import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);

    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI non définie dans le fichier .env");
    }

    await mongoose.connect(uri, {
      family: 4, // force IPv4 (utile sur certains réseaux)
      maxPoolSize: 20, // Connexions simultanées max
      minPoolSize: 5, // Connexions minimum maintenues
      serverSelectionTimeoutMS: 5000, // Timeout sélection serveur
      socketTimeoutMS: 45000, // Timeout socket
    });
  } catch (error) {
    console.error("Erreur de connexion MongoDB :", error.message);
    process.exit(1);
  }
};

export default connectDB;
