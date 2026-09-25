import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { MoveLeftIcon, ExternalLink } from 'lucide-react'
import Buttons from '../components/Buttons'
import SignupIncentiveBanner from '../components/SignupIncentiveBanner'

export default function SharedFiche() {
    const location = useLocation()
    const navigate = useNavigate()
    const { shareToken } = useParams()

    const { sheet, courseTitle } = location.state || {}

    useEffect(() => {
        if (!location.state || !sheet) {
            navigate(`/shared/${shareToken}`)
        }
    }, [location.state, sheet, navigate, shareToken])

    if (!sheet) {
        return null
    }

    const quizs = sheet.quizs || []

    return (
        <div className="min-h-dvh bg-dark w-screen lg:w-[80%] mx-auto flex flex-col">
            {/* Header */}
            <div className='glass-effect sticky top-0 z-20 p-4 sm:p-5 rounded-b-2xl border-b border-white/20/50 backdrop-blur-xl shadow-glass'>
                <div className='max-w-4xl mx-auto space-y-3'>
                    {/* Shared badge */}
                    <div className='flex items-center gap-2 text-accent text-xs'>
                        <ExternalLink className='h-3 w-3' />
                        <span>Cours partagé</span>
                        {courseTitle && <span className='text-text-quaternary'>• {courseTitle}</span>}
                    </div>

                    {/* Navigation */}
                    <div className='flex items-center justify-between'>
                        <button
                            onClick={() => navigate(`/shared/${shareToken}`)}
                            className='p-2 rounded-xl glass-effect border border-white/20 hover:border-accent/30 hover:scale-110 active:scale-95 transition-all duration-300 group'
                        >
                            <MoveLeftIcon className='h-6 w-6 text-text-primary group-hover:-translate-x-1 transition-transform' />
                        </button>
                        <h1 className='text-base sm:text-lg font-bold text-text-primary uppercase tracking-wide flex-1 text-center'>
                            {sheet.title}
                        </h1>
                        <div className='w-10'></div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className='max-w-4xl mx-auto w-full px-4 sm:px-5 py-6 sm:py-8'>
                <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                    {/* Questions Stat */}
                    <div className='glass-effect rounded-xl p-3 sm:p-4 border border-white/20/50 shadow-glass hover:shadow-glass-accent hover:border-accent/20 transition-all duration-300'>
                        <p className='text-text-tertiary text-xs font-bold uppercase tracking-widest mb-2.5'>Questions</p>
                        <div className='flex items-baseline gap-1'>
                            <span className='text-text-primary text-xl sm:text-2xl font-bold'>
                                {quizs.length}
                            </span>
                            <span className='text-text-tertiary text-xs'>
                                questions
                            </span>
                        </div>
                    </div>

                    {/* Info */}
                    <div className='glass-effect rounded-xl p-3 sm:p-4 border border-white/20/50 shadow-glass hover:shadow-glass-accent hover:border-accent/20 transition-all duration-300'>
                        <p className='text-text-tertiary text-xs font-bold uppercase tracking-widest mb-2.5'>Mode</p>
                        <div className='flex items-baseline gap-1'>
                            <span className='text-accent text-sm font-bold'>
                                Partagé
                            </span>
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
                        {sheet.content}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Floating Button */}
            {quizs.length > 0 && (
                <div className='fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-30 animate-slide-up'>
                    <Buttons
                        onClick={() => navigate(`/shared/${shareToken}/quiz`, {
                            state: {
                                shareToken,
                                quizs,
                                sheetTitle: sheet.title,
                                courseTitle
                            }
                        })}
                        primary
                        title="Faire le quiz"
                        className='w-full shadow-neon-accent hover:shadow-glow-lg'
                    />
                </div>
            )}

            {/* Signup Incentive Banner */}
            <SignupIncentiveBanner variant="default" delay={45000} />
        </div>
    )
}
