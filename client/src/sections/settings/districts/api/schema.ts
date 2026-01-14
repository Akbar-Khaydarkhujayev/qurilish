import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Required'),
  region_id: z.number({ required_error: 'Required' }),
});

export type FormFields = z.infer<typeof formSchema>;
