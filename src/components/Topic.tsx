import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Avatar, List } from 'antd';

const data = [
    { id: '1', title: 'Topic Title 1' },
    { id: '2', title: 'Topic Title 2' },
    { id: '3', title: 'Topic Title 3' },
    { id: '4', title: 'Topic Title 4' },
];

const Topic: React.FC = () => {
    const { roomTitle } = useParams<{ roomTitle: string }>();

    const handleItemClick = (topicId: string) => {
        // Aquí puedes realizar alguna acción antes de redirigir, si es necesario
        console.log(`Clic en el tema con ID ${topicId}`);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Bienvenido a {decodeURIComponent(roomTitle as string)}</h2>
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item) => (
                    <List.Item key={item.id}>
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.id}`} />}
                            title={<Link to={`/chat/${item.id}`} onClick={() => handleItemClick(item.id)}>{item.title}</Link>}
                            description="Descripción de las discusiones del tema"
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Topic;
