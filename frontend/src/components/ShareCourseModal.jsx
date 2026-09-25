import { useState, useEffect } from 'react'
import { X, Share2, Globe, Lock, Copy, Check, Loader2, Link2 } from 'lucide-react'
import { enableCourseSharing, disableCourseSharing, getSharingStatus } from '../api/sharedApi'

export default function ShareCourseModal({ isOpen, onClose, courseId, courseTitle }) {
  const [isShared, setIsShared] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [shareViewCount, setShareViewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isToggling, setIsToggling] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen && courseId) {
      loadSharingStatus()
    }
  }, [isOpen, courseId])

  const loadSharingStatus = async () => {
    setIsLoading(true)
    try {
      const response = await getSharingStatus(courseId)
      if (!response.error) {
        setIsShared(response.isShared || false)
        setShareUrl(response.shareUrl || '')
        setShareViewCount(response.shareViewCount || 0)
      }
    } catch (error) {
      console.error('Error loading sharing status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSharing = async () => {
    setIsToggling(true)
    try {
      if (isShared) {
        const response = await disableCourseSharing(courseId)
        if (!response.error) {
          setIsShared(false)
          setShareUrl('')
        }
      } else {
        const response = await enableCourseSharing(courseId)
        if (!response.error) {
          setIsShared(true)
          setShareUrl(response.shareUrl || '')
        }
      }
    } catch (error) {
      console.error('Error toggling sharing:', error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return

    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-effect-strong rounded-2xl border border-white/20 shadow-premium animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-text-primary font-bold text-lg">Partager le cours</h2>
              <p className="text-text-tertiary text-xs truncate max-w-[200px]">{courseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 text-accent animate-spin" />
            </div>
          ) : (
            <>
              {/* Toggle Section */}
              <div className="glass-effect rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isShared ? (
                      <Globe className="h-5 w-5 text-success" />
                    ) : (
                      <Lock className="h-5 w-5 text-text-tertiary" />
                    )}
                    <div>
                      <p className="text-text-primary font-medium text-sm">
                        {isShared ? 'Lien public actif' : 'Cours privé'}
                      </p>
                      <p className="text-text-quaternary text-xs">
                        {isShared
                          ? 'Toute personne avec le lien peut voir le cours'
                          : 'Seul vous pouvez accéder à ce cours'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={handleToggleSharing}
                    disabled={isToggling}
                    className={`
                      relative w-12 h-7 rounded-full transition-colors duration-300
                      ${isShared ? 'bg-success' : 'bg-surface-raised'}
                      ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div
                      className={`
                        absolute top-1 w-5 h-5 rounded-full bg-white shadow-md
                        transition-transform duration-300
                        ${isShared ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    >
                      {isToggling && (
                        <Loader2 className="h-5 w-5 text-dark animate-spin" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Share Link Section */}
              {isShared && shareUrl && (
                <div className="space-y-3 animate-fade-in">
                  <label className="text-text-secondary text-sm font-medium">
                    Lien de partage
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 glass-effect rounded-xl px-4 py-3 border border-white/10 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-text-tertiary flex-shrink-0" />
                        <p className="text-text-secondary text-sm truncate">
                          {shareUrl}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className={`
                        px-4 rounded-xl font-medium text-sm
                        transition-all duration-300 flex items-center gap-2
                        ${copied
                          ? 'bg-success text-white'
                          : 'bg-accent text-dark hover:shadow-glow-sm'
                        }
                      `}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span className="hidden sm:inline">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span className="hidden sm:inline">Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* View Count */}
                  {shareViewCount > 0 && (
                    <p className="text-text-quaternary text-xs text-center">
                      {shareViewCount} vue{shareViewCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="glass-accent rounded-xl p-4 border border-accent/20">
                <p className="text-accent text-xs leading-relaxed">
                  {isShared
                    ? "Les visiteurs peuvent voir le résumé, les fiches et faire les quiz. Leur progression n'est pas sauvegardée."
                    : "Activez le partage pour générer un lien unique que vous pouvez partager avec d'autres."
                  }
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
