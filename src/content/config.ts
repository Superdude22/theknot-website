// Astro content collections config
// Note: Keystatic manages the content, this file defines the collections for Astro's getCollection/getEntry

import { defineCollection, z } from 'astro:content';

// Team members collection
const team = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string().optional(),
    photo: z.string().optional(),
    order: z.number().default(99),
    isLeadership: z.boolean().default(false),
  }),
});

// Events collection
const events = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.string().optional(),
    time: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    registrationLink: z.string().optional(),
    isFeatured: z.boolean().default(false),
    isRecurring: z.boolean().default(false),
    recurringSchedule: z.string().optional(),
  }),
});

// Policies collection (Rates & Policies accordion)
const policies = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    content: z.any(), // Keystatic document field
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
    order: z.number().default(99),
  }),
});

// Products collection
const products = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    price: z.string(),
    description: z.string().optional(),
    images: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional(),
    category: z.enum(['apparel', 'gear', 'accessories']).default('apparel'),
    inStock: z.boolean().default(true),
    order: z.number().default(99),
  }),
});

// Not Ready to Commit cards
const notReadyCards = defineCollection({
  type: 'data',
  schema: z.object({
    label: z.string(),
    description: z.string(),
    buttonText: z.string(),
    buttonLink: z.string(),
    image: z.string().optional(),
    order: z.number().default(99),
  }),
});

export const collections = {
  team,
  events,
  policies,
  products,
  'not-ready-cards': notReadyCards,
};
