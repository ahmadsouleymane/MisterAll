import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, GraduationCap, AlertTriangle, Trash2, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { deleteCourse, updateCourse } from '../api/courseApi'

export default function ModifyCourse({ setIsModify }) {
    const location = useLocation()
    const course = location.state.course
    const navigate = useNavigate()
    const [delCourse, setDelCourse] = useState(false)
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(course.title)
    const [subject, setSubject] = useState(course.subject)

    // Toast state local
    const [toast, setToast] = useState({ show: false, type: '', message: '' })

    const showToast = (type, message) => {
        setToast({ show: true, type, message })
        setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000)
    }

    const handleDeleteCourse = async () => {
        setLoading(true)
        const response = await deleteCourse(course._id, localStorage.getItem('token'))
        if (response.success === true) {
            showToast('success', response.message)
            setTimeout(() => {
                setIsModify(false)
                window.location.replace("/home")
            }, 1500)
        }
        else {
            showToast('error', response.message)
        }
        setLoading(false)
    }

    const handleUpdateCourse = async () => {
        if (title === course.title && subject === course.subject) {
            showToast('error', 'Veuillez modifier le titre ou la matière')
            return
        }

        setLoading(true)
        const response = await updateCourse(localStorage.getItem('token'), title, subject, course._id)
        if (response.success === true) {
            showToast('success', response.message)
            setTimeout(() => {
                setIsModify(false)
                window.location.replace("/home")
            }, 1500)
        }
        else {
            showToast('error', response.message || 'Erreur lors de la mise à jour')
        }
        setLoading(false)
    }

    // Toast Component inline
    const Toast = () => {
        if (!toast.show) return null

        const config = {
            success: {
                icon: CheckCircle,
                bg: 'bg-success/10',
                border: 'border-success/30',
                color: 'text-success',
                title: 'Succès'
            },
            error: {
                icon: AlertCircle,
                bg: 'bg-error/10',
                border: 'border-error/30',
                color: 'text-error',
                title: 'Erreur'
            }
        }

        const c = config[toast.type] || config.error
        const Icon = c.icon

        return (
            <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[200] animate-toast-enter">
                <div className={`
                    relative overflow-hidden
                    bg-surface border ${c.border}
                    rounded-xl shadow-lg
                    backdrop-blur-xl
                `}>
                    <div className="flex items-start gap-3 p-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${c.bg} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${c.color}`} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <p className={`text-sm font-bold ${c.color} mb-0.5`}>{c.title}</p>
                            <p className="text-sm text-text-secondary leading-relaxed">{toast.message}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='fixed inset-0 z-50 bg-dark overflow-y-auto page-transition'>
            {/* Background animé */}
            <div className='fixed inset-0 pointer-events-none overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-40' />
                <div className='absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float' />
            </div>

            {/* Container */}
            <div className='relative max-w-2xl mx-auto px-4 sm:px-5 py-5 sm:py-6'>

                {/* Header */}
                <div className='flex items-center gap-4 mb-6'>
                    <button
                        onClick={() => setIsModify(false)}
                        className='p-2.5 rounded-xl bg-surface/50 border border-white/10 text-text-secondary hover:text-accent hover:bg-accent/5 transition-all group'
                    >
                        <ArrowLeft className='h-6 w-6 group-hover:-translate-x-1 transition-transform' />
                    </button>

                    <div className='flex-1'>
                        <h1 className='text-text-primary text-2xl sm:text-3xl font-bold'>
                            Modifier le cours
                        </h1>
                        <p className='text-text-tertiary text-sm sm:text-base mt-1'>
                            Modifiez les informations du cours
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className='space-y-5'>

                    {/* Titre */}
                    <div className='space-y-2'>
                        <label className='text-text-secondary text-sm font-semibold flex items-center gap-2'>
                            <BookOpen className='h-4 w-4 text-accent' />
                            Titre du cours
                        </label>
                        <input
                            type="text"
                            maxLength={40}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Entrez le titre..."
                            className='
                                w-full px-4 py-3.5
                                bg-surface/50 border border-white/10
                                rounded-xl
                                text-text-primary text-base
                                placeholder:text-text-quaternary
                                focus:border-accent focus:bg-surface
                                transition-all duration-300
                                outline-none
                            '
                        />
                    </div>

                    {/* Matière */}
                    <div className='space-y-2'>
                        <label className='text-text-secondary text-sm font-semibold flex items-center gap-2'>
                            <GraduationCap className='h-4 w-4 text-accent' />
                            Matière
                        </label>
                        <input
                            type="text"
                            maxLength={20}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Entrez la matière..."
                            className='
                                w-full px-4 py-3.5
                                bg-surface/50 border border-white/10
                                rounded-xl
                                text-text-primary text-base
                                placeholder:text-text-quaternary
                                focus:border-accent focus:bg-surface
                                transition-all duration-300
                                outline-none
                            '
                        />
                    </div>

                    {/* Update Button */}
                    <button
                        onClick={handleUpdateCourse}
                        disabled={loading || (title === course.title && subject === course.subject)}
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
                            <Loader2 className='w-5 h-5 animate-spin' />
                        ) : (
                            <Save className='w-5 h-5' />
                        )}
                        Enregistrer les modifications
                    </button>

                    {/* Danger Zone */}
                    <div className='mt-8 pt-6 border-t border-white/10'>
                        <div className='bg-error/5 border border-error/20 rounded-xl p-5 space-y-4'>
                            <div className='flex items-center gap-2 text-error'>
                                <AlertTriangle className='h-5 w-5' />
                                <h3 className='font-bold text-sm uppercase tracking-wider'>Zone de danger</h3>
                            </div>
                            <p className='text-text-tertiary text-sm'>
                                Cette action est irréversible. Toutes les fiches et quiz associés seront supprimés.
                            </p>
                            <button
                                onClick={() => setDelCourse(true)}
                                className='
                                    w-full px-6 py-3
                                    bg-transparent border border-error/30
                                    rounded-xl
                                    text-error font-bold text-base
                                    hover:bg-error/10 hover:border-error/50
                                    transition-all duration-300
                                    flex items-center justify-center gap-2
                                '
                            >
                                <Trash2 className='w-5 h-5' />
                                Supprimer le cours
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {delCourse && (
                <div className='fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in'>
                    <div
                        className='absolute inset-0 bg-dark/80 backdrop-blur-sm'
                        onClick={() => !loading && setDelCourse(false)}
                    />
                    <div className='relative bg-surface border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-premium animate-modal-enter space-y-5'>

                        {/* Icon */}
                        <div className='w-16 h-16 mx-auto rounded-full bg-error/10 border-2 border-error/30 flex items-center justify-center animate-bounce-subtle'>
                            <Trash2 className='h-8 w-8 text-error' />
                        </div>

                        {/* Message */}
                        <div className='text-center'>
                            <h2 className='text-xl font-bold text-error mb-2'>
                                Supprimer ce cours ?
                            </h2>
                            <p className='text-text-tertiary text-sm'>
                                Cette action est définitive. Tous les contenus associés seront perdus.
                            </p>
                        </div>

                        {/* Actions */}
                        <div className='grid grid-cols-2 gap-3 pt-2'>
                            <button
                                onClick={() => setDelCourse(false)}
                                disabled={loading}
                                className='
                                    px-4 py-3 rounded-xl
                                    bg-surface/50 border border-white/10
                                    text-text-secondary font-bold
                                    hover:border-accent/30 hover:text-text-primary
                                    transition-all duration-300
                                    disabled:opacity-50
                                '
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteCourse}
                                disabled={loading}
                                className='
                                    px-4 py-3 rounded-xl
                                    bg-error text-white font-bold
                                    hover:bg-error/90
                                    transition-all duration-300
                                    flex items-center justify-center gap-2
                                    disabled:opacity-50
                                '
                            >
                                {loading ? (
                                    <Loader2 className='w-4 h-4 animate-spin' />
                                ) : (
                                    'Confirmer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            <Toast />
        </div>
    )
}
