import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Required'),
  tax_id: z.string().optional(),
  region_id: z.coerce.number({ required_error: 'Required' }),
});

export type FormFields = z.infer<typeof formSchema>;
