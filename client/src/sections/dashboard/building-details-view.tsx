import dayjs from 'dayjs';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber, fPercent } from 'src/utils/format-number';

import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useGetBuildingFullDetails } from './api/get-building-details';

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

export function BuildingDetailsView() {
  const { t } = useTranslate();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const buildingId = id ? parseInt(id, 10) : null;
  const { data: details, isLoading, error } = useGetBuildingFullDetails(buildingId);
  console.log(details);
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !details) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{t('Error loading building data')}</Alert>
        <Button
          startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          {t('back')}
        </Button>
      </Box>
    );
  }

  const { building } = details;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:arrow-left" />}
          onClick={() => navigate('/dashboard')}
        >
          {t('back')}
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {building.object_name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {building.card_number && (
              <Chip size="small" label={`#${building.card_number}`} variant="outlined" />
            )}
            <Chip
              size="small"
              label={t(
                building.building_type === 'new_building' ? 'New Building' : 'Major Renovation'
              )}
              color={building.building_type === 'new_building' ? 'primary' : 'warning'}
            />
            {building.status_name && (
              <Chip size="small" label={building.status_name} color="info" variant="outlined" />
            )}
          </Box>
        </Box>
      </Box>

      {/* Construction Cost Highlight */}
      <Box
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: theme.palette.primary.lighter,
          border: `1px solid ${theme.palette.primary.light}`,
        }}
      >
        <Typography variant="subtitle1" color="primary.dark" gutterBottom>
          {t('Construction Cost')}
        </Typography>
        <Typography variant="h3" color="primary.main">
          {building.construction_cost ? fNumber(building.construction_cost) : '-'}
        </Typography>
      </Box>

      {/* Building Details */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={t('Location')}
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<Iconify icon="mdi:map-marker" width={24} color="primary.main" />}
            />
            <CardContent>
              <DetailRow label={t('Region')} value={building.region_name} />
              <DetailRow label={t('District')} value={building.district_name} />
              <DetailRow label={t('Address')} value={building.address} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={t('Organization')}
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<Iconify icon="mdi:domain" width={24} color="info.main" />}
            />
            <CardContent>
              <DetailRow label={t('Organization')} value={building.organization_name} />
              <DetailRow
                label={t('Project Organization')}
                value={building.project_organization_name}
              />
              <DetailRow label={t('Contractor')} value={building.contractor_name} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={t('Construction')}
              titleTypographyProps={{ variant: 'subtitle1' }}
              avatar={<Iconify icon="mdi:construction" width={24} color="warning.main" />}
            />
            <CardContent>
              <DetailRow label={t('Construction Status')} value={building.status_name} />
              <DetailRow label={t('Construction Basis')} value={building.construction_basis} />
              <DetailRow
                label={t('Construction Start Date')}
                value={
                  building.construction_start_date
                    ? dayjs(building.construction_start_date).format('DD.MM.YYYY')
                    : null
                }
              />
              <DetailRow
                label={t('Construction End Date')}
                value={
                  building.construction_end_date
                    ? dayjs(building.construction_end_date).format('DD.MM.YYYY')
                    : null
                }
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sub Objects */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t('Sub Objects')}
              <Chip size="small" label={details.subObjects?.length || 0} />
            </Box>
          }
          avatar={<Iconify icon="mdi:folder-multiple" width={24} color="primary.main" />}
        />
        <CardContent>
          {details.subObjects && details.subObjects.length > 0 ? (
            <Scrollbar sx={{ maxHeight: 300 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Name')}</TableCell>
                      <TableCell>{t('Deadline')}</TableCell>
                      <TableCell align="right">{t('Cost')}</TableCell>
                      <TableCell>{t('Completion %')}</TableCell>
                      <TableCell align="center">{t('Construction Items')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.subObjects.map((subObj) => (
                      <TableRow key={subObj.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {subObj.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {subObj.deadline ? dayjs(subObj.deadline).format('DD.MM.YYYY') : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {subObj.cost ? fNumber(subObj.cost) : '-'}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={subObj.completion_percentage || 0}
                              sx={{ flexGrow: 1, height: 6, borderRadius: 1 }}
                              color={
                                subObj.completion_percentage >= 100
                                  ? 'success'
                                  : subObj.completion_percentage >= 50
                                    ? 'primary'
                                    : 'warning'
                              }
                            />
                            <Typography variant="caption" sx={{ minWidth: 40 }}>
                              {fPercent(subObj.completion_percentage || 0)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Chip size="small" label={subObj.items_count || 0} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={2}>
              {t('No data available')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Contracts */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t('Contracts')}
              <Chip size="small" label={details.contracts?.length || 0} />
            </Box>
          }
          avatar={<Iconify icon="mdi:file-document" width={24} color="info.main" />}
        />
        <CardContent>
          {details.contracts && details.contracts.length > 0 ? (
            <Scrollbar sx={{ maxHeight: 300 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('Contract Number')}</TableCell>
                      <TableCell>{t('Contract Date')}</TableCell>
                      <TableCell align="right">{t('Contract Amount')}</TableCell>
                      <TableCell>{t('Stage')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.contracts.map((contract) => (
                      <TableRow key={contract.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {contract.contract_number || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {contract.contract_date
                            ? dayjs(contract.contract_date).format('DD.MM.YYYY')
                            : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {contract.contract_amount ? fNumber(contract.contract_amount) : '-'}
                        </TableCell>
                        <TableCell>{contract.stage || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Scrollbar>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={2}>
              {t('No data available')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Financial Summary Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Bank Expenses */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t('Bank Expenses')}
                  <Chip size="small" label={details.expenses?.count || 0} />
                </Box>
              }
              avatar={<Iconify icon="mdi:bank-transfer-out" width={24} color="error.main" />}
            />
            <CardContent>
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  bgcolor: theme.palette.error.lighter,
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" color="error.dark">
                  {t('Total Expenses')}
                </Typography>
                <Typography variant="h5" color="error.main">
                  {fNumber(details.expenses?.totalAmount || 0)}
                </Typography>
              </Box>
              {details.expenses?.expenses && details.expenses.expenses.length > 0 ? (
                <Scrollbar sx={{ maxHeight: 200 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Registry Number')}</TableCell>
                          <TableCell>{t('Registry Date')}</TableCell>
                          <TableCell align="right">{t('Amount')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {details.expenses.expenses.slice(0, 5).map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>{expense.registry_number || '-'}</TableCell>
                            <TableCell>
                              {expense.registry_date
                                ? dayjs(expense.registry_date).format('DD.MM.YYYY')
                                : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {expense.amount ? fNumber(expense.amount) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  {t('No data available')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Invoices */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t('Invoices')}
                  <Chip size="small" label={details.invoices?.count || 0} />
                </Box>
              }
              avatar={<Iconify icon="mdi:receipt" width={24} color="success.main" />}
            />
            <CardContent>
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 1,
                  bgcolor: theme.palette.success.lighter,
                  textAlign: 'center',
                }}
              >
                <Typography variant="subtitle2" color="success.dark">
                  {t('Total Invoices')}
                </Typography>
                <Typography variant="h5" color="success.main">
                  {fNumber(details.invoices?.totalAmount || 0)}
                </Typography>
              </Box>
              {details.invoices?.invoices && details.invoices.invoices.length > 0 ? (
                <Scrollbar sx={{ maxHeight: 200 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('Document Number')}</TableCell>
                          <TableCell>{t('Document Date')}</TableCell>
                          <TableCell align="right">{t('Amount')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {details.invoices.invoices.slice(0, 5).map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>{invoice.document_number || '-'}</TableCell>
                            <TableCell>
                              {invoice.document_date
                                ? dayjs(invoice.document_date).format('DD.MM.YYYY')
                                : '-'}
                            </TableCell>
                            <TableCell align="right">
                              {invoice.amount ? fNumber(invoice.amount) : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Scrollbar>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  {t('No data available')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Files */}
      <Card>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t('Files')}
              <Chip size="small" label={details.files?.count || 0} />
            </Box>
          }
          avatar={<Iconify icon="mdi:file-multiple" width={24} color="warning.main" />}
        />
        <CardContent>
          {details.files?.files && details.files.files.length > 0 ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {details.files.files.map((file) => {
                const ext = file.file_name?.split('.').pop()?.toLowerCase() || '';
                const isPdf = ext === 'pdf';
                const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
                const isDoc = ['doc', 'docx'].includes(ext);
                const isExcel = ['xls', 'xlsx'].includes(ext);

                let fileIcon = 'mdi:file-outline';
                let iconColor = 'text.secondary';

                if (isPdf) {
                  fileIcon = 'mdi:file-pdf-box';
                  iconColor = 'error.main';
                } else if (isImage) {
                  fileIcon = 'mdi:file-image';
                  iconColor = 'success.main';
                } else if (isDoc) {
                  fileIcon = 'mdi:file-word';
                  iconColor = 'info.main';
                } else if (isExcel) {
                  fileIcon = 'mdi:file-excel';
                  iconColor = 'success.dark';
                }

                return (
                  <Box
                    key={file.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: 'background.neutral',
                      minWidth: 100,
                      maxWidth: 120,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        bgcolor: theme.palette.action.hover,
                        boxShadow: theme.shadows[2],
                      },
                    }}
                    onClick={() => {
                      if (file.path) {
                        window.open(`${import.meta.env.VITE_SERVER_URL}${file.path}`, '_blank');
                      }
                    }}
                    title={file.description || file.file_name}
                  >
                    <Iconify icon={fileIcon} width={40} sx={{ color: iconColor, mb: 1 }} />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        textAlign: 'center',
                        wordBreak: 'break-all',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {file.description || ext.toUpperCase()}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
                      {dayjs(file.created_at).format('DD.MM.YY')}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={2}>
              {t('No data available')}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
