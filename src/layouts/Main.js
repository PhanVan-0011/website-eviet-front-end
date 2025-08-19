import React, { useEffect } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import {Outlet} from 'react-router-dom'

const Main = () => {
  useEffect(() => {
    // Add sb-nav-fixed class to body for Bootstrap fixed layout
    document.body.classList.add('sb-nav-fixed')
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('sb-nav-fixed')
    }
  }, [])

  return (
    <div>
        <Header />
        <div id="layoutSidenav">
            <Sidebar />
            <Outlet />
            
        </div>
    </div>
  )
}

export default Main