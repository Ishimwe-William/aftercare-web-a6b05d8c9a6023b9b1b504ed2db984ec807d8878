import React from 'react';
import {Box, Typography, Link} from '@mui/material';
import logo from '../../assets/images/ampersand-logo.png'; // or the other import method

const Footer = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                py: 1.5,
                backgroundColor: '#FCDB10'
            }}
        >
            {/* Container for responsive layout */}
            <Box
                sx={{
                    display: 'flex',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between', // Add this line
                    flexWrap: 'wrap',
                    gap: 2,
                    marginX: "2%",
                }}
            >
                {/* Logo and App Name */}
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                    {/* Logo */}
                    <Box
                        component="img"
                        src={logo}
                        alt="Ampersand Logo"
                        sx={{
                            width: 32,
                            height: 32,
                            objectFit: 'contain'
                        }}
                    />

                    {/* App Name + Tagline */}
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 'bold',
                                fontSize: '1.125rem',
                                color: 'black',
                                lineHeight: 1.2
                            }}
                        >
                            Aftercare App
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '1rem',
                                color: 'black'
                            }}
                        >
                            Ampersand E-mobility
                        </Typography>
                    </Box>
                </Box>

                {/* Links */}
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <Link
                        href="https://www.ampersand.solar/policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            fontWeight: 'medium',
                            color: 'black',
                            textDecoration: 'none',
                            mb: 0.5,
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        href="https://www.ampersand.solar"
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                            fontWeight: 'medium',
                            color: 'black',
                            textDecoration: 'none',
                            '&:hover': {
                                textDecoration: 'underline'
                            }
                        }}
                    >
                        Website
                    </Link>
                </Box>
            </Box>
        </Box>
    );
};

export default Footer;