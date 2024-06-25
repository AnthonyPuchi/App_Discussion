import React, { useState, useRef, useEffect } from 'react';

interface Message {
    id: number;
    text: string;
    sender: string;
}

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: 'Hola! ¿Cómo estás?', sender: 'Usuario' },
        { id: 2, text: '¡Hola! Bien, gracias.', sender: 'Otro Usuario' },
        { id: 3, text: '¿Qué tal tu día?', sender: 'Usuario' },
    ]);

    const [newMessageText, setNewMessageText] = useState<string>('');

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () => {
        if (newMessageText.trim() === '') {
            return;
        }

        const newMessage: Message = {
            id: messages.length + 1,
            text: newMessageText,
            sender: 'Usuario',
        };

        setMessages([...messages, newMessage]);
        setNewMessageText('');
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessageText(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div style={{ padding: '20px', margin: 'auto', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h2>Chat</h2>
            <div style={{ flex: 1, maxHeight: 'calc(80vh - 100px)', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', marginBottom: '10px', background: '#fff' }}>
                {messages.map((message) => (
                    <div key={message.id} style={{ marginBottom: '10px', textAlign: message.sender === 'Usuario' ? 'right' : 'left' }}>
                        <div style={{ marginBottom: '5px', color: '#000' }}>{message.sender}</div>
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
                    style={{ flex: 1, marginRight: '10px', borderRadius: '20px', padding: '12px', border: '1px solid #ccc', fontSize: '16px' }}
                    placeholder="Type your message..."
                />
                <button onClick={sendMessage} style={{ height: '40px', borderRadius: '20px', fontSize: '16px' }}>Send</button>
            </div>
        </div>
    );
};

export default Chat;
