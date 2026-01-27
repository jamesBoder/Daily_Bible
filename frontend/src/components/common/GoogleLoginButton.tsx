// GoogleLoginButton

// A button component for Google OAuth login

// features. -Beautiful google-branded button -loading state - error handling - redirects to Google OAuth login URL -dark mode support

// imports

import React, { useState } from 'react';
import { oauthService } from '../../services/api/oauth';
import './GoogleLoginButton.css';

// props
interface GoogleLoginButtonProps {
    mode: 'login' | 'signup' | 'link';
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

// GoogleLoginButton component
const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ mode, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        try {
            const loginUrl = oauthService.getGoogleLoginUrl();
            window.location.href = loginUrl;
            onSuccess && onSuccess();
        } catch (error) {
            onError && onError(error as Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            className={`google-login-button ${loading ? 'loading' : ''}`} 
            onClick={handleClick} 
            disabled={loading}
        >
            {loading ? 'Loading...' : `Continue with Google`}
        </button>
    );
};

export default GoogleLoginButton;