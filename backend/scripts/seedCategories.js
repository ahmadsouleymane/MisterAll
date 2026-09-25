import mongoose from "mongoose";
import dotenv from "dotenv";
import BookCategory from "../models/bookCategoryModel.js";

dotenv.config();

const defaultCategories = [
  { name: "Sciences", nameEn: "Sciences", slug: "sciences", icon: "🔬", color: "#3B82F6", order: 1 },
  { name: "Mathématiques", nameEn: "Mathematics", slug: "mathematiques", icon: "📐", color: "#8B5CF6", order: 2 },
  { name: "Informatique", nameEn: "Computer Science", slug: "informatique", icon: "💻", color: "#10B981", order: 3 },
  { name: "Langues", nameEn: "Languages", slug: "langues", icon: "🌍", color: "#F59E0B", order: 4 },
  { name: "Littérature", nameEn: "Literature", slug: "litterature", icon: "📚", color: "#EC4899", order: 5 },
  { name: "Histoire", nameEn: "History", slug: "histoire", icon: "🏛️", color: "#6366F1", order: 6 },
  { name: "Économie", nameEn: "Economy", slug: "economie", icon: "📈", color: "#14B8A6", order: 7 },
  { name: "Médecine", nameEn: "Medicine", slug: "medecine", icon: "⚕️", color: "#EF4444", order: 8 },
  { name: "Droit", nameEn: "Law", slug: "droit", icon: "⚖️", color: "#78716C", order: 9 },
  { name: "Physique", nameEn: "Physics", slug: "physique", icon: "⚛️", color: "#0EA5E9", order: 10 },
  { name: "Chimie", nameEn: "Chemistry", slug: "chimie", icon: "🧪", color: "#A855F7", order: 11 },
  { name: "Biologie", nameEn: "Biology", slug: "biologie", icon: "🧬", color: "#22C55E", order: 12 },
  { name: "Philosophie", nameEn: "Philosophy", slug: "philosophie", icon: "🤔", color: "#D946EF", order: 13 },
  { name: "Géographie", nameEn: "Geography", slug: "geographie", icon: "🌎", color: "#06B6D4", order: 14 },
  { name: "Art", nameEn: "Art", slug: "art", icon: "🎨", color: "#F43F5E", order: 15 },
  { name: "Autre", nameEn: "Other", slug: "autre", icon: "📁", color: "#FFFF5C", order: 99 }
];

const seedCategories = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI non définie dans le fichier .env");
    }

    console.log("🔌 Connexion à MongoDB...");
    await mongoose.connect(uri, {
      family: 4,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ Connecté à MongoDB");

    console.log("📚 Ajout des catégories par défaut...");

    let added = 0;
    let skipped = 0;

    for (const category of defaultCategories) {
      const exists = await BookCategory.findOne({ slug: category.slug });
      if (exists) {
        console.log(`⏭️  Catégorie "${category.name}" existe déjà`);
        skipped++;
      } else {
        await BookCategory.create(category);
        console.log(`✅ Catégorie "${category.name}" ajoutée`);
        added++;
      }
    }

    console.log("\n📊 Résumé:");
    console.log(`   - Ajoutées: ${added}`);
    console.log(`   - Existantes: ${skipped}`);
    console.log(`   - Total: ${defaultCategories.length}`);

    console.log("\n✅ Seed terminé avec succès!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seed:", error.message);
    process.exit(1);
  }
};

seedCategories();
