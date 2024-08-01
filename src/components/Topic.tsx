import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col } from 'antd';
import { fetchTopics } from '../service/Service';
import './Topic.css';
import LogoutButton from './LogoutButton';
import {ArrowLeftOutlined} from "@ant-design/icons"; // Importa el componente de cierre de sesión

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

    const handleGoBack = () => {
        navigate(-1);  // Esto navegará a la pantalla anterior en el historial de navegación
    };

    return (
        <div className="topic-page">
            <ArrowLeftOutlined onClick={handleGoBack} className="back-button-icon" />
            <LogoutButton className="logout-button"/>
            <h2 className="main-title">Instituto Tecnológico Sudamericano</h2>
            <h2 className="topic-title">
                ¡Únete a las conversaciones de {decodeURIComponent(roomTitle as string)}!
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
