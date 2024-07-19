import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, List } from 'antd';
import { fetchTopics } from '../service/Service';

interface Topic {
    id: string;
    title: string;
    roomId: string;
}

const Topic: React.FC = () => {
    const { roomTitle } = useParams<{ roomTitle: string }>();
    const navigate = useNavigate();
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const topicsData = await fetchTopics();
                setTopics(topicsData);
            } catch (error) {
                console.error('Error fetching topics:', error);
            }
        };

        fetchData();
    }, []);

    const handleClickTopic = (topicId: string, topicTitle: string) => {
        navigate(`/chat/${topicId}/${encodeURIComponent(topicTitle)}`);
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f0f2f5',
            minHeight: '100vh',
        }}>
            <h2 style={{
                marginBottom: '20px',
                color: '#1890ff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                backgroundColor: '#e6f7ff',
                padding: '10px 20px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'inline-block',
                border: '2px solid #91d5ff'
            }}>¡Aprende, comparte y participa en conversaciones significativas de {decodeURIComponent(roomTitle as string)}!</h2>
            <List
                itemLayout="horizontal"
                dataSource={topics}
                renderItem={(item) => (
                    <List.Item
                        key={item.id}
                        onClick={() => handleClickTopic(item.id, item.title)}
                        style={{
                            cursor: 'pointer',
                            marginBottom: '15px',
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            padding: '20px',
                            transition: 'background-color 0.3s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f7ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />}
                            title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{item.title}</span>}
                            description="Descripción de las discusiones del tema"
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Topic;
