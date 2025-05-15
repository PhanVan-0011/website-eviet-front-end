import {Outlet, Navigate} from 'react-router-dom'
import React from 'react'

const PrivateRoutes = () => {
    let accessToken = localStorage.getItem('access_token') || false;
    return (accessToken ?  <Outlet /> :  <Navigate to="/login" />);
}
export default PrivateRoutes