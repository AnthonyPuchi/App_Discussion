import React from 'react';
import { Link } from 'react-router-dom';

const App: React.FC = () => {
    return (
        <div>
            <h1>My Forum App</h1>
            <nav>
                <ul>
                    <li><Link to="/login">Login</Link></li>
                    <li><Link to="/room">Room</Link></li>
                    <li><Link to="/topic">Topic</Link></li>
                    <li><Link to="/chat">Chat</Link></li>
                    <li><Link to="/participants">Participants</Link></li>
                </ul>
            </nav>
        </div>
    );
};

export default App;
