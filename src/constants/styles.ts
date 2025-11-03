/**
 * Design system constants for consistent styling across the application
 */

// Color palette
export const COLORS = {
  // Primary brand colors
  primary: '#b794f6',
  primaryHover: '#9b72cf',

  // Semantic colors
  danger: '#c77a9b',
  warning: '#fff3cd',
  warningText: '#856404',

  // Grays
  gray50: '#f8f9fa',
  gray100: '#f0f0f0',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',

  // Special colors
  white: '#ffffff',
  black: '#000000',

  // Component-specific colors
  selectedHighlight: '#f3eeff',
  selectedBorder: '#d8c7f0',
  parameterBackground: '#e8dff5',
  parameterText: '#5a3d7a',

  // Chart colors
  chartPrimary: '#b794f6',
  chartReference: '#ff7300',
} as const;

// Typography
export const TYPOGRAPHY = {
  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '13px',
    md: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.6',
  },
} as const;

// Spacing scale (follows 4px base unit)
export const SPACING = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '10px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '20px',
  '4xl': '24px',
  '5xl': '30px',
  '6xl': '40px',
} as const;

// Border radius
export const BORDER_RADIUS = {
  sm: '4px',
  md: '6px',
  lg: '8px',
} as const;

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 1px 3px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 12px rgba(0, 0, 0, 0.15)',
  xl: '0 4px 20px rgba(0, 0, 0, 0.25)',
} as const;

// Common button styles
export const BUTTON_STYLES = {
  base: {
    border: 'none',
    borderRadius: BORDER_RADIUS.sm,
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.fontSize.md,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    padding: '10px 16px',
    transition: 'background-color 0.2s',
  },
  primary: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  secondary: {
    backgroundColor: COLORS.gray50,
    color: COLORS.gray700,
    border: `1px solid ${COLORS.gray300}`,
  },
  danger: {
    backgroundColor: COLORS.danger,
    color: COLORS.white,
  },
  small: {
    padding: '4px 10px',
    fontSize: TYPOGRAPHY.fontSize.sm,
  },
} as const;

// Common input styles
export const INPUT_STYLES = {
  base: {
    border: `1px solid ${COLORS.gray400}`,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: TYPOGRAPHY.fontSize.base,
    padding: `${SPACING.sm} ${SPACING.md}`,
  },
  number: {
    width: '60px',
  },
  numberLarge: {
    width: '80px',
  },
} as const;

// Modal styles
export const MODAL_STYLES = {
  backdrop: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'fixed' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: COLORS.white,
    padding: SPACING['4xl'],
    borderRadius: BORDER_RADIUS.lg,
    boxShadow: SHADOWS.xl,
    maxWidth: '500px',
    width: '90%',
  },
  smallContent: {
    maxWidth: '400px',
  },
  title: {
    margin: `0 0 ${SPACING.xl} 0`,
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
} as const;

// Label styles
export const LABEL_STYLES = {
  base: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.gray600,
  },
  bold: {
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.md,
  },
} as const;

// Helper function to merge styles
export const mergeStyles = (...styles: Array<React.CSSProperties>): React.CSSProperties => {
  return Object.assign({}, ...styles);
};
