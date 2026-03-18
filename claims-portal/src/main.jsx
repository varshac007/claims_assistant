import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import 'material-icons/iconfont/material-icons.css'
import './index.css'
import './theme/bloom-theme.css'
import './responsive.css'
import App from './App.jsx'

const muiTheme = createTheme({
  palette: {
    primary: { main: '#1B75BB' },
    secondary: { main: '#00ADEE' },
  },
  typography: {
    fontFamily: '"Open Sans", "Segoe UI", Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: '#F4F6F9' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
  },
})

// Apply Bloom theme class to body
document.body.classList.add('bloom-theme');

// Override Halstack's --color-primary-* scale (purple by default) with Bloom blue.
// Set on document.documentElement so these act as inline-style-level overrides that
// take priority over any Emotion-injected stylesheet, regardless of injection order.
const root = document.documentElement;
root.style.setProperty('--color-primary-50',  '#E8F4FC');
root.style.setProperty('--color-primary-100', '#D6E9F7');
root.style.setProperty('--color-primary-200', '#B3D4EE');
root.style.setProperty('--color-primary-300', '#8BBFE5');
root.style.setProperty('--color-primary-400', '#5CA9DD');
root.style.setProperty('--color-primary-500', '#2A8FD4');
root.style.setProperty('--color-primary-600', '#1B75BB');
root.style.setProperty('--color-primary-700', '#0F4470');
root.style.setProperty('--color-primary-800', '#0A3358');
root.style.setProperty('--color-primary-900', '#061E33');

// Mount the React app into the #root div defined in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
// Version 3.0.0 - Fixed ALL DxcContainer unsupported props
