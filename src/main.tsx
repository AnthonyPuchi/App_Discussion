import React from 'react'
import ReactDOM from 'react-dom/client'
//import App from './App.tsx'
import './index.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Login from "./components/Login.tsx";
import Room from "./components/Room.tsx";
import Topic from "./components/Topic.tsx";
import Participants from "./components/Participants.tsx";
import Chat from "./components/Chat.tsx";
import {Auth0Provider} from "@auth0/auth0-react";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Auth0Provider
            domain="dev-npbw8xft88hxcb3x.us.auth0.com"
            clientId="Na2wl1qLSTnredsDYATQb09fVSilgWbM"
            authorizationParams={{
                redirect_uri: `https://app-discussion.vercel.app//login`
            }}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/room" element={<Room />} />
                    <Route path="/topic/:roomId/:roomTitle" element={<Topic />} />
                    <Route path="/chat/:topicId/:topicTitle" element={<Chat />} />
                    <Route path="/participants/:topicId" element={<Participants />} />
                </Routes>
            </BrowserRouter>
        </Auth0Provider>
    </React.StrictMode>,
);
