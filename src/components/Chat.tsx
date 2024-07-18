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
import axios from 'axios';
import './Chat.css';

const Chat: React.FC = () => {
    const { topicId, topicTitle } = useParams<{ topicId: string; topicTitle: string }>();
    const { user } = useAuth0();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [participationCount, setParticipationCount] = useState<number>(0);
    const [notParticipatedUsers, setNotParticipatedUsers] = useState<{ firstName: string; lastName: string; email: string }[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

                const userTopic = await fetchUserTopicByUserIdAndTopicId(userId, topicId);
                if (userTopic) {
                    console.log('Se encontró el UserTopic:', userTopic);
                    const messagesForTopic = await fetchMessagesByTopicId(topicId);
                    console.log('Mensajes obtenidos:', messagesForTopic);
                    setMessages(messagesForTopic.map(msg => ({
                        ...msg,
                        sender: msg.sender || user?.name || 'Usuario'
                    })));
                    setParticipationCount(userTopic.participationCount || messagesForTopic.length);
                } else {
                    console.log('No se encontró el UserTopic.');
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
                    setNotParticipatedUsers(users); // Aquí nos aseguramos de pasar el email
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

            console.log('userId:', userId);
            console.log('topicId:', topicId);

            const userTopic = await fetchUserTopicByUserIdAndTopicId(userId, topicId);
            if (userTopic) {
                console.log('Se encontró el UserTopic:', userTopic);
                const userTopicId = userTopic.id;
                const newMessages = [...messages, { id: messages.length + 1, message: newMessageText, sender: user?.name || 'Usuario' }];
                setMessages(newMessages);
                setNewMessageText('');
                setParticipationCount((prevCount) => prevCount + 1);

                const response: SaveMessageResponse = await saveUserMessage(userTopicId, newMessageText);
                const analysisResult = response.analysisResult;

                await incrementUserParticipationCount(userTopicId);

                if (analysisResult && analysisResult.includes('no aporta nada en la discusión')) {
                    setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, message: analysisResult, sender: 'Sistema', isWarning: true }]);
                }

                // Actualizar la lista de usuarios que no han participado
                setNotParticipatedUsers((prevUsers) => prevUsers.filter((user) => user.email !== email));
            } else {
                console.error('No UserTopic found for the current topic');
            }
        } catch (error) {
            console.error('Error saving user message:', error);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.message || 'Error inesperado';
                setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, message: errorMessage, sender: 'Sistema', isWarning: true }]);
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
                <h2 className="chat-title">Chat {decodeURIComponent(topicTitle as string)}</h2>
                <button onClick={handleParticipantsClick} className="participants-button">Participants</button>
            </div>
            <p className="participation-count">Participaciones: {participationCount}</p>
            <div className="messages-container">
                {messages.map((message) => (
                    <div key={message.id} className="message" style={{ textAlign: message.sender === user?.name ? 'right' : 'left' }}>
                        <div className={`message-sender ${message.isWarning ? 'warning-message' : ''}`}>{message.sender}</div>
                        <div className={`message-content ${message.sender === user?.name ? 'message-content-user' : ''}`}>{message.message}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
                <input
                    type="text"
                    value={newMessageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="message-input"
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage} className="send-button">Send</button>
            </div>
            <div className="not-participated-users">
                {notParticipatedUsers.map((user, index) => (
                    <div key={index} className="user-avatar">
                        <Badge dot={Math.floor(participationCount / 10) === index + 1} className="custom-badge">
                            <Avatar shape="square" icon={<UserOutlined />} />
                        </Badge>
                        <div className="user-name">{user.firstName} {user.lastName}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;
