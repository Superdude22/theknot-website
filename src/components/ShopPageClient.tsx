import { useState } from 'react';
import ProductModal from './ProductModal';

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

const categories = [
  { id: 'apparel', label: 'APPAREL' },
  { id: 'essentials', label: 'ESSENTIALS' },
  { id: 'top-rope-gear', label: 'TOP-ROPE GEAR' },
  { id: 'climbing-shoes', label: 'CLIMBING SHOES' },
] as const;

const products: ShopProduct[] = [
  // Apparel
  { id: 'app-1', name: 'PRODUCT 1', price: 35, description: 'The Knot branded t-shirt. Soft cotton blend with climbing-inspired graphics.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'White', 'Grey'], images: ['img1', 'img2'] },
  { id: 'app-2', name: 'PRODUCT 2', price: 45, description: 'Premium hoodie with The Knot logo. Perfect for post-climb warmth.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Navy'], images: ['img1'] },
  { id: 'app-3', name: 'PRODUCT 3', price: 25, description: 'Classic tank top for warm weather climbing. Breathable fabric.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Grey'], images: ['img1'] },
  { id: 'app-4', name: 'PRODUCT 4', price: 30, description: 'Long sleeve shirt for cooler days. Moisture-wicking material.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'White'], images: ['img1'] },
  { id: 'app-5', name: 'PRODUCT 5', price: 55, description: 'Lightweight climbing jacket. Wind-resistant and packable.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Olive'], images: ['img1', 'img2', 'img3'] },
  { id: 'app-6', name: 'PRODUCT 6', price: 28, description: 'The Knot beanie. Warm knit with embroidered logo.', category: 'apparel', sizes: ['One Size'], colors: ['Black', 'Grey', 'Navy'], images: ['img1'] },
  { id: 'app-7', name: 'PRODUCT 7', price: 22, description: 'Performance cap with mesh back. Adjustable snapback closure.', category: 'apparel', sizes: ['One Size'], colors: ['Black', 'White'], images: ['img1'] },
  { id: 'app-8', name: 'PRODUCT 8', price: 38, description: 'Climbing joggers. Stretchy fabric for maximum mobility.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Grey'], images: ['img1', 'img2'] },
  { id: 'app-9', name: 'PRODUCT 9', price: 32, description: 'Athletic shorts with zippered pockets. Quick-dry material.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Olive'], images: ['img1'] },
  { id: 'app-10', name: 'PRODUCT 10', price: 65, description: 'Zip-up fleece jacket. Cozy warmth with The Knot branding.', category: 'apparel', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Black', 'Grey'], images: ['img1', 'img2'] },
  // Essentials
  { id: 'ess-1', name: 'PRODUCT 1', price: 18, description: 'Chalk bag with adjustable belt. Multiple color options.', category: 'essentials', images: ['img1'] },
  { id: 'ess-2', name: 'PRODUCT 2', price: 12, description: 'Premium loose chalk, 8oz bag. Long-lasting grip enhancement.', category: 'essentials', images: ['img1'] },
  { id: 'ess-3', name: 'PRODUCT 3', price: 8, description: 'Climbing tape for finger protection. 1.5 inch width.', category: 'essentials', images: ['img1'] },
  { id: 'ess-4', name: 'PRODUCT 4', price: 15, description: 'Brush set for cleaning holds. Includes 3 different brush types.', category: 'essentials', images: ['img1'] },
  { id: 'ess-5', name: 'PRODUCT 5', price: 25, description: 'Water bottle with The Knot logo. 32oz insulated.', category: 'essentials', images: ['img1'] },
  // Top-Rope Gear
  { id: 'tr-1', name: 'PRODUCT 1', price: 45, description: 'Climbing harness rental package. Includes chalk bag.', category: 'top-rope-gear', sizes: ['S', 'M', 'L', 'XL'], images: ['img1'] },
  { id: 'tr-2', name: 'PRODUCT 2', price: 15, description: 'Locking carabiner for top-rope anchors. HMS style.', category: 'top-rope-gear', images: ['img1'] },
  { id: 'tr-3', name: 'PRODUCT 3', price: 85, description: 'Belay device with assisted braking. Perfect for beginners.', category: 'top-rope-gear', images: ['img1'] },
  { id: 'tr-4', name: 'PRODUCT 4', price: 35, description: 'Belay glasses for neck comfort. Prism design.', category: 'top-rope-gear', images: ['img1'] },
  { id: 'tr-5', name: 'PRODUCT 5', price: 20, description: 'Helmet for indoor climbing. Lightweight foam construction.', category: 'top-rope-gear', images: ['img1'] },
  // Climbing Shoes
  { id: 'shoe-1', name: 'PRODUCT 1', price: 89, description: 'Beginner climbing shoes. Flat last for all-day comfort.', category: 'climbing-shoes', sizes: ['6', '7', '8', '9', '10', '11', '12'], images: ['img1', 'img2'] },
  { id: 'shoe-2', name: 'PRODUCT 2', price: 119, description: 'Intermediate shoes with moderate downturn. Great for bouldering.', category: 'climbing-shoes', sizes: ['6', '7', '8', '9', '10', '11', '12'], images: ['img1'] },
  { id: 'shoe-3', name: 'PRODUCT 3', price: 159, description: 'Advanced aggressive shoes. Designed for overhanging routes.', category: 'climbing-shoes', sizes: ['6', '7', '8', '9', '10', '11'], images: ['img1'] },
  { id: 'shoe-4', name: 'PRODUCT 4', price: 99, description: 'All-around performance shoes. Velcro closure for easy on/off.', category: 'climbing-shoes', sizes: ['6', '7', '8', '9', '10', '11', '12'], images: ['img1'] },
  { id: 'shoe-5', name: 'PRODUCT 5', price: 139, description: 'Technical slab shoes. Soft rubber for maximum sensitivity.', category: 'climbing-shoes', sizes: ['6', '7', '8', '9', '10', '11'], images: ['img1'] },
];

export default function ShopPageClient() {
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);

  const handleProductClick = (product: ShopProduct) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  const handleCategoryClick = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getProductsByCategory = (category: string) => {
    return products.filter(p => p.category === category);
  };

  return (
    <div className="shop-content">
      {/* Category Navigation */}
      <section className="category-section">
        <div className="category-grid">
          {categories.map((category, index) => (
            <button
              key={category.id}
              className="category-card"
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="category-image">
                <svg
                  viewBox="0 0 200 160"
                  preserveAspectRatio="xMidYMid slice"
                  style={{ width: '100%', height: '100%' }}
                >
                  <defs>
                    <linearGradient id={`catSkyGrad-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#87CEEB" />
                      <stop offset="100%" stopColor="#B0E0E6" />
                    </linearGradient>
                  </defs>
                  <rect width="200" height="160" fill={`url(#catSkyGrad-${index})`} />
                  <ellipse cx="40" cy="30" rx="25" ry="15" fill="white" opacity="0.9" />
                  <ellipse cx="60" cy="35" rx="20" ry="12" fill="white" opacity="0.9" />
                  <ellipse cx="150" cy="35" rx="28" ry="16" fill="white" opacity="0.9" />
                  <ellipse cx="100" cy="140" rx="140" ry="50" fill="#90EE90" />
                  <ellipse cx="60" cy="150" rx="100" ry="35" fill="#7CCD7C" />
                </svg>
              </div>
              <span className="category-label">{category.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Product Sections */}
      {categories.map((category) => (
        <section key={category.id} id={category.id} className="product-section">
          <h2 className="section-heading">{category.label}</h2>
          <div className="product-grid">
            {getProductsByCategory(category.id).map((product) => (
              <button
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product)}
              >
                <div className="product-image">
                  <svg
                    viewBox="0 0 180 140"
                    preserveAspectRatio="xMidYMid slice"
                    style={{ width: '100%', height: '100%' }}
                  >
                    <defs>
                      <linearGradient id={`prodSkyGrad-${product.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#87CEEB" />
                        <stop offset="100%" stopColor="#B0E0E6" />
                      </linearGradient>
                    </defs>
                    <rect width="180" height="140" fill={`url(#prodSkyGrad-${product.id})`} />
                    <ellipse cx="30" cy="25" rx="18" ry="10" fill="white" opacity="0.9" />
                    <ellipse cx="48" cy="28" rx="14" ry="8" fill="white" opacity="0.9" />
                    <ellipse cx="140" cy="28" rx="20" ry="12" fill="white" opacity="0.9" />
                    <ellipse cx="90" cy="120" rx="120" ry="40" fill="#90EE90" />
                    <ellipse cx="55" cy="130" rx="90" ry="30" fill="#7CCD7C" />
                  </svg>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">PRICE</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}

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

        /* Category Section */
        .category-section {
          padding: 80px 5% 60px;
          background: #fff;
        }

        .category-grid {
          display: flex;
          justify-content: center;
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .category-card {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s ease;
          padding: 0;
        }

        .category-card:hover {
          transform: translateY(-4px);
        }

        .category-image {
          width: 180px;
          height: 140px;
          border-radius: 8px;
          overflow: hidden;
        }

        .category-label {
          font-family: 'Zing Rust', 'Impact', sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Product Section */
        .product-section {
          padding: 60px 5% 40px;
          background: #fff;
        }

        .section-heading {
          display: none;
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
            padding: 40px 5%;
          }

          .category-grid {
            gap: 16px;
          }

          .category-card {
            width: 45%;
          }

          .category-image {
            width: 100%;
            height: auto;
            aspect-ratio: 5/4;
          }

          .category-label {
            font-size: 11px;
          }

          .product-section {
            padding: 30px 5% 40px;
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
