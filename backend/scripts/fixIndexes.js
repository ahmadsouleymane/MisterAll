/**
 * Script de migration pour corriger les index MongoDB
 * Exécuter avec: node scripts/fixIndexes.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function fixIndexes() {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connecté !');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // 1. Supprimer le champ phone_number où il est null
    console.log('\n1. Suppression des champs phone_number null...');
    const phoneResult = await usersCollection.updateMany(
      { phone_number: null },
      { $unset: { phone_number: "" } }
    );
    console.log(`   ${phoneResult.modifiedCount} documents mis à jour`);

    // 2. Supprimer le champ email où il est null
    console.log('\n2. Suppression des champs email null...');
    const emailResult = await usersCollection.updateMany(
      { email: null },
      { $unset: { email: "" } }
    );
    console.log(`   ${emailResult.modifiedCount} documents mis à jour`);

    // 3. Supprimer le champ googleId où il est null
    console.log('\n3. Suppression des champs googleId null...');
    const googleResult = await usersCollection.updateMany(
      { googleId: null },
      { $unset: { googleId: "" } }
    );
    console.log(`   ${googleResult.modifiedCount} documents mis à jour`);

    // 4. Lister les index actuels
    console.log('\n4. Index actuels:');
    const indexes = await usersCollection.indexes();
    indexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // 5. Supprimer et recréer les index
    console.log('\n5. Suppression des anciens index...');

    const indexesToDrop = ['phone_number_1', 'email_1', 'googleId_1'];
    for (const indexName of indexesToDrop) {
      try {
        await usersCollection.dropIndex(indexName);
        console.log(`   Index ${indexName} supprimé`);
      } catch (e) {
        console.log(`   Index ${indexName} n'existe pas ou déjà supprimé`);
      }
    }

    // 6. Recréer les index avec sparse: true
    console.log('\n6. Création des nouveaux index sparse...');

    await usersCollection.createIndex(
      { phone_number: 1 },
      { unique: true, sparse: true }
    );
    console.log('   Index phone_number créé');

    await usersCollection.createIndex(
      { email: 1 },
      { unique: true, sparse: true }
    );
    console.log('   Index email créé');

    await usersCollection.createIndex(
      { googleId: 1 },
      { unique: true, sparse: true }
    );
    console.log('   Index googleId créé');

    // 7. Vérifier les nouveaux index
    console.log('\n7. Nouveaux index:');
    const newIndexes = await usersCollection.indexes();
    newIndexes.forEach(idx => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)} ${idx.sparse ? '(sparse)' : ''}`);
    });

    console.log('\n✅ Migration terminée avec succès !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDéconnecté de MongoDB');
  }
}

fixIndexes();
