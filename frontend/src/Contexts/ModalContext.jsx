import { createContext, useContext, useState, useCallback } from 'react'
import Modal from '../components/Modal'

const ModalContext = createContext()

export function ModalProvider({ children }) {
  const [modal, setModal] = useState({
    isOpen: false,
    type: null,
    message: '',
    title: null,
    buttons: null,
    autoClose: true
  })

  const showModal = useCallback(({ type, message, title = null, buttons = null, autoClose = true }) => {
    setModal({
      isOpen: true,
      type,
      message,
      title,
      buttons,
      autoClose
    })
  }, [])

  const closeModal = useCallback(() => {
    setModal({
      isOpen: false,
      type: null,
      message: '',
      title: null,
      buttons: null,
      autoClose: true
    })
  }, [])

  // Raccourcis pratiques
  const showSuccess = useCallback((message, options = {}) => {
    showModal({ type: 'success', message, ...options })
  }, [showModal])

  const showError = useCallback((message, options = {}) => {
    showModal({ type: 'error', message, ...options })
  }, [showModal])

  const showWarning = useCallback((message, options = {}) => {
    showModal({ type: 'warning', message, ...options })
  }, [showModal])

  const showInfo = useCallback((message, options = {}) => {
    showModal({ type: 'info', message, ...options })
  }, [showModal])

  // Modal de confirmation avec boutons
  const showConfirm = useCallback((message, onConfirm, onCancel = null) => {
    showModal({
      type: 'warning',
      message,
      autoClose: false,
      buttons: [
        { label: 'Annuler', action: onCancel, style: 'cancel' },
        { label: 'Confirmer', action: onConfirm, style: 'confirm' }
      ]
    })
  }, [showModal])

  // Modal de confirmation avec type personnalisé
  const showConfirmDanger = useCallback((message, onConfirm, onCancel = null) => {
    showModal({
      type: 'error',
      message,
      autoClose: false,
      buttons: [
        { label: 'Annuler', action: onCancel, style: 'cancel' },
        { label: 'Supprimer', action: onConfirm, style: 'confirm' }
      ]
    })
  }, [showModal])

  return (
    <ModalContext.Provider value={{
      showModal,
      closeModal,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
      showConfirmDanger
    }}>
      {children}
      {modal.isOpen && (
        <Modal
          type={modal.type}
          message={modal.message}
          title={modal.title}
          buttons={modal.buttons}
          autoClose={modal.autoClose}
          onClose={closeModal}
        />
      )}
    </ModalContext.Provider>
  )
}

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
