import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';

const Navbar = ({ darkMode, setDarkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="div"
          sx={{ flexGrow: 1, fontWeight: 600 }}
        >
          ECG Analysis Dashboard
        </Typography>
        <Box>
          <IconButton
            color="inherit"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="toggle dark mode"
          >
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 