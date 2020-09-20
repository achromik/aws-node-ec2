import axios from 'axios';

import { authHeader } from './auth-header';
import { config } from '../config/app.config';

export const getPublicContent = () => axios.get(`${config.API_URL}/test/all`);

export const getUserBoard = () =>
  axios.get(`${config.API_URL}/test/user`, { headers: authHeader() });

export const getModeratorBoard = () =>
  axios.get(`${config.API_URL}/test/mod`, { headers: authHeader() });

export const getAdminBoard = () =>
  axios.get(`${config.API_URL}/test/admin`, { headers: authHeader() });

export const UserService = {
  getPublicContent,
  getUserBoard,
  getModeratorBoard,
  getAdminBoard,
};
