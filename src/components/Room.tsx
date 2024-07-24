import React, { useEffect, useState } from 'react';
import { Avatar, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../service/Service';

interface Room {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
}

const Room: React.FC = () => {
    const navigate = useNavigate();
    const [roomsData, setRoomsData] = useState<Room[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rooms = await fetchRooms();
                setRoomsData(rooms);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            }
        };

        fetchData();
    }, []);

    const handleClickRoom = (roomId: string, roomTitle: string) => {
        navigate(`/topic/${roomId}/${encodeURIComponent(roomTitle)}`);
    };

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#f0f2f5',
            minHeight: '100vh',
        }}>
            <h2 style={{
                marginBottom: '10px',
                color: '#1890ff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center'
            }}>Instituto Sudamericano</h2>
            <h2 style={{
                marginBottom: '20px',
                color: '#1890ff',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                backgroundColor: '#e6f7ff',
                padding: '10px 20px',
                borderRadius: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'inline-block',
                border: '2px solid #91d5ff'
            }}>Rooms: ¡Tu sala te espera!</h2>
            <List
                itemLayout="horizontal"
                dataSource={roomsData}
                renderItem={(item, index) => (
                    <List.Item
                        onClick={() => handleClickRoom(item.id, item.title)}
                        style={{
                            cursor: 'pointer',
                            marginBottom: '15px',
                            backgroundColor: '#fff',
                            borderRadius: '10px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                            padding: '20px',
                        }}
                    >
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                            title={<a style={{ color: '#1890ff', fontWeight: 'bold' }}>{item.title}</a>}
                            description={<span style={{ color: '#555' }}>{item.description}</span>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Room;
