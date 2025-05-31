/**
 * Application-wide color palette
 */
const colors = {
  light: {
    // Background colors
    background: {
      primary: '#f5f5f5',   // Off-white for main backgrounds
      secondary: '#ffffff', // White for cards, dialogs
      tertiary: '#e9ecef',  // Light gray for secondary elements
    },
    
    // Text colors
    text: {
      primary: '#212529',   // Dark gray for main text
      secondary: '#6c757d', // Medium gray for secondary text
      disabled: '#adb5bd',  // Light gray for disabled text
      inverse: '#ffffff',   // White text for dark backgrounds
    },
    
    // Border colors
    border: {
      light: '#dee2e6',     // Light border
      regular: '#ced4da',   // Regular border
      focus: '#80bdff',     // Border for focused elements
    }
  },
  
  dark: {
    // Background colors
    background: {
      primary: '#121212',   // Dark background
      secondary: '#1e1e1e', // Slightly lighter for cards, dialogs
      tertiary: '#2c2c2c',  // Even lighter for secondary elements
    },
    
    // Text colors
    text: {
      primary: '#e0e0e0',   // Light gray for main text
      secondary: '#a0a0a0', // Medium gray for secondary text
      disabled: '#6c6c6c',  // Dark gray for disabled text
      inverse: '#121212',   // Dark text for light backgrounds
    },
    
    // Border colors
    border: {
      light: '#3e3e3e',     // Dark border
      regular: '#505050',   // Medium border
      focus: '#757575',     // Border for focused elements
    }
  },
  
  // Brand colors (same for both modes)
  brand: {
    primary: '#1976d2',   // Primary brand color (MUI default blue)
    secondary: '#dc004e', // Secondary brand color
    success: '#4caf50',   // Green for success states
    warning: '#ff9800',   // Orange for warning states
    error: '#f44336',     // Red for error states
    info: '#2196f3',      // Light blue for info states
  },
};

export default colors;
