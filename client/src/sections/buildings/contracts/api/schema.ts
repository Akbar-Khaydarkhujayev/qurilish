import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  object_card_id: z.number(),
  contract_number: z.string().optional(),
  contract_date: z.string().optional().nullable(),
  contract_amount: z.number().optional(),
});

export type FormFields = z.infer<typeof formSchema>;
