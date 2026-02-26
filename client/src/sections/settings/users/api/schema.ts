import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Required'),
  username: z.string().min(1, 'Required'),
  password: z.string().min(1, 'Required'),
  phone_number: z.string().optional(),
  organization_id: z.number({ required_error: 'Required' }),
  role: z.enum(['super_admin', 'region_admin', 'user']),
});

export type FormFields = z.infer<typeof formSchema>;
