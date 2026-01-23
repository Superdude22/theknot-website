import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  isPopup?: boolean;
}

interface HeaderMobileProps {
  navItems: NavItem[];
  isHome?: boolean;
}

export default function HeaderMobile({ navItems, isHome = false }: HeaderMobileProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        style={{
          background: 'none',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '18px',
            position: 'relative',
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              backgroundColor: 'black',
              top: isOpen ? '8px' : '0',
              transform: isOpen ? 'rotate(45deg)' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              backgroundColor: 'black',
              top: '8px',
              opacity: isOpen ? 0 : 1,
              transition: 'opacity 0.3s ease',
            }}
          />
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              backgroundColor: 'black',
              top: isOpen ? '8px' : '16px',
              transform: isOpen ? 'rotate(-45deg)' : 'none',
              transition: 'all 0.3s ease',
            }}
          />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}
      >
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            textAlign: 'center',
          }}
        >
          {navItems.map((item, index) => (
            <li
              key={item.label}
              style={{
                marginBottom: '24px',
                opacity: isOpen ? 1 : 0,
                transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.3s ease ${index * 0.05}s, transform 0.3s ease ${index * 0.05}s`,
              }}
            >
              <a
                href={item.href}
                onClick={handleNavClick}
                style={{
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
