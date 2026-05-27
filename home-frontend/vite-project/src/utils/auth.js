export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export const setAuthSession = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const updateStoredUser = (updates) => {
  const nextUser = { ...(getStoredUser() || {}), ...updates };
  localStorage.setItem('user', JSON.stringify(nextUser));
  return nextUser;
};

export const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
};
