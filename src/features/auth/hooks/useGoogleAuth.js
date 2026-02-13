import { useGoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { signInWithGoogle } from '../authSlice';

export const useGoogleAuth = () => {
    const dispatch = useDispatch();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                await dispatch(signInWithGoogle(tokenResponse)).unwrap();
            } catch (error) {
                console.error('Google sign in failed:', error);
            }
        },
        onError: (error) => {
            console.error('Google OAuth failed:', error);
        },
        flow: 'auth-code',
        scope: 'openid email profile',
    });

    return {
        request: null,
        promptAsync: login
    };
};