import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Menu,
    X,
    ArrowUp,
    CheckCircle,
    XCircle,
    Sparkles,
    FileText,
    BrainCircuit,
    Target,
    Clock,
    TrendingUp,
    Upload,
    Zap,
    BookOpen,
    ChevronDown,
    ChevronRight,
    Star,
    Users,
    Play,
    MessageCircle
} from 'lucide-react'

// SEO Component
const SEOHead = () => {
    useEffect(() => {
        document.title = "MisterAll - Transforme tes cours en fiches de révision avec l'IA"

        const metaTags = [
            { name: 'description', content: "Revise plus vite et plus efficacement avec MisterAll. L'IA analyse tes cours et génère un resumé, des fiches de révison et des quiz tout. +100 étudiants. Gratuit." },
            { name: 'keywords', content: 'révision, fiches, quiz, IA, intelligence artificielle, étudiant, cours, PDF, université, examen' },
            { name: 'robots', content: 'index, follow' },
            { name: 'theme-color', content: '#FFFF5C' },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: 'https://misterall.tech/' },
            { property: 'og:title', content: "MisterAll - Révise 10x plus vite avec l'IA" },
            { property: 'og:description', content: "Revise plus vite et plus efficacement. Gratuit." },
            { property: 'og:image', content: 'https://misterall.tech/og-image.png' },
            { name: 'twitter:card', content: 'summary_large_image' },
        ]

        metaTags.forEach(({ name, property, content }) => {
            const attr = name ? 'name' : 'property'
            const val = name || property
            let tag = document.querySelector(`meta[${attr}="${val}"]`)
            if (!tag) {
                tag = document.createElement('meta')
                tag.setAttribute(attr, val)
                document.head.appendChild(tag)
            }
            tag.content = content
        })

        // JSON-LD
        let script = document.querySelector('script[type="application/ld+json"]')
        if (!script) {
            script = document.createElement('script')
            script.type = 'application/ld+json'
            document.head.appendChild(script)
        }
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "MisterAll",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "XOF" },
            "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "2000" }
        })
    }, [])
    return null
}

function Landing() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [navScrolled, setNavScrolled] = useState(false)
    const [showScrollTop, setShowScrollTop] = useState(false)
    const [openFaq, setOpenFaq] = useState(null)
    const [activeStep, setActiveStep] = useState(0)
    const navigate = useNavigate()

    // Optimized scroll handler
    useEffect(() => {
        let ticking = false
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollTop = window.scrollY
                    const docHeight = document.documentElement.scrollHeight - window.innerHeight
                    setScrollProgress((scrollTop / docHeight) * 100)
                    setNavScrolled(scrollTop > 50)
                    setShowScrollTop(scrollTop > 400)
                    ticking = false
                })
                ticking = true
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )

        document.querySelectorAll('.reveal-on-scroll, .reveal-on-scroll-left, .reveal-on-scroll-right, .reveal-scale').forEach(el => {
            observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    // Auto-advance demo steps
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep(prev => (prev + 1) % 3)
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setMenuOpen(false)
        }
    }

    // Memoized data for performance
    const features = useMemo(() => [
        {
            icon: <FileText className="w-6 h-6" />,
            title: "Fiches automatiques",
            description: "Ajoute ton cours et obtiens des fiches de révision structurées en quelques secondes. L'IA analyse et synthétise le contenu pour toi."
        },
        {
            icon: <Sparkles className="w-6 h-6" />,
            title: "Flashcards intelligentes",
            description: "Révise efficacement avec des flashcards générées automatiquement à partir de tes cours, idéales pour mémoriser rapidement et durablement."
        },
        {
            icon: <Target className="w-6 h-6" />,
            title: "Quiz intelligents",
            description: "Des questions générés automatiquement à partir de tes cours pour tester tes connaissances et identifier tes lacunes."
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: "Suivi de progression",
            description: "Visualise ton évolution, tes points forts et faibles. Optimise tes révisions avec des statistiques détaillées."
        },
        {
            icon: <BrainCircuit className="w-6 h-6" />,
            title: "IA conversationnelle",
            description: "Pose des questions sur tes cours et obtiens des explications claires et personnalisées instantanément."
        },
        {
            icon: <Clock className="w-6 h-6" />,
            title: "Gain de temps",
            description: "Plus besoin de passer des heures à cherche la bonne méthode d'apprentissage. Concentre-toi sur l'essentiel : apprendre et réviser."
        },
        {
            icon: <BookOpen className="w-6 h-6" />,
            title: "Tout centralisé",
            description: "Tous tes cours, fiches et quiz au même endroit. Accessible depuis n'importe quel appareil, n'importe quand."
        }
    ], [])

    const comparisonData = useMemo(() => [
        { classical: "Tu perds des heures à chercher a comprendre le cours sans aide", misterall: "Révisions instantanées avec l'IA" },
        { classical: "Fiches à préparer soi-même", misterall: "Fiches prêtes en quelques secondes" },
        { classical: "Cours compliqués et mal organisés", misterall: "Cours simplifiés, clairs et structurés" },
        { classical: "Peu d'exercices pour t'entraîner", misterall: "Questions pour tester tes acquis" },
        { classical: "Tout ton matériel est éparpillé", misterall: "Tout centralisé dans une seule plateforme" },
        { classical: "Tu perds la motivation", misterall: "Suivi de progression motivant" }
    ], [])


    const faqData = useMemo(() => [
        {
            question: "Comment fonctionne MisterAll ?",
            answer: "Tu ajoutes ton cours au format PDF ou DOCX, et notre IA analyse le contenu pour générer automatiquement des fiches de révision structurées, des quiz personnalisés et des résumés. Tu peux ensuite réviser efficacement et suivre ta progression."
        },
        {
            question: "Quels formats de fichiers sont acceptés ?",
            answer: "Nous acceptons les fichiers PDF et DOCX. La taille maximale est de 10 MB par fichier. Nous travaillons à ajouter d'autres formats comme les images et les présentations PowerPoint."
        },
        {
            question: "MisterAll est-il vraiment gratuit ?",
            answer: "Oui, complètement ! MisterAll est 100% gratuit avec un nombre illimité de cours, fiches de révision, quiz et flashcards. Aucun frais caché."
        },
        {
            question: "Mes données sont-elles sécurisées ?",
            answer: "Absolument. Tes cours et données personnelles sont chiffrés et stockés de manière sécurisée. Nous ne partageons jamais tes informations avec des tiers."
        },
        {
            question: "Puis-je accéder à MisterAll sur mobile ?",
            answer: "Oui ! MisterAll est une Progressive Web App (PWA) optimisée pour mobile. Tu peux l'utiliser depuis ton navigateur ou l'installer comme une application sur ton téléphone."
        },
        {
            question: "Y a-t-il des limites ?",
            answer: "Non ! Tu peux ajouter autant de cours que tu veux, accéder à toutes les fiches, quiz, flashcards et au chat IA sans aucune limitation."
        }
    ], [])

    const steps = useMemo(() => [
        {
            icon: <Upload className="w-8 h-8" />,
            title: "Ajoute ton cours",
            description: "Glisse ton PDF ou DOCX dans l'application"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "L'IA analyse",
            description: "En quelques secondes, tout est généré"
        },
        {
            icon: <Sparkles className="w-8 h-8" />,
            title: "Révise efficacement",
            description: "Fiches, question, flashcards et suivi de progression"
        }
    ], [])

    const allFeatures = useMemo(() => [
        "Cours illimités",
        "40 questions par cours",
        "Fiches résumées et détaillées",
        "Accès illimité à l'IA",
        "Flashcards intelligentes",
        "Chat IA conversationnel"
    ], [])

    // Reduced particles for mobile performance
    const particleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 8 : 20
    const msg = encodeURIComponent('Bonjour, je suis intéressé par vos compétences de développeur.');
    const link = `https://wa.me/2250160726314?text=${msg}`;

    return (
        <>
            <SEOHead />
            <div className="relative overflow-x-hidden">
                {/* Scroll Progress Bar */}
                <div
                    className="scroll-progress"
                    style={{ width: `${scrollProgress}%` }}
                />

                {/* Navigation */}
                <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navScrolled ? 'nav-blur scrolled' : ''}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-5 lg:px-8">
                        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
                            {/* Logo */}
                            <img
                                src="/logo.svg"
                                alt="MisterAll"
                                className="h-7 sm:h-8 lg:h-10 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => scrollToTop()}
                                width="120"
                                height="40"
                            />

                            {/* Desktop Navigation */}
                            <div className="hidden lg:flex items-center gap-8">
                                <button onClick={() => scrollToSection('features')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors animated-underline">
                                    Fonctionnalités
                                </button>
                                <button onClick={() => scrollToSection('how')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors animated-underline">
                                    Comment ça marche
                                </button>
                                <button onClick={() => scrollToSection('pricing')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors animated-underline">
                                    Tarifs
                                </button>
                                <button onClick={() => scrollToSection('faq')} className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors animated-underline">
                                    FAQ
                                </button>
                            </div>

                            {/* Desktop CTA */}
                            <div className="hidden lg:flex items-center gap-3">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-text-secondary hover:text-text-primary font-medium px-4 py-2 text-sm transition-colors"
                                >
                                    Se connecter
                                </button>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="bg-accent text-dark font-bold px-5 py-2.5 rounded-xl text-sm hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                                >
                                    Essayer gratuitement
                                </button>
                            </div>

                            {/* Mobile Menu Toggle */}
                            <button
                                className="lg:hidden p-2 text-text-primary"
                                onClick={() => setMenuOpen(!menuOpen)}
                                aria-label="Menu"
                            >
                                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div className="lg:hidden mobile-menu-enter bg-surface/95 backdrop-blur-xl border-b border-white/20">
                            <div className="px-4 sm:px-5 py-6 space-y-4">
                                <button onClick={() => scrollToSection('features')} className="block w-full text-left text-text-secondary hover:text-text-primary font-medium py-2 transition-colors">
                                    Fonctionnalités
                                </button>
                                <button onClick={() => scrollToSection('how')} className="block w-full text-left text-text-secondary hover:text-text-primary font-medium py-2 transition-colors">
                                    Comment ça marche
                                </button>
                                <button onClick={() => scrollToSection('pricing')} className="block w-full text-left text-text-secondary hover:text-text-primary font-medium py-2 transition-colors">
                                    Tarifs
                                </button>
                                <button onClick={() => scrollToSection('faq')} className="block w-full text-left text-text-secondary hover:text-text-primary font-medium py-2 transition-colors">
                                    FAQ
                                </button>
                                <div className="pt-4 border-t border-white/20 space-y-3">
                                    <button
                                        onClick={() => { navigate('/login'); setMenuOpen(false); }}
                                        className="block w-full text-center text-text-primary bg-surface-raised border border-white/20 font-semibold py-3 rounded-xl transition-all"
                                    >
                                        Se connecter
                                    </button>
                                    <button
                                        onClick={() => { navigate('/signup'); setMenuOpen(false); }}
                                        className="block w-full text-center bg-accent text-dark font-bold py-3 rounded-xl hover:shadow-glow transition-all"
                                    >
                                        Essayer gratuitement
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <section className="relative min-h-[100dvh] flex items-center justify-center hero-gradient-animated overflow-hidden pt-20 pb-12 sm:pb-16 px-4 sm:px-5">
                    {/* Animated Orbs - hidden on small mobile */}
                    <div className="glow-orb glow-orb-1 hidden sm:block" />
                    <div className="glow-orb glow-orb-2 hidden md:block" />
                    <div className="glow-orb glow-orb-3 hidden lg:block" />

                    {/* Grid Pattern */}
                    <div className="absolute inset-0 pattern-grid opacity-30" />

                    <div className="relative z-10 max-w-5xl mx-auto text-center stagger-fade-in">
                        

                        {/* Headline */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-text-primary leading-[1.1] mb-4 sm:mb-6 px-2">
                            Révise mieux, plus vite {' '}
                            <span className="text-gradient-animated uppercase">grâce à l’IA</span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed px-2">
                            Importe tes cours.
                            <span className="text-text-primary font-medium"> L’IA génère automatiquement tout ce qu’il te faut pour réviser efficacement.</span>
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-12 px-2">
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full sm:w-auto bg-accent text-dark font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                            >
                                <span>Commencer gratuitement</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => scrollToSection('demo')}
                                className="w-full sm:w-auto text-text-primary bg-surface-raised border border-white/20 font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:border-white/20-strong hover:bg-dark-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Play className="w-5 h-5" />
                                <span>Voir la démo</span>
                            </button>
                        </div>

                        {/* Social Proof Stats */}
                        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-12">
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-accent stat-glow">300+</p>
                                <p className="text-text-tertiary text-xs sm:text-sm mt-1">Étudiants actifs</p>
                            </div>
                            <div className="h-10 sm:h-12 w-px bg-border-medium hidden sm:block" />
                            <div className="text-center">
                                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-accent stat-glow">300+</p>
                                <p className="text-text-tertiary text-xs sm:text-sm mt-1">Cours analysés</p>
                            </div>
                            <div className="h-10 sm:h-12 w-px bg-border-medium hidden sm:block" />
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
                        <ChevronDown className="w-6 h-6 text-text-tertiary" />
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-16 sm:py-20 lg:py-28 bg-dark px-4 sm:px-5">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
                            <span className="inline-block text-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">Fonctionnalités</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                                Tout ce dont tu as besoin pour <span className="text-accent">réussir</span>
                            </h2>
                            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto">
                                Des outils puissants alimentés par l'IA pour transformer ta façon de réviser
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="reveal-on-scroll group bg-surface-raised border border-white/20 hover:border-accent/30 rounded-2xl p-5 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-glow-sm spotlight-card"
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent mb-4 sm:mb-5 group-hover:bg-accent group-hover:text-dark transition-all duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2 sm:mb-3">{feature.title}</h3>
                                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Interactive Demo Section */}
                <section id="demo" className="py-16 sm:py-20 lg:py-28 gradient-accent px-4 sm:px-5">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
                            <span className="inline-block text-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">Démo</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                                Vois MisterAll en action
                            </h2>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                            {/* Demo Visual */}
                            <div className="reveal-on-scroll-left order-2 lg:order-1">
                                <div className="device-frame">
                                    <div className="device-screen aspect-video flex items-center justify-center relative overflow-hidden">
                                        {/* Simulated App Interface */}
                                        <div className="absolute inset-0 bg-surface p-3 sm:p-4">
                                            <div className="bg-surface-raised rounded-xl h-full p-3 sm:p-4 flex flex-col">
                                                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                                                    </div>
                                                    <div>
                                                        <div className="h-2.5 sm:h-3 w-24 sm:w-32 bg-text-primary/20 rounded" />
                                                        <div className="h-2 w-16 sm:w-20 bg-text-primary/10 rounded mt-1" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 grid grid-cols-2 gap-2 sm:gap-3">
                                                    <div className={`bg-accent/10 border border-accent/20 rounded-lg p-2 sm:p-3 transition-all duration-500 ${activeStep === 1 ? 'ring-2 ring-accent' : ''}`}>
                                                        <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-accent mb-2" />
                                                        <div className="h-1.5 sm:h-2 w-full bg-accent/30 rounded mb-1" />
                                                        <div className="h-1.5 sm:h-2 w-3/4 bg-accent/20 rounded" />
                                                    </div>
                                                    <div className={`bg-accent/10 border border-accent/20 rounded-lg p-2 sm:p-3 transition-all duration-500 ${activeStep === 2 ? 'ring-2 ring-accent' : ''}`}>
                                                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-accent mb-2" />
                                                        <div className="h-1.5 sm:h-2 w-full bg-accent/30 rounded mb-1" />
                                                        <div className="h-1.5 sm:h-2 w-2/3 bg-accent/20 rounded" />
                                                    </div>
                                                </div>
                                                <div className={`mt-2 sm:mt-3 bg-dark/50 rounded-lg p-2 sm:p-3 transition-all duration-500 ${activeStep === 0 ? 'ring-2 ring-accent' : ''}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-accent rounded-full flex items-center justify-center">
                                                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-dark" />
                                                        </div>
                                                        <span className="text-xs sm:text-sm text-text-secondary">Glisse ton fichier ici...</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Steps */}
                            <div className="reveal-on-scroll-right space-y-4 sm:space-y-6 order-1 lg:order-2">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl transition-all duration-500 cursor-pointer ${activeStep === index ? 'bg-accent/10 border-2 border-accent' : 'bg-surface-raised border-2 border-transparent hover:border-white/20'}`}
                                        onClick={() => setActiveStep(index)}
                                    >
                                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${activeStep === index ? 'bg-accent text-dark' : 'bg-surface border border-white/20 text-text-secondary'}`}>
                                            {step.icon}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-xs font-bold uppercase tracking-wider ${activeStep === index ? 'text-accent' : 'text-text-tertiary'}`}>
                                                    Étape {index + 1}
                                                </span>
                                            </div>
                                            <h3 className={`text-base sm:text-lg font-bold mb-1 ${activeStep === index ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                {step.title}
                                            </h3>
                                            <p className="text-text-tertiary text-xs sm:text-sm">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section id="how" className="py-16 sm:py-20 lg:py-28 bg-dark px-4 sm:px-5">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
                            <span className="inline-block text-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">Comment ça marche</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                                3 étapes pour réviser <span className="text-accent">efficacement</span>
                            </h2>
                        </div>

                        <div className="relative">
                            {/* Timeline line - hidden on mobile */}
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent/50 to-transparent" />

                            <div className="space-y-8 sm:space-y-12 md:space-y-0">
                                {steps.map((step, index) => (
                                    <div
                                        key={index}
                                        className={`reveal-on-scroll relative md:flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                                        style={{ transitionDelay: `${index * 150}ms` }}
                                    >
                                        {/* Content */}
                                        <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                                            <div className="bg-surface-raised border border-white/20 hover:border-accent/30 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-glow-sm">
                                                <span className="inline-block text-accent text-xs sm:text-sm font-bold mb-2">Étape {index + 1}</span>
                                                <h3 className="text-lg sm:text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                                                <p className="text-text-secondary text-sm sm:text-base">{step.description}</p>
                                            </div>
                                        </div>

                                        {/* Center Icon - hidden on mobile */}
                                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-14 h-14 sm:w-16 sm:h-16 bg-accent rounded-2xl items-center justify-center text-dark shadow-glow z-10">
                                            {step.icon}
                                        </div>

                                        {/* Spacer */}
                                        <div className="md:w-1/2" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Comparison Section */}
                <section className="py-16 sm:py-20 lg:py-28 gradient-accent px-4 sm:px-5">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
                            <span className="inline-block text-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">Comparaison</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                                Pourquoi choisir <span className="text-accent">MisterAll</span> ?
                            </h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 reveal-on-scroll">
                            {/* Classical Method */}
                            <div className="bg-error/5 border border-error/20 rounded-2xl p-5 sm:p-6 lg:p-8">
                                <div className="bg-error text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl inline-block mb-5 sm:mb-6">
                                    <span className="text-xs sm:text-sm font-bold uppercase">Méthode classique</span>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {comparisonData.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-error flex-shrink-0 mt-0.5" />
                                            <span className="text-text-secondary text-sm sm:text-base">{item.classical}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* MisterAll Method */}
                            <div className="bg-accent/5 border-2 border-accent/30 rounded-2xl p-5 sm:p-6 lg:p-8 hover:border-accent hover:shadow-glow transition-all duration-300">
                                <div className="bg-accent text-dark px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl inline-block mb-5 sm:mb-6 shadow-glow-sm">
                                    <span className="text-xs sm:text-sm font-bold uppercase">Méthode MisterAll</span>
                                </div>
                                <div className="space-y-3 sm:space-y-4">
                                    {comparisonData.map((item, index) => (
                                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                                            <span className="text-text-primary font-medium text-sm sm:text-base">{item.misterall}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-16 sm:py-20 lg:py-28 gradient-accent px-4 sm:px-5">
                    <div className="max-w-lg mx-auto">
                        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
                            <span className="inline-block text-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">Tarifs</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                                100% <span className="text-accent">Gratuit</span>
                            </h2>
                            <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto">
                                Toutes les fonctionnalités, sans aucune limite
                            </p>
                        </div>

                        <div className="reveal-on-scroll relative bg-accent/10 border-2 border-accent rounded-2xl p-5 sm:p-6 lg:p-8 hover:shadow-glow transition-all duration-300">
                            <div className="absolute -top-3 right-4 sm:right-6">
                                <span className="bg-accent text-dark px-3 sm:px-4 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase badge-shine">
                                    Gratuit pour tous
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-accent mb-2">Accès complet</h3>
                            <p className="text-text-secondary text-sm sm:text-base mb-5 sm:mb-6">Tout est inclus, pour toujours</p>
                            <div className="mb-6 sm:mb-8">
                                <span className="text-3xl sm:text-4xl font-black text-accent">0 FCFA</span>
                                <span className="text-text-secondary text-sm ml-2">/ pour toujours</span>
                            </div>
                            <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                                {allFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2 sm:gap-3">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0 mt-0.5" />
                                        <span className="text-text-primary font-medium text-sm sm:text-base">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => navigate('/signup')}
                                className="w-full bg-accent text-dark font-bold py-3 rounded-xl hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Commencer gratuitement
                            </button>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section id="faq" className="py-16 sm:py-20 lg:py-28 bg-dark px-4 sm:px-5">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-12 sm:mb-16 reveal-on-scroll">
                            <span className="inline-block text-accent text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4">FAQ</span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                                Questions fréquentes
                            </h2>
                        </div>

                        <div className="space-y-3 sm:space-y-4 reveal-on-scroll">
                            {faqData.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-surface-raised border border-white/20 rounded-xl overflow-hidden hover:border-white/20 transition-all"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                                    >
                                        <span className="text-text-primary font-semibold text-sm sm:text-base pr-4">{faq.question}</span>
                                        <ChevronDown className={`w-5 h-5 text-text-tertiary flex-shrink-0 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                                    </button>
                                    <div className={`accordion-content ${openFaq === index ? 'open' : ''}`}>
                                        <div className="accordion-inner">
                                            <p className="px-4 sm:px-5 pb-4 sm:pb-5 text-text-secondary text-sm sm:text-base leading-relaxed">{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-16 sm:py-20 lg:py-28 cta-gradient-bg px-4 sm:px-5 relative overflow-hidden">
                    {/* Particles - reduced on mobile */}
                    <div className="particles-bg">
                        {[...Array(particleCount)].map((_, i) => (
                            <div
                                key={i}
                                className="particle"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 5}s`,
                                    animationDuration: `${8 + Math.random() * 4}s`
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 max-w-4xl mx-auto text-center reveal-scale">
                        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                            <span className="text-accent text-xs sm:text-sm font-semibold">Rejoins +300 étudiants</span>
                        </div>

                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-text-primary mb-4 sm:mb-6">
                            Prêt à transformer ta façon de <span className="text-accent">réviser</span> ?
                        </h2>
                        <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10">
                            Rejoins des étudiants qui gagnent du temps et améliorent leurs notes grâce à MisterAll.
                        </p>

                        <button
                            onClick={() => navigate('/signup')}
                            className="bg-accent text-dark font-bold px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl text-base sm:text-lg hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center gap-2"
                        >
                            <span>Commencer gratuitement</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-surface border-t border-white/20 py-10 sm:py-12 px-4 sm:px-5">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
                            <div className="flex flex-col items-center md:items-start gap-2">
                                <img src="/logo.svg" alt="MisterAll" className="h-7 sm:h-8" width="100" height="32" loading="lazy" />
                                <p className="text-text-tertiary text-xs sm:text-sm">
                                    © {new Date().getFullYear()} MisterAll. Tous droits réservés.
                                </p>
                            </div>
                            <div>
                                <p className="text-text-tertiary text-xs sm:text-sm">Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-1 sm:gap-2 text-xs sm:text-sm text-text-secondary">
                                <a href="mailto:service@misterall.tech" className="hover:text-text-primary transition-colors">
                                    service@misterall.tech
                                </a>
                                <a
                                    href="https://wa.me/2250160726314?text=Bonjour%2C%20j%27aimerais%20plus%20d%27informations%20sur%20MisterAll"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-text-primary transition-colors flex items-center gap-1.5"
                                    title="Nous contacter sur WhatsApp"
                                >
                                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                    <span>+225 01 60 72 63 14</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </footer>

                {/* Scroll to Top Button */}
                {showScrollTop && (
                    <button
                        onClick={scrollToTop}
                        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-accent text-dark w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-glow hover:shadow-glow-md hover:scale-110 active:scale-95 transition-all z-50"
                        aria-label="Retour en haut"
                    >
                        <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                )}
            </div>
        </>
    )
}

export default Landing
