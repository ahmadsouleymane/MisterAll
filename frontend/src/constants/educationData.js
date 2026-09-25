// Types d'education
export const EDUCATION_TYPES = [
  { value: 'secondary', label: 'Secondaire (College/Lycee)' },
  { value: 'university', label: 'Universitaire' }
];

// Programmes universitaires (existants)
export const UNIVERSITY_PROGRAMS = [
  { value: "Sciences & Technologies", label: "Sciences & Technologies" },
  { value: "Ingenierie & Genie", label: "Ingenierie & Genie" },
  { value: "Sante & Sciences medicales", label: "Sante & Sciences medicales" },
  { value: "Economie, Gestion & Commerce", label: "Economie, Gestion & Commerce" },
  { value: "Droit, Sciences politiques & Administration", label: "Droit, Sciences politiques & Administration" },
  { value: "Sciences humaines & sociales", label: "Sciences humaines & sociales" },
  { value: "Lettres, Langues & Communication", label: "Lettres, Langues & Communication" },
  { value: "Agriculture, Environnement & Ressources", label: "Agriculture, Environnement & Ressources" },
  { value: "Arts, Design & Architecture", label: "Arts, Design & Architecture" },
  { value: "Tourisme, Hotellerie & Services", label: "Tourisme, Hotellerie & Services" },
  { value: "Filieres professionnelles & BTS", label: "Filieres professionnelles & BTS" }
];

// Niveaux universitaires (existants)
export const UNIVERSITY_LEVELS = [
  { value: "L1", label: "L1 (Licence 1)" },
  { value: "L2", label: "L2 (Licence 2)" },
  { value: "L3", label: "L3 (Licence 3)" },
  { value: "M1", label: "M1 (Master 1)" },
  { value: "M2", label: "M2 (Master 2)" }
];

// Niveaux du secondaire
export const SECONDARY_LEVELS = {
  college: [
    { value: "6eme", label: "6eme" },
    { value: "5eme", label: "5eme" },
    { value: "4eme", label: "4eme" },
    { value: "3eme", label: "3eme (BEPC)" }
  ],
  lycee: [
    { value: "2nde", label: "2nde (Seconde)" },
    { value: "1ere", label: "1ere (Premiere)" },
    { value: "Tle", label: "Terminale (BAC)" }
  ]
};

// Series du baccalaureat regroupees par type
export const BAC_SERIES = {
  general: {
    label: "Enseignement General",
    series: [
      { value: "A1", label: "A1 - Lettres (Math renforce)" },
      { value: "A2", label: "A2 - Lettres (Langues)" },
      { value: "B", label: "B - Economique et Social" },
      { value: "C", label: "C - Mathematiques et Sciences Physiques" },
      { value: "D", label: "D - Mathematiques et SVT" }
    ]
  },
  technique: {
    label: "Enseignement Technique",
    series: [
      { value: "E", label: "E - Sciences et Technologies" },
      { value: "F1", label: "F1 - Mecanique" },
      { value: "F2", label: "F2 - Electronique" },
      { value: "F3", label: "F3 - Electrotechnique" },
      { value: "F4", label: "F4 - Genie Civil" },
      { value: "F5", label: "F5 - Froid et Climatisation" },
      { value: "F7", label: "F7 - Biochimie" },
      { value: "G1", label: "G1 - Techniques administratives" },
      { value: "G2", label: "G2 - Techniques de Gestion" }
    ]
  },
  artistique: {
    label: "Enseignement Artistique",
    series: [
      { value: "H1", label: "H1 - Arts plastiques" },
      { value: "H2", label: "H2 - Musique" },
      { value: "H3", label: "H3 - Arts dramatiques" }
    ]
  }
};

// Orientations pour les eleves de 2nde (tronc commun)
export const SECONDE_ORIENTATIONS = [
  { value: "litteraire", label: "Litteraire (vers A/B)" },
  { value: "scientifique", label: "Scientifique (vers C/D/E)" },
  { value: "technique", label: "Technique (vers F/G)" }
];

// Helper: Verifie si la serie est requise
export const needsSeries = (level) => {
  return ['1ere', 'Tle'].includes(level);
};

// Helper: Verifie si l'orientation est requise
export const needsOrientation = (level) => {
  return level === '2nde';
};

// Helper: Retourne toutes les series sous forme de tableau plat
export const getAllSeries = () => {
  return [
    ...BAC_SERIES.general.series,
    ...BAC_SERIES.technique.series,
    ...BAC_SERIES.artistique.series
  ];
};

// Helper: Retourne le label de la serie
export const getSeriesLabel = (seriesValue) => {
  const allSeries = getAllSeries();
  const found = allSeries.find(s => s.value === seriesValue);
  return found ? found.label : seriesValue;
};

// Helper: Retourne le label de l'orientation
export const getOrientationLabel = (orientationValue) => {
  const found = SECONDE_ORIENTATIONS.find(o => o.value === orientationValue);
  return found ? found.label : orientationValue;
};

// Helper: Formate l'affichage du niveau scolaire
export const formatEducationDisplay = (user) => {
  if (!user) return '';

  if (user.educationType === 'secondary' || user.secondaryCycle) {
    let display = user.level || '';

    if (user.series) {
      display += ` - Serie ${user.series}`;
    } else if (user.seriesOrientation) {
      const orientationLabels = {
        litteraire: 'Orientation Litteraire',
        scientifique: 'Orientation Scientifique',
        technique: 'Orientation Technique'
      };
      display += ` - ${orientationLabels[user.seriesOrientation] || user.seriesOrientation}`;
    }

    return display;
  }

  // Universitaire
  return `${user.level || ''} - ${user.program || ''}`;
};
