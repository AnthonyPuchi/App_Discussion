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

interface User {
    id: string;
    firstName: string;
    lastName: string;
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

export const fetchUsers = async (): Promise<User[]> => {
    try {
        const response = await axios.get<User[]>(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
};

export const getUserParticipationCount = (username: string): number => {
    const userMessagesCount = JSON.parse(localStorage.getItem('userMessagesCount') || '{}');
    return userMessagesCount[username] || 0;
};

export const updateUserParticipationCount = (username: string): void => {
    const userMessagesCount = JSON.parse(localStorage.getItem('userMessagesCount') || '{}');
    const count = userMessagesCount[username] || 0;
    localStorage.setItem('userMessagesCount', JSON.stringify({
        ...userMessagesCount,
        [username]: count + 1,
    }));
};