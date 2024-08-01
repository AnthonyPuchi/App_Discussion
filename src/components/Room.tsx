import React, { useEffect, useState } from 'react';
import { Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import { fetchRooms } from '../service/Service';
import './Room.css';
import LogoutButton from "./LogoutButton.tsx";

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
            <Row gutter={[16, 16]}>
                {roomsData.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={6}>
                        <div
                            className="room-card"
                            onClick={() => handleClickRoom(item.id, item.title)}
                        >
                            <div className="room-title">{item.title}</div>
                            <div className="room-description">{item.description}</div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Room;
