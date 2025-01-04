import axios from 'axios';

const API_URL = 'http://172.86.108.64:3000';
const API_KEY = process.env.API_KEY;

export class APIClient {
    constructor() {
        this.axios = axios.create({
            baseURL: API_URL,
            headers: {
                'X-API-Key': API_KEY
            }
        });
    }

    async getUser(userId) {
        const response = await this.axios.get(`/user/${userId}`);
        return response.data;
    }

    async updateCoins(userId, amount) {
        const response = await this.axios.post(`/user/${userId}/coins`, { amount });
        return response.data;
    }
}

export const apiClient = new APIClient();
