import {Box, Typography} from "@mui/material";
import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {AuthCard} from "../../components/common/AuthCard";
import {FormHeader} from "../../components/common/FormHeader";
import {CustomButton} from "../../components/common/CustomButton";
import {useDispatch} from "react-redux";
import {verifyEmail} from "./authSlice";

export const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [error, setError] = useState('');

    useEffect(() => {
        handleVerification();
    }, []);

    const handleVerification = async () => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');

        if (!token) {
            setError('Invalid or missing verification token');
            return;
        }

        try {
            setIsLoading(true);
            await dispatch(verifyEmail(token)).unwrap();
            navigate('/auth/login');
        } catch (err) {
            setError(err.message || 'Failed to verify email');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Box sx={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {isLoading && <LoadingSpinner/>}
            <AuthCard>
                <FormHeader title={'Verify Email'}/>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    {!isLoading && !error && (
                        <Typography
                            sx={{
                                color: 'success.main',
                                textAlign: 'center',
                                padding: 1,
                                borderRadius: 1,
                                fontSize: '0.875rem'
                            }}
                        >
                            Verifying your email address...
                        </Typography>
                    )}

                    {error && (
                        <Typography
                            sx={{
                                color: 'error.main',
                                textAlign: 'center',
                                padding: 1,
                                borderRadius: 1,
                                fontSize: '0.875rem'
                            }}
                        >
                            {error}
                        </Typography>
                    )}

                    {error && (
                        <CustomButton
                            variant="primary"
                            onClick={handleVerification}
                            disabled={isLoading}
                            fullWidth
                        >
                            {isLoading ? 'Verifying...' : 'Try Again'}
                        </CustomButton>
                    )}
                </Box>
            </AuthCard>
        </Box>
    );
}