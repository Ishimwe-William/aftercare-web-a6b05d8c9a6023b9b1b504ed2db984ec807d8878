import {Box} from "@mui/material";
import React from "react";
import {useNavigate} from "react-router-dom";
import {AuthForm} from "./components/AuthForm";
import Footer from "../../components/layout/Footer";

export const SignInPage = () => {
    const navigate = useNavigate();
    return (
        <Box>
            <AuthForm onNavigateToSignUp={() => navigate('/register')}/>
            <Footer/>
        </Box>
    )
}