import { z } from 'zod';

// Zod schema for runtime validation
export const DreamSchema = z.object({
  id: z.string(),
  title: z.string(),
  date: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  emotionalState: z.string().optional(),
  interpretation: z.string().optional(),
});

// TypeScript type derived from the schema
export type Dream = z.infer<typeof DreamSchema>;

// Empty dream for initialization
export const emptyDream: Dream = {
  id: '',
  title: '',
  date: '',
  description: '',
  tags: [],
  emotionalState: undefined,
  interpretation: undefined,
};