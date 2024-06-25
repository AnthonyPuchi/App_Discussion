import axios from 'axios';

interface Room {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
}

interface Topic {
    id: string;
    title: string;
    roomId: string;
}

const API_URL = 'http://localhost:8000';

export const fetchRooms = async (): Promise<Room[]> => {
    try {
        const response = await axios.get<Room[]>(`${API_URL}/rooms`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        throw error;
    }
};

export const fetchTopics = async (): Promise<Topic[]> => {
    try {
        const response = await axios.get<Topic[]>(`${API_URL}/topics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching topics:', error);
        throw error;
    }
};