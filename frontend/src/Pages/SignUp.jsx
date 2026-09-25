import React, { useState } from 'react'
import { MoveLeftIcon, School, GraduationCap, CheckCircle2, Mail, Loader } from 'lucide-react'
import BigTitle from '../components/BigTitle'
import Inputs from '../components/Inputs'
import Buttons from '../components/Buttons'
import Modal from '../components/Modal'
import Options from '../components/Options'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { SignupWithEmail, GoogleSignupAPI } from '../api/userApi'
import { AddCourse } from '../api/courseApi'
import { useNavigate } from 'react-router-dom'
import useMeta from '../utils/useMeta'
import { useAuth } from '../Contexts/AuthContext'
import { signInWithGoogle, isGoogleAuthAvailable } from '../config/firebase'
import {
  UNIVERSITY_PROGRAMS,
  UNIVERSITY_LEVELS,
  SECONDARY_LEVELS,
  SECONDE_ORIENTATIONS,
  getAllSeries,
  needsSeries,
  needsOrientation
} from '../constants/educationData'

export default function SignUp() {

   useMeta({
        title: "MisterAll - S'inscrire",
        canonical: "https://misterall.tech/signup",
        url: "https://misterall.tech/signup",
        noIndex: true
    })

    const navigate = useNavigate()
    const { checkAuth } = useAuth()

    // Etape actuelle
    const [step, setStep] = useState(1)

    // Infos educatives (collectees en premier)
    const [educationType, setEducationType] = useState('')
    const [program, setProgram] = useState('')
    const [level, setLevel] = useState('')
    const [secondaryCycle, setSecondaryCycle] = useState('')
    const [series, setSeries] = useState('')
    const [seriesOrientation, setSeriesOrientation] = useState('')

    // Infos personnelles
    const [lastname, setLastname] = useState('')
    const [firstname, setFirstname] = useState('')

    // Infos compte (email)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // Cours optionnel
    const [courseTitle, setCourseTitle] = useState('')
    const [courseSubject, setCourseSubject] = useState('')
    const [courseFile, setCourseFile] = useState(null)

    // UI states
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showEmailVerification, setShowEmailVerification] = useState(false)

    // Construire les donnees du profil
    const getProfileData = () => ({
        educationType,
        program: educationType === 'university' ? program : null,
        level,
        secondaryCycle: educationType === 'secondary' ? secondaryCycle : null,
        series: educationType === 'secondary' && needsSeries(level) ? series : null,
        seriesOrientation: educationType === 'secondary' && needsOrientation(level) ? seriesOrientation : null,
        firstname,
        lastname
    })

    // Handlers de navigation
    const goToEducationDetails = (type) => {
        setEducationType(type)
        if (type === 'university') {
            setSecondaryCycle('')
            setSeries('')
            setSeriesOrientation('')
        } else {
            setProgram('')
        }
        setLevel('')
        setStep(2)
    }

    // Handler inscription email
    const handleEmailSignup = async () => {
        if (!password) {
            setErrorMessage("Le mot de passe est requis")
            setShowError(true)
            return
        }
        if (password.length < 6) {
            setErrorMessage("Le mot de passe doit contenir au moins 6 caracteres")
            setShowError(true)
            return
        }
        if (password !== confirmPassword) {
            setErrorMessage("Les mots de passe ne correspondent pas")
            setShowError(true)
            return
        }

        setIsLoading(true)

        try {
            const userData = {
                ...getProfileData(),
                email,
                password
            }

            const result = await SignupWithEmail(userData)

            if (result.error) {
                setErrorMessage(result.message || "Erreur lors de l'inscription")
                setShowError(true)
                setIsLoading(false)
                return
            }

            await checkAuth()
            setIsLoading(false)

            if (result.requiresVerification) {
                setShowEmailVerification(true)
            } else {
                setStep(5) // Aller a l'ajout de cours
            }
        } catch (error) {
            setErrorMessage("Erreur de connexion au serveur")
            setShowError(true)
            setIsLoading(false)
        }
    }

    // Handler inscription Google
    const handleGoogleSignup = async () => {
        if (!isGoogleAuthAvailable()) {
            setErrorMessage("La connexion Google n'est pas disponible")
            setShowError(true)
            return
        }

        setIsLoading(true)

        try {
            // 1. Authentification Google
            const googleResult = await signInWithGoogle()

            if (!googleResult.success) {
                setErrorMessage(googleResult.error)
                setShowError(true)
                setIsLoading(false)
                return
            }

            // 2. Envoyer le token + profil au backend
            const profileData = getProfileData()
            const result = await GoogleSignupAPI(googleResult.idToken, profileData)

            if (result.error) {
                setErrorMessage(result.message || "Erreur lors de l'inscription")
                setShowError(true)
                setIsLoading(false)
                return
            }

            await checkAuth()
            setIsLoading(false)
            setStep(5) // Aller directement a l'ajout de cours (pas besoin de verifier email)
        } catch (error) {
            setErrorMessage("Erreur lors de l'inscription avec Google")
            setShowError(true)
            setIsLoading(false)
        }
    }

    // Continuer apres verification email
    const continueAfterEmailVerification = () => {
        setShowEmailVerification(false)
        setStep(5)
    }

    return (
        <>
            {/* Step 1: Type d'education */}
            {step === 1 && (
                <StepEducationType
                    goToEducationDetails={goToEducationDetails}
                    navigate={navigate}
                />
            )}

            {/* Step 2: Details education */}
            {step === 2 && educationType === 'university' && (
                <StepUniversity
                    program={program}
                    setProgram={setProgram}
                    level={level}
                    setLevel={setLevel}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    showError={showError}
                    setShowError={setShowError}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {step === 2 && educationType === 'secondary' && (
                <StepSecondary
                    secondaryCycle={secondaryCycle}
                    setSecondaryCycle={setSecondaryCycle}
                    level={level}
                    setLevel={setLevel}
                    series={series}
                    setSeries={setSeries}
                    seriesOrientation={seriesOrientation}
                    setSeriesOrientation={setSeriesOrientation}
                    onBack={() => setStep(1)}
                    onNext={() => setStep(3)}
                    showError={showError}
                    setShowError={setShowError}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {/* Step 3: Infos personnelles */}
            {step === 3 && (
                <StepPersonalInfo
                    firstname={firstname}
                    setFirstname={setFirstname}
                    lastname={lastname}
                    setLastname={setLastname}
                    onBack={() => setStep(2)}
                    onNext={() => setStep(4)}
                    showError={showError}
                    setShowError={setShowError}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {/* Step 4: Creation de compte (Email ou Google) */}
            {step === 4 && !showEmailVerification && (
                <StepAccountCreation
                    firstname={firstname}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    confirmPassword={confirmPassword}
                    setConfirmPassword={setConfirmPassword}
                    onBack={() => setStep(3)}
                    onEmailSignup={handleEmailSignup}
                    onGoogleSignup={handleGoogleSignup}
                    isLoading={isLoading}
                    showError={showError}
                    setShowError={setShowError}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {/* Email verification modal */}
            {step === 4 && showEmailVerification && (
                <StepEmailVerification
                    email={email}
                    onContinue={continueAfterEmailVerification}
                />
            )}

            {/* Step 5: Ajout de cours optionnel */}
            {step === 5 && (
                <StepCourse
                    courseTitle={courseTitle}
                    setCourseTitle={setCourseTitle}
                    courseSubject={courseSubject}
                    setCourseSubject={setCourseSubject}
                    courseFile={courseFile}
                    setCourseFile={setCourseFile}
                    showError={showError}
                    setShowError={setShowError}
                    errorMessage={errorMessage}
                    setErrorMessage={setErrorMessage}
                />
            )}

            {/* Loading overlay */}
            {isLoading && (
                <div className='fixed z-[60] inset-0 bg-dark/95 backdrop-blur-sm flex flex-col items-center justify-center p-5'>
                    <Loader className='w-12 h-12 text-accent animate-spin mb-4' />
                    <p className='text-text-primary text-center font-semibold text-lg mb-2'>Creation de ton compte...</p>
                    <p className='text-text-secondary text-center text-sm max-w-md'>Juste un instant</p>
                </div>
            )}
        </>
    )
}

// ============================================
// STEP 1: Type d'education
// ============================================
const StepEducationType = ({ goToEducationDetails, navigate }) => {
    return (
        <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
            <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                <div className='mb-8 lg:mb-12'>
                    <button
                        onClick={() => navigate(-1)}
                        className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                    >
                        <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                        <span className='text-sm font-medium'>Retour</span>
                    </button>
                </div>

                <div className='mb-8'>
                    <div className='flex gap-2 max-w-md mx-auto'>
                        <div className='h-1 flex-1 bg-accent rounded-full'></div>
                        <div className='h-1 flex-1 bg-border rounded-full'></div>
                        <div className='h-1 flex-1 bg-border rounded-full'></div>
                        <div className='h-1 flex-1 bg-border rounded-full'></div>
                    </div>
                    <p className='text-text-tertiary text-xs text-center mt-2'>Etape 1 sur 4</p>
                </div>

                <div className='flex-1 flex items-center justify-center'>
                    <div className='w-full max-w-md'>
                        <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                            <BigTitle title="Bienvenue sur MisterAll" primary />
                            <p className='text-text-secondary text-sm mt-2 mb-8'>Quel est ton niveau d'etudes ?</p>

                            <div className='flex flex-col gap-4'>
                                <button
                                    onClick={() => goToEducationDetails('secondary')}
                                    className='p-5 rounded-xl border-2 border-white/20 hover:border-accent/50 hover:bg-accent/5 text-left transition-all group'
                                >
                                    <div className='flex items-center gap-4'>
                                        <div className='w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors'>
                                            <School className='w-6 h-6 text-accent' />
                                        </div>
                                        <div>
                                            <h3 className='text-text-primary font-semibold'>Secondaire</h3>
                                            <p className='text-text-tertiary text-sm'>College ou Lycee (6eme - Terminale)</p>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => goToEducationDetails('university')}
                                    className='p-5 rounded-xl border-2 border-white/20 hover:border-accent/50 hover:bg-accent/5 text-left transition-all group'
                                >
                                    <div className='flex items-center gap-4'>
                                        <div className='w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors'>
                                            <GraduationCap className='w-6 h-6 text-accent' />
                                        </div>
                                        <div>
                                            <h3 className='text-text-primary font-semibold'>Universitaire</h3>
                                            <p className='text-text-tertiary text-sm'>Licence, Master, BTS...</p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <p className='text-text-tertiary text-center text-sm mt-6'>
                            Deja un compte ?{' '}
                            <button
                                onClick={() => navigate('/login')}
                                className='text-accent hover:text-accent-600 font-semibold transition-colors'
                            >
                                Connecte-toi
                            </button>
                        </p>
                        <p className='text-text-quaternary text-xs text-center mt-4'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// STEP 2a: Details Universitaire
// ============================================
const StepUniversity = ({ program, setProgram, level, setLevel, onBack, onNext, showError, setShowError, errorMessage, setErrorMessage }) => {
    const handleSubmit = () => {
        if (!program) {
            setErrorMessage("La filiere est requise")
            setShowError(true)
            return
        }
        if (!level) {
            setErrorMessage("L'annee est requise")
            setShowError(true)
            return
        }
        onNext()
    }

    return (
        <>
            {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}
            <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
                <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                    <div className='mb-8 lg:mb-12'>
                        <button
                            onClick={onBack}
                            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                        >
                            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                            <span className='text-sm font-medium'>Retour</span>
                        </button>
                    </div>

                    <div className='mb-8'>
                        <div className='flex gap-2 max-w-md mx-auto'>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-border rounded-full'></div>
                            <div className='h-1 flex-1 bg-border rounded-full'></div>
                        </div>
                        <p className='text-text-tertiary text-xs text-center mt-2'>Etape 2 sur 4</p>
                    </div>

                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-full max-w-md'>
                            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                                <BigTitle title="Ta formation" primary />
                                <p className='text-text-secondary text-sm mt-2 mb-8'>Parle-nous de tes etudes universitaires</p>

                                <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                    <Options id="program" placeholder="Filiere" options={UNIVERSITY_PROGRAMS} onChange={(e) => setProgram(e.target.value)} value={program}/>
                                    <Options id="level" placeholder="Annee" options={UNIVERSITY_LEVELS} onChange={(e) => setLevel(e.target.value)} value={level}/>

                                    <div className='mt-4'>
                                        <Buttons type="submit" primary title="Continuer" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ============================================
// STEP 2b: Details Secondaire
// ============================================
const StepSecondary = ({ secondaryCycle, setSecondaryCycle, level, setLevel, series, setSeries, seriesOrientation, setSeriesOrientation, onBack, onNext, showError, setShowError, errorMessage, setErrorMessage }) => {

    const handleCycleChange = (cycle) => {
        setSecondaryCycle(cycle)
        setLevel('')
        setSeries('')
        setSeriesOrientation('')
    }

    const handleLevelChange = (newLevel) => {
        setLevel(newLevel)
        setSeries('')
        setSeriesOrientation('')
    }

    const handleSubmit = () => {
        if (!secondaryCycle) {
            setErrorMessage("Choisis ton cycle (College ou Lycee)")
            setShowError(true)
            return
        }
        if (!level) {
            setErrorMessage("Choisis ta classe")
            setShowError(true)
            return
        }
        if (needsSeries(level) && !series) {
            setErrorMessage("Choisis ta serie")
            setShowError(true)
            return
        }
        if (needsOrientation(level) && !seriesOrientation) {
            setErrorMessage("Choisis ton orientation")
            setShowError(true)
            return
        }
        onNext()
    }

    const levelOptions = secondaryCycle ? SECONDARY_LEVELS[secondaryCycle] : []

    return (
        <>
            {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}
            <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
                <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                    <div className='mb-8 lg:mb-12'>
                        <button
                            onClick={onBack}
                            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                        >
                            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                            <span className='text-sm font-medium'>Retour</span>
                        </button>
                    </div>

                    <div className='mb-8'>
                        <div className='flex gap-2 max-w-md mx-auto'>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-border rounded-full'></div>
                            <div className='h-1 flex-1 bg-border rounded-full'></div>
                        </div>
                        <p className='text-text-tertiary text-xs text-center mt-2'>Etape 2 sur 4</p>
                    </div>

                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-full max-w-md'>
                            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                                <BigTitle title="Ta classe" primary />
                                <p className='text-text-secondary text-sm mt-2 mb-8'>Parle-nous de ta scolarite</p>

                                <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                    <div className='grid grid-cols-2 gap-3'>
                                        <button
                                            type="button"
                                            onClick={() => handleCycleChange('college')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                secondaryCycle === 'college'
                                                    ? 'border-accent bg-accent/10 text-accent'
                                                    : 'border-white/20 text-text-secondary hover:border-white/40'
                                            }`}
                                        >
                                            <span className='font-medium block'>College</span>
                                            <span className='text-xs opacity-70'>6eme - 3eme</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCycleChange('lycee')}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                secondaryCycle === 'lycee'
                                                    ? 'border-accent bg-accent/10 text-accent'
                                                    : 'border-white/20 text-text-secondary hover:border-white/40'
                                            }`}
                                        >
                                            <span className='font-medium block'>Lycee</span>
                                            <span className='text-xs opacity-70'>2nde - Tle</span>
                                        </button>
                                    </div>

                                    {secondaryCycle && (
                                        <Options
                                            id="level"
                                            placeholder="Choisis ta classe"
                                            options={levelOptions}
                                            onChange={(e) => handleLevelChange(e.target.value)}
                                            value={level}
                                        />
                                    )}

                                    {needsSeries(level) && (
                                        <div>
                                            <p className='text-text-secondary text-sm mb-2'>Quelle est ta serie ?</p>
                                            <Options
                                                id="series"
                                                placeholder="Choisis ta serie"
                                                options={getAllSeries()}
                                                onChange={(e) => setSeries(e.target.value)}
                                                value={series}
                                            />
                                        </div>
                                    )}

                                    {needsOrientation(level) && (
                                        <div>
                                            <p className='text-text-secondary text-sm mb-2'>Vers quelle orientation te diriges-tu ?</p>
                                            <Options
                                                id="orientation"
                                                placeholder="Choisis ton orientation"
                                                options={SECONDE_ORIENTATIONS}
                                                onChange={(e) => setSeriesOrientation(e.target.value)}
                                                value={seriesOrientation}
                                            />
                                        </div>
                                    )}

                                    <div className='mt-4'>
                                        <Buttons type="submit" primary title="Continuer" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ============================================
// STEP 3: Infos personnelles
// ============================================
const StepPersonalInfo = ({ firstname, setFirstname, lastname, setLastname, onBack, onNext, showError, setShowError, errorMessage, setErrorMessage }) => {
    const handleSubmit = () => {
        if (!lastname || lastname.length < 2) {
            setErrorMessage("Le nom doit contenir au moins 2 caracteres")
            setShowError(true)
            return
        }
        if (!firstname || firstname.length < 2) {
            setErrorMessage("Le prenom doit contenir au moins 2 caracteres")
            setShowError(true)
            return
        }
        onNext()
    }

    return (
        <>
            {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}
            <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
                <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                    <div className='mb-8 lg:mb-12'>
                        <button
                            onClick={onBack}
                            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                        >
                            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                            <span className='text-sm font-medium'>Retour</span>
                        </button>
                    </div>

                    <div className='mb-8'>
                        <div className='flex gap-2 max-w-md mx-auto'>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-border rounded-full'></div>
                        </div>
                        <p className='text-text-tertiary text-xs text-center mt-2'>Etape 3 sur 4</p>
                    </div>

                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-full max-w-md'>
                            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                                <BigTitle title="Comment tu t'appelles ?" primary />
                                <p className='text-text-secondary text-sm mt-2 mb-8'>Ces informations nous permettent de personnaliser ton experience</p>

                                <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                    <Inputs
                                        type="text"
                                        onChange={(e) => setLastname(e.target.value)}
                                        placeholder="Nom"
                                        autoComplete="family-name"
                                        value={lastname}
                                    />
                                    <Inputs
                                        type="text"
                                        onChange={(e) => setFirstname(e.target.value)}
                                        placeholder="Prenom"
                                        autoComplete="given-name"
                                        value={firstname}
                                    />

                                    <div className='mt-4'>
                                        <Buttons type="submit" primary title="Continuer" />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ============================================
// STEP 4: Creation de compte
// ============================================
const StepAccountCreation = ({ firstname, email, setEmail, password, setPassword, confirmPassword, setConfirmPassword, onBack, onEmailSignup, onGoogleSignup, isLoading, showError, setShowError, errorMessage, setErrorMessage }) => {
    const [showPassword, setShowPassword] = useState(false)
    const [authMethod, setAuthMethod] = useState(null) // null, 'email', 'google'

    const validateEmail = (email) => {
        const emailRegex = /^\S+@\S+\.\S+$/
        return emailRegex.test(email)
    }

    const handleEmailSubmit = () => {
        if (!email) {
            setErrorMessage("L'email est requis")
            setShowError(true)
            return
        }
        if (!validateEmail(email)) {
            setErrorMessage("Format d'email invalide")
            setShowError(true)
            return
        }
        onEmailSignup()
    }

    // Vue initiale: choix entre Email et Google
    if (!authMethod) {
        return (
            <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
                <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                    <div className='mb-8 lg:mb-12'>
                        <button
                            onClick={onBack}
                            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                        >
                            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                            <span className='text-sm font-medium'>Retour</span>
                        </button>
                    </div>

                    <div className='mb-8'>
                        <div className='flex gap-2 max-w-md mx-auto'>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                        </div>
                        <p className='text-text-tertiary text-xs text-center mt-2'>Etape 4 sur 4</p>
                    </div>

                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-full max-w-md'>
                            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                                <BigTitle title={`Super ${firstname} !`} primary />
                                <p className='text-text-secondary text-sm mt-2 mb-8'>Comment veux-tu creer ton compte ?</p>

                                <div className='flex flex-col gap-4'>
                                    {/* Google Button */}
                                    {isGoogleAuthAvailable() && (
                                        <button
                                            onClick={onGoogleSignup}
                                            disabled={isLoading}
                                            className={`
                                                w-full flex items-center justify-center gap-3
                                                bg-white hover:bg-gray-50
                                                text-gray-700 font-medium
                                                px-5 h-14 rounded-xl
                                                border border-gray-300
                                                transition-all duration-300
                                                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'}
                                            `}
                                        >
                                            <svg className='w-5 h-5' viewBox='0 0 24 24'>
                                                <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/>
                                                <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/>
                                                <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/>
                                                <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/>
                                            </svg>
                                            <span>Continuer avec Google</span>
                                        </button>
                                    )}

                                    <div className='flex items-center gap-4'>
                                        <div className='flex-1 h-px bg-white/10'></div>
                                        <span className='text-text-tertiary text-xs font-medium'>ou</span>
                                        <div className='flex-1 h-px bg-white/10'></div>
                                    </div>

                                    {/* Email Button */}
                                    <button
                                        onClick={() => setAuthMethod('email')}
                                        disabled={isLoading}
                                        className={`
                                            w-full flex items-center justify-center gap-3
                                            bg-surface hover:bg-surface-raised
                                            text-text-primary font-medium
                                            px-5 h-14 rounded-xl
                                            border border-white/20 hover:border-white/30
                                            transition-all duration-300
                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.98]'}
                                        `}
                                    >
                                        <Mail className='w-5 h-5' />
                                        <span>Continuer avec Email</span>
                                    </button>
                                </div>

                                <p className='text-text-tertiary text-xs text-center mt-6'>
                                    En creant un compte, tu acceptes nos conditions d'utilisation
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}
            </div>
        )
    }

    // Vue Email: formulaire email + mot de passe
    return (
        <>
            {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}
            <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
                <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                    <div className='mb-8 lg:mb-12'>
                        <button
                            onClick={() => setAuthMethod(null)}
                            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                        >
                            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                            <span className='text-sm font-medium'>Retour</span>
                        </button>
                    </div>

                    <div className='mb-8'>
                        <div className='flex gap-2 max-w-md mx-auto'>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                            <div className='h-1 flex-1 bg-accent rounded-full'></div>
                        </div>
                        <p className='text-text-tertiary text-xs text-center mt-2'>Etape 4 sur 4</p>
                    </div>

                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-full max-w-md'>
                            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                                <BigTitle title="Cree ton compte" primary />
                                <p className='text-text-secondary text-sm mt-2 mb-8'>Entre ton email et choisis un mot de passe</p>

                                <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); handleEmailSubmit(); }}>
                                    <Inputs
                                        type="email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Adresse email"
                                        autoComplete="email"
                                        value={email}
                                    />

                                    <div className='relative'>
                                        <Inputs
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mot de passe (min. 6 caracteres)"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            value={password}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1'
                                        >
                                            {showPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
                                        </button>
                                    </div>

                                    <Inputs
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirmer le mot de passe"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                    />

                                    <div className='mt-4'>
                                        <Buttons
                                            type="submit"
                                            primary
                                            title={isLoading ? "Creation..." : "Creer mon compte"}
                                            disabled={isLoading}
                                        />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

// ============================================
// Email Verification Screen
// ============================================
const StepEmailVerification = ({ email, onContinue }) => {
    return (
        <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
            <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                <div className='flex-1 flex items-center justify-center'>
                    <div className='w-full max-w-md text-center'>
                        <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                            <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in'>
                                <CheckCircle2 className='w-8 h-8 text-success' />
                            </div>

                            <BigTitle title="Compte cree !" primary />
                            <p className='text-text-secondary text-sm mt-2 mb-6'>
                                Un email de verification a ete envoye a
                            </p>
                            <p className='text-accent font-medium text-sm mb-6'>
                                {email}
                            </p>

                            <div className='bg-accent/10 border border-accent/20 rounded-xl p-4 mb-6 flex gap-3 text-left'>
                                <Mail className='w-5 h-5 text-accent shrink-0 mt-0.5' />
                                <div>
                                    <p className='text-text-primary text-sm font-medium'>
                                        Verifie ta boite mail
                                    </p>
                                    <p className='text-text-secondary text-xs mt-1'>
                                        Clique sur le lien pour activer ton compte et securiser ton acces.
                                    </p>
                                </div>
                            </div>

                            <Buttons
                                onClick={onContinue}
                                primary
                                title="Continuer vers l'app"
                            />

                            <p className='text-text-tertiary text-xs mt-4'>
                                Tu pourras verifier ton email plus tard
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// STEP 5: Ajout de cours optionnel
// ============================================
const StepCourse = ({ courseTitle, setCourseTitle, courseSubject, setCourseSubject, courseFile, setCourseFile, showError, setShowError, errorMessage, setErrorMessage }) => {
    const [isUploading, setIsUploading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async () => {
        if (!courseTitle || !courseSubject || !courseFile) {
            setErrorMessage("Veuillez remplir tous les champs")
            setShowError(true)
            return
        }

        setIsUploading(true)

        try {
            await AddCourse({ title: courseTitle, subject: courseSubject, file: courseFile })
            setIsUploading(false)
            window.location.replace("/home")
        } catch (err) {
            setIsUploading(false)
            setErrorMessage("Une erreur est survenue lors de l'ajout du cours. Reessaie.")
            setShowError(true)
        }
    }

    return (
        <>
            <div className='min-h-dvh bg-dark pattern-dark fixed top-0 left-0 z-20 w-full'>
                <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                    <div className='flex-1 flex items-center justify-center'>
                        <div className='w-full max-w-md'>
                            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>
                                <BigTitle title="Ajoute ton premier cours" primary />
                                <p className='text-text-secondary text-sm mt-2 mb-8'>Commence a reviser des maintenant (optionnel)</p>

                                <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                                    <Inputs
                                        onChange={(e) => setCourseTitle(e.target.value)}
                                        placeholder="Titre du cours"
                                        disabled={isUploading}
                                        value={courseTitle}
                                    />
                                    <Inputs
                                        onChange={(e) => setCourseSubject(e.target.value)}
                                        placeholder="Matiere du cours"
                                        disabled={isUploading}
                                        value={courseSubject}
                                    />

                                    <div className='relative'>
                                        <label
                                            htmlFor="courseFile"
                                            className={`
                                                bg-surface border border-white/20 hover:border-white/20
                                                text-text-secondary text-sm font-medium
                                                px-5 h-12 rounded-xl w-full
                                                flex items-center justify-center cursor-pointer
                                                transition-all duration-300
                                                ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:bg-surface-raised'}
                                                ${courseFile ? 'border-accent text-accent' : ''}
                                            `}
                                        >
                                            {courseFile ? 'Fichier selectionne' : 'Ajouter un fichier PDF ou DOCX'}
                                        </label>
                                        <input
                                            hidden
                                            id="courseFile"
                                            type="file"
                                            accept=".pdf, .docx"
                                            onChange={(e) => setCourseFile(e.target.files[0])}
                                            disabled={isUploading}
                                        />
                                    </div>

                                    {courseFile && (
                                        <div className='bg-accent/10 border border-accent/30 rounded-xl p-3'>
                                            <p className='text-accent text-xs font-medium text-center truncate'>{courseFile.name}</p>
                                            <p className='text-text-tertiary text-xs text-center mt-1'>Max 10MB</p>
                                        </div>
                                    )}

                                    <div className='mt-4 space-y-3'>
                                        <Buttons
                                            type="submit"
                                            primary
                                            title={isUploading ? "Ajout en cours..." : "Terminer"}
                                            disabled={isUploading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => navigate('/home')}
                                            className='w-full text-text-tertiary hover:text-text-primary text-sm font-medium transition-colors'
                                            disabled={isUploading}
                                        >
                                            Passer cette etape
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}

            {isUploading && (
                <div className='fixed z-[60] inset-0 bg-dark/95 backdrop-blur-sm flex flex-col items-center justify-center p-5'>
                    <Loader className='w-12 h-12 text-accent animate-spin mb-4' />
                    <p className='text-text-primary text-center font-semibold text-lg mb-2'>Ajout de ton cours...</p>
                    <p className='text-text-secondary text-center text-sm max-w-md'>L'IA analyse ton document et genere tes fiches de revision</p>
                </div>
            )}
        </>
    )
}
