import React from 'react'
import BigTitle from '../components/BigTitle'
import Buttons from '../components/Buttons'
import { MoveLeftIcon, Phone, Mail } from 'lucide-react'
import Inputs from '../components/Inputs'
import Modal from '../components/Modal'
import { useState } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import useMeta from '../utils/useMeta'
import GoogleAuthButton from '../components/GoogleAuthButton'

function Login() {

    useMeta({
        title: "MisterAll - Se connecter",
        canonical: "https://misterall.tech/login",
        url: "https://misterall.tech/login",
        noIndex: true
    })

    const { login, loginWithPhone, isLoading } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [showError, setShowError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loginMode, setLoginMode] = useState('email') // 'email' ou 'phone'

    const handleLogin = async (e) => {
        if (loginMode === 'email') {
            // Connexion par email
            if (email && password) {
                setShowError(false)
                const result = await login(email, password)

                if (result.success) {
                    navigate('/home')
                } else {
                    setErrorMessage(result.error || 'Erreur de connexion')
                    setShowError(true)
                }
            } else {
                setErrorMessage('Tous les champs sont obligatoires pour se connecter')
                setShowError(true)
            }
        } else {
            // Connexion par telephone
            if (phoneNumber && password) {
                setShowError(false)
                const result = await loginWithPhone(phoneNumber, password)

                if (result.success) {
                    navigate('/home')
                } else {
                    setErrorMessage(result.error || 'Erreur de connexion')
                    setShowError(true)
                }
            } else {
                setErrorMessage('Tous les champs sont obligatoires pour se connecter')
                setShowError(true)
            }
        }
    }

    const handleGoogleError = (error) => {
        setErrorMessage(error)
        setShowError(true)
    }

    return (
        <div className='w-full min-h-dvh bg-dark pattern-dark'>
            {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}

            <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
                {/* Header avec bouton retour */}
                <div className='mb-8 lg:mb-12'>
                    <button
                        onClick={() => navigate(-1)}
                        className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
                    >
                        <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                        <span className='text-sm font-medium'>Retour</span>
                    </button>
                </div>

                {/* Container central */}
                <div className='flex-1 flex items-center justify-center'>
                    <div className='w-full max-w-md'>
                        {/* Card avec glassmorphism */}
                        <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg hover:border-white/20-strong transition-all duration-300'>
                            {/* En-tete */}
                            <div className='mb-8'>
                                <BigTitle title="Bon retour !" primary />
                                <p className='text-text-secondary font-medium text-sm mt-2'>
                                    Connecte-toi pour continuer ton apprentissage
                                </p>
                            </div>

                            {/* Google Auth Button */}
                            <div className='mb-6'>
                                <GoogleAuthButton onError={handleGoogleError} disabled={isLoading} />
                            </div>

                            {/* Separator */}
                            <div className='flex items-center gap-4 mb-6'>
                                <div className='flex-1 h-px bg-white/10'></div>
                                <span className='text-text-tertiary text-xs font-medium'>ou</span>
                                <div className='flex-1 h-px bg-white/10'></div>
                            </div>

                            {/* Toggle Email / Telephone */}
                            <div className='flex gap-2 mb-4'>
                                <button
                                    type="button"
                                    onClick={() => setLoginMode('email')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        loginMode === 'email'
                                            ? 'bg-accent text-dark'
                                            : 'bg-surface text-text-tertiary hover:bg-surface-raised hover:text-text-secondary'
                                    }`}
                                >
                                    <Mail className='w-4 h-4' />
                                    Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setLoginMode('phone')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        loginMode === 'phone'
                                            ? 'bg-accent text-dark'
                                            : 'bg-surface text-text-tertiary hover:bg-surface-raised hover:text-text-secondary'
                                    }`}
                                >
                                    <Phone className='w-4 h-4' />
                                    Telephone
                                </button>
                            </div>

                            {/* Formulaire */}
                            <form className='flex flex-col gap-4' onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                                <div className='space-y-4'>
                                    {/* Champ email ou telephone selon le mode */}
                                    {loginMode === 'email' ? (
                                        <Inputs
                                            onChange={(e) => setEmail(e.target.value)}
                                            autoComplete="email"
                                            type="email"
                                            placeholder='Adresse email'
                                            disabled={isLoading}
                                            value={email}
                                        />
                                    ) : (
                                        <Inputs
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            autoComplete="tel"
                                            type="tel"
                                            placeholder='Numero de telephone (ex: 0701020304)'
                                            disabled={isLoading}
                                            value={phoneNumber}
                                        />
                                    )}

                                    {/* Champ mot de passe */}
                                    <div className='relative'>
                                        <Inputs
                                            onChange={(e) => setPassword(e.target.value)}
                                            autoComplete="current-password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder='Mot de passe'
                                            disabled={isLoading}
                                            value={password}
                                            className='pr-12'
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-raised'
                                            disabled={isLoading}
                                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                        >
                                            {showPassword ?
                                                <EyeOffIcon className='w-5 h-5' /> :
                                                <EyeIcon className='w-5 h-5' />
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Bouton connexion */}
                                <div className='mt-6'>
                                    <Buttons
                                        type="submit"
                                        primary
                                        title={isLoading ? "Connexion..." : "Se connecter"}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* Lien mot de passe oublie */}
                                <p className='text-text-tertiary text-center text-xs mt-4'>
                                    Mot de passe oublie ?{' '}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/forgot-password")}
                                        className='text-accent hover:text-accent-600 font-semibold transition-colors'
                                    >
                                        Clique ici
                                    </button>
                                </p>
                            </form>
                        </div>

                        {/* Lien inscription */}
                        <p className='text-text-tertiary text-center text-sm mt-6'>
                            Pas encore de compte ?{' '}
                            <button
                                onClick={() => navigate('/signup')}
                                className='text-accent hover:text-accent-600 font-semibold transition-colors'
                            >
                                Inscris-toi
                            </button>
                        </p>
                    </div>
                    <p className='text-text-quaternary text-xs text-center mt-6'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>
                </div>
            </div>
        </div>
    )
}

export default Login
