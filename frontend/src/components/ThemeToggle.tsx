import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  onToggle?: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ onToggle }) => {
  const { mode, toggleTheme } = useTheme();
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent default behaviors
    e.preventDefault();
    e.stopPropagation();
    
    // Toggle theme
    toggleTheme();
    
    // Execute callback if provided
    if (onToggle) {
      onToggle();
    }
  };

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton onClick={handleClick} color="inherit" aria-label="toggle theme">
        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
