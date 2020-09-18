import axios from 'axios';

import { authHeader } from './auth-header';
import { config } from '../config/app.config';

export const getPublicContent = () => {
  return axios.get(`${config.API_URL}/all`);
};

export const getUserBoard = () => {
  return axios.get(`${config.API_URL}/user`, { headers: authHeader() });
};

export const getModeratorBoard = () => {
  return axios.get(`${config.API_URL}/mod`, { headers: authHeader() });
};

export const getAdminBoard = () => {
  return axios.get(`${config.API_URL}/admin`, { headers: authHeader() });
};
