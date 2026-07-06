import axios from 'axios';

const api = axios.create({
    baseURL: 'https://libgo-production.up.railway.app'
});

export default api;