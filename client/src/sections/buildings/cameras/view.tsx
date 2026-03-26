import { useState } from 'react';
import { useParams } from 'react-router';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';
import { CustomConfirmDialog } from 'src/components/custom-dialog/custom-confirm-dialog';

import { useGetCamerasByBuilding } from './api/get';
import { useDeleteCamera } from './api/delete';
import { CameraDialog } from './components/dialog';

import type { ICamera } from './api/get';

const headLabels = ['Camera Name', 'Camera IP', 'Camera Login', ''];

export default function CamerasView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();

  const openDialog = useBoolean();
  const [editedCamera, setEditedCamera] = useState<ICamera | undefined>(undefined);

  const { data } = useGetCamerasByBuilding(objectCardId);
  const { mutate: deleteCamera } = useDeleteCamera(objectCardId || '');

  const cameras = data?.data || [];

  const handleEdit = (camera: ICamera) => {
    setEditedCamera(camera);
    openDialog.onTrue();
  };

  const handleAdd = () => {
    setEditedCamera(undefined);
    openDialog.onTrue();
  };

  return (
    <>
      <CameraDialog
        open={openDialog.value}
        onClose={openDialog.onFalse}
        objectCardId={objectCardId || ''}
        editedCamera={editedCamera}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            onClick={handleAdd}
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            color="primary"
          >
            {t('add')}
          </Button>
        </Box>

        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Scrollbar sx={{ height: 'calc(100vh - 340px)' }}>
            <Table size="small" stickyHeader>
              <TableHeadCustom
                headLabel={headLabels.map((label) => ({
                  id: label,
                  label: t(label),
                  align: label === '' ? 'right' : 'left',
                }))}
              />

              <TableBody>
                {cameras.map((camera) => (
                  <TableRow key={camera.id} hover>
                    <TableCell>{camera.name || '-'}</TableCell>
                    <TableCell>{camera.camera_ip || '-'}</TableCell>
                    <TableCell>{camera.camera_login || '-'}</TableCell>
                    <TableCell align="right">
                      <Box display="flex" justifyContent="end">
                        <Tooltip title={t('Edit')}>
                          <IconButton onClick={() => handleEdit(camera)}>
                            <Iconify icon="solar:pen-bold" />
                          </IconButton>
                        </Tooltip>
                        <CustomConfirmDialog
                          onConfirm={() => deleteCamera(camera.id)}
                          title={t('Delete')}
                          subtitle={t('Are you sure you want to delete?')}
                          trigger={
                            <Tooltip title={t('Delete')}>
                              <IconButton color="error">
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          }
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}

                <TableNoData
                  notFound={cameras.length === 0}
                  sx={{ height: 'calc(100vh - 370px)' }}
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>
      </Box>
    </>
  );
}
