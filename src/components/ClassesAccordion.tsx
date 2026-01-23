import { useState } from 'react';

interface ClassType {
  title: string;
  description: string;
  duration: string;
  level: string;
  included: boolean;
}

interface ClassesAccordionProps {
  items: ClassType[];
}

export default function ClassesAccordion({ items }: ClassesAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="accordion">
      {items.map((item, index) => (
        <div key={index} className="accordion-item">
          <button
            className={`accordion-header ${openIndex === index ? 'accordion-header--open' : ''}`}
            onClick={() => toggleItem(index)}
            aria-expanded={openIndex === index}
          >
            <span className="accordion-title">{item.title}</span>
            <span className="accordion-icon">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                }}
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>

          <div
            className="accordion-content"
            style={{
              maxHeight: openIndex === index ? '1000px' : '0',
              opacity: openIndex === index ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.3s ease, opacity 0.3s ease',
            }}
          >
            <div className="accordion-content-inner">
              <p className="accordion-text">{item.description}</p>
              <div className="class-meta">
                <span className="meta-item">
                  <strong>Duration:</strong> {item.duration}
                </span>
                <span className="meta-item">
                  <strong>Level:</strong> {item.level}
                </span>
                <span className={`meta-item ${item.included ? 'included' : 'not-included'}`}>
                  {item.included ? '✓ Free with Membership' : '$ Additional Fee'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        .accordion {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 800px;
          margin: 0 auto;
        }

        .accordion-item {
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .accordion-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background-color: var(--color-graphite, #39393B);
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .accordion-header:hover {
          background-color: #4a4a4c;
        }

        .accordion-header--open {
          background-color: #4a4a4c;
        }

        .accordion-title {
          font-family: var(--font-heading, 'Uniform Pro', sans-serif);
          font-size: 16px;
          font-weight: 700;
          color: white;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-align: left;
        }

        .accordion-icon {
          color: var(--color-manatee, #84BABF);
          display: flex;
          align-items: center;
        }

        .accordion-content-inner {
          padding: 24px;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .accordion-text {
          font-family: var(--font-body, 'Rubik', sans-serif);
          font-size: 15px;
          color: #555;
          line-height: 1.7;
          margin: 0;
        }

        .class-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .meta-item {
          font-family: var(--font-body, 'Rubik', sans-serif);
          font-size: 13px;
          color: #555;
          padding: 4px 10px;
          background: var(--color-sand, #FAF9F5);
          border-radius: 4px;
        }

        .meta-item strong {
          color: #000;
        }

        .meta-item.included {
          background: #d4edda;
          color: #155724;
        }

        .meta-item.not-included {
          background: #fff3cd;
          color: #856404;
        }

        @media (max-width: 768px) {
          .accordion-header {
            padding: 16px 20px;
          }

          .accordion-title {
            font-size: 14px;
          }

          .accordion-content-inner {
            padding: 20px;
          }

          .accordion-text {
            font-size: 14px;
          }

          .class-meta {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
