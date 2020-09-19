import axios from 'axios';

import { authHeader } from './auth-header';
import { config } from '../config/app.config';

export const getPublicContent = () => {
  return axios.get(`${config.API_URL}/test/all`);
};

export const getUserBoard = () => {
  return axios.get(`${config.API_URL}/test/user`, { headers: authHeader() });
};

export const getModeratorBoard = () => {
  return axios.get(`${config.API_URL}/test/mod`, { headers: authHeader() });
};

export const getAdminBoard = () => {
  return axios.get(`${config.API_URL}/test/admin`, { headers: authHeader() });
};

export const UserService = {
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
};
