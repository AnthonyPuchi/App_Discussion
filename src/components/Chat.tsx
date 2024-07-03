import React, { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchUserTopicByUserIdAndTopicId, saveUserMessage, updateUserParticipationCount, getUserParticipationCount, fetchUserIdByEmail } from '../service/Service';

interface Message {
    id: number;
    text: string;
    sender: string;
}

const Chat: React.FC = () => {
    const { user } = useAuth0();
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMessages = localStorage.getItem('messages');
        return savedMessages ? JSON.parse(savedMessages) : [];
    });
    const [newMessageText, setNewMessageText] = useState<string>('');
    const [participationCount, setParticipationCount] = useState<number>(0);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const count = getUserParticipationCount(user?.name || 'Usuario');
        setParticipationCount(count);
    }, [user]);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('messages', JSON.stringify(messages));
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
                console.log('Se encontró el UserTopic.');
            } else {
                console.log('No se encontró el UserTopic.');
            }

            const userTopicId = userTopic ? userTopic.id : null;
            console.log('userTopicId:', userTopicId);

            if (userTopicId) {
                await saveUserMessage(userTopicId, newMessageText);
                setMessages([...messages, { id: messages.length + 1, text: newMessageText, sender: user?.name || 'Usuario' }]);
                setNewMessageText('');
                updateUserParticipationCount(user?.name || 'Usuario');
                setParticipationCount((prevCount) => prevCount + 1);
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ color: "#000" }}>Chat</h2>
                <button onClick={handleParticipantsClick} style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#646cff', color: '#fff', border: 'none' }}>Participants</button>
            </div>
            <p style={{ color: "#000" }}>Participaciones: {participationCount}</p>
            <div style={{ flex: 1, maxHeight: 'calc(80vh - 100px)', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', background: '#fff' }}>
                {messages.map((message) => (
                    <div key={message.id} style={{ marginBottom: '10px', textAlign: message.sender === user?.name ? 'right' : 'left' }}>
                        <div style={{ marginBottom: '5px', color: '#000' }}>{message.sender}</div>
                        <div style={{ backgroundColor: message.sender === 'Usuario' ? '#f0f0f0' : '#e6e6e6', color: '#000', padding: '8px 12px', borderRadius: '8px', maxWidth: '70%', wordWrap: 'break-word', display: 'inline-block', marginLeft: message.sender === 'Usuario' ? 'auto' : '0', marginRight: message.sender === 'Usuario' ? '0' : 'auto' }}>
                            {message.text}
                        </div>
                    </div>
                ))}
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
            <div ref={messagesEndRef} />
        </div>
    );
};

export default Chat;
