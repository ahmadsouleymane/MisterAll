import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Settings, Loader2, AlertCircle, RefreshCw, FileText, BookOpen, Zap, Award, CheckCircle, Clock, Sparkles, Layers, PlayCircle, Share2 } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs";
import { useState, useEffect, useMemo } from "react";
import Resume from "../components/Resume";
import ModifyCourse from "../components/ModifyCourse";
import SheetCard from "../components/SheetCard";
import { useData } from "../Contexts/DataContext";
import { useModal } from "../Contexts/ModalContext";
import useMeta from "../utils/useMeta";
import ShareCourseModal from "../components/ShareCourseModal";

function Course() {
  useMeta({
    title: "MisterAll - Cours",
    canonical: "https://misterall.tech/course",
    url: "https://misterall.tech/course",
    noIndex: true,
  });

  const navigate = useNavigate();
  const location = useLocation();

  /* ✅ Toujours sécuriser les données AVANT */
  const course = location.state?.course ?? null;

  /* ✅ HOOKS TOUJOURS EN PREMIER */
  const [tab, setTab] = useState("resume");
  const [isModify, setIsModify] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("A réviser");
  const [regenerating, setRegenerating] = useState(false);
  const { getAssetsForCourse, refreshCourseAssets } = useData();
  const { showSuccess, showError } = useModal();

  /* ✅ APRÈS les hooks, on peut rediriger (via effet pour éviter setState pendant render) */
  useEffect(() => {
    if (!course) {
      navigate("/all-courses", { replace: true });
    }
  }, [course, navigate]);

  if (!course) {
    return null;
  }

  const assets = getAssetsForCourse(course._id || course.id) || {};
  const sheets = assets.sheets || [];
  const flashcards = assets.flashcards || [];

  const getDueFlashcardsCount = (cards) => {
    if (cards.length === 0) return 0;
    const now = new Date();
    return cards.filter(card => new Date(card.nextReviewDate) <= now).length;
  };

  const dueFlashcardsCount = getDueFlashcardsCount(flashcards);

  // Fonctions utilitaires pour les calculs - memoizées pour éviter les recalculs
  const progress = useMemo(() => {
    if (sheets.length === 0) return 0
    const completed = sheets.filter(s => s.status === 'Terminé').length
    return Math.round((completed / sheets.length) * 100)
  }, [sheets])

  const avgScore = useMemo(() => {
    if (sheets.length === 0) return 0
    const total = sheets.reduce((sum, s) => sum + (s.score || 0), 0)
    return Math.round(total / sheets.length)
  }, [sheets])

  const estimatedTime = useMemo(() => {
    const remaining = sheets.filter(s => s.status !== 'Terminé').length
    if (remaining === 0) return 'Fait!'
    const minutes = remaining * 15 // 15 min par fiche
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`
  }, [sheets])

  // Déterminer la couleur de la barre de progression
  const getProgressBarColor = (progress) => {
    if (progress === 0) return 'bg-surface'
    if (progress <= 30) return 'bg-gradient-to-r from-error to-error/80'
    if (progress <= 70) return 'bg-gradient-to-r from-warning to-warning/80'
    if (progress < 100) return 'bg-gradient-to-r from-info to-info/80'
    return 'bg-gradient-to-r from-success to-success/80'
  }

  // Calculer les stats globales
  const stats = useMemo(() => {
    return {
      progress,
      avgScore,
      completed: sheets.filter(s => s.status === 'Terminé').length,
      estimatedTime,
    }
  }, [sheets, progress, avgScore, estimatedTime])

  // Déterminer le statut réel
  const getStatus = () => {
    // Si pas d'assets du tout
    if (!assets || Object.keys(assets).length === 0) {
      return 'failed'
    }

    // ✅ PRIORITÉ 1: Vérifier si "processing" est RÉCENT (vraie génération en cours)
    if (assets.status === 'processing') {
      // Vérifier si la mise à jour est récente (moins de 5 minutes)
      const updatedAt = assets.updatedAt ? new Date(assets.updatedAt) : null
      const now = new Date()
      const diffMinutes = updatedAt ? (now - updatedAt) / (1000 * 60) : 999

      // Si la mise à jour date de moins de 5 minutes → vraiment en génération
      if (diffMinutes < 5) {
        return 'processing'
      }

    }

    // ✅ PRIORITÉ 2: Vérifier la QUALITÉ du contenu pour déterminer completed/failed

    // Vérifier la QUALITÉ du résumé
    const resumeText = assets.resume ? assets.resume.trim() : ''
    const hasValidResume = resumeText.length > 500 &&
      !resumeText.includes("Résumé non généré") &&
      !resumeText.includes("erreur technique") &&
      !resumeText.includes("⚠️")

    // Vérifier la QUALITÉ des fiches
    const hasValidSheets = assets.sheets &&
      Array.isArray(assets.sheets) &&
      assets.sheets.length > 0 &&
      assets.sheets.some(sheet =>
        sheet.content &&
        sheet.content.trim().length > 100 &&
        sheet.quizs &&
        Array.isArray(sheet.quizs) &&
        sheet.quizs.length > 0
      )

    // Vérifier la QUALITÉ des quiz
    const hasValidQuizs = assets.allQuizs &&
      Array.isArray(assets.allQuizs) &&
      assets.allQuizs.length >= 5 &&
      assets.allQuizs.some(q =>
        q.quiz &&
        q.quiz.trim().length > 10 &&
        q.answers &&
        Array.isArray(q.answers) &&
        q.answers.length >= 2
      )

    // OK si a des fiches valides OU des quiz valides
    if (hasValidSheets || hasValidQuizs) {
      return 'completed'
    }

    // ERREUR si tout est invalide ou incomplet
    if (!hasValidResume && !hasValidSheets && !hasValidQuizs) {
      return 'failed'
    }

    // Par défaut, erreur
    return 'failed'
  }

  const status = getStatus();

  // Polling pour rafraîchir si en processing
  useEffect(() => {
    if (status === 'processing') {
      const interval = setInterval(() => {
        refreshCourseAssets(course._id || course.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [status, course._id, course.id, refreshCourseAssets]);

  // Polling continu pour rafraîchir les stats toutes les 10 secondes (quand cours actif)
  useEffect(() => {
    // Ne pas poller si le cours est en "processing" (déjà géré par l'autre useEffect)
    if (status === 'processing') return;

    // Ne pas poller si le cours est terminé à 100%
    if (stats.progress === 100) return;

    // Polling toutes les 10 secondes
    const interval = setInterval(() => {
      refreshCourseAssets(course._id || course.id);
    }, 10000);

    return () => clearInterval(interval);
  }, [status, stats.progress, course._id, course.id, refreshCourseAssets]);

  // Fonction pour régénérer les assets
  const handleRegenerate = async () => {
    const API_URL = import.meta.env.VITE_API_URL;
    if (!API_URL) {
      showError('Configuration API manquante');
      return;
    }

    setRegenerating(true);
    const courseId = course._id || course.id;

    try {
      const response = await fetch(`${API_URL}/course/regenerate/${courseId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Régénération lancée ! Le cours sera prêt dans quelques instants.');
        setTimeout(() => refreshCourseAssets(courseId), 500);
      } else {
        showError(data.message || 'Erreur lors de la régénération');
      }
    } catch (error) {
      console.error('Erreur régénération:', error);
      showError('Erreur de connexion au serveur');
    } finally {
      setRegenerating(false);
    }
  };

  // Afficher un écran d'erreur si failed
  if (status === 'failed') {
    return (
      <div className='min-h-screen bg-dark flex flex-col items-center justify-center p-5 gap-6'>
        <div className='w-16 h-16 rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center'>
          <AlertCircle className='w-8 h-8 text-error' />
        </div>
        <h2 className='text-error text-2xl font-bold text-center'>
          Génération échouée
        </h2>
        <p className='text-text-tertiary text-center max-w-md'>
          Une erreur est survenue lors de la génération des assets pour ce cours.
        </p>
        {assets.error && (
          <p className='text-sm text-text-quaternary text-center max-w-md'>
            Erreur: {assets.error}
          </p>
        )}
        <div className='flex gap-3 mt-4'>
          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className='
              px-6 py-2.5 bg-accent text-dark
              font-bold rounded-xl
              hover:shadow-glow-lg hover:scale-105
              active:scale-95
              flex items-center gap-2
              disabled:opacity-50 transition-all
            '
          >
            {regenerating ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <RefreshCw className='w-4 h-4' />
            )}
            Réessayer
          </button>
          <button
            onClick={() => navigate(-1)}
            className='
              px-6 py-2.5 glass-effect border border-white/20 text-text-secondary
              font-bold rounded-xl hover:border-accent/30
              transition-all
            '
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  const accessibleSheets = sheets;
  const accessibleFlashcards = flashcards;

  const visibleSheets = accessibleSheets.filter(
    (sheet) => sheet.status === selectedFilter
  );

  const totalSheets = accessibleSheets.length;

  const countByStatus = {
    "A réviser": sheets.filter((s) => s.status === "A réviser").length,
    "En cours": sheets.filter((s) => s.status === "En cours").length,
    "Terminé": sheets.filter((s) => s.status === "Terminé").length,
  };

  const progressByStatus = {
    "A réviser": totalSheets === 0 ? 0 : Math.round((countByStatus["A réviser"] / totalSheets) * 100),
    "En cours": totalSheets === 0 ? 0 : Math.round((countByStatus["En cours"] / totalSheets) * 100),
    "Terminé": totalSheets === 0 ? 0 : Math.round((countByStatus["Terminé"] / totalSheets) * 100),
  };

  return (
    <div className='min-h-screen bg-dark pb-24 page-transition'>
      {/* Background animé */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-30' />
        <div className='absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float' />
        <div className='absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-[100px] animate-float-gentle' />
      </div>

      {/* Container */}
      <div className='relative max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5 sm:space-y-6'>

        {/* Bannière processing modernisée */}
        {status === 'processing' && (
          <div className='glass-accent rounded-xl p-4 mb-2 border border-accent/30 shadow-glow-sm animate-pulse-glow'>
            <div className='flex items-center gap-3'>
              <Loader2 className='h-5 w-5 text-accent animate-spin flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-accent font-bold text-sm'>Génération IA en cours</p>
                <p className='text-accent/80 text-xs mt-1'>
                  Les fiches et quiz sont créés. Actualisez pour voir la progression.
                </p>
              </div>
              <button
                onClick={() => refreshCourseAssets(course._id || course.id)}
                className='
                  glass-effect px-3 py-2 rounded-lg
                  hover:bg-accent/10 transition-all flex-shrink-0
                '
              >
                <RefreshCw className='h-4 w-4 text-accent' />
              </button>
            </div>
          </div>
        )}

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: course.title }
          ]}
        />

        {/* Header modernisé */}
        <div className='flex items-center gap-3 sm:gap-4 relative'>
          <button
            onClick={() => navigate(-1)}
            className='
              p-2.5 rounded-xl glass-effect border border-white/20
              text-text-secondary hover:text-accent
              hover:border-accent/30 hover:shadow-glass-accent
              transition-all duration-300 group flex-shrink-0
            '
          >
            <ArrowLeft className='h-6 w-6 group-hover:-translate-x-1 transition-transform' />
          </button>

          <div className='flex-1 min-w-0'>
            <h1 className='text-text-primary text-2xl sm:text-3xl font-bold line-clamp-2'>
              {course.title}
            </h1>
            <div className='mt-2'>
              <span className='
                glass-accent px-3 py-1.5 rounded-full
                text-xs font-bold text-accent uppercase
                inline-block
              '>
                {course.subject}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className='
                p-2.5 rounded-xl glass-effect border border-white/20
                text-text-secondary hover:text-accent
                hover:border-accent/30 hover:shadow-glass-accent
                transition-all duration-300 group flex-shrink-0
              '
              title="Partager le cours"
            >
              <Share2 className='h-6 w-6 group-hover:scale-110 transition-transform' />
            </button>

            <button
              onClick={() => setIsModify(!isModify)}
              className='
                p-2.5 rounded-xl glass-effect border border-white/20
                text-text-secondary hover:text-accent
                hover:border-accent/30 hover:shadow-glass-accent
                transition-all duration-300 group flex-shrink-0
              '
            >
              <Settings className='h-6 w-6 group-hover:rotate-90 transition-transform' />
            </button>
          </div>
        </div>

        {/* Carte de progression compacte */}
        <div className='glass-effect rounded-xl p-5 sm:p-6 border border-white/20 hover:shadow-glass-accent transition-all duration-300 group'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-4 sm:mb-5'>
            <div className='w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-info/10 border border-white/20 border-info/20 flex items-center justify-center'>
              <Zap className='h-5 w-5 text-info' />
            </div>
            <p className='text-text-secondary text-xs sm:text-sm font-medium uppercase tracking-wider'>
              Progression du cours
            </p>
          </div>

          {/* Progress principale */}
          <div className='space-y-2 sm:space-y-2.5'>
            <div className='flex items-baseline justify-between'>
              <p className='text-text-secondary text-sm font-medium'>
                Progression
              </p>
              <p className='text-text-primary text-xl sm:text-2xl font-bold'>
                {stats.progress}%
              </p>
            </div>

            {/* Barre de progression */}
            <div className='w-full h-2 sm:h-2.5 bg-surface rounded-full overflow-hidden'>
              <div
                className={`h-full rounded-full transition-all duration-600 ${getProgressBarColor(stats.progress)}`}
                style={{ width: `${stats.progress}%` }}
              />
            </div>
          </div>

          {/* Score secondaire */}
          <div className='mt-4 sm:mt-5 flex items-center gap-2'>
            <Award className='h-3.5 w-3.5 text-text-tertiary' />
            <p className='text-text-tertiary text-xs sm:text-sm font-medium'>
              Score moyen: <span className='text-text-secondary font-semibold'>{stats.avgScore}/100</span>
            </p>
          </div>
        </div>

        {/* Tabs modernisées */}
        <div className='flex gap-2 sm:gap-3'>
          <button
            onClick={() => setTab('resume')}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-3 py-3 rounded-xl
              transition-all duration-300
              ${tab === 'resume'
                ? 'glass-accent border-2 border-accent text-accent font-bold'
                : 'glass-effect border border-white/20 text-text-secondary hover:border-accent/30'
              }
            `}
          >
            <FileText className='h-5 w-5' />
            <span className='hidden sm:inline'>Résumé</span>
          </button>

          <button
            onClick={() => setTab('fiches')}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-3 py-3 rounded-xl
              transition-all duration-300
              ${tab === 'fiches'
                ? 'glass-accent border-2 border-accent text-accent font-bold'
                : 'glass-effect border border-white/20 text-text-secondary hover:border-accent/30'
              }
            `}
          >
            <BookOpen className='h-5 w-5' />
            <span className='hidden sm:inline'>Fiches</span>
            {sheets.length > 0 && (
              <span className='ml-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold'>
                {sheets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab('flashcards')}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-3 py-3 rounded-xl
              transition-all duration-300
              ${tab === 'flashcards'
                ? 'glass-accent border-2 border-accent text-accent font-bold'
                : 'glass-effect border border-white/20 text-text-secondary hover:border-accent/30'
              }
            `}
          >
            <Layers className='h-5 w-5' />
            <span className='hidden sm:inline'>Flashcards</span>
            {dueFlashcardsCount > 0 && (
              <span className='ml-1 px-2 py-0.5 rounded-full bg-error/20 text-error text-xs font-bold animate-pulse'>
                {dueFlashcardsCount}
              </span>
            )}
          </button>
        </div>

        {/* Contenu des fiches */}
        {tab === 'fiches' && (
          <>
            {/* Filtres modernisés */}
            <div className='flex gap-2 sm:gap-3 justify-center flex-wrap'>
              {['A réviser', 'En cours', 'Terminé'].map((filterStatus) => {
                const filterConfig = {
                  'A réviser': { icon: AlertCircle, color: 'error', count: countByStatus['A réviser'] },
                  'En cours': { icon: Clock, color: 'warning', count: countByStatus['En cours'] },
                  'Terminé': { icon: CheckCircle, color: 'success', count: countByStatus['Terminé'] },
                }[filterStatus]

                const FilterIcon = filterConfig.icon

                return (
                  <button
                    key={filterStatus}
                    onClick={() => setSelectedFilter(filterStatus)}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl
                      transition-all duration-300
                      ${selectedFilter === filterStatus
                        ? `glass-accent border-2 border-${filterConfig.color} text-accent font-bold`
                        : 'glass-effect border border-white/20 text-text-secondary hover:border-accent/30'
                      }
                    `}
                  >
                    <FilterIcon className='h-4 w-4' />
                    <span className='hidden sm:inline text-sm'>{filterStatus}</span>
                    <span className='px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold'>
                      {filterConfig.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Grille de fiches */}
            {visibleSheets.length > 0 ? (
              <div className='grid grid-cols-1 gap-4 auto-rows-fr'>
                {visibleSheets.map((sheet, index) => (
                  <div
                    key={sheet._id || index}
                    className='animate-slide-up'
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <SheetCard
                      courseId={course._id || course.id}
                      sheetId={sheet._id || sheet.id}
                      title={sheet.title}
                      content={sheet.content}
                      quizs={sheet.quizs}
                      score={sheet.score || 0}
                      status={sheet.status}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className='glass-effect rounded-xl p-12 text-center'>
                <Sparkles className='h-16 w-16 mx-auto mb-4 text-accent opacity-50 animate-float' />
                <p className='text-text-primary font-bold text-lg mb-2'>
                  Aucune fiche {selectedFilter.toLowerCase()}
                </p>
                <p className='text-text-tertiary text-sm'>
                  Continuez à réviser pour débloquer des fiches
                </p>
              </div>
            )}

          </>
        )}

        {/* Contenu du résumé */}
        {tab === 'resume' && (
          <div>
            {assets.resume ? (
              <Resume resume={assets.resume} />
            ) : (
              <div className='glass-effect rounded-xl p-12 text-center'>
                <Sparkles className='h-16 w-16 mx-auto mb-4 text-text-tertiary opacity-30' />
                <p className='text-text-secondary text-lg'>Aucun résumé disponible</p>
              </div>
            )}
          </div>
        )}

        {/* Contenu des flashcards */}
        {tab === 'flashcards' && (
          <div className='space-y-6'>
            {flashcards.length > 0 ? (
              <>
                {/* Stats Card */}
                <div className='glass-effect rounded-xl p-5 sm:p-6 border border-white/20'>
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center'>
                        <Layers className='h-5 w-5 text-accent' />
                      </div>
                      <div>
                        <p className='text-text-primary font-bold'>Flashcards</p>
                        <p className='text-text-tertiary text-sm'>
                          {accessibleFlashcards.length} cartes
                        </p>
                      </div>
                    </div>
                    {dueFlashcardsCount > 0 && (
                      <div className='glass-accent px-4 py-2 rounded-full border border-accent/30'>
                        <span className='text-accent font-bold text-sm'>
                          {dueFlashcardsCount} à réviser
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-text-tertiary'>Cartes maîtrisées</span>
                      <span className='text-text-primary font-bold'>
                        {accessibleFlashcards.filter(c => c.interval >= 21).length} / {accessibleFlashcards.length}
                      </span>
                    </div>
                    <div className='h-2 bg-surface rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-gradient-to-r from-success to-success/80 rounded-full transition-all duration-500'
                        style={{
                          width: `${accessibleFlashcards.length > 0
                            ? (accessibleFlashcards.filter(c => c.interval >= 21).length / accessibleFlashcards.length) * 100
                            : 0}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => navigate('/flashcards', {
                    state: {
                      courseId: course._id || course.id,
                      courseTitle: course.title
                    }
                  })}
                  disabled={dueFlashcardsCount === 0}
                  className={`
                    w-full flex items-center justify-center gap-3
                    px-6 py-4 rounded-xl
                    font-bold text-lg
                    transition-all duration-300
                    ${dueFlashcardsCount > 0
                      ? 'bg-accent text-dark hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98]'
                      : 'glass-effect border border-white/20 text-text-tertiary cursor-not-allowed'
                    }
                  `}
                >
                  <PlayCircle className='h-6 w-6' />
                  {dueFlashcardsCount > 0
                    ? `Réviser ${dueFlashcardsCount} flashcard${dueFlashcardsCount > 1 ? 's' : ''}`
                    : 'Aucune carte à réviser'
                  }
                </button>

                {/* Info about next review */}
                {dueFlashcardsCount === 0 && accessibleFlashcards.length > 0 && (
                  <div className='glass-effect rounded-xl p-4 border border-white/20/50 text-center'>
                    <p className='text-text-tertiary text-sm'>
                      Tu as révisé toutes tes flashcards ! Reviens plus tard pour continuer.
                    </p>
                  </div>
                )}

              </>
            ) : (
              <div className='glass-effect rounded-xl p-12 text-center'>
                <Layers className='h-16 w-16 mx-auto mb-4 text-text-tertiary opacity-30' />
                <p className='text-text-primary font-bold text-lg mb-2'>
                  Pas encore de flashcards
                </p>
                <p className='text-text-tertiary text-sm'>
                  Les flashcards seront générées automatiquement lors de la création du cours.
                </p>
              </div>
            )}
          </div>
        )}

        <p className='text-text-quaternary text-xs text-center py-4'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>

        {/* Modal modifier */}
        {isModify && <ModifyCourse setIsModify={setIsModify} />}

        {/* Modal partage */}
        <ShareCourseModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          courseId={course._id || course.id}
          courseTitle={course.title}
        />
      </div>
    </div>
  );
}

export default Course;
