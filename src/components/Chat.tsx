import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
    fetchUserTopicByUserIdAndTopicId,
    saveUserMessage,
    incrementUserParticipationCount,
    fetchUserIdByEmail,
    fetchNotParticipatedUsers,
    fetchMessagesByTopicId,
    SaveMessageResponse,
    Message
} from '../service/Service';
import io from 'socket.io-client';
import './Chat.css';
import axios from "axios";

const socket = io('http://localhost:8000');

const Chat: React.FC = () => {
    const { topicId, topicTitle } = useParams<{ topicId: string; topicTitle: string }>();
    const { user } = useAuth0();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [participationCount, setParticipationCount] = useState<number>(0);
    const [notParticipatedUsers, setNotParticipatedUsers] = useState<{ firstName: string; lastName: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const formatName = (fullName: string): string => {
        const names = fullName.split(' ');
        if (names.length >= 2) {
            const firstName = names[0].charAt(0).toUpperCase() + names[0].slice(1).toLowerCase();
            const lastName = names[names.length - 2].charAt(0).toUpperCase() + names[names.length - 2].slice(1).toLowerCase();
            return `${firstName} ${lastName}`;
        }
        return fullName.charAt(0).toUpperCase() + fullName.slice(1).toLowerCase();
    };

    useEffect(() => {
        const loadMessagesAndResetCount = async () => {
            try {
                if (!user || !topicId) return;

                const email = user.email;
                if (!email) {
                    console.error('User email is not available');
                    return;
                }

                const userId = await fetchUserIdByEmail(email);
                if (!userId) {
                    console.error('User ID not found for email:', email);
                    return;
                }

                try {
                    const userTopic = await fetchUserTopicByUserIdAndTopicId(userId, topicId);
                    console.log('Se encontró el UserTopic:', userTopic);
                    const messagesForTopic = await fetchMessagesByTopicId(topicId);
                    console.log('Mensajes obtenidos:', messagesForTopic);

                    const updatedMessages = messagesForTopic.map(message => ({
                        ...message,
                        sender: message.sender || 'Desconocido'
                    }));

                    setMessages(updatedMessages);
                    setParticipationCount(updatedMessages.length);
                } catch (error) {
                    console.error('Error loading messages:', error);
                    setMessages([]);
                    setParticipationCount(0);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessagesAndResetCount();
    }, [user, topicId]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                if (topicId) {
                    const users = await fetchNotParticipatedUsers(topicId);
                    setNotParticipatedUsers(users);
                }
            } catch (error) {
                console.error('Error fetching users who have not participated:', error);
            }
        };

        fetchUsers();
    }, [topicId]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const handleMessage = (newMessage: Message) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };

        socket.on('newMessage', handleMessage);

        return () => {
            socket.off('newMessage', handleMessage);
        };
    }, []);

    const sendMessage = async () => {
        if (newMessageText.trim() === '') {
            return;
        }

        try {
            const email = user?.email;
            if (!email) {
                console.error('User email is not available');
                return;
            }

            const userId = await fetchUserIdByEmail(email);
            if (!userId) {
                console.error('User ID not found for email:', email);
                return;
            }

            const fullName = user?.name || 'Usuario';
            const formattedName = formatName(fullName);

            try {
                const userTopic = await fetchUserTopicByUserIdAndTopicId(userId, topicId);
                console.log('Se encontró el UserTopic:', userTopic);
                const userTopicId = userTopic.id;
                const newMessage: Message = { id: Date.now().toString(), message: newMessageText, sender: formattedName };
                setNewMessageText('');
                setParticipationCount((prevCount) => prevCount + 1);

                socket.emit('sendMessage', newMessage);

                const response: SaveMessageResponse = await saveUserMessage(userTopicId, newMessageText);
                const analysisResult = response.analysisResult;

                await incrementUserParticipationCount(userTopicId);

                if (analysisResult && analysisResult.includes('no aporta nada en la discusión')) {
                    const warningMessage: Message = { id: (Date.now() + 1).toString(), message: analysisResult, sender: 'Sistema', isWarning: true };
                    setMessages((prevMessages) => [...prevMessages, warningMessage]);
                }
            } catch (error) {
                console.error('Error saving user message:', error);
                if (axios.isAxiosError(error) && error.response) {
                    const errorMessage = error.response.data.message || 'Error inesperado';
                    const systemMessage: Message = { id: (Date.now() + 1).toString(), message: errorMessage, sender: 'Sistema', isWarning: true };
                    setMessages((prevMessages) => [...prevMessages, systemMessage]);
                } else {
                    const systemMessage: Message = { id: (Date.now() + 1).toString(), message: 'Error: UserTopic not found', sender: 'Sistema', isWarning: true };
                    setMessages((prevMessages) => [...prevMessages, systemMessage]);
                }
            }
        } catch (error) {
            console.error('Error saving user message:', error);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.message || 'Error inesperado';
                const systemMessage: Message = { id: (Date.now() + 1).toString(), message: errorMessage, sender: 'Sistema', isWarning: true };
                setMessages((prevMessages) => [...prevMessages, systemMessage]);
            }
        }
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessageText(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    const handleParticipantsClick = () => {
        navigate('/participants');
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>¡Comparte tus ideas y participa en la conversación de {decodeURIComponent(topicTitle as string)}!</h2>
                <button onClick={handleParticipantsClick} className="participants-button">Participants</button>
            </div>
            <div className="participation-count">
                <p>Participaciones: {participationCount}</p>
            </div>

            <div className="chat-messages">
                {messages.map((message, index) => (
                    <div key={index} className={`chat-message ${message.sender === formatName(user?.name || '') ? 'chat-message-sent' : 'chat-message-received'}`}>
                        <div className="chat-message-sender">{message.sender}</div>
                        <div className={`chat-message-content ${message.isWarning ? 'chat-message-warning' : ''}`}>
                            {message.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-container">
                <input
                    type="text"
                    value={newMessageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="chat-input"
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage} className="chat-send-button">Send</button>
            </div>
            <div className="not-participated-users">
                {notParticipatedUsers.map((user, index) => (
                    <div key={index} className="not-participated-user">
                        <Badge dot={Math.floor(participationCount / 10) === index + 1}>
                            <Avatar shape="square" icon={<UserOutlined />} />
                        </Badge>
                        <div>{user.firstName} {user.lastName}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;
