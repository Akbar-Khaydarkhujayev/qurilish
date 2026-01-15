import { z } from 'zod';

export const formSchema = z.object({
  id: z.number().optional(),
  card_number: z.string().optional(),
  object_name: z.string().min(1, 'Required'),
  address: z.string().optional(),
  region_id: z.number({ required_error: 'Required' }),
  district_id: z.number({ required_error: 'Required' }),
  construction_basis: z.string().optional(),
  project_organization_id: z.number({ required_error: 'Required' }),
  object_passport: z.string().optional(),
  contractor_id: z.number({ required_error: 'Required' }),
  technical_supervisor_id: z.number().optional().nullable(),
  construction_start_date: z.string().optional().nullable(),
  construction_end_date: z.string().optional().nullable(),
  construction_status_id: z.number({ required_error: 'Required' }),
  construction_cost: z.string().optional(),
  organization_id: z.number({ required_error: 'Required' }),
});

export type FormFields = z.infer<typeof formSchema>;
