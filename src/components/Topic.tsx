import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, List } from 'antd';
import { fetchTopics } from '../service/Service';

interface Topic {
    id: string;
    title: string;
    roomId: string;
}

const Topic: React.FC = () => {
    const { roomTitle } = useParams<{ roomTitle: string }>();
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

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px', color:"#000" }}>Bienvenido a {decodeURIComponent(roomTitle as string)}</h2>
            <List
                itemLayout="horizontal"
                dataSource={topics}
                renderItem={(item) => (
                    <List.Item key={item.id}>
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />}
                            title={<Link to={`/chat/${item.id}/${encodeURIComponent(item.title)}`}>{item.title}</Link>}
                            description="Descripción de las discusiones del tema"
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Topic;
