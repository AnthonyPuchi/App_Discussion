import React, { useState, useEffect } from 'react';
import { Row, Col, Avatar, Spin } from 'antd';
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
        <div className="participants-page">
            <div className="participants-container">
                <h2 className="participants-title">Participantes</h2>
                {loading ? (
                    <Spin size="large" />
                ) : (
                    <div className="participants-list">
                        <Row gutter={[16, 16]}>
                            {participants.map((participant, index) => (
                                <Col key={index} xs={24} sm={12} md={6}>
                                    <div className="participant-card">
                                        <Avatar src={participant.picture} size={64} />
                                        <div className="participant-name">{participant.name}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Participants;
