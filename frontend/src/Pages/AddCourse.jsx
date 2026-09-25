import React, { useState } from 'react'
import { ArrowLeft, Upload, FileText, Sparkles, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AddCourse as addCourseApi } from '../api/courseApi'
import { useModal } from '../Contexts/ModalContext'
import { Loading } from '../components/Loading'
import useMeta from '../utils/useMeta'
import { useData } from '../Contexts/DataContext'

function AddCourse() {
  const [courseFile, setCourseFile] = useState(null)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseSubject, setCourseSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const { user, courses, isDataLoading } = useData()
  const { showSuccess, showError } = useModal()
  const navigate = useNavigate()

  useMeta({
    title: "MisterAll - Ajouter un cours",
    canonical: "https://misterall.tech/add-course",
    url: "https://misterall.tech/add-course",
    noIndex: true
  })

  // Attendre que les données user soient chargées (après les hooks)
  if (!user || isDataLoading) {
    return <Loading title="Chargement..." />
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        setCourseFile(file)
      } else {
        showError('Format non supporté. Utilisez PDF ou DOCX')
      }
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCourseFile(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    if (!courseTitle || !courseSubject || !courseFile) {
      showError("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)
    const course = { title: courseTitle, subject: courseSubject, file: courseFile }

    try {
      const result = await addCourseApi(course)
      if (result.error) {
        showError(result.message || "Une erreur est survenue")
      } else {
        showSuccess('Cours ajouté avec succès ! IA en cours de génération...')
        setTimeout(() => navigate("/home"), 1500)
      }
    } catch (error) {
      showError("Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-dark pb-24 page-transition'>
      {/* Background animé */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-40' />
        <div className='absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float' />
      </div>

      {/* Container */}
      <div className='relative max-w-3xl mx-auto px-4 sm:px-5 py-5 sm:py-6'>

        {/* Header */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            onClick={() => navigate('/home')}
            className='p-2.5 rounded-xl bg-surface/50 border border-white/20 text-text-secondary hover:text-accent hover:bg-accent/5 transition-all group'
          >
            <ArrowLeft className='h-6 w-6 group-hover:-translate-x-1 transition-transform' />
          </button>

          <div className='flex-1'>
            <h1 className='text-text-primary text-2xl sm:text-3xl font-bold flex items-center gap-2'>
              <Sparkles className='h-7 w-7 text-accent' />
              Nouveau cours
            </h1>
            <p className='text-text-tertiary text-sm sm:text-base mt-1'>
              Cours illimités
            </p>
          </div>
        </div>

        {/* Form */}
        <div className='space-y-5'>

          {/* Titre */}
          <div className='space-y-2'>
            <label className='text-text-secondary text-sm font-semibold block'>
              Titre du cours
            </label>
            <input
              type="text"
              maxLength={40}
              value={courseTitle}
              onChange={(e) => setCourseTitle(e.target.value)}
              placeholder="Ex: Introduction à la physique quantique"
              className='
                w-full px-4 py-3.5
                bg-surface/50 border border-white/20
                rounded-xl
                text-text-primary text-base
                placeholder:text-text-quaternary
                focus:border-accent focus:bg-surface
                transition-all duration-300
                outline-none
              '
            />
            <p className='text-text-tertiary text-xs'>
              {courseTitle.length}/40 caractères
            </p>
          </div>

          {/* Matière */}
          <div className='space-y-2'>
            <label className='text-text-secondary text-sm font-semibold block'>
              Matière
            </label>
            <input
              type="text"
              maxLength={20}
              value={courseSubject}
              onChange={(e) => setCourseSubject(e.target.value)}
              placeholder="Ex: Physique, Mathématiques..."
              className='
                w-full px-4 py-3.5
                bg-surface/50 border border-white/20
                rounded-xl
                text-text-primary text-base
                placeholder:text-text-quaternary
                focus:border-accent focus:bg-surface
                transition-all duration-300
                outline-none
              '
            />
          </div>

          {/* Upload Zone */}
          <div className='space-y-2'>
            <label className='text-text-secondary text-sm font-semibold block'>
              Document du cours
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                relative
                border-2 border-white/20 rounded-xl
                p-8 sm:p-12
                text-center
                transition-all duration-300
                cursor-pointer
                ${dragActive
                  ? 'border-accent bg-accent/5 scale-[1.02]'
                  : courseFile
                  ? 'border-accent/50 bg-accent/5'
                  : 'border-white/20 hover:border-accent/50 hover:bg-surface/50'
                }
              `}
              onClick={() => document.getElementById('courseFile').click()}
            >
              <input
                hidden
                id="courseFile"
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />

              {courseFile ? (
                <div className='space-y-3'>
                  <CheckCircle2 className='w-12 h-12 mx-auto text-accent' />
                  <p className='text-text-primary font-bold text-lg'>
                    {courseFile.name}
                  </p>
                  <p className='text-text-tertiary text-sm'>
                    {(courseFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setCourseFile(null)
                    }}
                    className='text-accent text-sm hover:underline'
                  >
                    Changer de fichier
                  </button>
                </div>
              ) : (
                <div className='space-y-3'>
                  <Upload className='w-12 h-12 mx-auto text-accent opacity-70' />
                  <div>
                    <p className='text-text-primary font-bold text-base mb-1'>
                      Glissez votre fichier ici
                    </p>
                    <p className='text-text-tertiary text-sm'>
                      ou cliquez pour parcourir
                    </p>
                  </div>
                  <div className='flex items-center justify-center gap-2 text-text-quaternary text-xs'>
                    <FileText className='w-4 h-4' />
                    <span>PDF ou DOCX • 10 MB max</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!courseTitle || !courseSubject || !courseFile || loading}
            className='
              w-full bg-accent text-dark
              px-6 py-4 rounded-xl
              font-bold text-lg
              shadow-neon-accent
              hover:bg-accent/90 hover:scale-[1.02]
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              transition-all duration-300
              flex items-center justify-center gap-2
            '
          >
            {loading ? (
              <>
                <div className='w-5 h-5 border-2 border-dark/30 border-t-dark rounded-full animate-spin' />
                Création en cours...
              </>
            ) : (
              <>
                <Sparkles className='w-5 h-5' />
                Créer le cours
              </>
            )}
          </button>

          <p className='text-text-tertiary text-xs text-center'>
            L'IA générera automatiquement résumés, fiches et quiz
          </p>
          <p className='text-text-quaternary text-xs text-center mt-4'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>
        </div>
      </div>

      {loading && <Loading title="Création du cours en cours..." />}
    </div>
  )
}

export default AddCourse
