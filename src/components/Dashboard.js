import React from 'react'
import requestApi from '../helpers/api'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

import { useDispatch } from 'react-redux';
import * as actions from '../redux/actions/index';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({});
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(actions.controlLoading(true)); // Bắt đầu loading
        Promise.all([
            requestApi('api/users', 'GET'),
            requestApi('api/orders', 'GET'),
            requestApi('api/products', 'GET'),
            requestApi('api/posts', 'GET')
        ]).then((response) => {
            setDashboardData({
                totalUser: response[0].data.total,
                totalOrder: response[1].data.total,
                totalProduct: response[2].data.total,
                totalPost: response[3].data.total
            });
            dispatch(actions.controlLoading(false));
        }
        ).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log("Dashboard error: ", error);
        });
    }, [dispatch])

  return (
    <div id="layoutSidenav_content">
    <main>
        <div className="container-fluid px-4">
            <h1 className="mt-4">Tổng quan</h1>
            <ol className="breadcrumb mb-4">
                <li className="breadcrumb-item active">Tổng quan</li>
            </ol>
            <div className="row">
                <div className="col-xl-3 col-md-6">
                    <div className="card bg-primary text-white mb-4 position-relative">
                        <div className="card-body">Tổng người dùng</div>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {dashboardData.totalUser}
                            <span className="visually-hidden">unread messages</span>
                        </span>
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <Link className="small text-white stretched-link" to="/user">Xem chi tiết</Link>
                            <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6">
                    <div className="card bg-success text-white mb-4 position-relative">
                        <div className="card-body">Tổng bài viết</div>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {dashboardData.totalPost}
                            <span className="visually-hidden">unread messages</span>
                        </span>
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <Link className="small text-white stretched-link" to="/post">Xem chi tiết</Link>
                            <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6">
                    <div className="card bg-warning text-white mb-4 position-relative">
                        <div className="card-body">Tổng sản phẩm</div>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                            {dashboardData.totalProduct}
                            <span className="visually-hidden">unread messages</span>
                        </span>
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <Link className="small text-white stretched-link" to="/product">Xem chi tiết</Link>
                            <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                        </div>
                    </div>
                </div>
                <div className="col-xl-3 col-md-6">
                    <div className="card bg-danger text-white mb-4 position-relative">
                        <div className="card-body">Tổng đơn hàng</div>
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning">
                            {dashboardData.totalOrder}
                            <span className="visually-hidden">unread messages</span>
                        </span>
                        <div className="card-footer d-flex align-items-center justify-content-between">
                            <Link className="small text-white stretched-link" to="/order">Xem chi tiết</Link>
                            <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-xl-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-chart-area me-1"></i>
                            Biểu đồ cột
                        </div>
                        <div className="card-body"><canvas id="myAreaChart" width="100%" height="40"></canvas></div>
                    </div>
                </div>
                <div className="col-xl-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <i className="fas fa-chart-bar me-1"></i>
                            Biểu đồ tròn
                        </div>
                        <div className="card-body"><canvas id="myBarChart" width="100%" height="40"></canvas></div>
                    </div>
                </div>
            </div>
            <div className="card mb-4">
                <div className="card-header">
                    <i className="fas fa-table me-1"></i>
                    QUẢN LÝ ĐƠN ĐẶT HÀNG
                </div>
                <div className="card-body">
                    <table id="datatablesSimple">
                        <thead>
                            <tr>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tfoot>
                            <tr>
                                <th></th>
                                
                            </tr>
                        </tfoot>
                        <tbody>
                            <tr>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
    <footer className="py-4 bg-light mt-auto">
        <div className="container-fluid px-4">
            <div className="d-flex align-items-center justify-content-between small">
                <div className="text-muted">Copyright &copy; EVIET SOLUTION 2025</div>
                <div>
                    <a href="#"></a>
                    <a href="#"></a>
                </div>
            </div>
        </div>
    </footer>
</div>
  )
}

export default Dashboard