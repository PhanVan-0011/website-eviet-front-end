import React, { useEffect, useState } from 'react';
import requestApi from '../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../redux/actions/index';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Link } from 'react-router-dom';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend
);

const formatVND = (value) => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(number);
};
const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(actions.controlLoading(true));
        requestApi('api/admin/dashboard', 'GET')
            .then((res) => {
                setDashboardData(res.data);
                dispatch(actions.controlLoading(false));
            })
            .catch((error) => {
                dispatch(actions.controlLoading(false));
                console.log('Dashboard error: ', error);
            });
    }, [dispatch]);

    // Dữ liệu biểu đồ area (line fill) doanh thu 6 tháng
    const revenueAreaChartData = dashboardData?.data?.revenue_chart?.labels ? {
        labels: dashboardData.data.revenue_chart.labels,
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: dashboardData.data.revenue_chart.data,
                fill: true,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                tension: 0.4,
            },
        ],
    } : null;

    // Dữ liệu biểu đồ tròn trạng thái đơn hàng
    const orderStatusChartData = dashboardData?.data?.order_status_chart?.labels ? {
        labels: dashboardData.data.order_status_chart.labels,
        datasets: [
            {
                data: dashboardData.data.order_status_chart.data,
                backgroundColor: [
                    '#28a745', '#ffc107', '#17a2b8', '#dc3545', '#6c757d'
                ],
            },
        ],
    } : null;

    return (
        <div className="container-fluid px-4">
            <h1 className="mt-4 mb-4">Tổng quan</h1>
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="card text-white bg-primary mb-3 position-relative">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="fas fa-money-bill-wave me-2"></i> Tổng doanh thu
                            </h5>
                            <p className="card-text fs-3">
                                {dashboardData?.data?.kpis?.total_revenue !== undefined
                                    ? formatVND(dashboardData.data.kpis.total_revenue)
                                    : 'Đang tải...'}
                            </p>
                            <div className="d-flex justify-content-end">
                                <Link
                                    className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-1"
                                    to="/order"
                                    style={{ borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                                >
                                    Xem chi tiết <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-success mb-3 position-relative">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="fas fa-shopping-cart me-2"></i> Tổng đơn hàng
                            </h5>
                            <p className="card-text fs-3">
                                {dashboardData?.data?.kpis?.total_orders !== undefined
                                    ? dashboardData.data.kpis.total_orders
                                    : 'Đang tải...'}
                            </p>
                            <div className="d-flex justify-content-end">
                                <Link
                                    className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-1"
                                    to="/order"
                                    style={{ borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                                >
                                    Xem chi tiết <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-info mb-3 position-relative">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="fas fa-users me-2"></i> Tổng người dùng
                            </h5>
                            <p className="card-text fs-3">
                                {dashboardData?.data?.kpis?.total_users !== undefined
                                    ? dashboardData.data.kpis.total_users
                                    : 'Đang tải...'}
                            </p>
                            <div className="d-flex justify-content-end">
                                <Link
                                    className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-1"
                                    to="/user"
                                    style={{ borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                                >
                                    Xem chi tiết <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card text-white bg-warning mb-3 position-relative">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="fas fa-box-open me-2"></i> Tổng sản phẩm
                            </h5>
                            <p className="card-text fs-3">
                                {dashboardData?.data?.kpis?.total_products !== undefined
                                    ? dashboardData.data.kpis.total_products
                                    : 'Đang tải...'}
                            </p>
                            <div className="d-flex justify-content-end">
                                <Link
                                    className="btn btn-light btn-sm fw-bold d-flex align-items-center gap-1"
                                    to="/product"
                                    style={{ borderRadius: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                                >
                                    Xem chi tiết <i className="fas fa-arrow-right"></i>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header"><i className="fas fa-chart-area me-2"></i> Doanh thu 6 tháng gần nhất</div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                            {revenueAreaChartData ? (
                                <Bar data={revenueAreaChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }} />
                            ) : (
                                <div>Đang tải biểu đồ...</div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header"><i className="fas fa-chart-pie me-2"></i> Trạng thái đơn hàng</div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ height: 300 }}>
                            {orderStatusChartData ? (
                                <Doughnut data={orderStatusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: true } } }} />
                            ) : (
                                <div>Đang tải biểu đồ...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header"><i className="fas fa-fire me-2"></i> Top sản phẩm bán chạy</div>
                        <div className="card-body p-0">
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        <th>Sản phẩm</th>
                                        <th>Đã bán</th>
                                        <th>Doanh thu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData?.data?.top_selling_products?.length > 0 ? (
                                        dashboardData.data.top_selling_products.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.product_name}</td>
                                                <td>{item.total_sold}</td>
                                                <td>{formatVND(item.total_revenue)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center">Không có dữ liệu</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card mb-3">
                        <div className="card-header"><i className="fas fa-tasks me-2"></i> Đơn hàng cần xử lý</div>
                        <div className="card-body p-0">
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardData?.data?.pending_orders?.length > 0 ? (
                                        dashboardData.data.pending_orders.map((order, idx) => (
                                            <tr key={idx}>
                                                <td>{order.order_code}</td>
                                                <td>{order.client_name}</td>
                                                <td>
                                                    <span className="badge bg-warning text-dark">Chờ xử lý</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="3" className="text-center">Không có dữ liệu</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;