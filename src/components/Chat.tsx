import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Avatar, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserTopicByUserIdAndTopicId, saveUserMessage, incrementUserParticipationCount, fetchUserIdByEmail, fetchNotParticipatedUsers, fetchMessagesByTopicId, SaveMessageResponse } from '../service/Service';
import axios from 'axios';

interface Message {
    id: number;
    text: string;
    sender: string;
    isWarning?: boolean;
}

const Chat: React.FC = () => {
    const { user } = useAuth0();
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [participationCount, setParticipationCount] = useState<number>(0);
    const [notParticipatedUsers, setNotParticipatedUsers] = useState<{ firstName: string; lastName: string }[]>([]);
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

                    const mappedMessages = messagesForTopic.map((msg) => ({
                        id: msg.id,
                        text: msg.message,
                        sender: user?.name || 'Usuario' // Suponiendo que quieres usar el nombre del usuario autenticado
                    }));

                    setMessages(mappedMessages);
                    setParticipationCount(userTopic.participationCount || 0);
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
                const newMessages = [...messages, { id: messages.length + 1, text: newMessageText, sender: user?.name || 'Usuario' }];
                setMessages(newMessages);
                setNewMessageText('');
                setParticipationCount((prevCount) => prevCount + 1);

                const response: SaveMessageResponse = await saveUserMessage(userTopicId, newMessageText);
                const analysisResult = response.analysisResult;

                await incrementUserParticipationCount(userTopicId);

                if (analysisResult && analysisResult.includes('no aporta nada en la discusión')) {
                    setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, text: analysisResult, sender: 'Sistema', isWarning: true }]);
                }
            } else {
                console.error('No UserTopic found for the current topic');
            }
        } catch (error) {
            console.error('Error saving user message:', error);
            if (axios.isAxiosError(error) && error.response) {
                const errorMessage = error.response.data.message || 'Error inesperado';
                setMessages((prevMessages) => [...prevMessages, { id: prevMessages.length + 1, text: errorMessage, sender: 'Sistema', isWarning: true }]);
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
        <div style={{ padding: '20px', margin: 'auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: "#000" }}>Chat</h2>
                <button onClick={handleParticipantsClick} style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#646cff',
                    color: '#fff',
                    border: 'none'
                }}>Participants
                </button>
            </div>
            <p style={{ color: "#000" }}>Participaciones: {participationCount}</p>
            <div style={{
                flex: 1,
                maxHeight: 'calc(80vh - 100px)',
                overflowY: 'scroll',
                border: '1px solid #ccc', padding: '10px', marginBottom: '10px', background: '#fff'
            }}>
                {messages.map((message) => (
                    <div key={message.id}
                         style={{ marginBottom: '10px', textAlign: message.sender === user?.name ? 'right' : 'left' }}>
                        <div style={{ marginBottom: '5px', color: message.isWarning ? 'red' : '#000' }}>{message.sender}</div>
                        <div style={{ backgroundColor: message.sender === 'Usuario' ? '#f0f0f0' : '#e6e6e6', color: '#000', padding: '8px 12px', borderRadius: '8px', maxWidth: '70%', wordWrap: 'break-word', display: 'inline-block', marginLeft: message.sender === 'Usuario' ? 'auto' : '0', marginRight: message.sender === 'Usuario' ? '0' : 'auto' }}>
                            {message.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', marginBottom: '10px' }}>
                <input
                    type="text"
                    value={newMessageText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    style={{ flex: 1, marginRight: '10px', borderRadius: '20px', padding: '12px', border: '1px solid #ccc', fontSize: '16px', background: "#fff", color: "#000" }}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage} style={{ height: '40px', borderRadius: '20px', fontSize: '16px', background: "#646cff", alignItems: "center", justifyContent: "center", display: "flex" }}>Send</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                {notParticipatedUsers.map((user, index) => (
                    <div key={index} style={{ textAlign: 'center', marginRight: '20px' }}>
                        <Badge dot={Math.floor(participationCount / 10) === index + 1}>
                            <Avatar shape="square" icon={<UserOutlined />} />
                        </Badge>
                        <div style={{ color: '#000', marginTop: '5px' }}>
                            {user.firstName} {user.lastName}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Chat;
