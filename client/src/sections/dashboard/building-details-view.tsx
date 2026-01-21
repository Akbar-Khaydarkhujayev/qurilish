import dayjs from 'dayjs';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Step from '@mui/material/Step';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Collapse from '@mui/material/Collapse';
import TableRow from '@mui/material/TableRow';
import StepLabel from '@mui/material/StepLabel';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';

import { fNumber, fPercent, fShortenNumber } from 'src/utils/format-number';

import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';

import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';
import { Scrollbar } from 'src/components/scrollbar';
import { Chart, useChart } from 'src/components/chart';

import { useGetBuildingFullDetails } from './api/get-building-details';
import { useGetConstructionStatuses } from '../settings/construction-statuses/api/get';

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={500}
        sx={{
          textAlign: 'right',
          maxWidth: '60%',
          color: label === 'Tugash sanasi' ? 'error.main' : 'text.primary',
        }}
      >
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
  const { data: constructionStatuses } = useGetConstructionStatuses({ page: 1, limit: 999 });

  // Expandable state for sub-objects
  const [expandedSubObjects, setExpandedSubObjects] = useState<number[]>([]);
  // Expandable state for contracts
  const [expandedContracts, setExpandedContracts] = useState<number[]>([]);

  const toggleSubObject = (subObjectId: number) => {
    setExpandedSubObjects((prev) =>
      prev.includes(subObjectId)
        ? prev.filter((item) => item !== subObjectId)
        : [...prev, subObjectId]
    );
  };

  const toggleContract = (contractId: number) => {
    setExpandedContracts((prev) =>
      prev.includes(contractId) ? prev.filter((item) => item !== contractId) : [...prev, contractId]
    );
  };

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

  // Sort construction statuses by sequence
  const sortedStatuses = constructionStatuses?.data
    ? [...constructionStatuses.data].sort((a, b) => a.sequence - b.sequence)
    : [];

  // Determine current stage based on construction_status_id
  const getCurrentStage = () => {
    if (!building.construction_status_id || sortedStatuses.length === 0) return 0;
    const index = sortedStatuses.findIndex((s) => s.id === building.construction_status_id);
    return index >= 0 ? index : 0;
  };

  // Calculate overall completion percentage from sub-objects
  const overallCompletionPct =
    details.subObjects && details.subObjects.length > 0
      ? details.subObjects.reduce((sum, obj) => sum + (obj.completion_percentage || 0), 0) /
        details.subObjects.length
      : 0;

  // Get expenses, invoices, estimates for a specific contract
  const getContractExpenses = (contractId: number) =>
    details.expenses?.expenses?.filter((e) => e.object_contract_id === contractId) || [];

  const getContractInvoices = (contractId: number) =>
    details.invoices?.invoices?.filter((i) => i.object_contract_id === contractId) || [];

  const getContractEstimates = (contractId: number) =>
    details.estimates?.filter((e) => e.object_contract_id === contractId) || [];

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
          </Box>
        </Box>
      </Box>

      {/* Top Row: Stage Stepper + Progress + Construction Cost */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Stage Stepper Card */}
        <Card sx={{ flex: 2 }}>
          <CardHeader
            title={t('Loyiha qaysi bosqichda')}
            titleTypographyProps={{ variant: 'subtitle1' }}
            avatar={<Iconify icon="mdi:flag-checkered" width={24} color="primary.main" />}
          />
          <CardContent>
            <Stepper activeStep={getCurrentStage()} alternativeLabel>
              {sortedStatuses.map((status) => (
                <Step key={status.id}>
                  <StepLabel>{status.name}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Bajarilgan ishlar Progress Card */}
        <CompletionWidget
          title={t('Bajarilgan ishlar')}
          percent={overallCompletionPct}
          icon="mdi:clipboard-check-outline"
        />

        {/* Construction Cost Card */}
        <Card
          sx={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            display: 'flex',
          }}
        >
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('Construction Cost')}
            </Typography>
            <Typography variant="h3" color="primary.main">
              {building.construction_cost ? fNumber(building.construction_cost) : '-'}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Info Cards Row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {/* Obyekt haqida Card */}
        <Card sx={{ flex: 1 }}>
          <CardHeader
            title={t('Obyekt haqida')}
            titleTypographyProps={{ variant: 'subtitle1' }}
            avatar={<Iconify icon="mdi:information" width={24} color="info.main" />}
          />
          <CardContent>
            <DetailRow label={t('Obyekt nomi')} value={building.object_name} />
            <DetailRow
              label={t('Joylashuv')}
              value={[building.region_name, building.district_name].filter(Boolean).join(', ')}
            />
            <DetailRow label={t('Manzil')} value={building.address} />
            <DetailRow label={t('Qurilish uchun asos')} value={building.construction_basis} />
            <DetailRow
              label={t('Boshlanish sanasi')}
              value={
                building.construction_start_date
                  ? dayjs(building.construction_start_date).format('DD.MM.YYYY')
                  : null
              }
            />
            <DetailRow
              label={t('Tugash sanasi')}
              value={
                building.construction_end_date
                  ? dayjs(building.construction_end_date).format('DD.MM.YYYY')
                  : null
              }
            />
            <DetailRow
              label={t('Ish qiymati')}
              value={building.construction_cost ? fNumber(building.construction_cost) : null}
            />
            <DetailRow label={t('Texnik nazoratchi')} value={building.technical_supervisor_name} />
          </CardContent>
        </Card>

        {/* Pudratchi haqida Card */}
        <Card sx={{ flex: 1 }}>
          <CardHeader
            title={t('Pudratchi haqida')}
            titleTypographyProps={{ variant: 'subtitle1' }}
            avatar={<Iconify icon="mdi:account-hard-hat" width={24} color="warning.main" />}
          />
          <CardContent>
            <DetailRow label={t('Tashkilot nomi')} value={building.contractor_name} />
            <DetailRow label={t('STIR')} value={building.contractor_tax_id} />
            <DetailRow label={t('Manzil')} value={building.contractor_address} />
            <DetailRow label={t('Telefon')} value={building.contractor_phone} />
          </CardContent>
        </Card>

        {/* Loyiha tashkiloti haqida Card */}
        <Card sx={{ flex: 1 }}>
          <CardHeader
            title={t('Loyiha tashkiloti haqida')}
            titleTypographyProps={{ variant: 'subtitle1' }}
            avatar={<Iconify icon="mdi:office-building" width={24} color="primary.main" />}
          />
          <CardContent>
            <DetailRow label={t('Tashkilot nomi')} value={building.project_organization_name} />
            <DetailRow label={t('STIR')} value={building.project_org_tax_id} />
            <DetailRow label={t('Manzil')} value={building.project_org_address} />
            <DetailRow label={t('Telefon')} value={building.project_org_phone} />
          </CardContent>
        </Card>
      </Box>

      {/* Sub Objects with expandable items */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          sx={{ mb: 2 }}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t('Sub Objects')}
              <Chip size="small" label={details.subObjects?.length || 0} />
            </Box>
          }
          avatar={<Iconify icon="mdi:folder-multiple" width={24} color="primary.main" />}
        />
        <CardContent sx={{ p: 0 }}>
          {details.subObjects && details.subObjects.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />
                    <TableCell>{t('Name')}</TableCell>
                    <TableCell>{t('Deadline')}</TableCell>
                    <TableCell align="right">{t('Cost')}</TableCell>
                    <TableCell>{t('Completion %')}</TableCell>
                    <TableCell align="center">{t('Items')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.subObjects.map((subObj) => (
                    <>
                      <TableRow
                        key={subObj.id}
                        hover
                        sx={{ cursor: subObj.items_count > 0 ? 'pointer' : 'default' }}
                        onClick={() => subObj.items_count > 0 && toggleSubObject(subObj.id)}
                      >
                        <TableCell>
                          {subObj.items_count > 0 && (
                            <IconButton size="small">
                              <Iconify
                                icon={
                                  expandedSubObjects.includes(subObj.id)
                                    ? 'mdi:chevron-down'
                                    : 'mdi:chevron-right'
                                }
                                width={20}
                              />
                            </IconButton>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {subObj.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ color: subObj.deadline ? 'error.main' : 'text.secondary' }}
                          >
                            {subObj.deadline ? dayjs(subObj.deadline).format('DD.MM.YYYY') : '-'}
                          </Typography>
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
                      {/* Expanded items row */}
                      <TableRow>
                        <TableCell colSpan={6} sx={{ py: 0, border: 0 }}>
                          <Collapse
                            in={expandedSubObjects.includes(subObj.id)}
                            timeout="auto"
                            unmountOnExit
                          >
                            <SubObjectItems subObjectId={subObj.id} />
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={3}>
              {t('No data available')}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Contracts with expandable expenses/invoices/estimates */}
      <Card sx={{ mb: 3 }}>
        <CardHeader
          sx={{ mb: 2 }}
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {t('Contracts')}
              <Chip size="small" label={details.contracts?.length || 0} />
            </Box>
          }
          avatar={<Iconify icon="mdi:file-document" width={24} color="info.main" />}
        />
        <CardContent sx={{ p: 0 }}>
          {details.contracts && details.contracts.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={50} />
                    <TableCell>{t('Contract Number')}</TableCell>
                    <TableCell>{t('Contract Date')}</TableCell>
                    <TableCell align="right">{t('Contract Amount')}</TableCell>
                    <TableCell>{t('Stage')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {details.contracts.map((contract) => {
                    const expenses = getContractExpenses(contract.id);
                    const invoices = getContractInvoices(contract.id);
                    const estimates = getContractEstimates(contract.id);
                    const hasRelatedData =
                      expenses.length > 0 || invoices.length > 0 || estimates.length > 0;

                    return (
                      <>
                        <TableRow
                          key={contract.id}
                          hover
                          sx={{ cursor: hasRelatedData ? 'pointer' : 'default' }}
                          onClick={() => hasRelatedData && toggleContract(contract.id)}
                        >
                          <TableCell>
                            {hasRelatedData && (
                              <IconButton size="small">
                                <Iconify
                                  icon={
                                    expandedContracts.includes(contract.id)
                                      ? 'mdi:chevron-down'
                                      : 'mdi:chevron-right'
                                  }
                                  width={20}
                                />
                              </IconButton>
                            )}
                          </TableCell>
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
                        {/* Expanded contract details row */}
                        <TableRow>
                          <TableCell colSpan={5} sx={{ py: 0, border: 0 }}>
                            <Collapse
                              in={expandedContracts.includes(contract.id)}
                              timeout="auto"
                              unmountOnExit
                            >
                              <ContractDetails
                                expenses={expenses}
                                invoices={invoices}
                                estimates={estimates}
                              />
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={3}>
              {t('No data available')}
            </Typography>
          )}
        </CardContent>
      </Card>

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

// Sub-component for sub-object items
function SubObjectItems({ subObjectId }: { subObjectId: number }) {
  const { t } = useTranslate();
  const theme = useTheme();

  // For now, we'll show a placeholder. In production, you'd fetch items here
  // using useGetSubObjectItems(subObjectId)
  return (
    <Box sx={{ py: 2, px: 4, bgcolor: theme.palette.background.neutral }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {t('Construction Items')}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('Items will be loaded here for sub-object')} #{subObjectId}
      </Typography>
    </Box>
  );
}

// Sub-component for contract details (expenses, invoices, estimates)
function ContractDetails({
  expenses,
  invoices,
  estimates,
}: {
  expenses: any[];
  invoices: any[];
  estimates: any[];
}) {
  const { t } = useTranslate();
  const theme = useTheme();

  return (
    <Box sx={{ py: 2, px: 2, bgcolor: theme.palette.background.neutral }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Expenses */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="error.main" sx={{ mb: 1 }}>
            <Iconify
              icon="mdi:bank-transfer-out"
              width={18}
              sx={{ mr: 0.5, verticalAlign: 'middle' }}
            />
            {t('Bank Expenses')} ({expenses.length})
          </Typography>
          {expenses.length > 0 ? (
            <Scrollbar sx={{ maxHeight: 150 }}>
              {expenses.map((expense) => (
                <Box
                  key={expense.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.5,
                    borderBottom: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption">
                    {expense.registry_number || '-'} (
                    {expense.registry_date ? dayjs(expense.registry_date).format('DD.MM.YY') : '-'})
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="error.main">
                    {expense.amount ? fShortenNumber(expense.amount) : '-'}
                  </Typography>
                </Box>
              ))}
            </Scrollbar>
          ) : (
            <Typography variant="caption" color="text.disabled">
              {t('No data')}
            </Typography>
          )}
        </Box>

        {/* Invoices */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="success.main" sx={{ mb: 1 }}>
            <Iconify icon="mdi:receipt" width={18} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            {t('Invoices')} ({invoices.length})
          </Typography>
          {invoices.length > 0 ? (
            <Scrollbar sx={{ maxHeight: 150 }}>
              {invoices.map((invoice) => (
                <Box
                  key={invoice.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.5,
                    borderBottom: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption">
                    {invoice.document_number || '-'} (
                    {invoice.document_date ? dayjs(invoice.document_date).format('DD.MM.YY') : '-'})
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="success.main">
                    {invoice.amount ? fShortenNumber(invoice.amount) : '-'}
                  </Typography>
                </Box>
              ))}
            </Scrollbar>
          ) : (
            <Typography variant="caption" color="text.disabled">
              {t('No data')}
            </Typography>
          )}
        </Box>

        {/* Estimates */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
            <Iconify icon="mdi:calculator" width={18} sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            {t('Estimates')} ({estimates.length})
          </Typography>
          {estimates.length > 0 ? (
            <Scrollbar sx={{ maxHeight: 150 }}>
              {estimates.map((estimate) => (
                <Box
                  key={estimate.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.5,
                    borderBottom: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption">{estimate.year}</Typography>
                  <Typography variant="caption" fontWeight={600} color="info.main">
                    {estimate.year_total ? fShortenNumber(estimate.year_total) : '-'}
                  </Typography>
                </Box>
              ))}
            </Scrollbar>
          ) : (
            <Typography variant="caption" color="text.disabled">
              {t('No data')}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

// Completion Widget with radial chart
function CompletionWidget({
  title,
  percent,
  icon,
}: {
  title: string;
  percent: number;
  icon: string;
}) {
  const theme = useTheme();

  const getChartColors = (pct: number): [string, string] => {
    if (pct >= 80) return [theme.palette.success.light, theme.palette.success.main];
    if (pct >= 50) return [theme.palette.primary.light, theme.palette.primary.main];
    if (pct >= 25) return [theme.palette.warning.light, theme.palette.warning.main];
    return [theme.palette.error.light, theme.palette.error.main];
  };

  const getBgColor = (pct: number) => {
    if (pct >= 80) return 'success.dark';
    if (pct >= 50) return 'primary.dark';
    if (pct >= 25) return 'warning.dark';
    return 'error.dark';
  };

  const chartColors = getChartColors(percent);

  const chartOptions = useChart({
    chart: { sparkline: { enabled: true } },
    stroke: { width: 0 },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: chartColors[0], opacity: 1 },
          { offset: 100, color: chartColors[1], opacity: 1 },
        ],
      },
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 6,
            color: theme.palette.common.white,
            fontSize: theme.typography.subtitle2.fontSize as string,
          },
        },
      },
    },
  });

  return (
    <Box
      sx={{
        p: 3,
        gap: 3,
        flex: 1,
        borderRadius: 2,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
        alignItems: 'center',
        color: 'common.white',
        bgcolor: getBgColor(percent),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Chart
          type="radialBar"
          series={[percent]}
          options={chartOptions}
          width={80}
          height={80}
          sx={{ zIndex: 1 }}
        />

        <SvgColor
          src={`${CONFIG.site.basePath}/assets/background/shape-circle-3.svg`}
          sx={{
            width: 200,
            height: 200,
            opacity: 0.08,
            position: 'absolute',
            color: 'primary.light',
          }}
        />
      </Box>

      <div>
        <Box sx={{ typography: 'h4' }}>{fPercent(percent)}</Box>
        <Box sx={{ typography: 'subtitle2', opacity: 0.64 }}>{title}</Box>
      </div>

      <Iconify
        icon={icon}
        sx={{
          width: 120,
          right: -40,
          height: 120,
          opacity: 0.08,
          position: 'absolute',
        }}
      />
    </Box>
  );
}
