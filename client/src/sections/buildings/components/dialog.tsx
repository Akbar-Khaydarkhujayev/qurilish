import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import { Box, Dialog, Button, MenuItem, DialogTitle, DialogContent } from '@mui/material';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { formSchema } from '../api/schema';
import { useEditBuilding } from '../api/edit';
import { useCreateBuilding } from '../api/create';
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
  object_passport: '',
  contractor_id: undefined as unknown as number,
  technical_supervisor_id: null,
  construction_start_date: null,
  construction_end_date: null,
  construction_status_id: undefined as unknown as number,
  construction_cost: '',
  organization_id: undefined as unknown as number,
};

interface IProps {
  open: boolean;
  onClose: () => void;
  editedBuildingId: string | undefined;
}

export const BuildingDialog = ({ open, onClose, editedBuildingId }: IProps) => {
  const { t } = useTranslate();

  const { data: building } = useGetBuildingById(editedBuildingId);
  const { data: regionsData } = useGetRegions({ page: 1, limit: 100 });
  const { data: contractorsData } = useGetContractors({ page: 1, limit: 100 });
  const { data: organizationsData } = useGetOrganizations({ page: 1, limit: 100 });
  const { data: statusesData } = useGetConstructionStatuses({ page: 1, limit: 100 });
  const { data: projectOrgsData } = useGetProjectOrganizations({ page: 1, limit: 100 });

  const { mutate: edit } = useEditBuilding();
  const { mutate: create } = useCreateBuilding();

  const methods = useForm<FormFields>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  console.log(methods.watch('region_id'));
  const selectedRegionId = methods.watch('region_id');

  const { data: districtsData } = useGetDistricts({
    page: 1,
    limit: 100,
    region_id: selectedRegionId,
  });

  useEffect(() => {
    if (!open) return;

    if (editedBuildingId && building?.data) {
      methods.reset({
        id: building.data.id,
        card_number: building.data.card_number || '',
        object_name: building.data.object_name || '',
        address: building.data.address || '',
        region_id: building.data.region_id,
        district_id: building.data.district_id,
        construction_basis: building.data.construction_basis || '',
        project_organization_id: building.data.project_organization_id,
        object_passport: building.data.object_passport || '',
        contractor_id: building.data.contractor_id,
        technical_supervisor_id: building.data.technical_supervisor_id,
        construction_start_date: building.data.construction_start_date?.split('T')[0] || null,
        construction_end_date: building.data.construction_end_date?.split('T')[0] || null,
        construction_status_id: building.data.construction_status_id,
        construction_cost: building.data.construction_cost || '',
        organization_id: building.data.organization_id,
      });
    } else {
      methods.reset(defaultValues);
    }
  }, [building, methods, open, editedBuildingId]);

  // Reset district when region changes
  useEffect(() => {
    if (selectedRegionId && !editedBuildingId) {
      methods.setValue('district_id', undefined as unknown as number);
    }
  }, [selectedRegionId, methods, editedBuildingId]);

  const onSubmit = methods.handleSubmit(
    async (data) => {
      const mutate = editedBuildingId ? edit : create;

      mutate(data, {
        onSuccess: () => {
          toast.success(t(editedBuildingId ? 'Edited successfully' : 'Created successfully'));
          onClose();
        },
      });
    },
    (err) => console.log(err)
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle textAlign="center">{editedBuildingId ? t('edit') : t('add')}</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Box pt={1} display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
            <Field.Text size="small" name="card_number" label={t('Card Number')} />
            <Field.Text required size="small" name="object_name" label={t('Object Name')} />

            <Field.Text size="small" name="address" label={t('Address')} />
            <Field.Text size="small" name="construction_basis" label={t('Construction Basis')} />

            <Field.Select required size="small" name="region_id" label={t('Region')}>
              {regionsData?.data.map((region) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              required
              size="small"
              name="district_id"
              label={t('District')}
              disabled={!selectedRegionId}
            >
              {districtsData?.data.map((district) => (
                <MenuItem key={district.id} value={district.id}>
                  {district.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              required
              size="small"
              name="project_organization_id"
              label={t('Project Organization')}
            >
              {projectOrgsData?.data.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select required size="small" name="contractor_id" label={t('Contractor')}>
              {contractorsData?.data.map((contractor) => (
                <MenuItem key={contractor.id} value={contractor.id}>
                  {contractor.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select required size="small" name="organization_id" label={t('Organization')}>
              {organizationsData?.data.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Select
              required
              size="small"
              name="construction_status_id"
              label={t('Construction Status')}
            >
              {statusesData?.data.map((status) => (
                <MenuItem key={status.id} value={status.id}>
                  {status.name}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text size="small" name="object_passport" label={t('Object Passport')} />
            <Field.Text
              size="small"
              name="construction_cost"
              label={t('Construction Cost')}
              type="number"
            />

            <Field.DatePicker
              name="construction_start_date"
              label={t('Construction Start Date')}
              slotProps={{ textField: { size: 'small' } }}
            />

            <Field.DatePicker
              name="construction_end_date"
              label={t('Construction End Date')}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={1} mt={3} mb={1}>
            <Button
              variant="contained"
              color="error"
              onClick={onClose}
              startIcon={<Iconify icon="maktab:mingcute-close-fill" />}
            >
              {t('cancel')}
            </Button>

            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={methods.formState.isSubmitting}
              startIcon={<Iconify icon="maktab:mingcute-save-2-fill" />}
            >
              {t('save')}
            </LoadingButton>
          </Box>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
