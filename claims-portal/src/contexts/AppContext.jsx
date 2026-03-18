/**
 * App Context
 * Global application state management
 * - User authentication and profile
 * - Global notifications
 * - Theme settings
 * - Application-wide settings
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import eventBus from '../services/sync/eventBus';
import { applyThemeVars, buildThemeVars, getThemeById } from '../theme/themeConfig';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // User State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // Theme State
  const [theme, setTheme] = useState('default');
  const [activeThemeId, setActiveThemeId] = useState('bloom-blue');

  // Product Line State (demo toggle: 'la' | 'pc')
  const [productLine, setProductLine] = useState(
    () => localStorage.getItem('demoProductLine') || 'la'
  );

  const switchProductLine = (line) => {
    setProductLine(line);
    localStorage.setItem('demoProductLine', line);
  };

  // Loading State
  const [globalLoading, setGlobalLoading] = useState(false);

  /**
   * Initialize application
   */
  useEffect(() => {
    initializeApp();
  }, []);

  /**
   * Initialize application state
   */
  const initializeApp = async () => {
    try {
      setAuthLoading(true);

      // Check for stored auth token
      const token = localStorage.getItem('authToken');
      if (token) {
        // TODO: Validate token and fetch user profile
        // For now, mock user data
        setUser({
          id: 'user-1',
          name: 'Sarah Johnson',
          email: 's.johnson@insurance.com',
          role: 'examiner',
          permissions: ['view_claims', 'edit_claims', 'approve_payments']
        });
        setIsAuthenticated(true);
      }

      // Load theme from localStorage
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme) {
        setTheme(savedTheme);
      }

      // Restore active theme (preset or custom)
      const savedThemeId = localStorage.getItem('appThemeId');
      const savedCustomVars = localStorage.getItem('appThemeCustomVars');
      if (savedCustomVars) {
        try {
          applyThemeVars(JSON.parse(savedCustomVars));
          setActiveThemeId('custom');
        } catch (_) { /* ignore corrupt data */ }
      } else if (savedThemeId) {
        const preset = getThemeById(savedThemeId);
        applyThemeVars(buildThemeVars(preset.primary, preset.accent));
        setActiveThemeId(savedThemeId);
      }

    } catch (error) {
      console.error('[AppContext] Initialization error:', error);
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Authentication Actions
   */

  const login = useCallback(async (credentials) => {
    try {
      setGlobalLoading(true);

      // TODO: Implement actual authentication
      // const response = await authService.login(credentials);

      // Mock login
      const mockUser = {
        id: 'user-1',
        name: credentials.username || 'Sarah Johnson',
        email: credentials.email || 's.johnson@insurance.com',
        role: 'examiner',
        permissions: ['view_claims', 'edit_claims', 'approve_payments']
      };

      const mockToken = 'mock-jwt-token';

      localStorage.setItem('authToken', mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);

      addNotification({
        type: 'success',
        message: 'Successfully logged in',
        duration: 3000
      });

      return { success: true, user: mockUser };

    } catch (error) {
      console.error('[AppContext] Login error:', error);

      addNotification({
        type: 'error',
        message: 'Login failed. Please try again.',
        duration: 5000
      });

      return { success: false, error: error.message };
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);

    addNotification({
      type: 'info',
      message: 'You have been logged out',
      duration: 3000
    });
  }, []);

  const updateUserProfile = useCallback((updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Notification Actions
   */

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration || 5000,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Theme Actions
   */

  const updateTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('appTheme', newTheme);
  }, []);

  /** Apply a preset theme by ID */
  const applyPresetTheme = useCallback((themeId) => {
    const preset = getThemeById(themeId);
    const vars = buildThemeVars(preset.primary, preset.accent);
    applyThemeVars(vars);
    setActiveThemeId(themeId);
    localStorage.setItem('appThemeId', themeId);
    localStorage.removeItem('appThemeCustomVars');
  }, []);

  /** Apply a fully custom theme from primary + accent hex colors */
  const applyCustomTheme = useCallback((primary, accent) => {
    const vars = buildThemeVars(primary, accent);
    applyThemeVars(vars);
    setActiveThemeId('custom');
    localStorage.setItem('appThemeId', 'custom');
    localStorage.setItem('appThemeCustomVars', JSON.stringify(vars));
  }, []);

  /**
   * Subscribe to global error events
   */
  useEffect(() => {
    const handleError = (event) => {
      addNotification({
        type: 'error',
        message: event.data.message || 'An error occurred',
        duration: 5000
      });
    };

    const unsubscribe = eventBus.subscribe('error.occurred', handleError);

    return () => unsubscribe();
  }, [addNotification]);

  /**
   * Context Value
   */
  const value = {
    // User State
    user,
    isAuthenticated,
    authLoading,

    // User Actions
    login,
    logout,
    updateUserProfile,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,

    // Theme
    theme,
    updateTheme,
    activeThemeId,
    applyPresetTheme,
    applyCustomTheme,

    // Global Loading
    globalLoading,
    setGlobalLoading,

    // Product Line
    productLine,
    switchProductLine
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * Hook to use App Context
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export default AppContext;
