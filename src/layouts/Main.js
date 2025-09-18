import React from 'react'
import Header from './Header'
import {Outlet} from 'react-router-dom'

const Main = () => {
  return (
    <div>
        <Header />
        <div className="container-fluid">
            <Outlet />
        </div>
    </div>
  )
}

export default Main