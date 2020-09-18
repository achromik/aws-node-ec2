import axios from 'axios';

import { config } from '../config/app.config';

export const register = (username, email, password) => {
  return axios.post(`${config.API_URL}/auth/signup`, {
    username,
    email,
    password,
  });
};
export const login = (username, password) => {
  return axios
    .post(`${config.API_URL}/auth/signin`, {
      username,
      password,
    })
    .then(response => {
      if (response.data.accessToken) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }

      return response.data;
    });
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const AuthService = { register, login, logout, getCurrentUser };
