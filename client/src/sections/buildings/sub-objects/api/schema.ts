import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  object_card_id: z.number(),
  name: z.string().min(1, 'Required'),
  deadline: z.string().optional().nullable(),
  cost: z.number().optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
});

export type FormFields = z.infer<typeof formSchema>;
