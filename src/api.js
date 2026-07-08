import axios from 'axios';

const api = axios.create({
    baseURL: 'https://libgo-production.up.railway.app'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    console.log("Token being sent:", token); // add this
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;