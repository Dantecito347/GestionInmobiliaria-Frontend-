import api from '../api/axios';

export const authService = {
    login: async (username, password) => {
    const response = await api.post('/auth/login', {username, password});
        if (response.data.token){
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('perfil', response.data.perfil);
        }
        return response.data;
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('perfil');
    },

    getToken: () => localStorage.getItem('token'),
    isLoggedIn: () => !!localStorage.getItem('token'),
};