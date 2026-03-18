import { useState } from 'react';
import {
  Box, Stack, Typography, IconButton, Button, Divider, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PaletteIcon from '@mui/icons-material/Palette';
import TuneIcon from '@mui/icons-material/Tune';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { THEMES } from '../../theme/themeConfig';
import { useApp } from '../../contexts/AppContext';

const ThemeSettings = ({ isOpen, onClose }) => {
  const { activeThemeId, applyPresetTheme, applyCustomTheme } = useApp();

  // Custom color state — start from current Bloom defaults
  const [customPrimary, setCustomPrimary] = useState('#1B75BB');
  const [customAccent, setCustomAccent] = useState('#00ADEE');

  if (!isOpen) return null;

  const handlePreset = (themeId) => {
    applyPresetTheme(themeId);
    onClose();
  };

  const handleCustomApply = () => {
    applyCustomTheme(customPrimary, customAccent);
    onClose();
  };

  const handleReset = () => {
    applyPresetTheme('bloom-blue');
    setCustomPrimary('#1B75BB');
    setCustomAccent('#00ADEE');
    onClose();
  };

  return (
    /* Backdrop */
    <Box
      sx={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}
      onClick={onClose}
    >
      {/* Panel */}
      <Box
        sx={{ width: 460, maxHeight: '88vh', backgroundColor: '#fff', borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 48px rgba(0,0,0,0.22)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', backgroundColor: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PaletteIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#0F172A', lineHeight: 1.2 }}>Theme Settings</Typography>
              <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Customize your interface appearance</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { backgroundColor: '#F1F5F9', color: '#334155' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>

        {/* ── Scrollable body ── */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>

          {/* Preset themes */}
          <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, mb: 1.5 }}>
            Preset Themes
          </Typography>

          <Stack spacing={1}>
            {THEMES.map(theme => {
              const isActive = activeThemeId === theme.id;
              return (
                <Box
                  key={theme.id}
                  onClick={() => handlePreset(theme.id)}
                  sx={{
                    p: 1.5, borderRadius: 2, cursor: 'pointer',
                    border: `2px solid ${isActive ? theme.primary : '#F1F5F9'}`,
                    backgroundColor: isActive ? `${theme.primary}0A` : '#FAFBFC',
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: theme.primary,
                      backgroundColor: `${theme.primary}08`,
                      transform: 'translateX(2px)',
                    },
                  }}
                >
                  {/* Color preview strip */}
                  <Stack direction="row" spacing={0.5} flexShrink={0}>
                    <Box sx={{ width: 32, height: 32, borderRadius: '8px', backgroundColor: theme.primary }} />
                    <Box sx={{ width: 16, height: 32, borderRadius: '6px', backgroundColor: theme.accent }} />
                    <Stack spacing={0.5}>
                      <Box sx={{ width: 10, height: 14, borderRadius: '3px', backgroundColor: `${theme.primary}60` }} />
                      <Box sx={{ width: 10, height: 14, borderRadius: '3px', backgroundColor: `${theme.primary}25` }} />
                    </Stack>
                  </Stack>

                  {/* Label */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#0F172A', lineHeight: 1.2 }}>
                      {theme.name}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.3 }}>
                      {theme.description}
                    </Typography>
                  </Box>

                  {/* Active check */}
                  {isActive ? (
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckIcon sx={{ fontSize: 13, color: '#fff' }} />
                    </Box>
                  ) : (
                    <Box sx={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #E2E8F0', flexShrink: 0 }} />
                  )}
                </Box>
              );
            })}
          </Stack>

          {/* Custom colors */}
          <Divider sx={{ my: 3 }} />

          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <TuneIcon sx={{ fontSize: 14, color: '#64748B' }} />
            <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: 1 }}>
              Custom Colors
            </Typography>
            {activeThemeId === 'custom' && (
              <Box sx={{ px: 1, py: 0.2, borderRadius: '100px', backgroundColor: '#EFF6FF' }}>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: '#1D4ED8' }}>Active</Typography>
              </Box>
            )}
          </Stack>

          <Stack spacing={2}>
            {/* Primary */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0F172A', mb: 0.25 }}>Primary Color</Typography>
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Main buttons, links & active states</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: customPrimary, border: '2px solid #E2E8F0', flexShrink: 0 }} />
                <Tooltip title="Pick a color">
                  <Box
                    component="input"
                    type="color"
                    value={customPrimary}
                    onChange={e => setCustomPrimary(e.target.value)}
                    sx={{
                      width: 36, height: 36, p: 0, border: '2px solid #E2E8F0', borderRadius: '8px',
                      cursor: 'pointer', backgroundColor: 'transparent',
                      '&::-webkit-color-swatch-wrapper': { padding: 0, borderRadius: '6px' },
                      '&::-webkit-color-swatch': { border: 'none', borderRadius: '6px' },
                    }}
                  />
                </Tooltip>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontFamily: 'monospace', minWidth: 70 }}>
                  {customPrimary.toUpperCase()}
                </Typography>
              </Stack>
            </Stack>

            {/* Accent */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 13, color: '#0F172A', mb: 0.25 }}>Accent Color</Typography>
                <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>Highlights, hover states & secondary</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 36, height: 36, borderRadius: '8px', backgroundColor: customAccent, border: '2px solid #E2E8F0', flexShrink: 0 }} />
                <Tooltip title="Pick a color">
                  <Box
                    component="input"
                    type="color"
                    value={customAccent}
                    onChange={e => setCustomAccent(e.target.value)}
                    sx={{
                      width: 36, height: 36, p: 0, border: '2px solid #E2E8F0', borderRadius: '8px',
                      cursor: 'pointer', backgroundColor: 'transparent',
                      '&::-webkit-color-swatch-wrapper': { padding: 0, borderRadius: '6px' },
                      '&::-webkit-color-swatch': { border: 'none', borderRadius: '6px' },
                    }}
                  />
                </Tooltip>
                <Typography sx={{ fontSize: 12, color: '#64748B', fontFamily: 'monospace', minWidth: 70 }}>
                  {customAccent.toUpperCase()}
                </Typography>
              </Stack>
            </Stack>

            {/* Live preview strip */}
            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Box sx={{ px: 2, py: 1.25, backgroundColor: customPrimary }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff', opacity: 0.9 }}>Header / Active State</Typography>
              </Box>
              <Stack direction="row" sx={{ p: 1.5, gap: 1 }}>
                <Box sx={{ px: 1.5, py: 0.75, borderRadius: '6px', backgroundColor: customPrimary, display: 'inline-flex' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Button</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 0.75, borderRadius: '6px', border: `2px solid ${customPrimary}`, display: 'inline-flex' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: customPrimary }}>Outline</Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 0.75, borderRadius: '6px', backgroundColor: `${customPrimary}15`, display: 'inline-flex' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: customPrimary }}>Subtle</Typography>
                </Box>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: customAccent, alignSelf: 'center', ml: 'auto' }} />
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: customPrimary, alignSelf: 'center' }} />
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* ── Footer actions ── */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Tooltip title="Reset to Bloom Blue default">
            <IconButton size="small" onClick={handleReset} sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', backgroundColor: '#FFF1F2' } }}>
              <RestartAltIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={onClose}
            sx={{ fontSize: 13, textTransform: 'none', color: '#64748B', fontWeight: 600, px: 2, '&:hover': { backgroundColor: '#F1F5F9' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCustomApply}
            sx={{
              fontSize: 13, textTransform: 'none', fontWeight: 700, px: 2.5,
              backgroundColor: customPrimary,
              '&:hover': { backgroundColor: customPrimary, opacity: 0.9, boxShadow: `0 4px 12px ${customPrimary}50` },
              boxShadow: 'none',
            }}
          >
            Apply Custom
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default ThemeSettings;
