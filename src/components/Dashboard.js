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
                backgroundColor: '#1e4c8e', 
                borderColor: '#244aa0',
                pointBackgroundColor: '#2c5cc5', 
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
    <div id="layoutSidenav_content">
       <main >
         <div className="container-fluid px-2 px-md-4">
            <h3 className="mt-3 mt-md-4 mb-3 mb-md-4"></h3>
            {/* Stat Cards - Responsive: 1 col mobile, 2 cols tablet, 4 cols desktop */}
            <div className="row g-2 g-md-3 mb-3 mb-md-4">
                {/* Doanh thu tháng */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card bg-white text-dark mb-2 mb-md-3 position-relative shadow-sm stat-card-revenue h-100">
                        <div className="card-body p-3 p-md-4">
                            <h5 className="card-title d-flex align-items-center mb-2 mb-md-3">
                                <span className="icon-circle-revenue stat-icon">
                                    <i className="fas fa-money-bill-wave"></i>
                                </span>
                                <span className="ms-2">Tổng doanh thu</span>
                            </h5>
                            <p className="card-text-custom mb-2 mb-md-3">
                                {dashboardData?.data?.kpis?.total_revenue?.value !== undefined
                                    ? formatVND(dashboardData.data.kpis.total_revenue.value)
                                    : 'Đang tải...'}
                            </p>
                            {dashboardData?.data?.kpis?.total_revenue?.change !== undefined && (
                                <span className={`d-block mb-0 ${dashboardData.data.kpis.total_revenue.change < 0 ? 'text-danger' : 'text-success'}`}>
                                    <i className={`fas ${dashboardData.data.kpis.total_revenue.change < 0 ? 'fa-arrow-down' : 'fa-arrow-up'} me-1`}></i>
                                    <span className="percent-change small">
                                        {`${dashboardData.data.kpis.total_revenue.change > 0 ? '+' : ''}${dashboardData.data.kpis.total_revenue.change}% so với tháng trước`}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tổng đơn hàng */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card mb-2 mb-md-3 position-relative stat-card-order h-100">
                        <div className="card-body p-3 p-md-4">
                             <h5 className="card-title d-flex align-items-center mb-2 mb-md-3">
                                <span className="icon-circle-order stat-icon">
                                    <i className="fas fa-shopping-cart"></i>
                                </span>
                                <span className="ms-2">Tổng đơn hàng</span>
                            </h5>
                            <p className="card-text-custom mb-2 mb-md-3">
                                {dashboardData?.data?.kpis?.total_orders?.value ?? 'Đang tải...'}
                            </p>
                            {dashboardData?.data?.kpis?.total_orders?.change !== undefined && (
                                <span className={`d-block mb-0 ${dashboardData.data.kpis.total_orders.change < 0 ? 'text-danger' : 'text-success'}`}>
                                    <i className={`fas ${dashboardData.data.kpis.total_orders.change < 0 ? 'fa-arrow-down' : 'fa-arrow-up'} me-1`}></i>
                                    <span className="percent-change small">
                                        {`${dashboardData.data.kpis.total_orders.change > 0 ? '+' : ''}${dashboardData.data.kpis.total_orders.change}% so với tháng trước`}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Tổng sản phẩm */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card mb-2 mb-md-3 position-relative stat-card-product h-100">
                        <div className="card-body p-3 p-md-4">
                            <h5 className="card-title d-flex align-items-center mb-2 mb-md-3">
                                <span className="icon-circle-product stat-icon">
                                    <i className="fas fa-box-open"></i>
                                </span>
                                <span className="ms-2">Tổng sản phẩm</span>
                            </h5>
                            <p className="card-text-custom mb-2 mb-md-3">
                                {dashboardData?.data?.kpis?.total_products?.value ?? 'Đang tải...'}
                            </p>
                            {dashboardData?.data?.kpis?.total_products?.secondary_info?.text && (
                            <span className="d-block mb-0">
                                <i className="fas fa-exclamation-triangle me-1 text-warning-custom"></i>
                                    <span className="percent-change small">
                                        <span className='text-warning-custom'>{dashboardData.data.kpis.total_products.secondary_info.text}</span>
                                    </span>
                            </span>
                            )}
                        </div>
                    </div>
                </div>
                {/* Tổng người dùng */}
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card mb-2 mb-md-3 position-relative stat-card-user h-100">
                        <div className="card-body p-3 p-md-4">
                            <h5 className="card-title d-flex align-items-center mb-2 mb-md-3">
                                <span className="icon-circle-user stat-icon">
                                    <i className="fas fa-users"></i>
                                </span>
                                <span className="ms-2">Tổng người dùng</span>
                            </h5>
                            <p className="card-text-custom mb-2 mb-md-3">
                                {dashboardData?.data?.kpis?.total_users?.value ?? 'Đang tải...'}
                            </p>
                            {dashboardData?.data?.kpis?.total_users?.change !== undefined && (
                                <span className={`d-block mb-0 ${dashboardData.data.kpis.total_users.change < 0 ? 'text-danger' : 'text-success'}`}>
                                    <i className={`fas ${dashboardData.data.kpis.total_users.change < 0 ? 'fa-arrow-down' : 'fa-arrow-up'} me-1`}></i>
                                    <span className="percent-change small">
                                        {`${dashboardData.data.kpis.total_users.change > 0 ? '+' : ''}${dashboardData.data.kpis.total_users.change}% so với tháng trước`}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts - Responsive: 1 col mobile, 2 cols desktop */}
            <div className="row g-2 g-md-3 mb-3 mb-md-4">
                <div className="col-12 col-md-6">
                    <div className="card mb-2 mb-md-3 h-100">
                        <div className="card-header"><i className="fas fa-chart-area me-2"></i> Doanh thu 6 tháng gần nhất</div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '250px', height: '250px' }}>
                            {revenueAreaChartData ? (
                                <Bar  data={revenueAreaChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: true } }, scales: { y: { beginAtZero: true } } }} />
                            ) : (
                                <div>Đang tải biểu đồ...</div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="card mb-2 mb-md-3 h-100">
                        <div className="card-header"><i className="fas fa-chart-pie me-2"></i> Trạng thái đơn hàng</div>
                        <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '250px', height: '250px' }}>
                            {orderStatusChartData ? (
                                <Doughnut data={orderStatusChartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: true } } }} />
                            ) : (
                                <div>Đang tải biểu đồ...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables - Responsive: 1 col mobile/tablet, 2 cols desktop */}
            <div className="row g-2 g-md-3 align-items-stretch">
                <div className="col-12 col-lg-6 d-flex">
                    <div className="card mb-2 mb-md-3 w-100">
                        <div className="card-header"><i className="fas fa-fire me-2"></i> Top sản phẩm bán chạy</div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3">Sản phẩm</th>
                                            <th>Đã bán</th>
                                            <th className="pe-3">Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData?.data?.top_selling_products?.length > 0 ? (
                                            dashboardData.data.top_selling_products.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-3">{item.product_name}</td>
                                                    <td>{item.total_sold}</td>
                                                    <td className="pe-3">{formatVND(item.total_revenue)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="3" className="text-center py-3">Không có dữ liệu</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-lg-6 d-flex">
                    <div className="card mb-2 mb-md-3 w-100">
                        <div className="card-header"><i className="fas fa-tasks me-2"></i> Đơn hàng cần xử lý</div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-sm table-hover mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-3">Mã đơn</th>
                                            <th>Khách hàng</th>
                                            <th className="pe-3">Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dashboardData?.data?.pending_orders?.length > 0 ? (
                                            dashboardData.data.pending_orders.map((order, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-3">{order.order_code}</td>
                                                    <td>{order.client_name}</td>
                                                    <td className="pe-3">
                                                        <span className="badge bg-warning text-dark">Chờ xử lý</span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan="3" className="text-center py-3">Không có dữ liệu</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
       </main>
       </div>
    );
   
};

export default Dashboard;