const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    roles: JSON.parse(localStorage.getItem('roles')) || [],
    permissions: JSON.parse(localStorage.getItem('permissions')) || [],
    accessToken: localStorage.getItem('access_token') || null,
    isAuthenticated: !!localStorage.getItem('access_token')
  };
  
  const auth = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_AUTH':
        // console.log('SET_AUTH payload:', action.payload);
        return {
          ...state,
          user: action.payload.user,
          roles: action.payload.roles,
          permissions: action.payload.permissions,
          accessToken: action.payload.accessToken,
          isAuthenticated: true
        };
      case 'LOGOUT':
        return initialState;
      default:
        return state;
    }
  };

export default auth;