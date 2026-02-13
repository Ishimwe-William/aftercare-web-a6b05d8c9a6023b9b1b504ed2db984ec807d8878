import React, { useState } from "react";
import { Typography } from '@mui/material';
import {CustomButton} from "../../../components/common/CustomButton";
import {CustomDialog} from "../../../components/common/CustomDialog";
import {CustomTextField} from "../../../components/common/CustomTextField";
import {useDispatch} from "react-redux";
import {forgotPassword} from "../authSlice";

export default function ChangePasswordDialog({ showModal, handleCloseModal }) {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        setError("");
        if (!email || !email.includes('@')) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setIsLoading(true);
            await dispatch(forgotPassword(email));
            setSuccess(true);
        } catch (e) {
            setError(e.response?.data?.message || "Failed to send reset link. Please try again.");
        } finally {
            setIsLoading(false);
            setEmail("");
        }
    };

    const handleClose = () => {
        setEmail("");
        setError("");
        setSuccess(false);
        handleCloseModal();
    };

    const handleKeyUp = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    const dialogActions = (
        <>
            {!success && (
                <CustomButton
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    fullWidth
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </CustomButton>
            )}
            <CustomButton
                variant="secondary"
                onClick={handleClose}
                fullWidth
            >
                {success ? 'Close' : 'Cancel'}
            </CustomButton>
        </>
    );

    return (
        <CustomDialog
            open={showModal}
            onClose={handleClose}
            title="Change Password"
            actions={dialogActions}
        >
            {success ? (
                <Typography sx={{ mb: 2, color: '#22c55e', fontSize: '14px' }}>
                    Reset link sent! Check your email for instructions to reset your password.
                </Typography>
            ) : (
                <>
                    <Typography sx={{ mb: 2, color: '#6b7280', fontStyle: 'italic', fontSize: '14px' }}>
                        Enter the email linked to your account. We'll send you a link to reset your password.
                    </Typography>
                    <CustomTextField
                        label="Email"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyUp={handleKeyUp}
                        error={error}
                        autoComplete="email"
                    />
                </>
            )}
        </CustomDialog>
    );
}