import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { MoveLeftIcon, Sparkles } from 'lucide-react'
import Buttons from '../components/Buttons'
import Breadcrumbs from '../components/Breadcrumbs'
import { useData } from '../Contexts/DataContext'
import useMeta from '../utils/useMeta'

export default function FichePage() {

    useMeta({
        title: "MisterAll - Fiche",
        canonical: "https://misterall.tech/fiche",
        url: "https://misterall.tech/fiche",
        noIndex: true
    })

    const location = useLocation()
    const {title, content, quizs, score, status, courseId, sheetId} = location.state || {}
    const navigate = useNavigate()
    const { getAssetsForCourse, refreshCourseAssets, courses } = useData()

    // Récupérer le cours pour le breadcrumb
    const course = courses?.find(c => (c._id || c.id) === courseId)

    // Redirection si pas de state - dans useEffect pour respecter les règles des hooks
    useEffect(() => {
        if (!location.state) {
            navigate(-1)
            return
        }
        if (courseId && refreshCourseAssets) {
            refreshCourseAssets(courseId)
        }
    }, [location.state, courseId, refreshCourseAssets, navigate])

    // Early return APRÈS tous les hooks
    if (!location.state) {
        return null
    }

    const assets = courseId ? getAssetsForCourse(courseId) : null
    const sheetFromContext = assets?.sheets?.find((sheet) => (sheet._id || sheet.id) === sheetId)

    const effectiveTitle = sheetFromContext?.title ?? title
    const effectiveContent = sheetFromContext?.content ?? content
    const allQuizs = sheetFromContext?.quizs ?? quizs ?? []
    const effectiveScore = sheetFromContext?.score ?? score
    const effectiveStatus = sheetFromContext?.status ?? status

    const effectiveQuizs = allQuizs
    const lockedQuizCount = 0

    // Calculer les stats
    const getDifficulty = () => {
        if (!effectiveQuizs || effectiveQuizs.length === 0) return 'Moyen'
        const firstQuiz = effectiveQuizs[0]
        return firstQuiz.difficulty || 'Moyen'
    }

    const getScorePercentage = () => {
        if (!effectiveQuizs || effectiveQuizs.length === 0) return 0
        return Math.round((effectiveScore / effectiveQuizs.length) * 100)
    }

    const getSuccessRate = () => {
        if (!effectiveQuizs || effectiveQuizs.length === 0) return 0
        const done = effectiveQuizs.filter(q => q.isDone).length
        return Math.round((done / effectiveQuizs.length) * 100)
    }

    const getScoreColor = () => {
        const percentage = getScorePercentage()
        if (percentage <= 30) return 'bg-error'
        if (percentage <= 70) return 'bg-warning'
        if (percentage <= 99) return 'bg-info'
        return 'bg-success'
    }

    const getDifficultyColor = () => {
        const difficulty = getDifficulty()
        if (difficulty === 'Facile') return 'text-success'
        if (difficulty === 'Difficile') return 'text-error'
        return 'text-warning'
    }

    return (
        <div className="min-h-dvh bg-dark w-screen lg:w-[80%] mx-auto flex flex-col">

            {/* Header Glassmorphic */}
            <div className='glass-effect sticky top-0 z-20 p-4 sm:p-5 rounded-b-2xl border-b border-white/20/50 backdrop-blur-xl shadow-glass'>
                <div className='max-w-4xl mx-auto space-y-3'>
                    {/* Breadcrumbs */}
                    <Breadcrumbs
                        items={[
                            ...(course ? [{
                                label: course.title,
                                path: '/course',
                                state: { course }
                            }] : []),
                            { label: effectiveTitle }
                        ]}
                    />

                    {/* Navigation */}
                    <div className='flex items-center justify-between'>
                        <button
                            onClick={() => navigate(-1)}
                            className='p-2 rounded-xl glass-effect border border-white/20 hover:border-accent/30 hover:scale-110 active:scale-95 transition-all duration-300 group'
                        >
                            <MoveLeftIcon className='h-6 w-6 text-text-primary group-hover:-translate-x-1 transition-transform' />
                        </button>
                        <h1 className='text-base sm:text-lg font-bold text-text-primary uppercase tracking-wide flex-1 text-center'>
                            {effectiveTitle}
                        </h1>
                        <div className='w-10'></div>
                    </div>
                </div>
            </div>

            {/* Stats Section - Glassmorphic Cards */}
            <div className='max-w-4xl mx-auto w-full px-4 sm:px-5 py-6 sm:py-8'>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'>
                    {/* Score Stat */}
                    <div className='glass-effect rounded-xl p-3 sm:p-4 border border-white/20/50 shadow-glass hover:shadow-glass-accent hover:border-accent/20 transition-all duration-300'>
                        <p className='text-text-tertiary text-xs font-bold uppercase tracking-widest mb-2.5'>Score</p>
                        <div className='flex items-center gap-2'>
                            <div className='flex-1 h-2 bg-surface rounded-full overflow-hidden'>
                                <div
                                    className={`h-full rounded-full ${getScoreColor()} shadow-glow-sm transition-all duration-600`}
                                    style={{ width: `${getScorePercentage()}%` }}
                                />
                            </div>
                            <span className='text-accent text-sm font-bold whitespace-nowrap'>
                                {getScorePercentage()}%
                            </span>
                        </div>
                    </div>

                    {/* Difficulty Stat */}
                    <div className='glass-effect rounded-xl p-3 sm:p-4 border border-white/20/50 shadow-glass hover:shadow-glass-accent hover:border-accent/20 transition-all duration-300'>
                        <p className='text-text-tertiary text-xs font-bold uppercase tracking-widest mb-2.5'>Difficulté</p>
                        <div className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase
                            ${getDifficulty() === 'Facile' ? 'bg-success/10 text-success' :
                              getDifficulty() === 'Difficile' ? 'bg-error/10 text-error' :
                              'bg-warning/10 text-warning'}`}>
                            <span>{getDifficulty()}</span>
                        </div>
                    </div>

                    {/* Questions Stat */}
                    <div className='glass-effect rounded-xl p-3 sm:p-4 border border-white/20/50 shadow-glass hover:shadow-glass-accent hover:border-accent/20 transition-all duration-300'>
                        <p className='text-text-tertiary text-xs font-bold uppercase tracking-widest mb-2.5'>Questions</p>
                        <div className='flex items-baseline gap-1'>
                            <span className='text-text-primary text-xl sm:text-2xl font-bold'>
                                {effectiveQuizs?.length || 0}
                            </span>
                            <span className='text-text-tertiary text-xs'>
                                questions
                                {lockedQuizCount > 0 && (
                                    <span className='text-accent ml-1'>(+{lockedQuizCount})</span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Success Rate Stat */}
                    <div className='glass-effect rounded-xl p-3 sm:p-4 border border-white/20/50 shadow-glass hover:shadow-glass-accent hover:border-accent/20 transition-all duration-300'>
                        <p className='text-text-tertiary text-xs font-bold uppercase tracking-widest mb-2.5'>Réussite</p>
                        <div className='flex items-baseline gap-1'>
                            <span className='text-text-primary text-xl sm:text-2xl font-bold'>
                                {getSuccessRate()}
                            </span>
                            <span className='text-text-tertiary text-xs'>%</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='max-w-4xl mx-auto w-full px-4 sm:px-5 py-2 pb-32'>
                <div className='prose prose-invert max-w-none'>
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => (
                                <h1 className='text-3xl sm:text-4xl font-bold my-6 text-text-primary' {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 className='text-2xl sm:text-3xl font-bold my-5 text-text-primary border-b border-white/20/30 pb-3' {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 className='text-xl sm:text-2xl font-semibold my-4 text-accent' {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p className='text-text-secondary leading-relaxed my-4 text-base' {...props} />
                            ),
                            li: ({ node, ...props }) => (
                                <li className='ml-6 list-disc my-2 text-text-secondary marker:text-accent' {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul className='space-y-2 my-4 ml-2' {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol className='space-y-2 my-4 ml-6 list-decimal marker:text-accent marker:font-bold' {...props} />
                            ),
                            table: ({ node, ...props }) => (
                                <div className='overflow-x-auto my-5 rounded-xl border border-white/20/30'>
                                    <table className='w-full' {...props} />
                                </div>
                            ),
                            th: ({ node, ...props }) => (
                                <th className='border border-white/20/30 px-4 py-3 text-left font-bold text-text-primary bg-surface/40 text-sm uppercase tracking-wide' {...props} />
                            ),
                            td: ({ node, ...props }) => (
                                <td className='border border-white/20/30 px-4 py-2.5 text-text-secondary text-sm' {...props} />
                            ),
                            code: ({ node, inline, className, children, ...props }) =>
                                inline ? (
                                    <code className='bg-accent/10 text-accent px-2 py-1 rounded text-sm font-mono border border-accent/20' {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <pre className='glass-dark rounded-xl p-4 overflow-x-auto my-4 border border-white/20/30 shadow-glass' {...props}>
                                        <code className='text-text-secondary text-sm font-mono leading-relaxed'>
                                            {children}
                                        </code>
                                    </pre>
                                ),
                            blockquote: ({ node, ...props }) => (
                                <blockquote className='border-l-4 border-accent/50 pl-5 py-3 my-4 glass-accent rounded-r-lg italic text-text-secondary' {...props} />
                            ),
                            hr: ({ node, ...props }) => (
                                <hr className='my-6 border-white/20/30' {...props} />
                            ),
                            // Support formules mathématiques
                            div: ({ node, className, children, ...props }) => {
                                if (className === "math math-display") {
                                    return (
                                        <div className="my-6 flex justify-center overflow-x-auto" {...props}>
                                            <div className="px-6 py-4 glass-effect border border-white/20 rounded-xl shadow-glass">
                                                {children}
                                            </div>
                                        </div>
                                    );
                                }
                                return <div {...props}>{children}</div>;
                            },
                            span: ({ node, className, children, ...props }) => {
                                if (className === "math math-inline") {
                                    return (
                                        <span className="mx-1 text-accent" {...props}>
                                            {children}
                                        </span>
                                    );
                                }
                                return <span {...props}>{children}</span>;
                            },
                        }}
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                    >
                        {effectiveContent}
                    </ReactMarkdown>
                </div>
            </div>

            <p className='text-text-quaternary text-xs text-center py-4'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>

            {/* Floating Button */}
            <div className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30 animate-slide-up'>
                <Buttons
                    onClick={() => navigate("/quiz", {
                        state: {
                            quizs: effectiveQuizs,
                            score: effectiveScore,
                            courseId,
                            sheetId,
                            title: effectiveTitle
                        }
                    })}
                    primary
                    title="Réviser"
                    className='w-full shadow-neon-accent hover:shadow-glow-lg'
                />
            </div>
        </div>
    )
}