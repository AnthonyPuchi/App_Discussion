import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserTopicByUserIdAndTopicId, saveUserMessage, incrementUserParticipationCount, fetchUserIdByEmail, fetchNotParticipatedUsers } from '../service/Service';

interface Message {
    id: number;
    text: string;
    sender: string;
}

const Chat: React.FC = () => {
    const { user } = useAuth0();
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [participationCount, setParticipationCount] = useState<number>(0);
    const [notParticipatedUsers, setNotParticipatedUsers] = useState<{ firstName: string; lastName: string }[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0); // Estado para mantener el índice del usuario actual

    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadMessagesAndResetCount = async () => {
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

                const userTopic = await fetchUserTopicByUserIdAndTopicId(userId, topicId);
                if (userTopic) {
                    console.log('Se encontró el UserTopic:', userTopic);
                    const messagesForTopic = userTopic.messages || [];
                    setMessages(messagesForTopic);
                    setParticipationCount(0); // Reinicia el contador de participaciones
                } else {
                    console.log('No se encontró el UserTopic.');
                    setMessages([]);
                    setParticipationCount(0); // Asegura que el contador se reinicie incluso si no hay mensajes
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
                    setCurrentIndex(0); // Reinicia el índice al cargar nuevos usuarios no participantes
                }
            } catch (error) {
                console.error('Error fetching users who have not participated:', error);
            }
        };

        fetchUsers();
    }, [topicId]);

    useEffect(() => {
        const checkParticipationCount = async () => {
            if (participationCount > 0 && participationCount % 10 === 0) {
                try {
                    const users = await fetchNotParticipatedUsers(topicId);
                    setNotParticipatedUsers(users);
                    // No actualizamos currentIndex aquí para mantener al usuario actual hasta el siguiente cambio
                } catch (error) {
                    console.error('Error fetching users who have not participated:', error);
                }
            }
        };

        checkParticipationCount();
    }, [participationCount, topicId]);

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
                await saveUserMessage(userTopicId, newMessageText);
                await incrementUserParticipationCount(userTopicId);
                setMessages([...messages, { id: messages.length + 1, text: newMessageText, sender: user?.name || 'Usuario' }]);
                setNewMessageText('');
                setParticipationCount((prevCount) => prevCount + 1);

                // Verificar si se han alcanzado las 10 participaciones para cambiar el usuario no participante
                if ((participationCount + 1) % 10 === 0 && notParticipatedUsers.length > 0) {
                    setCurrentIndex((prevIndex) => (prevIndex + 1) % notParticipatedUsers.length);
                }
            } else {
                console.error('No UserTopic found for the current topic');
            }
        } catch (error) {
            console.error('Error saving user message:', error);
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
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h2 style={{color: "#000"}}>Chat</h2>
                <div>
                    {notParticipatedUsers.length > 0 && (
                        <div style={{marginBottom: '10px'}}>
                            <label style={{color: '#000'}}>Usuarios que no han participado:</label>
                            <ul>
                                <li style={{color: '#000'}}>{notParticipatedUsers[currentIndex].firstName} {notParticipatedUsers[currentIndex].lastName}</li>
                            </ul>
                        </div>
                    )}

                </div>
                <button onClick={handleParticipantsClick} style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    backgroundColor: '#646cff',
                    color: '#fff',
                    border: 'none'
                }}>Participants
                </button>
            </div>
            <p style={{color: "#000"}}>Participaciones: {participationCount}</p>
            <div style={{
                flex: 1,
                maxHeight: 'calc(80vh - 100px)',
                overflowY: 'scroll',
                border: '1px solid #ccc', padding: '10px', marginBottom: '10px', background: '#fff'
            }}>
                {messages.map((message) => (
                    <div key={message.id}
                         style={{marginBottom: '10px', textAlign: message.sender === user?.name ? 'right' : 'left'}}>
                        <div style={{marginBottom: '5px', color: '#000'}}>{message.sender}</div>
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
        </div>
    );
};

export default Chat;
