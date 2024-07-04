import axios, { AxiosError } from 'axios';

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

export const fetchUserIdByEmail = async (email: string): Promise<string | null> => {
    try {
        const response = await axios.get<User>(`${API_URL}/users/email/${email}`);
        return response.data?.id || null;
    } catch (error) {
        console.error('Error fetching user ID by email:', error);
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

export const saveUserMessage = async (userTopicId: string, message: string): Promise<void> => {
    try {
        await axios.post(`${API_URL}/user-participation`, {
            userTopicId,
            message,
            status: true,
        });
    } catch (error) {
        console.error('Error saving user message:', error);
        throw error;
    }
};

export const fetchUserTopicByUserIdAndTopicId = async (userId: string, topicId: string | undefined) => {
    try {
        const response = await axios.get(`${API_URL}/users-topics/user/${userId}/topic/${topicId}`);
        return response.data;
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            if (axiosError.response && axiosError.response.status === 404) {
                console.error('UserTopic not found. Please check your IDs.');
                throw new Error('UserTopic not found');
            } else {
                console.error('Error fetching user topic:', axiosError.message);
            }
        } else {
            console.error('Unexpected error:', error);
        }
        throw error;
    }
};

export const incrementUserParticipationCount = async (userTopicId: string): Promise<void> => {
    try {
        await axios.post(`${API_URL}/users-topics/increment/${userTopicId}`);
    } catch (error) {
        console.error('Error incrementing user participation count:', error);
        throw error;
    }
};

export const fetchNotParticipatedUsers = async (topicId: string | undefined): Promise<{
    firstName: string;
    lastName: string
}[]> => {
    try {
        const response = await axios.get<User[]>(`${API_URL}/participation/topic/list-not-participated-criteria/${topicId}`);
        return response.data.map(user => ({
            firstName: user.firstName,
            lastName: user.lastName,
        }));
    } catch (error) {
        console.error('Error fetching users who have not participated:', error);
        throw error;
    }
};

