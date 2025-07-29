import { Outlet } from "react-router-dom";
import React from 'react'
import { ToastContainer } from "react-toastify";
import ScaleLoader from "react-spinners/ScaleLoader";
import { useSelector } from "react-redux";
const Layout = () => {
    const loading = useSelector((state) => state.globalLoading.status); // Lấy trạng thái loading từ Redux
    const override = {
        position: "fixed", // Đặt lớp phủ ở vị trí tuyệt đối
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)", // Màu nền mờ
        zIndex: 9999, // Đảm bảo lớp phủ nằm trên cùng
        display: "flex",                // Thêm dòng này
        justifyContent: "center",       // Thêm dòng này
        alignItems: "center",  
    };
    return (
      <div>
        <ScaleLoader cssOverride={override} color="white" loading={loading}/>
        <Outlet />
        <ToastContainer />
      </div>
    );
}
export default Layout;