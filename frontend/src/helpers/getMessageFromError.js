export const getMessageFromError = error =>
  error.response?.data?.error?.message || error.message || error.toString();
