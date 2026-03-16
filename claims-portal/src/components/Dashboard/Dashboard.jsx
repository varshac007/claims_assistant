import { useState, useEffect, useMemo } from 'react';
import {
  Box, Stack, Typography, TextField, Button, Tabs, Tab,
  Chip, Paper, CircularProgress, Select, MenuItem, FormControl,
  InputLabel, IconButton, Tooltip, Divider, InputAdornment,
  Avatar, Badge, LinearProgress
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import PaidIcon from '@mui/icons-material/Paid';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TargetIcon from '@mui/icons-material/GpsFixed';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useClaims } from '../../contexts/ClaimsContext';
import { useWorkflow } from '../../contexts/WorkflowContext';
import { useApp } from '../../contexts/AppContext';
import { RoutingType, ClaimStatus } from '../../types/claim.types';
import serviceNowService from '../../services/api/serviceNowService';
import { getProductLineConfig, PRODUCT_LINES } from '../../config/productLineConfig';
import { getPCDemoData } from '../../data/demoDataPC';
import STPBadge from '../shared/STPBadge';
import SLAIndicator from '../shared/SLAIndicator';
import './Dashboard.css';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  [ClaimStatus.NEW]:                  { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'New' },
  [ClaimStatus.SUBMITTED]:            { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Submitted' },
  [ClaimStatus.UNDER_REVIEW]:         { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', label: 'Under Review' },
  [ClaimStatus.IN_REVIEW]:            { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A', label: 'In Review' },
  [ClaimStatus.APPROVED]:             { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Approved' },
  [ClaimStatus.DENIED]:               { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', label: 'Denied' },
  [ClaimStatus.CLOSED]:               { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB', label: 'Closed' },
  [ClaimStatus.PENDING_REQUIREMENTS]: { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA', label: 'Pending Req.' },
  [ClaimStatus.REQUIREMENTS_COMPLETE]:{ bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Req. Complete' },
  [ClaimStatus.IN_APPROVAL]:          { bg: '#FAF5FF', text: '#7C3AED', border: '#DDD6FE', label: 'In Approval' },
  [ClaimStatus.PAYMENT_SCHEDULED]:    { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0', label: 'Pmt. Scheduled' },
  [ClaimStatus.PAYMENT_COMPLETE]:     { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Pmt. Complete' },
  [ClaimStatus.SUSPENDED]:            { bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3', label: 'Suspended' },
};

const StatusChip = ({ status }) => {
  const cfg = STATUS_CFG[status] || { bg: '#F9FAFB', text: '#374151', border: '#E5E7EB', label: status || '—' };
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center',
      px: 1.25, py: 0.35, borderRadius: '6px',
      backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: '11px', fontWeight: 700, color: cfg.text,
      letterSpacing: 0.2, whiteSpace: 'nowrap'
    }}>
      {cfg.label}
    </Box>
  );
};

// ── Metric Card ────────────────────────────────────────────────────────────────
const MetricCard = ({ label, value, sub, subUp, icon, color, bgColor }) => (
  <Paper elevation={0} sx={{
    flex: 1, minWidth: 130, p: 2, borderRadius: 2,
    border: '1px solid #E8EDF2',
    background: bgColor || '#fff',
    position: 'relative', overflow: 'hidden',
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', backgroundColor: color }
  }}>
    <Stack spacing={1}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6, lineHeight: 1.3, fontSize: '10px' }}>
          {label}
        </Typography>
        <Avatar sx={{ width: 32, height: 32, backgroundColor: `${color}18`, color: color }}>
          {icon}
        </Avatar>
      </Stack>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {subUp !== undefined && (subUp
            ? <TrendingUpIcon sx={{ fontSize: 13, color: '#16A34A' }} />
            : <TrendingDownIcon sx={{ fontSize: 13, color: '#DC2626' }} />
          )}
          <Typography variant="caption" sx={{ color: subUp === true ? '#16A34A' : subUp === false ? '#DC2626' : '#94A3B8', fontWeight: 500 }}>
            {sub}
          </Typography>
        </Stack>
      )}
    </Stack>
  </Paper>
);

// ── Workflow Tile ──────────────────────────────────────────────────────────────
const WorkflowTile = ({ label, count, active, onClick, urgent }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      px: 2, py: 1.5, borderRadius: 2, textAlign: 'center', cursor: 'pointer', minWidth: 110,
      border: active ? '2px solid #2563EB' : `1px solid ${urgent && count > 0 ? '#FECDD3' : '#E2E8F0'}`,
      backgroundColor: active ? '#EFF6FF' : (urgent && count > 0 ? '#FFF1F2' : '#FAFBFC'),
      transition: 'all 0.15s ease',
      '&:hover': { borderColor: '#2563EB', backgroundColor: '#EFF6FF', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(37,99,235,0.12)' }
    }}
  >
    <Typography variant="h5" sx={{ fontWeight: 800, color: active ? '#1D4ED8' : (urgent && count > 0 ? '#DC2626' : '#1E293B'), lineHeight: 1.2 }}>
      {count}
    </Typography>
    <Typography sx={{ color: active ? '#1D4ED8' : '#64748B', fontWeight: 600, display: 'block', lineHeight: 1.3, fontSize: '11px', mt: 0.5 }}>
      {label}
    </Typography>
  </Paper>
);

// ── DataGrid shared styles ─────────────────────────────────────────────────────
const gridSx = (headerBg = '#F8FAFC') => ({
  border: '1px solid #E2E8F0', borderRadius: 2, fontSize: 13,
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: headerBg, borderBottom: '2px solid #E2E8F0',
    '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 }
  },
  '& .MuiDataGrid-row': {
    cursor: 'pointer',
    '&:hover': { backgroundColor: '#F0F7FF' },
    '&:nth-of-type(even)': { backgroundColor: '#FAFBFC' },
    '&:nth-of-type(even):hover': { backgroundColor: '#F0F7FF' },
  },
  '& .MuiDataGrid-cell': { borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', py: 1 },
  '& .MuiDataGrid-footerContainer': { borderTop: '2px solid #E2E8F0', backgroundColor: '#F8FAFC' },
  '& .MuiDataGrid-virtualScroller': { minHeight: 80 },
});

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = ({ onClaimSelect }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [subsetFilter, setSubsetFilter] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [amountRangeFilter, setAmountRangeFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [snowClaims, setSnowClaims] = useState([]);
  const [snowLoading, setSnowLoading] = useState(false);
  const [snowConnected, setSnowConnected] = useState(serviceNowService.isAuthenticated());

  const { claims: laClaims, claimsLoading, fetchClaims } = useClaims();
  const { slaAtRiskCases, fetchSLAAtRiskCases } = useWorkflow();
  const { productLine } = useApp();
  const plConfig = getProductLineConfig(productLine);
  const isPC = productLine === PRODUCT_LINES.PC;
  const claims = useMemo(() => isPC ? getPCDemoData().claims : laClaims, [isPC, laClaims]);

  useEffect(() => { setTypeFilter(''); setPage(0); setSubsetFilter(null); }, [productLine]);

  const fetchSnow = async () => {
    if (!serviceNowService.isAuthenticated()) return;
    try {
      setSnowLoading(true);
      const recs = await serviceNowService.getFNOLsGlobal({ limit: 50, enrichWithPolicy: true });
      setSnowClaims(recs.map(f => serviceNowService.mapFNOLToClaim(f)));
    } catch { setSnowClaims([]); } finally { setSnowLoading(false); }
  };

  useEffect(() => {
    fetchClaims(); fetchSLAAtRiskCases(); fetchSnow();
    const unsub = serviceNowService.onAuthChange(auth => { setSnowConnected(auth); if (auth) fetchSnow(); });
    return () => typeof unsub === 'function' && unsub();
  }, []);

  const allClaims = useMemo(() => {
    if (!claims) return snowClaims;
    const ids = new Set(claims.map(c => c.sysId).filter(Boolean));
    return [...claims, ...snowClaims.filter(sc => !ids.has(sc.sysId))];
  }, [claims, snowClaims]);

  const metrics = useMemo(() => {
    if (!allClaims.length) return { openClaims: 0, newToday: 0, newThisWeek: 0, pendingReview: 0, approvedThisMonth: 0, declinedThisMonth: 0, claimsPaidYTD: '$0', approvalRate: 0 };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now - 7 * 86400000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const approved = allClaims.filter(c => c.status === ClaimStatus.APPROVED && new Date(c.updatedAt) >= monthStart);
    const declined = allClaims.filter(c => c.status === ClaimStatus.DENIED && new Date(c.updatedAt) >= monthStart);
    const total = approved.length + declined.length;
    const paid = allClaims.filter(c => c.status === ClaimStatus.CLOSED && new Date(c.closedAt) >= yearStart).reduce((s, c) => s + (c.financial?.amountPaid || 0), 0);
    return {
      openClaims: allClaims.filter(c => c.status !== ClaimStatus.CLOSED && c.status !== ClaimStatus.DENIED).length,
      newToday: allClaims.filter(c => new Date(c.createdAt) >= todayStart).length,
      newThisWeek: allClaims.filter(c => new Date(c.createdAt) >= weekStart).length,
      pendingReview: allClaims.filter(c => c.status === ClaimStatus.UNDER_REVIEW).length,
      approvedThisMonth: approved.length,
      declinedThisMonth: declined.length,
      claimsPaidYTD: `$${(paid / 1000000).toFixed(1)}M`,
      approvalRate: total > 0 ? Math.round((approved.length / total) * 100) : 0
    };
  }, [allClaims]);

  const stpMetrics = useMemo(() => {
    const stp = allClaims.filter(c => c.routing?.type === RoutingType.STP);
    const closed = stp.filter(c => c.status === ClaimStatus.CLOSED);
    const days = closed.reduce((s, c) => c.createdAt && c.closedAt ? s + Math.floor((new Date(c.closedAt) - new Date(c.createdAt)) / 86400000) : s, 0);
    return {
      count: stp.length,
      percentage: allClaims.length > 0 ? Math.round((stp.length / allClaims.length) * 100) : 0,
      avgDaysToClose: closed.length > 0 ? Math.round(days / closed.length) : 0
    };
  }, [allClaims]);

  const workflowGroups = useMemo(() => [
    { key: 'all',                   label: 'All Open',              count: allClaims.filter(c => c.status !== ClaimStatus.CLOSED && c.status !== ClaimStatus.DENIED).length },
    { key: 'new_fnol',              label: 'New FNOL',              count: allClaims.filter(c => c.status === ClaimStatus.NEW || c.status === ClaimStatus.SUBMITTED).length },
    { key: 'awaiting_requirements', label: 'Awaiting Req.',         count: allClaims.filter(c => c.status === ClaimStatus.PENDING_REQUIREMENTS).length },
    { key: 'requirement_received',  label: 'Req. Received',         count: allClaims.filter(c => c.status === ClaimStatus.REQUIREMENTS_COMPLETE || c.status === ClaimStatus.IN_REVIEW).length },
    { key: 'manual_followups',      label: 'Manual Follow Ups',     count: allClaims.filter(c => c.status === ClaimStatus.UNDER_REVIEW).length },
    { key: 'quality_approval',      label: 'Quality Approval',      count: allClaims.filter(c => c.status === ClaimStatus.IN_APPROVAL).length },
    { key: 'exception_approval',    label: 'Exception Approval',    count: allClaims.filter(c => c.routing?.type === RoutingType.SIU).length, urgent: true },
    { key: 'pending_actuary',       label: 'Pending Actuary',       count: allClaims.filter(c => c.status === ClaimStatus.PAYMENT_SCHEDULED).length },
    { key: 'invalidated',           label: 'Invalidated',           count: allClaims.filter(c => c.status === ClaimStatus.SUSPENDED).length, urgent: true },
  ], [allClaims]);

  const filteredClaims = useMemo(() => {
    let list = [...allClaims];
    if (activeTab === 0) list = list.filter(c => c.status !== ClaimStatus.CLOSED && c.status !== ClaimStatus.DENIED);
    else list = list.filter(c => c.status === ClaimStatus.CLOSED || c.status === ClaimStatus.DENIED);
    const subMap = {
      new_fnol: c => c.status === ClaimStatus.NEW || c.status === ClaimStatus.SUBMITTED,
      awaiting_requirements: c => c.status === ClaimStatus.PENDING_REQUIREMENTS,
      requirement_received: c => c.status === ClaimStatus.REQUIREMENTS_COMPLETE || c.status === ClaimStatus.IN_REVIEW,
      manual_followups: c => c.status === ClaimStatus.UNDER_REVIEW,
      quality_approval: c => c.status === ClaimStatus.IN_APPROVAL,
      exception_approval: c => c.routing?.type === RoutingType.SIU,
      pending_actuary: c => c.status === ClaimStatus.PAYMENT_SCHEDULED,
      invalidated: c => c.status === ClaimStatus.SUSPENDED,
    };
    if (subsetFilter && subsetFilter !== 'all' && subMap[subsetFilter]) list = list.filter(subMap[subsetFilter]);
    if (typeFilter) list = list.filter(c => c.type === typeFilter);
    if (amountRangeFilter) {
      const amt = c => c.financial?.claimAmount || c.financial?.totalClaimed || 0;
      const ranges = { under_50k: c => amt(c) < 50000, '50k_250k': c => amt(c) >= 50000 && amt(c) < 250000, '250k_1m': c => amt(c) >= 250000 && amt(c) < 1000000, over_1m: c => amt(c) >= 1000000 };
      if (ranges[amountRangeFilter]) list = list.filter(ranges[amountRangeFilter]);
    }
    if (searchValue) {
      const s = searchValue.toLowerCase();
      list = list.filter(c => c.claimNumber?.toLowerCase().includes(s) || c.fnolNumber?.toLowerCase().includes(s) || c.policy?.policyNumber?.toLowerCase().includes(s) || c.claimant?.name?.toLowerCase().includes(s) || c.insured?.name?.toLowerCase().includes(s));
    }
    return list;
  }, [allClaims, activeTab, subsetFilter, searchValue, typeFilter, amountRangeFilter]);

  const claimColumns = useMemo(() => [
    {
      field: 'claimNumber', headerName: 'Claim #', width: 150,
      renderCell: ({ row }) => (
        <Typography sx={{ fontWeight: 700, color: '#2563EB', fontSize: 13, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => onClaimSelect(row)}>
          {row.fnolNumber || row.claimNumber || 'N/A'}
        </Typography>
      )
    },
    {
      field: 'insured', headerName: 'Insured / Claimant', width: 210,
      renderCell: ({ row }) => (
        <Stack spacing={0.2}>
          <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{row.insured?.name || '—'}</Typography>
          {row.claimant?.name && row.claimant.name !== row.insured?.name && (
            <Typography sx={{ fontSize: 11, color: '#2563EB', fontWeight: 500 }}>{row.claimant.name}</Typography>
          )}
        </Stack>
      )
    },
    {
      field: 'status', headerName: 'Status', width: 155,
      renderCell: ({ value }) => <StatusChip status={value} />
    },
    {
      field: 'type', headerName: 'Type / LOB', width: 140,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 13, color: '#334155' }}>
          {isPC ? (plConfig.claimTypeLabels[value] || value) : (value === 'death' ? 'Life' : value === 'annuity' ? 'Annuity' : value || '—')}
        </Typography>
      )
    },
    {
      field: 'policy', headerName: 'Policy #', width: 150,
      renderCell: ({ row }) => <Typography sx={{ fontSize: 13, color: '#475569', fontFamily: 'monospace', letterSpacing: 0.3 }}>{row.policy?.policyNumber || '—'}</Typography>
    },
    {
      field: 'createdAt', headerName: 'Submitted', width: 110,
      renderCell: ({ value }) => (
        <Typography sx={{ fontSize: 13, color: '#475569' }}>
          {value ? new Date(value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) : '—'}
        </Typography>
      )
    },
    {
      field: 'routing', headerName: 'STP', width: 70, sortable: false,
      renderCell: ({ row }) => row.routing?.type === RoutingType.STP ? <STPBadge eligible={true} showLabel={false} size="small" /> : null
    },
    {
      field: 'sla', headerName: 'SLA', width: 155, sortable: false,
      renderCell: ({ row }) => row.workflow?.sla?.dueDate
        ? <SLAIndicator slaDate={row.workflow.sla.dueDate} claimStatus={row.status} compact={true} />
        : null
    },
    {
      field: 'actions', headerName: 'Actions', width: 110, sortable: false,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Approve">
            <IconButton size="small" onClick={e => e.stopPropagation()} sx={{ color: '#16A34A', '&:hover': { backgroundColor: '#F0FDF4' } }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Decline">
            <IconButton size="small" onClick={e => e.stopPropagation()} sx={{ color: '#DC2626', '&:hover': { backgroundColor: '#FFF1F2' } }}>
              <CancelOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Transfer">
            <IconButton size="small" onClick={e => e.stopPropagation()} sx={{ color: '#7C3AED', '&:hover': { backgroundColor: '#FAF5FF' } }}>
              <CompareArrowsIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ], [isPC, plConfig, onClaimSelect]);

  const claimRows = filteredClaims.map((c, i) => ({ ...c, id: c.sysId || c.claimNumber || i }));
  const fnolRows = snowClaims.map((c, i) => ({ ...c, id: c.sysId || c.claimNumber || `fnol-${i}` }));

  if ((claimsLoading || snowLoading) && !allClaims.length) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight={400} gap={2}>
        <CircularProgress size={36} sx={{ color: '#2563EB' }} />
        <Typography sx={{ color: '#64748B', fontSize: 14 }}>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, backgroundColor: '#F1F5F9', minHeight: '100vh' }}>
      <Stack spacing={3}>

        {/* ── Header ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AssignmentIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>Claims Dashboard</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Chip
              icon={isPC ? <DirectionsCarIcon sx={{ fontSize: 14 }} /> : <FavoriteIcon sx={{ fontSize: 14 }} />}
              label={plConfig.label}
              size="small"
              sx={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 700, fontSize: 11, border: '1px solid #BFDBFE' }}
            />
          </Stack>
          <Tooltip title="Refresh">
            <IconButton onClick={() => { fetchClaims(); fetchSLAAtRiskCases(); fetchSnow(); }} sx={{ color: '#64748B', '&:hover': { color: '#2563EB', backgroundColor: '#EFF6FF' } }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* ── Metrics Row ── */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <MetricCard label="Open Claims"      value={metrics.openClaims}        icon={<AssignmentIcon sx={{ fontSize: 16 }} />}     color="#2563EB" />
          <MetricCard label="New Today"         value={metrics.newToday}           icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}     color="#7C3AED" />
          <MetricCard label="New This Week"     value={metrics.newThisWeek}        icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}     color="#0EA5E9" />
          <MetricCard label="Pending Review"    value={metrics.pendingReview}      sub={`${slaAtRiskCases?.length || 0} at SLA risk`} subUp={false} icon={<WarningAmberIcon sx={{ fontSize: 16 }} />} color="#F59E0B" />
          <MetricCard label="Claims Paid YTD"   value={metrics.claimsPaidYTD}      sub="+12% vs last year" subUp={true}               icon={<PaidIcon sx={{ fontSize: 16 }} />}          color="#10B981" />
          <MetricCard label="Approved / Month"  value={metrics.approvedThisMonth}  sub={`${metrics.approvalRate}% approval rate`} subUp={true} icon={<CheckIcon sx={{ fontSize: 16 }} />}  color="#16A34A" />
          <MetricCard label="Declined / Month"  value={metrics.declinedThisMonth}  sub={`${100 - metrics.approvalRate}% decline rate`} subUp={false} icon={<BlockIcon sx={{ fontSize: 16 }} />} color="#DC2626" />
        </Stack>

        {/* ── STP Performance ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', background: 'linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%)' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Avatar sx={{ width: 30, height: 30, backgroundColor: '#DBEAFE' }}>
              <FlashOnIcon sx={{ fontSize: 17, color: '#1D4ED8' }} />
            </Avatar>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>{plConfig.terms.stpLabel} Performance</Typography>
            <STPBadge eligible={true} showLabel={false} size="small" />
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>{plConfig.terms.fastTrackMetric} Claims</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#1D4ED8' }}>{stpMetrics.count} ({stpMetrics.percentage}%)</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={stpMetrics.percentage} sx={{ height: 8, borderRadius: 4, backgroundColor: '#DBEAFE', '& .MuiLinearProgress-bar': { backgroundColor: '#2563EB', borderRadius: 4 } }} />
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Target: 40%</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack alignItems="center" sx={{ minWidth: 90 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>{stpMetrics.avgDaysToClose}</Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>Avg Days to Close</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Target: ≤10 days</Typography>
            </Stack>
            <Divider orientation="vertical" flexItem />
            <Stack alignItems="center" sx={{ minWidth: 110 }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: stpMetrics.percentage >= 40 ? '#F0FDF4' : '#FFFBEB', border: `2px solid ${stpMetrics.percentage >= 40 ? '#16A34A' : '#F59E0B'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <TargetIcon sx={{ fontSize: 22, color: stpMetrics.percentage >= 40 ? '#16A34A' : '#F59E0B' }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: stpMetrics.percentage >= 40 ? '#16A34A' : '#F59E0B' }}>
                {stpMetrics.percentage >= 40 ? 'On Target' : 'Below Target'}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* ── Department Inventory ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', backgroundColor: '#fff' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Stack spacing={0.25}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Department Inventory</Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8' }}>Click a group to filter the claims list below</Typography>
            </Stack>
            {subsetFilter && (
              <Chip
                label={`Filter: ${workflowGroups.find(g => g.key === subsetFilter)?.label}`}
                size="small"
                onDelete={() => setSubsetFilter(null)}
                sx={{ backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 600, border: '1px solid #BFDBFE' }}
              />
            )}
          </Stack>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            {workflowGroups.map(g => (
              <WorkflowTile
                key={g.key}
                label={g.label}
                count={g.count}
                active={subsetFilter === g.key}
                urgent={g.urgent}
                onClick={() => { setSubsetFilter(subsetFilter === g.key ? null : g.key); setActiveTab(0); setPage(0); }}
              />
            ))}
          </Stack>
        </Paper>

        {/* ── FNOL Records ── */}
        {(snowConnected || snowClaims.length > 0) && (
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', backgroundColor: '#fff' }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box sx={{ width: 8, height: 28, borderRadius: 1, backgroundColor: '#7C3AED' }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>FNOL Records</Typography>
              <Chip label={`${snowClaims.length} records`} size="small" sx={{ backgroundColor: '#FAF5FF', color: '#7C3AED', fontWeight: 700, border: '1px solid #DDD6FE', fontSize: 11 }} />
              {snowLoading && <CircularProgress size={14} sx={{ color: '#7C3AED' }} />}
            </Stack>
            <Box sx={{ height: snowClaims.length === 0 ? 110 : Math.min(400, 56 + snowClaims.length * 52 + 52) }}>
              <DataGrid
                rows={fnolRows}
                columns={claimColumns}
                pageSizeOptions={[10, 25]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                disableRowSelectionOnClick
                onRowClick={({ row }) => onClaimSelect(row)}
                localeText={snowClaims.length === 0 ? { noRowsLabel: 'No FNOL records — check your ServiceNow connection.' } : undefined}
                sx={gridSx('#FAF5FF')}
              />
            </Box>
          </Paper>
        )}

        {/* ── Claims Inventory ── */}
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid #E2E8F0', backgroundColor: '#fff' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
            <Box sx={{ width: 8, height: 28, borderRadius: 1, backgroundColor: '#2563EB' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>Claims Inventory</Typography>
            <Chip label={`${filteredClaims.length} claims`} size="small" sx={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, border: '1px solid #BFDBFE', fontSize: 11 }} />
          </Stack>

          <Tabs
            value={activeTab}
            onChange={(_, v) => { setActiveTab(v); setPage(0); }}
            sx={{
              mb: 2, borderBottom: '2px solid #F1F5F9',
              '& .MuiTab-root': { fontWeight: 600, fontSize: 13, textTransform: 'none', color: '#64748B', minHeight: 40, py: 1 },
              '& .Mui-selected': { color: '#2563EB' },
              '& .MuiTabs-indicator': { backgroundColor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' }
            }}
          >
            <Tab label="All Open Claims" />
            <Tab label="Closed Claims" />
          </Tabs>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap mb={2}>
            <TextField
              size="small"
              placeholder="Search claim, policy, or name..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#94A3B8' }} /></InputAdornment> }}
              sx={{
                minWidth: 280,
                '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: 13, '& fieldset': { borderColor: '#E2E8F0' }, '&:hover fieldset': { borderColor: '#94A3B8' }, '&.Mui-focused fieldset': { borderColor: '#2563EB' } }
              }}
            />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ fontSize: 13 }}>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={e => { setTypeFilter(e.target.value); setPage(0); }} sx={{ borderRadius: 2, fontSize: 13 }}>
                <MenuItem value="">All Types</MenuItem>
                {isPC ? [
                  <MenuItem key="ac" value="auto_collision">Auto Collision</MenuItem>,
                  <MenuItem key="ah" value="auto_comprehensive">Auto Comprehensive</MenuItem>,
                  <MenuItem key="ho" value="homeowners">Homeowners</MenuItem>,
                  <MenuItem key="cp" value="commercial_property">Commercial Property</MenuItem>,
                  <MenuItem key="al" value="auto_liability">Auto Liability</MenuItem>,
                  <MenuItem key="wc" value="workers_comp">Workers Comp</MenuItem>,
                ] : [
                  <MenuItem key="de" value="death">Life / Death</MenuItem>,
                  <MenuItem key="ma" value="maturity">Maturity</MenuItem>,
                  <MenuItem key="su" value="surrender">Surrender</MenuItem>,
                  <MenuItem key="an" value="annuity">Annuity</MenuItem>,
                ]}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 155 }}>
              <InputLabel sx={{ fontSize: 13 }}>Amount Range</InputLabel>
              <Select value={amountRangeFilter} label="Amount Range" onChange={e => { setAmountRangeFilter(e.target.value); setPage(0); }} sx={{ borderRadius: 2, fontSize: 13 }}>
                <MenuItem value="">All Amounts</MenuItem>
                <MenuItem value="under_50k">Under $50K</MenuItem>
                <MenuItem value="50k_250k">$50K – $250K</MenuItem>
                <MenuItem value="250k_1m">$250K – $1M</MenuItem>
                <MenuItem value="over_1m">Over $1M</MenuItem>
              </Select>
            </FormControl>
            {(searchValue || typeFilter || amountRangeFilter) && (
              <Button size="small" startIcon={<FilterListIcon />} onClick={() => { setSearchValue(''); setTypeFilter(''); setAmountRangeFilter(''); }} sx={{ color: '#64748B', fontSize: 12, textTransform: 'none', '&:hover': { color: '#DC2626', backgroundColor: '#FFF1F2' } }}>
                Clear filters
              </Button>
            )}
          </Stack>

          <Box sx={{ height: 560 }}>
            <DataGrid
              rows={claimRows}
              columns={claimColumns}
              paginationModel={{ page, pageSize }}
              onPaginationModelChange={({ page: p, pageSize: ps }) => { setPage(p); setPageSize(ps); }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              onRowClick={({ row }) => onClaimSelect(row)}
              sx={gridSx('#F8FAFC')}
            />
          </Box>
        </Paper>

      </Stack>
    </Box>
  );
};

export default Dashboard;
