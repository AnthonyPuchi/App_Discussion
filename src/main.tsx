import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Room from './components/Room';
import Topic from './components/Topic';
import Participants from './components/Participants';
import Chat from './components/Chat';
import { Auth0Provider } from '@auth0/auth0-react';
import ProtectedRoute from '../src/components/ProtectedRoute';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Auth0Provider
            domain="dev-npbw8xft88hxcb3x.us.auth0.com"
            clientId="Na2wl1qLSTnredsDYATQb09fVSilgWbM"
            authorizationParams={{
                redirect_uri: `${window.location.origin}/login`
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/room" element={<ProtectedRoute element={<Room />} />} />
                    <Route path="/topic/:roomId/:roomTitle" element={<ProtectedRoute element={<Topic />} />} />
                    <Route path="/chat/:topicId/:topicTitle" element={<ProtectedRoute element={<Chat />} />} />
                    <Route path="/participants/:topicId" element={<ProtectedRoute element={<Participants />} />} />
                </Routes>
            </BrowserRouter>
        </Auth0Provider>
    </React.StrictMode>,
);
