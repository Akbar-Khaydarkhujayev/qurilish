import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  object_card_id: z.number(),
  object_contract_id: z.number({ required_error: 'Required' }),
  year: z.number({ required_error: 'Required' }),
  month_1: z.number().optional(),
  month_2: z.number().optional(),
  month_3: z.number().optional(),
  month_4: z.number().optional(),
  month_5: z.number().optional(),
  month_6: z.number().optional(),
  month_7: z.number().optional(),
  month_8: z.number().optional(),
  month_9: z.number().optional(),
  month_10: z.number().optional(),
  month_11: z.number().optional(),
  month_12: z.number().optional(),
});

export type FormFields = z.infer<typeof formSchema>;
