const initialState = {
    user: null,
    roles: [],
    permissions: [],
    accessToken: null,
    isAuthenticated: false
  };
  
  const auth = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_AUTH':
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