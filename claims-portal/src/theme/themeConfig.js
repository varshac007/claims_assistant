/**
 * Bloom Insurance Theme Configuration
 * Maps theme selections to the actual CSS custom properties used in bloom-theme.css
 */

// ── Color math helpers ──────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
}

function toHex(r, g, b) {
  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

export function lighten(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return toHex(
    rgb.r + (255 - rgb.r) * amount,
    rgb.g + (255 - rgb.g) * amount,
    rgb.b + (255 - rgb.b) * amount
  );
}

export function darken(hex, amount) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return toHex(rgb.r * (1 - amount), rgb.g * (1 - amount), rgb.b * (1 - amount));
}

/**
 * Build a full set of CSS variable overrides from a primary + accent hex color.
 * This covers all the bloom-theme.css --color-blue-* variables used throughout the app.
 */
export function buildThemeVars(primary, accent) {
  return {
    '--color-blue':              primary,
    '--color-blue-dark':         darken(primary, 0.18),
    '--color-blue-darker':       darken(primary, 0.38),
    '--color-blue-light':        lighten(primary, 0.14),
    '--color-blue-lighter':      lighten(primary, 0.32),
    '--color-blue-pale':         lighten(primary, 0.82),
    '--color-light-blue':        accent,
    '--color-light-blue-dark':   darken(accent, 0.18),
    '--color-light-blue-light':  lighten(accent, 0.2),
    '--color-light-blue-pale':   lighten(accent, 0.82),
    '--color-primary':           primary,
    '--color-primary-hover':     accent,
    '--color-primary-active':    darken(primary, 0.18),
    '--color-primary-focus':     lighten(primary, 0.14),
    '--gradient-primary':        primary,
    '--gradient-primary-vertical': primary,
    '--shadow-xs':  `0 1px 2px ${lighten(primary, 0.5)}40`,
    '--shadow-sm':  `0 1px 3px ${lighten(primary, 0.3)}30`,
    '--shadow-md':  `0 4px 6px ${lighten(primary, 0.2)}28`,
    '--shadow-focus': `0 0 0 3px ${lighten(primary, 0.2)}33`,
  };
}

// ── Predefined themes ────────────────────────────────────────────────────────
export const THEMES = [
  {
    id: 'bloom-blue',
    name: 'Bloom Blue',
    description: 'Default Bloom Insurance brand',
    primary: '#1B75BB',
    accent: '#00ADEE',
  },
  {
    id: 'navy-pro',
    name: 'Navy Pro',
    description: 'Deep navy for a formal look',
    primary: '#1E3A5F',
    accent: '#3D8EBF',
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Fresh green for growth',
    primary: '#2E7D32',
    accent: '#26A69A',
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Professional slate grey-blue',
    primary: '#334155',
    accent: '#0EA5E9',
  },
  {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    description: 'Calm, focused cyan palette',
    primary: '#0E7490',
    accent: '#06B6D4',
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    description: 'Energetic amber & gold',
    primary: '#B45309',
    accent: '#F59E0B',
  },
];

/** Apply a vars object to :root CSS custom properties */
export function applyThemeVars(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/** Look up a preset theme by ID */
export function getThemeById(id) {
  return THEMES.find(t => t.id === id) ?? THEMES[0];
}
