import React, { useEffect, useState } from 'react';
import { List, Avatar } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../service/Service';
import './Room.css';
import LogoutButton from "./LogoutButton";

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
        <div className="room-page">
            <LogoutButton className="logout-button" />
            <h2 className="main-title">Instituto Tecnológico Sudamericano</h2>
            <h2 className="sub-title">Rooms: ¡Tu sala te espera!</h2>
            <List
                itemLayout="horizontal"
                dataSource={roomsData}
                renderItem={(item, index) => (
                    <List.Item onClick={() => handleClickRoom(item.id, item.title)}>
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                            title={<a>{item.title}</a>}
                            description={item.description}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Room;
