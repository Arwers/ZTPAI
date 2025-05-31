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
import ThemeToggle from '../components/ThemeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faChartPie } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../contexts/AuthContext';

// FAQ data
const faqs = [
  {
    question: "What is this application for?",
    answer: "This is a project management application that helps teams organize tasks, track progress, and collaborate efficiently on projects of any size."
  },
  {
    question: "How do I get started?",
    answer: "You can register for a free account, then create your first project and invite team members to collaborate with you."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, all data is encrypted and stored securely. We implement industry-standard security practices to protect your information."
  },
  {
    question: "Can I use this for personal projects?",
    answer: "Absolutely! The application is designed for both personal and team use. You can create private projects just for yourself."
  },
  {
    question: "Is there a mobile app?",
    answer: "We're currently developing mobile apps for iOS and Android. In the meantime, our web application is fully responsive and works great on mobile devices."
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
          <FontAwesomeIcon 
              icon={faChartPie} 
              style={{ fontSize: '1.5rem', marginRight: '10px' }} 
            />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Finance Tracker
          </Typography>
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
            Streamline your workflow, collaborate with your team, and deliver projects on time
            with our intuitive project management platform.
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
                transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Paper elements
              }}
            >
              <Typography variant="h5" gutterBottom>
                Task Management
              </Typography>
              <Typography>
                Organize tasks with priorities, deadlines, and assignments. Track progress
                with customizable workflows and visual boards.
              </Typography>
            </Paper>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                width: '80%',
                maxWidth: 800,
                transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Paper elements
              }}
            >
              <Typography variant="h5" gutterBottom>
                Team Collaboration
              </Typography>
              <Typography>
                Communicate effectively with integrated messaging, comments, and file sharing.
                Keep everyone on the same page.
              </Typography>
            </Paper>
            
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3,
                width: '80%',
                maxWidth: 800,
                transition: 'background-color 0.3s ease, color 0.3s ease' // Add transition for Paper elements
              }}
            >
              <Typography variant="h5" gutterBottom>
                Reports & Analytics
              </Typography>
              <Typography>
                Get insights into project performance with detailed reports and dashboards.
                Make data-driven decisions to improve efficiency.
              </Typography>
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
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  1. Create an Account
                </Typography>
                <Typography paragraph>
                  Register for free and set up your profile. It only takes a minute to get started.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    transition: 'background-color 0.3s ease' // Add transition for Paper elements
                  }}
                >
                  <Typography variant="h6" color="primary.contrastText">
                    Registration Screen
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Grid container spacing={2} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'secondary.light',
                    transition: 'background-color 0.3s ease' // Add transition for Paper elements
                  }}
                >
                  <Typography variant="h6" color="secondary.contrastText">
                    Project Dashboard
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  2. Create Your First Project
                </Typography>
                <Typography paragraph>
                  Set up a project, add tasks, and invite your team members to collaborate.
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }} />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>
                  3. Track Your Progress
                </Typography>
                <Typography paragraph>
                  Monitor project progress, update task statuses, and stay on top of deadlines.
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'success.light',
                    transition: 'background-color 0.3s ease' // Add transition for Paper elements
                  }}
                >
                  <Typography variant="h6" color="success.contrastText">
                    Progress Tracking
                  </Typography>
                </Paper>
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
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We're a passionate team dedicated to building tools that help people work smarter and more efficiently.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Email: support@projectmanager.com
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Phone: +1 (555) 123-4567
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: 123 Project St, Techville, CA 94043
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Links
              </Typography>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
                Terms of Service
              </Link>
              <Link href="#" color="inherit" display="block" sx={{ mb: 1 }}>
                Privacy Policy
              </Link>
              <Link href="#" color="inherit" display="block">
                Help Center
              </Link>
            </Grid>
          </Grid>
          <Box mt={4} pt={2} borderTop={1} borderColor="divider">
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} Project Manager. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
