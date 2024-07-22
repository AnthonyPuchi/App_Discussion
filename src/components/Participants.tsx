import React, { useState, useEffect } from 'react';
import { List, Avatar } from 'antd';
import { useParams } from 'react-router-dom';
import { fetchParticipantsByTopicId } from '../service/Service';
import './Participants.css';

const Participants: React.FC = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const [participants, setParticipants] = useState<{ name: string; picture: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const loadParticipants = async () => {
            try {
                if (topicId) {
                    const participantsList = await fetchParticipantsByTopicId(topicId);
                    const formattedParticipants = participantsList.map(user => ({
                        name: `${user.firstName} ${user.lastName}`,
                        picture: `https://api.dicebear.com/7.x/miniavs/svg?seed=${user.firstName}${user.lastName}`,
                    }));
                    setParticipants(formattedParticipants);
                }
            } catch (error) {
                console.error('Error fetching participants:', error);
            } finally {
                setLoading(false);
            }
        };

        loadParticipants();
    }, [topicId]);

    return (
        <div className="participants-container">
            <h2 className="participants-title">Participantes</h2>
            <List
                loading={loading}
                itemLayout="horizontal"
                dataSource={participants}
                renderItem={participant => (
                    <List.Item className="participants-list-item">
                        <List.Item.Meta
                            avatar={<Avatar src={participant.picture} />}
                            title={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{participant.name}</span>}
                        />
                    </List.Item>
                )}
            />
        </div>
    );
};

export default Participants;
