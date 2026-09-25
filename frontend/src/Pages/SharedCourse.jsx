import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle, FileText, BookOpen, Layers, PlayCircle, Sparkles, ExternalLink } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Resume from "../components/Resume";
import SignupIncentiveBanner from "../components/SignupIncentiveBanner";
import { getSharedCourse, getSharedCourseAssets } from "../api/sharedApi";

function SharedCourse() {
  const { shareToken } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [assets, setAssets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("resume");

  useEffect(() => {
    const loadSharedCourse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [courseData, assetsData] = await Promise.all([
          getSharedCourse(shareToken),
          getSharedCourseAssets(shareToken),
        ]);

        if (courseData.error) {
          setError(courseData.message || "Cours non trouvé");
          return;
        }

        if (assetsData.error) {
          setError(assetsData.message || "Assets non trouvés");
          return;
        }

        setCourse(courseData);
        setAssets(assetsData);
      } catch (err) {
        setError("Erreur lors du chargement du cours");
      } finally {
        setIsLoading(false);
      }
    };

    if (shareToken) {
      loadSharedCourse();
    }
  }, [shareToken]);

  const sheets = assets?.sheets || [];
  const flashcards = assets?.flashcards || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-5 gap-4">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
        <p className="text-text-secondary">Chargement du cours...</p>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-5 gap-6">
        <div className="w-16 h-16 rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <h2 className="text-error text-2xl font-bold text-center">
          Cours non trouvé
        </h2>
        <p className="text-text-tertiary text-center max-w-md">
          {error || "Ce lien de partage n'existe pas ou a été désactivé."}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 glass-effect border border-white/20 text-text-secondary font-bold rounded-xl hover:border-accent/30 transition-all"
        >
          Accueil
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark pb-24 page-transition">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-[100px] animate-float-gentle" />
      </div>

      {/* Container */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Shared badge */}
        <div className="glass-accent rounded-xl p-4 border border-accent/30">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-accent font-bold text-sm">Cours partagé</p>
                <p className="text-accent/70 text-xs">
                  Inscris-toi pour ajouter tes propres cours !
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 bg-accent text-dark font-bold text-sm rounded-xl hover:shadow-glow-sm transition-all"
            >
              Créer mes cours
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 relative">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl glass-effect border border-white/20 text-text-secondary hover:text-accent hover:border-accent/30 hover:shadow-glass-accent transition-all duration-300 group flex-shrink-0"
          >
            <ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-text-primary text-2xl sm:text-3xl font-bold line-clamp-2">
              {course.title}
            </h1>
            <div className="mt-2">
              <span className="glass-accent px-3 py-1.5 rounded-full text-xs font-bold text-accent uppercase inline-block">
                {course.subject}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setTab("resume")}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-3 py-3 rounded-xl
              transition-all duration-300
              ${tab === "resume"
                ? "glass-accent border-2 border-accent text-accent font-bold"
                : "glass-effect border border-white/20 text-text-secondary hover:border-accent/30"
              }
            `}
          >
            <FileText className="h-5 w-5" />
            <span className="hidden sm:inline">Résumé</span>
          </button>

          <button
            onClick={() => setTab("fiches")}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-3 py-3 rounded-xl
              transition-all duration-300
              ${tab === "fiches"
                ? "glass-accent border-2 border-accent text-accent font-bold"
                : "glass-effect border border-white/20 text-text-secondary hover:border-accent/30"
              }
            `}
          >
            <BookOpen className="h-5 w-5" />
            <span className="hidden sm:inline">Fiches</span>
            {sheets.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {sheets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("flashcards")}
            className={`
              flex-1 flex items-center justify-center gap-2
              px-3 py-3 rounded-xl
              transition-all duration-300
              ${tab === "flashcards"
                ? "glass-accent border-2 border-accent text-accent font-bold"
                : "glass-effect border border-white/20 text-text-secondary hover:border-accent/30"
              }
            `}
          >
            <Layers className="h-5 w-5" />
            <span className="hidden sm:inline">Flashcards</span>
            {flashcards.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">
                {flashcards.length}
              </span>
            )}
          </button>
        </div>

        {/* Resume Tab */}
        {tab === "resume" && (
          <div>
            {assets.resume ? (
              <Resume resume={assets.resume} />
            ) : (
              <div className="glass-effect rounded-xl p-12 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-text-tertiary opacity-30" />
                <p className="text-text-secondary text-lg">Aucun résumé disponible</p>
              </div>
            )}
          </div>
        )}

        {/* Fiches Tab */}
        {tab === "fiches" && (
          <div className="space-y-4">
            {sheets.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {sheets.map((sheet, index) => (
                  <button
                    key={sheet._id || index}
                    onClick={() =>
                      navigate(`/shared/${shareToken}/fiche`, {
                        state: {
                          shareToken,
                          sheet,
                          courseTitle: course.title,
                        },
                      })
                    }
                    className="glass-effect rounded-xl p-5 border border-white/20 hover:border-accent/30 hover:shadow-glass-accent transition-all duration-300 text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-text-primary font-bold text-lg group-hover:text-accent transition-colors truncate">
                          {sheet.title}
                        </h3>
                        <p className="text-text-tertiary text-sm mt-1">
                          {sheet.quizs?.length || 0} questions
                        </p>
                      </div>
                      <div className="ml-4 p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <BookOpen className="h-5 w-5 text-accent" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="glass-effect rounded-xl p-12 text-center">
                <Sparkles className="h-16 w-16 mx-auto mb-4 text-accent opacity-50 animate-float" />
                <p className="text-text-primary font-bold text-lg mb-2">
                  Aucune fiche disponible
                </p>
              </div>
            )}
          </div>
        )}

        {/* Flashcards Tab */}
        {tab === "flashcards" && (
          <div className="space-y-6">
            {flashcards.length > 0 ? (
              <>
                {/* Stats Card */}
                <div className="glass-effect rounded-xl p-5 sm:p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-text-primary font-bold">Flashcards</p>
                        <p className="text-text-tertiary text-sm">
                          {flashcards.length} cartes disponibles
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() =>
                    navigate(`/shared/${shareToken}/flashcards`, {
                      state: {
                        shareToken,
                        flashcards,
                        courseTitle: course.title,
                      },
                    })
                  }
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-lg bg-accent text-dark hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                >
                  <PlayCircle className="h-6 w-6" />
                  Réviser les flashcards
                </button>
              </>
            ) : (
              <div className="glass-effect rounded-xl p-12 text-center">
                <Layers className="h-16 w-16 mx-auto mb-4 text-text-tertiary opacity-30" />
                <p className="text-text-primary font-bold text-lg mb-2">
                  Pas de flashcards
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Signup Incentive Banner */}
      <SignupIncentiveBanner variant="default" delay={30000} />
    </div>
  );
}

export default SharedCourse;
