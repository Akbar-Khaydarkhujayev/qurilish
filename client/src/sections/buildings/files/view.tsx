import { useParams } from 'react-router';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';

import { useBoolean } from 'src/hooks/use-boolean';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';

import { useDeleteFile } from './api/delete';
import { FileRowItem } from './components/row-item';
import { useGetFilesByObjectCard } from './api/get';
import { FileUploadDialog } from './components/upload-dialog';

const headLabels = ['File Name', 'Description', 'Created at', ''];

export default function FilesView() {
  const { t } = useTranslate();
  const { id: objectCardId } = useParams();

  const openUploadDialog = useBoolean();

  const { mutate: deleteFile } = useDeleteFile();
  const { data } = useGetFilesByObjectCard(objectCardId || '');

  return (
    <>
      <FileUploadDialog
        onClose={openUploadDialog.onFalse}
        open={openUploadDialog.value}
        objectCardId={objectCardId || ''}
      />

      <Box width="100%">
        <Box display="flex" justifyContent="flex-end" alignItems="start" mb={2}>
          <Button
            variant="contained"
            onClick={openUploadDialog.onTrue}
            startIcon={<Iconify icon="solar:upload-bold" />}
            color="primary"
          >
            {t('Upload File')}
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
                {data?.files?.map((row) => (
                  <FileRowItem key={row.id} row={row} remove={() => deleteFile(row.id)} />
                ))}

                <TableNoData
                  notFound={!data?.files?.length}
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
