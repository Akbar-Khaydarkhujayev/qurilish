import { toast } from 'sonner';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Card, Grid, MenuItem, CardHeader, CardContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

import { formSchema } from '../api/schema';
import { useEditBuilding } from '../api/edit';
import { useGetBuildingById } from '../api/get-by-id';
import { useGetRegions } from '../../settings/regions/api/get';
import { useGetDistricts } from '../../settings/districts/api/get';
import { useGetContractors } from '../../settings/contractors/api/get';
import { useGetOrganizations } from '../../settings/organizations/api/get';
import { useGetConstructionStatuses } from '../../settings/construction-statuses/api/get';
import { useGetProjectOrganizations } from '../../settings/project-organizations/api/get';

import type { FormFields } from '../api/schema';

const defaultValues: FormFields = {
  id: undefined,
  card_number: '',
  object_name: '',
  address: '',
  region_id: undefined as unknown as number,
  district_id: undefined as unknown as number,
  construction_basis: '',
  project_organization_id: undefined as unknown as number,
  // object_passport: '',
  contractor_id: undefined as unknown as number,
  technical_supervisor_id: null,
  construction_start_date: null,
  construction_end_date: null,
  construction_status_id: undefined as unknown as number,
  construction_cost: '',
  organization_id: undefined as unknown as number,
  building_type: 'new_building',
};

export default function DetailsView() {
  const { t } = useTranslate();
  const { id } = useParams();
  const { user } = useAuthContext();

  const { data: building } = useGetBuildingById(id);
  const { data: regionsData } = useGetRegions({ page: 1, limit: 100 });
  const { data: contractorsData } = useGetContractors({ page: 1, limit: 100 });
  const { data: organizationsData } = useGetOrganizations({ page: 1, limit: 100 });
  const { data: statusesData } = useGetConstructionStatuses({ page: 1, limit: 100 });
  const { data: projectOrgsData } = useGetProjectOrganizations({ page: 1, limit: 100 });

  const { mutate: edit, isPending } = useEditBuilding();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const selectedRegionId = methods.watch('region_id');

  const { data: districtsData } = useGetDistricts({
    page: 1,
    limit: 100,
    region_id: selectedRegionId,
  });

  useEffect(() => {
    methods.reset({
      id: building?.data?.id,
      card_number: building?.data?.card_number || '',
      object_name: building?.data?.object_name || '',
      address: building?.data?.address || '',
      region_id: building?.data?.region_id,
      district_id: building?.data?.district_id,
      construction_basis: building?.data?.construction_basis || '',
      project_organization_id: building?.data?.project_organization_id,
      // object_passport: building?.data?.object_passport || '',
      contractor_id: building?.data?.contractor_id,
      technical_supervisor_id: building?.data?.technical_supervisor_id,
      construction_start_date: building?.data?.construction_start_date?.split('T')[0] || null,
      construction_end_date: building?.data?.construction_end_date?.split('T')[0] || null,
      construction_status_id: building?.data?.construction_status_id,
      construction_cost: building?.data?.construction_cost || '',
      organization_id: building?.data?.organization_id || user?.organizationId,
      building_type: building?.data?.building_type || 'new_building',
    });
  }, [building, methods, user]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      edit(data, {
        onSuccess: () => {
          toast.success(t('Edited successfully'));
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Card>
      <CardHeader title={t('Building Information')} />
      <CardContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Field.Text size="small" name="card_number" label={t('Object ID')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field.Text
                required
                size="small"
                name="object_name"
                label={t('Object Name')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Text size="small" name="address" label={t('Address')} fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <Field.Text
                size="small"
                name="construction_basis"
                label={t('Construction Basis')}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select required size="small" name="region_id" label={t('Region')} fullWidth>
                {regionsData?.data.map((region) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                required
                size="small"
                name="district_id"
                label={t('District')}
                fullWidth
                disabled={!selectedRegionId}
              >
                {districtsData?.data.map((district) => (
                  <MenuItem key={district.id} value={district.id}>
                    {district.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                required
                size="small"
                name="project_organization_id"
                label={t('Project Organization')}
                fullWidth
              >
                {projectOrgsData?.data.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                required
                size="small"
                name="contractor_id"
                label={t('Contractor')}
                fullWidth
              >
                {contractorsData?.data.map((contractor) => (
                  <MenuItem key={contractor.id} value={contractor.id}>
                    {contractor.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                required
                disabled
                size="small"
                name="organization_id"
                label={t('Organization')}
                fullWidth
              >
                {organizationsData?.data.map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.Select
                required
                size="small"
                name="construction_status_id"
                label={t('Construction Status')}
                fullWidth
              >
                {statusesData?.data.map((status) => (
                  <MenuItem key={status.id} value={status.id}>
                    {status.name}
                  </MenuItem>
                ))}
              </Field.Select>
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <Field.Text
                size="small"
                name="object_passport"
                label={t('Object Passport')}
                fullWidth
              />
            </Grid> */}
            <Grid item xs={12} md={6}>
              <Field.Text
                size="small"
                name="construction_cost"
                label={t('Construction Cost')}
                type="number"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.DatePicker
                name="construction_start_date"
                label={t('Construction Start Date')}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Field.DatePicker
                name="construction_end_date"
                label={t('Construction End Date')}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="flex-end" mt={3}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isPending}
              startIcon={<Iconify icon="maktab:mingcute-save-2-fill" />}
            >
              {t('save')}
            </LoadingButton>
          </Box>
        </Form>
      </CardContent>
    </Card>
  );
}
