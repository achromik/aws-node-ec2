export const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToke) {
    return { 'x-access-token': user.accessToken };
  }
  return {};
};
