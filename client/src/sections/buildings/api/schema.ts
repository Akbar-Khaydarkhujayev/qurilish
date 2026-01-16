import { z } from 'zod';

export const BUILDING_TYPE_OPTIONS = [
  { value: 'new_building', label: 'New Building' },
  { value: 'major_renovation', label: 'Major Renovation' },
] as const;

export type BuildingType = (typeof BUILDING_TYPE_OPTIONS)[number]['value'];

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
  construction_cost: z.coerce.string().optional(),
  organization_id: z.number({ required_error: 'Required' }),
  building_type: z.enum(['new_building', 'major_renovation']).default('new_building'),
});

export type FormFields = z.infer<typeof formSchema>;
