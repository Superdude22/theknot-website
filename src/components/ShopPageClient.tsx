import { useState } from 'react';
import ProductModal from './ProductModal';

interface ShopProduct {
  id: string;
  slug?: string;
  data: {
    name: string;
    price: string;
    description?: string;
    category: 'apparel' | 'essentials' | 'top-rope-gear' | 'climbing-shoes';
    sizes?: string[];
    imageLibraryPaths?: string[];
    images?: string[];
    inStock: boolean;
    order: number;
  };
}

interface ShopPageClientProps {
  products: ShopProduct[];
}

const categories = [
  { id: 'all', label: 'ALL' },
  { id: 'apparel', label: 'APPAREL' },
  { id: 'essentials', label: 'ESSENTIALS' },
  { id: 'top-rope-gear', label: 'TOP-ROPE GEAR' },
  { id: 'climbing-shoes', label: 'CLIMBING SHOES' },
] as const;

export default function ShopPageClient({ products }: ShopPageClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleProductClick = (product: ShopProduct) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const getFilteredProducts = () => {
    const inStockProducts = products.filter(p => p.data.inStock);
    if (activeCategory === 'all') {
      return inStockProducts;
    }
    return inStockProducts.filter(p => p.data.category === activeCategory);
  };

  const toPublicUrl = (libraryPath?: string) =>
    libraryPath && libraryPath.startsWith('public/')
      ? `/${libraryPath.slice('public/'.length)}`
      : undefined;

  const getProductImages = (product: ShopProduct) => {
    const libraryImages = (product.data.imageLibraryPaths || [])
      .map((entry) => toPublicUrl(entry))
      .filter((entry): entry is string => Boolean(entry));
    return libraryImages.length > 0 ? libraryImages : (product.data.images || []);
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="shop-content">
      {/* Category Filter Tabs */}
      <section className="category-section">
        <div className="category-tabs">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-tab${activeCategory === category.id ? ' active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
              aria-label={`Filter by ${category.label}`}
              aria-pressed={activeCategory === category.id}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="product-section">
        <div className="product-grid">
          {filteredProducts.map((product) => {
            const productImages = getProductImages(product);
            return (
              <button
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product)}
                aria-label={`View details for ${product.data.name}`}
              >
                <div className="product-image">
                  <img
                    src={productImages[0] || '/images/canva-final/canva-hills-background.jpg'}
                    alt={product.data.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.data.name}</h3>
                  <p className="product-price">{product.data.price}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Modal */}
      <ProductModal
        product={selectedProduct}
        isOpen={selectedProduct !== null}
        onClose={handleCloseModal}
      />

      <style>{`
        .shop-content {
          background: #fff;
        }

        /* Category Filter Tabs */
        .category-section {
          padding: 48px 5% 24px;
          background: #fff;
        }

        .category-tabs {
          display: flex;
          justify-content: center;
          gap: 8px;
          max-width: 1100px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .category-tab {
          background: none;
          border: 2px solid #ccc;
          border-radius: 24px;
          cursor: pointer;
          padding: 10px 24px;
          font-family: 'Zing Rust', 'Impact', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #333;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
        }

        .category-tab:hover {
          border-color: #000;
          color: #000;
        }

        .category-tab.active {
          background: #000;
          border-color: #000;
          color: #fff;
        }

        /* Product Section */
        .product-section {
          padding: 32px 5% 60px;
          background: #fff;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .product-card {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
          transition: transform 0.2s ease;
          padding: 0;
        }

        .product-card:hover {
          transform: translateY(-4px);
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
        }

        .product-info {
          text-align: left;
        }

        .product-name {
          font-family: 'Zing Rust', 'Impact', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          margin: 0 0 2px;
        }

        .product-price {
          font-family: 'Rubik', sans-serif;
          font-size: 12px;
          color: #000;
          margin: 0;
          text-transform: uppercase;
        }

        /* Tablet Responsive */
        @media (max-width: 1024px) {
          .product-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .category-section {
            padding: 32px 5% 16px;
          }

          .category-tabs {
            gap: 6px;
          }

          .category-tab {
            padding: 8px 16px;
            font-size: 11px;
          }

          .product-section {
            padding: 24px 5% 40px;
          }

          .product-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .product-name {
            font-size: 11px;
          }

          .product-price {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
