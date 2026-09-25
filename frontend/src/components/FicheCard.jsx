import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function FicheCard({ title, content, quizs, score, status, courseId, sheetId }) {
  const navigate = useNavigate()

  const statusConfig = {
    "A réviser": {
      bg: "bg-error/10",
      border: "border-error/30",
      text: "text-error",
      dot: "bg-error"
    },
    "En cours": {
      bg: "bg-warning/10",
      border: "border-warning/30",
      text: "text-warning",
      dot: "bg-warning"
    },
    "Terminé": {
      bg: "bg-success/10",
      border: "border-success/30",
      text: "text-success",
      dot: "bg-success"
    }
  };

  const config = statusConfig[status] || statusConfig["A réviser"];

  return (
    <button
      onClick={() => navigate("/fiche", { state: { title, content, quizs, score, status, courseId, sheetId } })}
      className="
        group
        w-full
        bg-surface border border-white/20
        hover:border-white/20-light hover:shadow-dark
        active:scale-[0.98]
        p-4
        rounded-xl
        transition-all duration-300 ease-out
        text-left
        relative
        overflow-hidden
      "
    >
      {/* Glow subtil basé sur le statut */}
      <div className={`absolute inset-0 ${config.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Contenu */}
      <div className="relative flex flex-col gap-3">
        {/* Status badge */}
        <div className={`
          inline-flex items-center gap-2 self-start
          px-3 py-1.5 rounded-full
          ${config.bg} ${config.border} border
        `}>
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          <span className={`text-xs font-semibold ${config.text}`}>
            {status}
          </span>
        </div>

        {/* Title et Arrow */}
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-text-primary text-sm font-semibold leading-tight flex-1">
            {title}
          </h3>
          <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-accent group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
        </div>

        {/* Score si disponible */}
        {score !== undefined && score !== null && (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  score >= 80 ? 'bg-success' :
                  score >= 50 ? 'bg-warning' :
                  'bg-error'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-secondary">
              {score}%
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
