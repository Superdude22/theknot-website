import { useState, useEffect } from 'react';

interface ShopProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  category: 'apparel' | 'essentials' | 'top-rope-gear' | 'climbing-shoes';
  sizes?: string[];
  colors?: string[];
  images: string[];
}

interface ProductModalProps {
  product: ShopProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setSelectedColor(null);
    }
  }, [product]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const isDisabled = (product.sizes && !selectedSize) || (product.colors && !selectedColor);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>

        <div className="modal-content">
          <div className="modal-image-column">
            <svg
              viewBox="0 0 400 400"
              preserveAspectRatio="xMidYMid slice"
              style={{ width: '100%', height: '100%' }}
            >
              <defs>
                <linearGradient id="modalProductSkyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#87CEEB" />
                  <stop offset="100%" stopColor="#B0E0E6" />
                </linearGradient>
              </defs>
              <rect width="400" height="400" fill="url(#modalProductSkyGrad)" />
              <ellipse cx="70" cy="50" rx="45" ry="28" fill="white" opacity="0.9" />
              <ellipse cx="110" cy="58" rx="38" ry="24" fill="white" opacity="0.9" />
              <ellipse cx="310" cy="65" rx="50" ry="30" fill="white" opacity="0.9" />
              <ellipse cx="200" cy="350" rx="280" ry="100" fill="#90EE90" />
              <ellipse cx="130" cy="375" rx="200" ry="70" fill="#7CCD7C" />
            </svg>
            {product.images.length > 1 && (
              <div className="modal-carousel-dots">
                {product.images.map((_, index) => (
                  <span
                    key={index}
                    className={`modal-dot ${index === 0 ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="modal-details-column">
            <h2 className="modal-product-name">{product.name}</h2>
            <p className="modal-product-price">PRICE $$</p>
            <p className="modal-product-description">{product.description}</p>

            {product.sizes && (
              <div className="modal-size-selector">
                <p className="modal-size-label">SIZE</p>
                <div className="modal-size-buttons">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`modal-size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && (
              <div className="modal-color-selector">
                <p className="modal-color-label">COLOR</p>
                <div className="modal-color-buttons">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      className={`modal-color-button ${selectedColor === color ? 'selected' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className={`modal-add-to-cart ${isDisabled ? 'disabled' : ''}`}
              disabled={!!isDisabled}
            >
              ADD TO CART
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-container {
          background: #FAF9F5;
          border-radius: 16px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow: auto;
          position: relative;
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          font-size: 32px;
          color: #39393B;
          cursor: pointer;
          z-index: 10;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }

        .modal-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .modal-image-column {
          position: relative;
          min-height: 400px;
          border-radius: 16px 0 0 16px;
          overflow: hidden;
        }

        .modal-carousel-dots {
          position: absolute;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
        }

        .modal-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #39393B;
          opacity: 0.4;
        }

        .modal-dot.active {
          opacity: 1;
        }

        .modal-details-column {
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .modal-product-name {
          font-family: 'Zing Rust', 'Impact', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          margin: 0;
        }

        .modal-product-price {
          font-family: 'Zing Rust', 'Impact', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--color-rust, #B94237);
          margin: 0;
          text-transform: uppercase;
        }

        .modal-product-description {
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          color: #000;
          line-height: 1.6;
          margin: 0;
        }

        .modal-size-selector,
        .modal-color-selector {
          margin-top: 8px;
        }

        .modal-size-label,
        .modal-color-label {
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          text-transform: uppercase;
          margin: 0 0 8px;
        }

        .modal-size-buttons,
        .modal-color-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-size-button {
          min-width: 48px;
          height: 48px;
          padding: 8px 16px;
          background: #fff;
          border: 2px solid #000;
          border-radius: 6px;
          font-family: 'Zing Rust', 'Impact', sans-serif;
          font-size: 14px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-size-button:hover {
          background: #f0f0f0;
        }

        .modal-size-button.selected {
          background: #39393B;
          color: #fff;
          border-color: #39393B;
        }

        .modal-color-button {
          padding: 8px 16px;
          background: #fff;
          border: 1px solid #000;
          border-radius: 8px;
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-color-button:hover {
          background: #e5e5e0;
        }

        .modal-color-button.selected {
          background: #333333;
          color: #fff;
          border-color: #333333;
        }

        .modal-add-to-cart {
          margin-top: 16px;
          padding: 14px 28px;
          background: var(--color-rust, #B94237);
          color: #fff;
          font-family: 'Rubik', sans-serif;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
        }

        .modal-add-to-cart:hover:not(.disabled) {
          opacity: 0.9;
        }

        .modal-add-to-cart.disabled {
          background: #cccccc;
          color: #666666;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-content {
            grid-template-columns: 1fr;
          }

          .modal-image-column {
            min-height: 250px;
            border-radius: 16px 16px 0 0;
          }

          .modal-details-column {
            padding: 24px 20px;
          }

          .modal-add-to-cart {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
