import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { List, Avatar } from 'antd';

const Participants: React.FC = () => {
    const { user } = useAuth0();

    const participants = [
        {
            name: user?.name || 'Usuario',
            picture: user?.picture || `https://api.dicebear.com/7.x/miniavs/svg?seed=${user?.name || 'Usuario'}`,
        },
    ];

    return (
        <div style={{ padding: '20px', maxWidth: '600px' }}>
            <h2 style={{ marginBottom: '20px', color: "#000" }}>Participantes</h2>
            <List
                itemLayout="horizontal"
                dataSource={participants}
                renderItem={participant => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={participant.picture} />}
                            title={<span>{participant.name}</span>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Participants;
