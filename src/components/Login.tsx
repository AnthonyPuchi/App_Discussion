import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'antd';
import 'antd/dist/reset.css';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const handleLogin = () => {
        loginWithRedirect();
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/room'); // Redirige a /room cuando el usuario esté autenticado
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f2f5' // Fondo claro para contraste
        }}>
            <h2 style={{marginBottom: '20px', color: "#000"}}>Bienvenido</h2>
            <Button
                style={{
                    height: '40px',
                    backgroundColor: '#fa541c',
                    borderColor: '#FFA216',
                }}
                type="primary"
                onClick={handleLogin}
            >
                Log In
            </Button>
        </div>

    );
};

export default Login;
