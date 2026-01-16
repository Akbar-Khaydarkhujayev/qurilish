import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  sub_object_card_id: z.number(),
  construction_item_id: z.number({ required_error: 'Required' }),
  deadline: z.string().optional().nullable(),
  cost: z.number().optional().nullable(),
  completion_percentage: z.number().min(0).max(100).optional(),
});

export type FormFields = z.infer<typeof formSchema>;
