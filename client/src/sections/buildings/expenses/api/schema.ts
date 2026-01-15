import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  object_card_id: z.number(),
  object_contract_id: z.number({ required_error: 'Required' }),
  registry_number: z.string().optional(),
  registry_date: z.string().optional().nullable(),
  amount: z.number().optional(),
  description: z.string().optional(),
});

export type FormFields = z.infer<typeof formSchema>;
