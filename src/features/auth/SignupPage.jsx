import {Box} from "@mui/material";
import React from "react";
import {useNavigate} from "react-router-dom";
import {AuthForm} from "./components/AuthForm";
import Footer from "../../components/layout/Footer";

export const SignupPage = () => {
    const navigate = useNavigate();
    return (
        <Box>
            <AuthForm isSignUp={true} onNavigateToSignIn={() => navigate('/login')}/>
            <Footer/>
        </Box>
    )
}