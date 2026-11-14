import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });
export const imageUrl = value => value?.startsWith('/uploads/') ? `${api.defaults.baseURL.replace('/api','')}${value}` : value;
export const uploadImage = async file => { const data = new FormData(); data.append('image',file); return (await api.post('/uploads',data)).data.url; };
export default api;
