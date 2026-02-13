import {Box, Checkbox, Divider, FormControlLabel, Typography} from "@mui/material";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {AuthCard} from "../../components/common/AuthCard";
import {FormHeader} from "../../components/common/FormHeader";
import {CustomTextField} from "../../components/common/CustomTextField";
import {CustomButton} from "../../components/common/CustomButton";
import {useDispatch} from "react-redux";
import {resetPassword} from "./authSlice";
import Footer from "../../components/layout/Footer";

export const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();
    const [error, setError] = useState({
        password: '',
        confirmPassword: '',
    });
    const [data, setData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        password: false,
        confirmPassword: false,
    });

    const validateData = () => {
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        let tempErrors = {
            password: '',
            confirmPassword: ''
        };
        let isValid = true;

        if (!data.password || !passwordPattern.test(data.password)) {
            tempErrors.password = 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';
            isValid = false;
        }

        if (!data.confirmPassword || !passwordPattern.test(data.confirmPassword)) {
            tempErrors.confirmPassword = 'Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';
            isValid = false;
        }

        if (data.confirmPassword !== data.password) {
            tempErrors.confirmPassword = 'Passwords do not match.';
            isValid = false;
        }

        setError(tempErrors);
        return isValid;
    }

    const handleSubmit = async () => {
        if (!validateData()) return;

        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');

        if (!token) {
            setError({
                password: '',
                confirmPassword: 'Invalid or missing reset token'
            });
            return;
        }

        try {
            setIsLoading(true);
            await dispatch(resetPassword({token, newPassword: data.password})).unwrap();
            navigate('/auth/login');
        } catch (err) {
            setError({
                password: '',
                confirmPassword: err.message || 'Failed to reset password'
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <Box>
            <Box sx={{
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {isLoading && <LoadingSpinner/>}
                <AuthCard>
                    <FormHeader title={'Reset Password'}/>

                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                        {(error.password || error.confirmPassword) && (
                            <Typography
                                sx={{
                                    color: 'error.main',
                                    textAlign: 'center',
                                    padding: 1,
                                    borderRadius: 1,
                                    fontSize: '0.875rem'
                                }}
                            >
                                {error.password || error.confirmPassword}
                            </Typography>
                        )}

                        <Box>
                            <CustomTextField
                                label="New Password"
                                id="password"
                                name="password"
                                placeholder="Enter new password"
                                type={showPassword.password ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData({...data, password: e.target.value})}
                                error={error.password}
                                autoComplete="new-password"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showPassword.password}
                                        onChange={(e) => setShowPassword({...showPassword, password: e.target.checked})}
                                        sx={{
                                            color: '#000000',
                                            '&.Mui-checked': {
                                                color: '#000000',
                                            },
                                        }}
                                    />
                                }
                                label="Show Password"
                                sx={{color: '#000000', mt: 1}}
                            />
                        </Box>
                        <Box>
                            <CustomTextField
                                label="Confirm Password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm password"
                                type={showPassword.confirmPassword ? 'text' : 'password'}
                                value={data.confirmPassword}
                                onChange={(e) => setData({...data, confirmPassword: e.target.value})}
                                error={error.confirmPassword}
                                autoComplete="new-password"
                                onKeyUp={handleKeyUp}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={showPassword.confirmPassword}
                                        onChange={(e) => setShowPassword({
                                            ...showPassword,
                                            confirmPassword: e.target.checked
                                        })}
                                        sx={{
                                            color: '#000000',
                                            '&.Mui-checked': {
                                                color: '#000000',
                                            },
                                        }}
                                    />
                                }
                                label="Show Password"
                                sx={{color: '#000000', mt: 1}}
                            />
                        </Box>

                        <CustomButton
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            fullWidth
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </CustomButton>

                        <CustomButton
                            variant="secondary"
                            onClick={() => navigate('/auth/login')}
                            fullWidth
                        >
                            Back to Login
                        </CustomButton>
                    </Box>
                </AuthCard>
            </Box>
            <Footer/>
        </Box>
    );
}