import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGO_URI;
await mongoose.connect(uri);

const UserModel = mongoose.model(
  "User",
  new mongoose.Schema({
    firstname: String,
    lastname: String,
    phone_number: String,
  })
);

const users = await UserModel.find({}).lean();

console.log("=== CORRECTION DES NUMEROS ===");
console.log("Total utilisateurs:", users.length);
console.log("");

let corrected = 0;
let alreadyOk = 0;
let errors = [];

for (const user of users) {
  const phone = user.phone_number;
  const name = (user.firstname || "") + " " + (user.lastname || "");

  if (!phone) {
    errors.push({ name, error: "Numero vide" });
    continue;
  }

  // Deja correct avec +
  if (phone.startsWith("+")) {
    alreadyOk++;
    continue;
  }

  let fixedPhone = null;
  let reason = "";

  // Nettoyer le numero (enlever espaces, tirets, etc.)
  const clean = phone.replace(/[\s\-\(\)\.]/g, "");

  // Cas 1: 10 chiffres commencant par 0 -> Cote d'Ivoire (+225)
  if (clean.length === 10 && clean.startsWith("0")) {
    fixedPhone = "+225" + clean;
    reason = "10 chiffres avec 0 -> +225";
  }
  // Cas 2: 9 chiffres SANS le 0 initial -> Cote d'Ivoire (+225 + 0 + numero)
  else if (clean.length === 9 && /^\d+$/.test(clean)) {
    // Numeros ivoiriens: 01, 05, 07, 02, 04
    const firstDigit = clean[0];
    if (["1", "5", "7", "2", "4"].includes(firstDigit)) {
      fixedPhone = "+2250" + clean;
      reason = "9 chiffres ivoirien sans 0 -> +2250" + clean[0] + "...";
    }
    // Si commence par 6 -> peut-etre Cameroun
    else if (firstDigit === "6") {
      fixedPhone = "+237" + clean;
      reason = "9 chiffres commence par 6 -> +237 Cameroun";
    }
    // Sinon on ajoute +2250 par defaut
    else {
      fixedPhone = "+2250" + clean;
      reason = "9 chiffres -> +2250 par defaut";
    }
  }
  // Cas 3: 11 chiffres commencant par 0 (erreur de saisie)
  else if (clean.length === 11 && clean.startsWith("0")) {
    // Probablement un chiffre en trop, on prend les 10 premiers
    fixedPhone = "+225" + clean.slice(0, 10);
    reason = "11 chiffres -> tronque a 10 + +225";
  }
  // Cas 4: Commence par 222 (Mauritanie sans +)
  else if (clean.startsWith("222") && clean.length >= 10) {
    fixedPhone = "+" + clean;
    reason = "Mauritanie sans + -> +" + clean.slice(0, 3);
  }
  // Cas 5: 8 chiffres (Benin, Togo, etc.) -> on met +225 par defaut
  else if (clean.length === 8 && /^\d+$/.test(clean)) {
    fixedPhone = "+2250" + clean;
    reason = "8 chiffres -> +2250 (ajoute 0)";
  }
  // Cas 6: Autre format avec que des chiffres
  else if (/^\d{7,12}$/.test(clean)) {
    if (clean.length < 10) {
      // Ajouter des 0 pour arriver a 10 chiffres
      const padded = clean.padStart(10, "0");
      fixedPhone = "+225" + padded;
      reason = "Moins de 10 chiffres -> complete avec 0";
    } else {
      fixedPhone = "+225" + clean;
      reason = "Format inconnu -> +225 par defaut";
    }
  }

  if (fixedPhone) {
    try {
      await UserModel.updateOne({ _id: user._id }, { phone_number: fixedPhone });
      console.log("CORRIGE:", name.trim());
      console.log("  Avant:", phone);
      console.log("  Apres:", fixedPhone);
      console.log("  Raison:", reason);
      console.log("");
      corrected++;
    } catch (err) {
      if (err.code === 11000) {
        // Doublon - le numero existe deja
        console.log("DOUBLON:", name.trim());
        console.log("  Numero:", phone, "->", fixedPhone);
        console.log("  Ce numero existe deja dans la base (compte duplique?)");
        console.log("");
        errors.push({ name: name.trim(), phone, fixedPhone, error: "Doublon - numero existe deja" });
      } else {
        throw err;
      }
    }
  } else {
    errors.push({ name: name.trim(), phone, error: "Format non reconnu" });
  }
}

console.log("=".repeat(50));
console.log("RESUME:");
console.log("  - Deja corrects:", alreadyOk);
console.log("  - Corriges:", corrected);
console.log("  - Erreurs:", errors.length);

if (errors.length > 0) {
  console.log("");
  console.log("ERREURS:");
  errors.forEach((e) => console.log("  -", e.name, ":", e.phone || e.error));
}

await mongoose.disconnect();
console.log("");
console.log("Termine!");
