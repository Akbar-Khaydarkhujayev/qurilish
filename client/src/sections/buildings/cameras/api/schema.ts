import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Required'),
  camera_ip: z.string().min(1, 'Required'),
  camera_login: z.string().min(1, 'Required'),
  camera_password: z.string().optional(),
});

export type FormFields = z.infer<typeof formSchema>;
