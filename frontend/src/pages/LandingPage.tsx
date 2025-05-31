import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Toolbar,
  Typography,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ThemeToggle from '../components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';
import SearchIcon from '@mui/icons-material/Search';

// FAQ data
const faqs = [
  {
    question: "What is this application for?",
    answer: "This application is designed to help you manage your personal finances. You can track expenses, set budgets, and analyze your spending habits."
  },
  {
    question: "How do I get started?",
    answer: "You can register for a free account, then create your profiles for different bank accounts. Once set up, you can start tracking your expenses."
  },
  {
    question: "Is my data secure?",
    answer: "No, this is a mock application for educational purposes."
  },
  {
    question: "Is there a mobile app?",
    answer: "There is currently no mobile app, but the web application is fully responsive (XD) and works well on mobile devices."
  }
];

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const { isLoading } = useAuth();
  
  // Show simple loading indicator if auth is loading
  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }
  
  return (
    <Box sx={{ 
      flexGrow: 1, 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'background-color 0.3s ease', // Add transition for smooth theme change
      backgroundColor: 'background.default'
    }}>
      {/* Navigation Bar */}
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ transition: 'background-color 0.3s ease' }} // Add transition for AppBar
      >
        <Toolbar>
          <Box 
            component={RouterLink} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            <FontAwesomeIcon 
              icon={faChartPie} 
              style={{ fontSize: '1.5rem', marginRight: '10px' }} 
            />
            <Typography variant="h6" component="div">
              Finance Tracker
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ThemeToggle />
            <Button 
              component={RouterLink} 
              to="/login"
              color="inherit"
            >
              Login
            </Button>
            <Button 
              component={RouterLink} 
              to="/register" 
              variant="contained" 
              color="primary"
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
          textAlign: 'center',
          transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Hero section
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Take control of your finances today.
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Our application offers powerful tools for tracking expenses, budgeting, and financial planning.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              component={RouterLink} 
              to="/register" 
              variant="contained" 
              color="primary" 
              size="large"
            >
              Get Started
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ 
        py: 8, 
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease' // Add transition for features section
      }}>
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Features
          </Typography>
          
          {/* Center the features and give them fixed width */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            gap: 4, 
            mt: 2 
          }}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                width: '80%',
                maxWidth: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Paper elements
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  Managing expenses
                </Typography>
                <Typography>
                  Easily track your daily expenses, categorize them, and set budgets to stay on top of your finances.
                </Typography>
              </Box>
              <Box sx={{ ml: 3 }}>
                <SearchIcon sx={{ fontSize: 60 }} />
              </Box>
            </Paper>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                width: '80%',
                maxWidth: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Paper elements
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  Multi-profile support
                </Typography>
                <Typography>
                  Manage multiple bank accounts, credit cards, and cash transactions all in one place.
                </Typography>
              </Box>
              <Box sx={{ ml: 3 }}>
                <DashboardIcon sx={{ fontSize: 60 }} />
              </Box>
            </Paper>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                width: '80%',
                maxWidth: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Paper elements
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" gutterBottom>
                  Reports & Analytics
                </Typography>
                <Typography>
                  Get insights into your spending habits with detailed reports and visualizations. 
                  Understand where your money goes and how to save more effectively.
                </Typography>
              </Box>
              <Box sx={{ ml: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 60 }} />
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Getting Started Section */}
      <Box sx={{ 
        py: 8, 
        bgcolor: 'background.paper',
        transition: 'background-color 0.3s ease' // Add transition for section
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            Getting Started
          </Typography>
          <Box sx={{ my: 4 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  1. Create an Account
                </Typography>
                <Typography paragraph>
                  Register for free and set up your profile. It only takes a minute to get started.
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  2. Set up your profiles
                </Typography>
                <Typography paragraph>
                  Set up your bank accounts, credit cards, and cash transactions to start tracking your finances.
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  3. Track Your spendings
                </Typography>
                <Typography paragraph>
                  Monitor your daily expenses, categorize them, and set budgets to stay on track with your financial goals.
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ 
        py: 8, 
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease' // Add transition for FAQ section
      }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            Frequently Asked Questions
          </Typography>
          <Box sx={{ mt: 4 }}>
            {faqs.map((faq, index) => (
              <Accordion 
                key={index} 
                sx={{ 
                  mb: 1,
                  transition: 'background-color 0.3s ease' // Add transition for accordion elements
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`faq-content-${index}`}
                  id={`faq-header-${index}`}
                >
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{faq.answer}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Footer / Contact Section */}
      <Box 
        sx={{ 
          py: 6, 
          bgcolor: theme.palette.mode === 'light' ? 'grey.200' : 'grey.900',
          mt: 'auto',
          transition: 'background-color 0.3s ease' // Add transition for footer
        }} 
        component="footer"
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ZTPAI project for Cracow UoT
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: mock@email.com
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Phone: +48 123 123 123
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: Cracow, Poland
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
                  Terms of Service
                </Link>
                <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
                  Privacy Policy
                </Link>
                <Link href="#" color="inherit" display="block">
                  Help Center
                </Link>
              </Box>
            </Grid>
          </Grid>
          <Box mt={4} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Finance Tracker. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
