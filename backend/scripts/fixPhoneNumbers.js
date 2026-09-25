import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Obtenir le chemin du fichier actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des indicatifs africains pour reference
const AFRICAN_COUNTRY_CODES = {
  "+225": { country: "Cote d'Ivoire", length: 10, allowsLeadingZero: true },
  "+229": { country: "Benin", length: 8 },
  "+226": { country: "Burkina Faso", length: 8 },
  "+237": { country: "Cameroun", length: 9 },
  "+221": { country: "Senegal", length: 9 },
  "+223": { country: "Mali", length: 8 },
  "+224": { country: "Guinee", length: 9 },
  "+228": { country: "Togo", length: 8 },
  "+227": { country: "Niger", length: 8 },
  "+243": { country: "RD Congo", length: 9 },
  "+212": { country: "Maroc", length: 10, allowsLeadingZero: true },
  "+234": { country: "Nigeria", length: 11, allowsLeadingZero: true },
  "+233": { country: "Ghana", length: 10, allowsLeadingZero: true },
};

// Mode dry-run par defaut (ne modifie pas la base)
const DRY_RUN = process.argv.includes("--apply") ? false : true;

// Resultat de l'analyse
const results = {
  total: 0,
  alreadyCorrect: 0,
  autoFixed: [],
  needsReview: [],
  errors: [],
};

// Analyser un numero et determiner l'action
function analyzePhoneNumber(phone, userId, userName) {
  const original = phone;
  const clean = phone.replace(/[\s\-\(\)\.]/g, "");

  // Cas 1: Deja correct (commence par +)
  if (clean.startsWith("+")) {
    return { status: "correct", phone: clean };
  }

  // Cas 2: Commence par 00 (format international)
  if (clean.startsWith("00")) {
    const fixed = "+" + clean.slice(2);
    return {
      status: "autofix",
      original,
      fixed,
      reason: "Format 00XXX -> +XXX",
      userId,
      userName,
    };
  }

  // Cas 3: 10 chiffres commencant par 0 (probablement Cote d'Ivoire +225)
  if (clean.length === 10 && clean.startsWith("0")) {
    return {
      status: "review",
      original,
      suggestion: "+225" + clean,
      reason: "10 chiffres avec 0 initial - probablement Cote d'Ivoire",
      userId,
      userName,
    };
  }

  // Cas 4: 8 chiffres (Benin, Togo, Mali, Burkina...)
  if (clean.length === 8 && /^\d+$/.test(clean)) {
    return {
      status: "review",
      original,
      suggestions: [
        { code: "+229", country: "Benin" },
        { code: "+228", country: "Togo" },
        { code: "+223", country: "Mali" },
        { code: "+226", country: "Burkina Faso" },
      ],
      reason: "8 chiffres - pays ambigu",
      userId,
      userName,
    };
  }

  // Cas 5: 9 chiffres (Cameroun, Senegal, Guinee...)
  if (clean.length === 9 && /^\d+$/.test(clean)) {
    const suggestions = [];
    if (clean.startsWith("6") || clean.startsWith("2")) {
      suggestions.push({ code: "+237", country: "Cameroun" });
    }
    if (clean.startsWith("7")) {
      suggestions.push({ code: "+221", country: "Senegal" });
    }
    suggestions.push({ code: "+224", country: "Guinee" });

    return {
      status: "review",
      original,
      suggestions,
      reason: "9 chiffres - pays ambigu",
      userId,
      userName,
    };
  }

  // Cas 6: Autre format non reconnu
  return {
    status: "review",
    original,
    reason: `Format non reconnu (${clean.length} chiffres)`,
    userId,
    userName,
  };
}

const fixPhoneNumbers = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("MONGO_URI non definie dans le fichier .env");
    }

    console.log("=".repeat(60));
    console.log("  SCRIPT DE CORRECTION DES NUMEROS DE TELEPHONE");
    console.log("=".repeat(60));
    console.log(`Mode: ${DRY_RUN ? "ANALYSE (dry-run)" : "APPLICATION"}`);
    console.log(
      DRY_RUN
        ? "Utilisez --apply pour appliquer les corrections"
        : "Les modifications seront appliquees!"
    );
    console.log("=".repeat(60));

    console.log("\n Connexion a MongoDB...");
    await mongoose.connect(uri, {
      family: 4,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connecte a MongoDB\n");

    // Recuperer tous les utilisateurs
    const UserModel = mongoose.model(
      "User",
      new mongoose.Schema({
        firstname: String,
        lastname: String,
        phone_number: String,
      })
    );

    const users = await UserModel.find({}, "firstname lastname phone_number");
    results.total = users.length;

    console.log(`Analyse de ${users.length} utilisateurs...\n`);

    for (const user of users) {
      const phone = user.phone_number;
      const userName = `${user.firstname} ${user.lastname}`;

      if (!phone) {
        results.errors.push({
          userId: user._id.toString(),
          userName,
          error: "Numero de telephone manquant",
        });
        continue;
      }

      const analysis = analyzePhoneNumber(phone, user._id.toString(), userName);

      switch (analysis.status) {
        case "correct":
          results.alreadyCorrect++;
          break;

        case "autofix":
          results.autoFixed.push(analysis);
          if (!DRY_RUN) {
            await UserModel.updateOne(
              { _id: user._id },
              { phone_number: analysis.fixed }
            );
            console.log(`Corrige: ${analysis.original} -> ${analysis.fixed}`);
          }
          break;

        case "review":
          results.needsReview.push(analysis);
          break;
      }
    }

    // Afficher le resume
    console.log("\n" + "=".repeat(60));
    console.log("  RESUME DE L'ANALYSE");
    console.log("=".repeat(60));
    console.log(`Total utilisateurs: ${results.total}`);
    console.log(`Deja corrects: ${results.alreadyCorrect}`);
    console.log(
      `Corriges automatiquement: ${results.autoFixed.length}${DRY_RUN ? " (simulation)" : ""}`
    );
    console.log(`A revoir manuellement: ${results.needsReview.length}`);
    console.log(`Erreurs: ${results.errors.length}`);

    // Generer le rapport JSON
    const reportPath = path.join(__dirname, "phone_numbers_report.json");
    const report = {
      generatedAt: new Date().toISOString(),
      mode: DRY_RUN ? "dry-run" : "applied",
      summary: {
        total: results.total,
        alreadyCorrect: results.alreadyCorrect,
        autoFixed: results.autoFixed.length,
        needsReview: results.needsReview.length,
        errors: results.errors.length,
      },
      autoFixed: results.autoFixed,
      needsReview: results.needsReview,
      errors: results.errors,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\nRapport genere: ${reportPath}`);

    // Afficher les numeros a revoir
    if (results.needsReview.length > 0) {
      console.log("\n" + "-".repeat(60));
      console.log("  NUMEROS A REVOIR MANUELLEMENT");
      console.log("-".repeat(60));

      results.needsReview.slice(0, 20).forEach((item, i) => {
        console.log(`\n${i + 1}. ${item.userName}`);
        console.log(`   ID: ${item.userId}`);
        console.log(`   Numero: ${item.original}`);
        console.log(`   Raison: ${item.reason}`);
        if (item.suggestion) {
          console.log(`   Suggestion: ${item.suggestion}`);
        }
        if (item.suggestions) {
          console.log(
            `   Suggestions: ${item.suggestions.map((s) => `${s.code} (${s.country})`).join(", ")}`
          );
        }
      });

      if (results.needsReview.length > 20) {
        console.log(
          `\n... et ${results.needsReview.length - 20} autres (voir le rapport JSON)`
        );
      }
    }

    console.log("\n" + "=".repeat(60));
    if (DRY_RUN) {
      console.log("Mode ANALYSE termine. Aucune modification appliquee.");
      console.log("Executez avec --apply pour appliquer les corrections.");
    } else {
      console.log("Corrections appliquees avec succes!");
    }
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("Erreur:", error.message);
    process.exit(1);
  }
};

fixPhoneNumbers();
