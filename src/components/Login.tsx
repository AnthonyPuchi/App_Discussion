import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Button } from 'antd';
import 'antd/dist/reset.css';
import { useNavigate } from 'react-router-dom';
import debateLogin from '../assets/debateLogin.jpg';

const Login: React.FC = () => {
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const handleLogin = () => {
        loginWithRedirect();
    };

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/room');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f0f2f5',
            backgroundImage: `url(${debateLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '60vh',
                width: '300px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '15px',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
                padding: '20px'
            }}>
                <h2 style={{marginBottom: '20px', color: "#333", fontFamily: 'Arial, sans-serif', textAlign: "center"}}>¡Bienvenido al espacio donde tus ideas son escuchadas!</h2>
                <Button
                    style={{
                        height: '40px',
                        width: '100%',
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '16px'
                    }}
                    type="primary"
                    onClick={handleLogin}
                >
                    Iniciar Sesión
                </Button>
                <div style={{marginTop: '20px', textAlign: 'center'}}>
                    <p style={{color: '#666', fontSize: '14px'}}>¡Unete a la conversación y Atrévete a desafiar tus pensamientos y defender tus argumentos!</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
