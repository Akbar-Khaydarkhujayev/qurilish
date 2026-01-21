import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Required'),
  sequence: z.number().min(1, 'Required'),
});

export type FormFields = z.infer<typeof formSchema>;
