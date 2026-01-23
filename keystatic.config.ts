import { config, fields, collection, singleton } from '@keystatic/core';

export default config({
  storage:
    process.env.NODE_ENV === 'production'
      ? {
          kind: 'github',
          repo: 'Superdude22/theknot-website',
        }
      : {
          kind: 'local',
        },

  singletons: {
    // =========================================
    // BRAND SETTINGS
    // =========================================
    brand: singleton({
      label: 'Brand Settings',
      path: 'src/content/brand',
      format: { data: 'json' },
      schema: {
        colors: fields.object(
          {
            rust: fields.text({
              label: 'Rust (Primary)',
              defaultValue: '#B94237',
              description: 'Primary brand color - used for primary buttons',
            }),
            limestone: fields.text({
              label: 'Limestone',
              defaultValue: '#D0D96F',
              description: 'Bright accent color',
            }),
            manatee: fields.text({
              label: 'Manatee (Secondary)',
              defaultValue: '#84BABF',
              description: 'Secondary color - used for secondary buttons',
            }),
            coral: fields.text({
              label: 'Coral',
              defaultValue: '#D89B92',
              description: 'Soft accent - Rust at 75%',
            }),
            surf: fields.text({
              label: 'Surf',
              defaultValue: '#0B4F6C',
              description: 'Deep blue',
            }),
            deepWater: fields.text({
              label: 'Deep Water',
              defaultValue: '#073447',
              description: 'Darkest blue',
            }),
            milkweed: fields.text({
              label: 'Milkweed',
              defaultValue: '#F2F3AE',
              description: 'Limestone at 50%',
            }),
            graphite: fields.text({
              label: 'Graphite',
              defaultValue: '#39393B',
              description: 'Dark neutral',
            }),
            sand: fields.text({
              label: 'Sand',
              defaultValue: '#FAF9F5',
              description: 'Light background',
            }),
          },
          { label: 'Brand Colors' }
        ),
      },
    }),

    // =========================================
    // ANNOUNCEMENT BANNER
    // =========================================
    announcement: singleton({
      label: 'Announcement Banner',
      path: 'src/content/announcement',
      format: { data: 'json' },
      schema: {
        enabled: fields.checkbox({
          label: 'Show Banner',
          defaultValue: true,
        }),
        text: fields.text({
          label: 'Banner Text',
          defaultValue: 'Welcome to The Knot Climbing Gym!',
        }),
        linkText: fields.text({
          label: 'Link Text (optional)',
          description: 'Text for the clickable link portion',
        }),
        linkUrl: fields.text({
          label: 'Link URL (optional)',
          description: 'Where the link goes',
        }),
        backgroundColor: fields.select({
          label: 'Background Color',
          options: [
            { label: 'Rust (Primary)', value: 'rust' },
            { label: 'Manatee (Secondary)', value: 'manatee' },
            { label: 'Limestone', value: 'limestone' },
            { label: 'Graphite', value: 'graphite' },
          ],
          defaultValue: 'rust',
        }),
      },
    }),

    // =========================================
    // HOME PAGE
    // =========================================
    homePage: singleton({
      label: 'Home Page',
      path: 'src/content/pages/home',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            headline: fields.text({
              label: 'Headline',
              defaultValue: 'CLIMB. TRAIN. LEARN.',
            }),
            subtext: fields.array(
              fields.text({ label: 'Paragraph' }),
              {
                label: 'Subtext Paragraphs',
                itemLabel: (props) => props.value || 'Paragraph',
              }
            ),
            buttonText: fields.text({
              label: 'Button Text',
              defaultValue: 'START CLIMBING',
            }),
            buttonLink: fields.text({
              label: 'Button Link',
              defaultValue: '/new-climber',
            }),
            backgroundVideo: fields.text({
              label: 'Background Video URL',
              description: 'Path to video file (e.g., /videos/hero.mp4)',
            }),
            backgroundImage: fields.image({
              label: 'Background Image (fallback)',
              directory: 'public/images/hero',
              publicPath: '/images/hero/',
            }),
          },
          { label: 'Hero Section' }
        ),
        membership: fields.object(
          {
            headline: fields.text({
              label: 'Section Headline',
              defaultValue: 'START YOUR MEMBERSHIP TODAY FOR',
            }),
            promoPrice: fields.text({
              label: 'Promo Price',
              defaultValue: '$XX',
              description: 'The highlighted price (e.g., $XX, $29)',
            }),
            monthlyRate: fields.text({
              label: 'Monthly Rate Text',
              defaultValue: 'Then $80/month, billed on the first of every month.',
            }),
            description: fields.text({
              label: 'Description',
              multiline: true,
              defaultValue:
                'Only pay for the remaining days of this month, then cancel anytime with no contract or additional fees.',
            }),
            buttonText: fields.text({
              label: 'Button Text',
              defaultValue: 'JOIN NOW',
            }),
            buttonLink: fields.text({
              label: 'Button Link',
              defaultValue: 'https://portal.climbtheknot.com/gnv/memberships/join',
            }),
            image: fields.image({
              label: 'Section Image',
              directory: 'public/images/membership',
              publicPath: '/images/membership/',
            }),
          },
          { label: 'Membership Section' }
        ),
        notReadySection: fields.object(
          {
            headline: fields.text({
              label: 'Section Headline',
              defaultValue: 'NOT READY TO COMMIT? NO PROBLEM!',
            }),
          },
          { label: 'Not Ready to Commit Section' }
        ),
        codeOfConduct: fields.object(
          {
            headline: fields.text({
              label: 'Headline',
              defaultValue: 'CODE OF CONDUCT',
            }),
            paragraphs: fields.array(
              fields.text({ label: 'Paragraph', multiline: true }),
              {
                label: 'Content Paragraphs',
                itemLabel: (props) => props.value?.slice(0, 50) + '...' || 'Paragraph',
              }
            ),
          },
          { label: 'Code of Conduct Section' }
        ),
      },
    }),

    // =========================================
    // ABOUT PAGE
    // =========================================
    aboutPage: singleton({
      label: 'About Page',
      path: 'src/content/pages/about',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'ABOUT THE KNOT' }),
            subtext: fields.text({ label: 'Subtext', multiline: true }),
            backgroundImage: fields.image({
              label: 'Background Image',
              directory: 'public/images/about',
              publicPath: '/images/about/',
            }),
          },
          { label: 'Hero Section' }
        ),
        mission: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'OUR MISSION' }),
            content: fields.text({ label: 'Content', multiline: true }),
          },
          { label: 'Mission Section' }
        ),
        story: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'OUR STORY' }),
            content: fields.text({ label: 'Content', multiline: true }),
          },
          { label: 'Story Section' }
        ),
        teamHeadline: fields.text({
          label: 'Team Section Headline',
          defaultValue: 'MEET THE TEAM',
        }),
      },
    }),

    // =========================================
    // MEMBERSHIP PAGE
    // =========================================
    membershipPage: singleton({
      label: 'Membership Page',
      path: 'src/content/pages/membership',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'MEMBERSHIP' }),
            subtext: fields.text({ label: 'Subtext', multiline: true }),
          },
          { label: 'Hero Section' }
        ),
        pricing: fields.object(
          {
            adultPrice: fields.text({ label: 'Adult Monthly Price', defaultValue: '$80' }),
            youthPrice: fields.text({ label: 'Youth Monthly Price', defaultValue: '$45' }),
            kidsPrice: fields.text({ label: 'Kids Monthly Price', defaultValue: '$25' }),
            initiationFee: fields.text({ label: 'Initiation Fee', defaultValue: '$0' }),
          },
          { label: 'Pricing' }
        ),
        benefits: fields.array(
          fields.object({
            title: fields.text({ label: 'Benefit Title' }),
            description: fields.text({ label: 'Description', multiline: true }),
          }),
          {
            label: 'Member Benefits',
            itemLabel: (props) => props.fields.title.value || 'Benefit',
          }
        ),
      },
    }),

    // =========================================
    // NEW CLIMBER PAGE
    // =========================================
    newClimberPage: singleton({
      label: 'New Climber Page',
      path: 'src/content/pages/new-climber',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'NEW TO CLIMBING?' }),
            subtext: fields.text({ label: 'Subtext', multiline: true }),
          },
          { label: 'Hero Section' }
        ),
        gettingStarted: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'GETTING STARTED' }),
            content: fields.text({ label: 'Content', multiline: true }),
          },
          { label: 'Getting Started Section' }
        ),
        dayPassInfo: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'DAY PASSES' }),
            price: fields.text({ label: 'Price', defaultValue: '$25' }),
            description: fields.text({ label: 'Description', multiline: true }),
            restrictions: fields.text({ label: 'Restrictions', multiline: true }),
          },
          { label: 'Day Pass Info' }
        ),
      },
    }),

    // =========================================
    // AMENITIES PAGE
    // =========================================
    amenitiesPage: singleton({
      label: 'Amenities Page',
      path: 'src/content/pages/amenities',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'AMENITIES' }),
            subtext: fields.text({ label: 'Subtext', multiline: true }),
          },
          { label: 'Hero Section' }
        ),
        features: fields.array(
          fields.object({
            title: fields.text({ label: 'Feature Title' }),
            description: fields.text({ label: 'Description', multiline: true }),
            image: fields.image({
              label: 'Feature Image',
              directory: 'public/images/amenities',
              publicPath: '/images/amenities/',
            }),
          }),
          {
            label: 'Facility Features',
            itemLabel: (props) => props.fields.title.value || 'Feature',
          }
        ),
      },
    }),

    // =========================================
    // SHOP PAGE
    // =========================================
    shopPage: singleton({
      label: 'Shop Page',
      path: 'src/content/pages/shop',
      format: { data: 'json' },
      schema: {
        hero: fields.object(
          {
            headline: fields.text({ label: 'Headline', defaultValue: 'GEAR SHOP' }),
            subtext: fields.text({ label: 'Subtext', multiline: true }),
          },
          { label: 'Hero Section' }
        ),
        intro: fields.text({
          label: 'Intro Text',
          multiline: true,
          description: 'Introductory paragraph for the shop',
        }),
      },
    }),
  },

  collections: {
    // =========================================
    // TEAM MEMBERS
    // =========================================
    team: collection({
      label: 'Team Members',
      slugField: 'name',
      path: 'src/content/team/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Name' } }),
        role: fields.text({ label: 'Role/Title' }),
        bio: fields.text({ label: 'Bio', multiline: true }),
        photo: fields.image({
          label: 'Photo',
          directory: 'public/images/team',
          publicPath: '/images/team/',
        }),
        order: fields.integer({
          label: 'Display Order',
          defaultValue: 99,
          description: 'Lower numbers appear first',
        }),
        isLeadership: fields.checkbox({
          label: 'Leadership Team',
          defaultValue: false,
        }),
      },
    }),

    // =========================================
    // EVENTS
    // =========================================
    events: collection({
      label: 'Events',
      slugField: 'title',
      path: 'src/content/events/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Event Title' } }),
        date: fields.date({ label: 'Event Date' }),
        time: fields.text({ label: 'Time', description: 'e.g., 6:00 PM - 9:00 PM' }),
        description: fields.text({ label: 'Description', multiline: true }),
        image: fields.image({
          label: 'Event Image',
          directory: 'public/images/events',
          publicPath: '/images/events/',
        }),
        registrationLink: fields.text({
          label: 'Registration Link',
          description: 'URL for event registration (optional)',
        }),
        isFeatured: fields.checkbox({
          label: 'Featured Event',
          defaultValue: false,
        }),
        isRecurring: fields.checkbox({
          label: 'Recurring Event',
          defaultValue: false,
        }),
        recurringSchedule: fields.text({
          label: 'Recurring Schedule',
          description: 'e.g., "Every Tuesday" (only if recurring)',
        }),
      },
    }),

    // =========================================
    // POLICIES (Rates & Policies Accordion)
    // =========================================
    policies: collection({
      label: 'Rates & Policies',
      slugField: 'title',
      path: 'src/content/policies/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.document({
          label: 'Content',
          formatting: true,
          links: true,
          dividers: true,
          lists: true,
        }),
        buttonText: fields.text({ label: 'Button Text (optional)' }),
        buttonLink: fields.text({ label: 'Button Link (optional)' }),
        order: fields.integer({
          label: 'Display Order',
          defaultValue: 99,
          description: 'Lower numbers appear first',
        }),
      },
    }),

    // =========================================
    // PRODUCTS (Shop Items)
    // =========================================
    products: collection({
      label: 'Shop Products',
      slugField: 'name',
      path: 'src/content/products/*',
      format: { data: 'json' },
      schema: {
        name: fields.slug({ name: { label: 'Product Name' } }),
        price: fields.text({ label: 'Price', description: 'e.g., $29.99' }),
        description: fields.text({ label: 'Description', multiline: true }),
        images: fields.array(
          fields.image({
            label: 'Image',
            directory: 'public/images/products',
            publicPath: '/images/products/',
          }),
          {
            label: 'Product Images',
            itemLabel: (props) => 'Image',
          }
        ),
        sizes: fields.array(fields.text({ label: 'Size' }), {
          label: 'Available Sizes',
          itemLabel: (props) => props.value || 'Size',
        }),
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Apparel', value: 'apparel' },
            { label: 'Gear', value: 'gear' },
            { label: 'Accessories', value: 'accessories' },
          ],
          defaultValue: 'apparel',
        }),
        inStock: fields.checkbox({
          label: 'In Stock',
          defaultValue: true,
        }),
        order: fields.integer({
          label: 'Display Order',
          defaultValue: 99,
        }),
      },
    }),

    // =========================================
    // NOT READY TO COMMIT CARDS
    // =========================================
    notReadyCards: collection({
      label: 'Not Ready to Commit Cards',
      slugField: 'label',
      path: 'src/content/not-ready-cards/*',
      format: { data: 'json' },
      schema: {
        label: fields.slug({ name: { label: 'Card Label' } }),
        description: fields.text({ label: 'Description', multiline: true }),
        buttonText: fields.text({ label: 'Button Text' }),
        buttonLink: fields.text({ label: 'Button Link' }),
        image: fields.image({
          label: 'Card Image',
          directory: 'public/images/cards',
          publicPath: '/images/cards/',
        }),
        order: fields.integer({
          label: 'Display Order',
          defaultValue: 99,
        }),
      },
    }),
  },
});
