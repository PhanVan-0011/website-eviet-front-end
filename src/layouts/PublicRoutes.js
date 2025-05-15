import {Outlet, Navigate} from 'react-router-dom'
import React from 'react'

const PublicRoutes = () => {
    let accessToken = localStorage.getItem('access_token') || false;
    return (!accessToken ?  <Outlet /> :  <Navigate to="/" />);
}
export default PublicRoutes