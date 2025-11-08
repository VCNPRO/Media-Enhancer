import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  icon?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  onConfirm,
  icon,
}) => {
  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-900/30',
          border: 'border-red-500',
          icon: icon || '❌',
          buttonBg: 'bg-red-600 hover:bg-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-900/30',
          border: 'border-yellow-500',
          icon: icon || '⚠️',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
        };
      case 'success':
        return {
          bg: 'bg-green-900/30',
          border: 'border-green-500',
          icon: icon || '✅',
          buttonBg: 'bg-green-600 hover:bg-green-700',
        };
      case 'confirm':
        return {
          bg: 'bg-blue-900/30',
          border: 'border-blue-500',
          icon: icon || '❓',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          bg: 'bg-gray-800',
          border: 'border-gray-600',
          icon: icon || 'ℹ️',
          buttonBg: 'bg-gray-600 hover:bg-gray-700',
        };
    }
  };

  const styles = getTypeStyles();
  const isConfirmModal = type === 'confirm' && onConfirm;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        className={`relative w-full max-w-md ${styles.bg} border-2 ${styles.border} rounded-xl shadow-2xl animate-scaleIn`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">{styles.icon}</div>
            <div className="flex-1">
              <h3 id="modal-title" className="text-xl font-bold text-white mb-2">
                {title}
              </h3>
              <p id="modal-description" className="text-gray-300 whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex gap-3 justify-end">
          {isConfirmModal ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                autoFocus
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                className={`px-6 py-2 ${styles.buttonBg} rounded-lg font-semibold transition`}
              >
                {confirmText}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className={`px-6 py-2 ${styles.buttonBg} rounded-lg font-semibold transition`}
              autoFocus
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

// Hook para usar modales de forma programática
export const useModal = () => {
  const [modalState, setModalState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: ModalProps['type'];
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    icon?: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  const showModal = (params: Omit<typeof modalState, 'isOpen'>) => {
    setModalState({ ...params, isOpen: true });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const showAlert = (title: string, message: string, type: ModalProps['type'] = 'info') => {
    showModal({ title, message, type });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
  ) => {
    showModal({
      title,
      message,
      type: 'confirm',
      onConfirm,
      confirmText,
      cancelText,
    });
  };

  return {
    modalState,
    showModal,
    closeModal,
    showAlert,
    showConfirm,
    ModalComponent: () => (
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        icon={modalState.icon}
      />
    ),
  };
};
