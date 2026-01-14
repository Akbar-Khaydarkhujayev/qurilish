import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Required'),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  phone_number: z.string().optional(),
  mfo: z.string().optional(),
});

export type FormFields = z.infer<typeof formSchema>;
