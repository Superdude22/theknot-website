'use client';

import { useEffect, useCallback, useRef, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  twoColumn?: boolean;
  imageContent?: ReactNode;
  lightTheme?: boolean;
  ariaLabel?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  twoColumn = false,
  imageContent,
  lightTheme = false,
  ariaLabel = 'Dialog'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
      
      setTimeout(() => {
        modalRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = '';
      
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleEscKey]);

  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="modal-overlay"
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        <div
          ref={modalRef}
          className={`modal-container ${lightTheme ? 'modal-light' : 'modal-dark'} ${twoColumn ? 'modal-wide' : ''}`}
          tabIndex={-1}
        >
          {twoColumn ? (
            <div className="modal-two-column">
              {imageContent && (
                <div className="modal-image-column">
                  {imageContent}
                </div>
              )}
              <div className="modal-content-column">
                {children}
              </div>
            </div>
          ) : (
            <div className="modal-single-column">
              {children}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: modalFadeIn 0.3s ease;
        }

        .modal-container {
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          animation: modalSlideIn 0.3s ease;
          outline: none;
        }

        .modal-container.modal-wide {
          max-width: 900px;
        }

        .modal-container.modal-dark {
          background-color: var(--color-graphite);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0;
        }

        .modal-container.modal-light {
          background-color: var(--color-sand);
          border: none;
          border-radius: 8px;
        }

        .modal-single-column {
          padding: 32px;
        }

        .modal-two-column {
          display: flex;
          min-height: 400px;
        }

        .modal-image-column {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-graphite);
        }

        .modal-content-column {
          flex: 1;
          min-width: 0;
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .modal-two-column {
            flex-direction: column;
          }

          .modal-image-column {
            min-height: 200px;
          }
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

interface ModalCloseButtonProps {
  onClick: () => void;
  lightTheme?: boolean;
}

export function ModalCloseButton({ onClick, lightTheme = false }: ModalCloseButtonProps) {
  const strokeColor = lightTheme ? 'var(--color-graphite)' : 'white';
  const borderColor = lightTheme ? 'var(--color-graphite)' : 'white';

  return (
    <>
      <button
        onClick={onClick}
        aria-label="Close modal"
        className="modal-close-button"
        type="button"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1 1L11 11M1 11L11 1"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <style>{`
        .modal-close-button {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid ${borderColor};
          background-color: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .modal-close-button:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }

        .modal-close-button:focus {
          outline: 2px solid var(--color-limestone);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}

export default Modal;
