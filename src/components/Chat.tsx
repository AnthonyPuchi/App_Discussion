import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Badge } from 'antd';
import { UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
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
import LogoutButton from './LogoutButton';
import axios from "axios";

const socket = io('http://localhost:3001', {
    withCredentials: true,
});

const Chat: React.FC = () => {
    const { topicId, topicTitle } = useParams<{ topicId: string; topicTitle: string }>();
    const { user } = useAuth0();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [participationCount, setParticipationCount] = useState<number>(0);
    const [totalParticipationCount, setTotalParticipationCount] = useState<number>(0);
    const [notParticipatedUsers, setNotParticipatedUsers] = useState<{ firstName: string; lastName: string }[]>(() => {
        const savedUsers = localStorage.getItem('notParticipatedUsers');
        return savedUsers ? JSON.parse(savedUsers) : [];
    });
    const [highlightedUserIndex, setHighlightedUserIndex] = useState<number | null>(null);
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
                    return;
                }

                const userId = await fetchUserIdByEmail(email);
                if (!userId) {
                    console.error('User ID not found for email:', email);
                    return;
                }

                try {
                    const userTopic = await fetchUserTopicByUserIdAndTopicId(userId, topicId);
                    const messagesForTopic = await fetchMessagesByTopicId(topicId);

                    const updatedMessages = messagesForTopic.map(message => ({
                        ...message,
                        sender: message.sender || 'Desconocido'
                    }));

                    setMessages(updatedMessages);
                    setParticipationCount(userTopic.participationCount || 0);
                    setTotalParticipationCount(updatedMessages.length);

                    if (updatedMessages.length % 5 === 0) {
                        setHighlightedUserIndex(0);
                    } else {
                        setHighlightedUserIndex(null);
                    }
                } catch (error) {
                    console.error('Error loading messages:', error);
                    setMessages([]);
                    setParticipationCount(0);
                    setTotalParticipationCount(0);
                    setHighlightedUserIndex(null);
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
                    localStorage.setItem('notParticipatedUsers', JSON.stringify(users));
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
            setTotalParticipationCount((prevCount) => prevCount + 1);

            setNotParticipatedUsers((prevUsers) => {
                const updatedUsers = [...prevUsers];
                if (updatedUsers.length > 0 && newMessage.sender === `${updatedUsers[0].firstName} ${updatedUsers[0].lastName}`) {
                    const movedUser = updatedUsers.shift();
                    if (movedUser) {
                        updatedUsers.push(movedUser);
                    }
                }
                localStorage.setItem('notParticipatedUsers', JSON.stringify(updatedUsers));
                return updatedUsers;
            });

            if ((messages.length + 1) % 5 === 0) {
                setHighlightedUserIndex(0);
            } else {
                setHighlightedUserIndex(null);
            }
        };

        socket.on('newMessage', handleMessage);

        return () => {
            socket.off('newMessage', handleMessage);
        };
    }, [messages]);

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
                const userTopicId = userTopic.id;
                const newMessage: Message = { id: Date.now().toString(), message: newMessageText, sender: formattedName };
                setNewMessageText('');
                setParticipationCount((prevCount) => prevCount + 1);

                socket.emit('sendMessage', newMessage);

                const response: SaveMessageResponse = await saveUserMessage(userTopicId, newMessageText);
                const analysisFeedback = response.analysisFeedback;

                await incrementUserParticipationCount(userTopicId);

                if (analysisFeedback && (analysisFeedback.includes('no está aportando nada nuevo a la discusión') || analysisFeedback.includes('está fuera del contexto del debate'))) {
                    const systemMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        message: analysisFeedback,
                        sender: 'Sistema',
                        isWarning: true
                    };
                    setMessages((prevMessages) => [...prevMessages, systemMessage]);
                }

                if (highlightedUserIndex !== null) {
                    setNotParticipatedUsers((prevUsers) => {
                        const updatedUsers = [...prevUsers];
                        const movedUser = updatedUsers.shift();
                        if (movedUser) {
                            updatedUsers.push(movedUser);
                        }
                        localStorage.setItem('notParticipatedUsers', JSON.stringify(updatedUsers));
                        return updatedUsers;
                    });
                    setHighlightedUserIndex(null);
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

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessageText(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="chat-container">
            <ArrowLeftOutlined onClick={handleGoBack} className="back-button-icon" />
            <LogoutButton className="logout-button" />
            <div className="users-list">
                <h3 className="badge-title">Usuarios por participar</h3>
                <div className="not-participated-users">
                    {notParticipatedUsers
                        .filter((user) => user.firstName !== 'Sistema')
                        .map((user, index) => (
                            <div key={index} className="not-participated-user">
                                <Badge count={index === highlightedUserIndex ? 'participa' : 0} showZero={false}>
                                    <div className="user-avatar">
                                        <Avatar shape="square" icon={<UserOutlined />} />
                                    </div>
                                </Badge>
                                <div className="user-name">{user.firstName} {user.lastName}</div>
                            </div>
                        ))}
                </div>
            </div>
            <div className="chat-content">
                <div className="chat-header">
                    <h2 >¡Comparte tus ideas en la conversación de {decodeURIComponent(topicTitle as string)}!</h2>
                </div>
                <div className="participation-count">
                    <p>Participaciones de {formatName(user?.name || '')}: {participationCount}</p>
                    <p>Participaciones totales: {totalParticipationCount}</p>
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
                    <textarea
                        value={newMessageText}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        className="chat-input"
                        placeholder="Type your message..."
                    />
                    <button onClick={sendMessage} className="chat-send-button">Enviar</button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
