import React, { useEffect, useState } from 'react';
import { Avatar, List } from 'antd';
import { useNavigate } from 'react-router-dom';

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
        const fetchRooms = async () => {
            const data: Room[] = [
                { id: '1', title: 'Room Title 1', description: 'Description for Room 1', isActive: true },
                { id: '2', title: 'Room Title 2', description: 'Description for Room 2', isActive: true },
                { id: '3', title: 'Room Title 3', description: 'Description for Room 3', isActive: false },
                { id: '4', title: 'Room Title 4', description: 'Description for Room 4', isActive: true },
            ];
            setRoomsData(data);
        };

        fetchRooms();
    }, []);

    const handleClickRoom = (roomId: string, roomTitle: string) => {
        navigate(`/topic/${roomId}/${encodeURIComponent(roomTitle)}`);
    };

    return (
        <div style={{padding: '20px'}}>
            <h2 style={{marginBottom: '20px', color: "#fff"}}>Bienvenido a Rooms</h2>
            <List
                itemLayout="horizontal"
                dataSource={roomsData}
                renderItem={(item, index) => (
                    <List.Item onClick={() => handleClickRoom(item.id, item.title)} style={{cursor: 'pointer'}}>
                        <List.Item.Meta
                            avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`}/>}
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
