import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col } from 'antd';
import { fetchTopics } from '../service/Service';
import './Topic.css';

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
        <div className="topic-page">
            <h2 className="topic-title">
                ¡Aprende, comparte y participa en conversaciones significativas de {decodeURIComponent(roomTitle as string)}!
            </h2>
            <Row gutter={[16, 16]}>
                {topics.map((item) => (
                    <Col key={item.id} xs={24} sm={12} md={6}>
                        <div
                            className="topic-card"
                            onClick={() => handleClickTopic(item.id, item.title)}
                        >
                            <div className="topic-title">{item.title}</div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Topic;
