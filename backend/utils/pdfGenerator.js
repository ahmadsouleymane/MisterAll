import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Couleurs MisterAll
const COLORS = {
  primary: '#FFFF5C',    // Jaune accent
  dark: '#0A0A0A',       // Fond sombre
  text: '#333333',       // Texte principal
  textLight: '#666666',  // Texte secondaire
  border: '#E5E5E5'      // Bordures
}

/**
 * Génère un PDF de flashcards pour un cours
 * @param {Object[]} flashcards - Tableau de flashcards
 * @param {string} courseName - Nom du cours
 * @returns {PDFDocument} - Document PDF
 */
export const generateFlashcardsPDF = (flashcards, courseName) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Flashcards - ${courseName}`,
      Author: 'MisterAll',
      Creator: 'MisterAll - Application éducative'
    }
  })

  // Page de couverture
  doc.fontSize(32)
     .fillColor(COLORS.primary)
     .text('MisterAll', { align: 'center' })

  doc.moveDown(0.5)
     .fontSize(14)
     .fillColor(COLORS.textLight)
     .text('Flashcards', { align: 'center' })

  doc.moveDown(2)
     .fontSize(24)
     .fillColor(COLORS.text)
     .text(courseName, { align: 'center' })

  doc.moveDown(1)
     .fontSize(12)
     .fillColor(COLORS.textLight)
     .text(`${flashcards.length} flashcard${flashcards.length > 1 ? 's' : ''}`, { align: 'center' })

  doc.moveDown(0.5)
     .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })

  // Ligne décorative
  doc.moveDown(2)
  const lineY = doc.y
  doc.strokeColor(COLORS.primary)
     .lineWidth(2)
     .moveTo(150, lineY)
     .lineTo(445, lineY)
     .stroke()

  // Flashcards - 2 par page
  const cardsPerPage = 2
  const cardHeight = 300
  const pageHeight = 842 // A4 height
  const margin = 50

  for (let i = 0; i < flashcards.length; i++) {
    // Nouvelle page pour chaque paire de flashcards
    if (i % cardsPerPage === 0) {
      doc.addPage()

      // En-tête de page
      doc.fontSize(10)
         .fillColor(COLORS.textLight)
         .text(`MisterAll - ${courseName}`, margin, 25, { continued: true })
         .text(`Page ${Math.floor(i / cardsPerPage) + 1}`, { align: 'right' })
    }

    const card = flashcards[i]
    const cardIndex = i % cardsPerPage
    const yOffset = 60 + (cardIndex * (cardHeight + 30))

    // Numéro de la flashcard
    doc.fontSize(10)
       .fillColor(COLORS.primary)
       .text(`Flashcard ${i + 1}/${flashcards.length}`, margin, yOffset)

    // Cadre Question
    const questionY = yOffset + 20
    doc.roundedRect(margin, questionY, 495, 120, 8)
       .strokeColor(COLORS.border)
       .lineWidth(1)
       .stroke()

    doc.fontSize(10)
       .fillColor(COLORS.primary)
       .text('QUESTION', margin + 15, questionY + 10)

    doc.fontSize(12)
       .fillColor(COLORS.text)
       .text(card.question || '', margin + 15, questionY + 30, {
         width: 465,
         height: 75,
         ellipsis: true
       })

    // Cadre Réponse
    const answerY = questionY + 135
    doc.roundedRect(margin, answerY, 495, 120, 8)
       .fillAndStroke('#FFFEF0', COLORS.primary)

    doc.fontSize(10)
       .fillColor(COLORS.primary)
       .text('RÉPONSE', margin + 15, answerY + 10)

    doc.fontSize(12)
       .fillColor(COLORS.text)
       .text(card.answer || '', margin + 15, answerY + 30, {
         width: 465,
         height: 75,
         ellipsis: true
       })
  }

  // Dernière page - Résumé
  doc.addPage()
  doc.fontSize(24)
     .fillColor(COLORS.text)
     .text('Résumé', { align: 'center' })

  doc.moveDown(1)
     .fontSize(14)
     .fillColor(COLORS.textLight)
     .text(`Vous avez ${flashcards.length} flashcard${flashcards.length > 1 ? 's' : ''} à réviser.`, { align: 'center' })

  doc.moveDown(2)
     .fontSize(12)
     .text('Conseils pour une révision efficace:', { underline: true })

  doc.moveDown(0.5)
     .fontSize(11)
     .fillColor(COLORS.text)
     .list([
       'Révisez régulièrement, de préférence tous les jours',
       'Utilisez la technique de répétition espacée',
       'Essayez de répondre avant de regarder la réponse',
       'Marquez les cartes difficiles pour les réviser plus souvent'
     ])

  doc.moveDown(3)
     .fontSize(10)
     .fillColor(COLORS.textLight)
     .text('Généré par MisterAll - Votre assistant d\'apprentissage', { align: 'center' })
     .text('misterall.tech', { align: 'center', link: 'https://misterall.tech' })

  return doc
}

/**
 * Génère un PDF de résumé
 * @param {string} resume - Contenu du résumé
 * @param {string} courseName - Nom du cours
 * @returns {PDFDocument} - Document PDF
 */
export const generateResumePDF = (resume, courseName) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Résumé - ${courseName}`,
      Author: 'MisterAll'
    }
  })

  // En-tête
  doc.fontSize(10)
     .fillColor(COLORS.textLight)
     .text('MisterAll', { continued: true })
     .text(new Date().toLocaleDateString('fr-FR'), { align: 'right' })

  doc.moveDown(1)
     .fontSize(24)
     .fillColor(COLORS.text)
     .text(courseName, { align: 'center' })

  doc.moveDown(0.5)
     .fontSize(14)
     .fillColor(COLORS.primary)
     .text('Résumé du cours', { align: 'center' })

  // Ligne décorative
  doc.moveDown(1)
  const lineY = doc.y
  doc.strokeColor(COLORS.primary)
     .lineWidth(2)
     .moveTo(50, lineY)
     .lineTo(545, lineY)
     .stroke()

  // Contenu
  doc.moveDown(1)
     .fontSize(11)
     .fillColor(COLORS.text)
     .text(resume || 'Aucun résumé disponible.', {
       width: 495,
       align: 'justify',
       lineGap: 4
     })

  // Pied de page
  const bottomY = 780
  doc.fontSize(9)
     .fillColor(COLORS.textLight)
     .text('Généré par MisterAll - misterall.tech', 50, bottomY, { align: 'center' })

  return doc
}
