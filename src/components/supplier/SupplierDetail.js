import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastErrorConfig } from '../../tools/toastConfig';
import requestApi from '../../helpers/api';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions/index';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import moment from 'moment';
import DataTables from '../common/DataTables';

const SupplierDetail = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const isLoading = useSelector(state => state.globalLoading.isLoading);
    
    const [supplier, setSupplier] = useState(null);
    const [activeTab, setActiveTab] = useState('info');
    const [importHistory, setImportHistory] = useState([
        {
            id: 1,
            voucher_code: 'PN009057',
            created_at: '2025-09-15T00:00:00.000000Z',
            user: { name: 'EV - DOANH CT' },
            branch: { name: 'CT CSB' },
            total_amount: '568000'
        },
        {
            id: 2,
            voucher_code: 'PN009058',
            created_at: '2025-09-14T10:30:00.000000Z',
            user: { name: 'EV - DOANH CT' },
            branch: { name: 'CT CSB' },
            total_amount: '1250000'
        },
        {
            id: 3,
            voucher_code: 'PN009059',
            created_at: '2025-09-13T14:15:00.000000Z',
            user: { name: 'EV - DOANH CT' },
            branch: { name: 'CT CSB' },
            total_amount: '890000'
        }
    ]);

    // Load supplier data
    useEffect(() => {
        if (id) {
            dispatch(actions.controlLoading(true));
            requestApi(`api/admin/suppliers/${id}`, 'GET', []).then((response) => {
                dispatch(actions.controlLoading(false));
                if (response.data && response.data.data) {
                    setSupplier(response.data.data);
                }
            }).catch((error) => {
                dispatch(actions.controlLoading(false));
                if (error.response && error.response.data && error.response.data.message) {
                    toast.error(error.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Không thể tải thông tin nhà cung cấp!", toastErrorConfig);
                }
                navigate('/supplier');
            });
        }
    }, [id, dispatch, navigate]);

    const handleBack = () => {
        navigate('/supplier');
    };

    const handleEdit = () => {
        navigate(`/supplier/${id}`);
    };

    if (isLoading) {
        return (
            <div id="layoutSidenav_content">
                <main>
                    <div className="container-fluid px-4">
                        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!supplier) {
        return (
            <div id="layoutSidenav_content">
                
            </div>
        );
    }

    // Format VND currency
    const formatVND = (value) => {
        if (typeof value !== 'number' && typeof value !== 'string') return '0';
        value = value.toString().replace(/\D/g, '');
        if (!value) return '0';
        return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // Columns for import history table
    const importHistoryColumns = [
        {
            title: "Mã phiếu",
            element: row => (
                <span className="text-primary fw-bold">{row?.voucher_code || '-'}</span>
            ),
            width: "15%"
        },
        {
            title: "Thời gian",
            element: row => row?.created_at ? moment(row.created_at).format('DD/MM/YYYY HH:mm') : '-',
            width: "20%"
        },
        {
            title: "Người tạo",
            element: row => row?.user?.name || '-',
            width: "20%"
        },
        {
            title: "Chi nhánh",
            element: row => row?.branch?.name || '-',
            width: "15%"
        },
        {
            title: "Tổng cộng",
            element: row => row?.total_amount ? `${formatVND(parseInt(row.total_amount))} ₫` : '0 ₫',
            width: "15%"
        },
        {
            title: "Trạng thái",
            element: row => (
                <span className="badge bg-success">Đã nhập hàng</span>
            ),
            width: "15%"
        }
    ];

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item">
                            <a href="/">Trang chủ</a>
                        </li>
                        <li className="breadcrumb-item">
                            <a href="/supplier">Nhà cung cấp</a>
                        </li>
                        <li className="breadcrumb-item active">Chi tiết nhà cung cấp</li>
                    </ol>
                    
                    {/* Header */}
                    <div className="card mb-0">
                        <div className="card-header bg-secondary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="mb-0">
                                        <i className="fas fa-home me-2"></i>
                                        {supplier.code} - {supplier.name}
                                    </h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Custom Tabs */}
                    <div className="card">
                        <div className="card-header bg-white p-0">
                            <div className="custom-tabs">
                                <button
                                    className={`custom-tab ${activeTab === 'info' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('info')}
                                    type="button"
                                >
                                    <i className="fas fa-info-circle me-2"></i>
                                    Thông tin
                                </button>
                                <button
                                    className={`custom-tab ${activeTab === 'history' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                    type="button"
                                >
                                    <i className="fas fa-history me-2"></i>
                                    Lịch sử nhập hàng
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {activeTab === 'info' ? (
                                // Information Tab
                                <div className="p-4">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <h5 className="mb-4">
                                                <i className="fas fa-building me-2"></i>
                                                {supplier.name} {supplier.code}
                                            </h5>
                                            
                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Người tạo:</label>
                                                    <p className="form-control-plaintext">{supplier.user?.name || 'Chưa có'}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Ngày tạo:</label>
                                                    <p className="form-control-plaintext">
                                                        {supplier.created_at ? moment(supplier.created_at).format('DD/MM/YYYY') : 'Chưa có'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Nhóm nhà cung cấp:</label>
                                                    <p className="form-control-plaintext">
                                                        {supplier.group?.name || 'Chưa có'}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Trạng thái:</label>
                                                    <p className="form-control-plaintext">
                                                        {supplier.active === 1 ? (
                                                            <span className="badge bg-success">Hoạt động</span>
                                                        ) : (
                                                            <span className="badge bg-secondary">Không hoạt động</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Điện thoại:</label>
                                                    <p className="form-control-plaintext">{supplier.phone_number || 'Chưa có'}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Email:</label>
                                                    <p className="form-control-plaintext">{supplier.email || 'Chưa có'}</p>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Địa chỉ:</label>
                                                    <p className="form-control-plaintext">{supplier.address || 'Chưa có'}</p>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Mã số thuế:</label>
                                                    <p className="form-control-plaintext">{supplier.tax_code || 'Chưa có'}</p>
                                                </div>
                                            </div>

                                            <div className="row mb-3">
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Tổng mua:</label>
                                                    <p className="form-control-plaintext">
                                                        {supplier.total_purchase_amount ? `${formatVND(parseInt(supplier.total_purchase_amount))} ₫` : '0 ₫'}
                                                    </p>
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label fw-semibold">Nợ cần trả:</label>
                                                    <p className="form-control-plaintext">
                                                        {supplier.balance_due ? `${formatVND(parseInt(supplier.balance_due))} ₫` : '0 ₫'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label fw-semibold">Ghi chú:</label>
                                                <div className="rounded p-3 bg-light">
                                                    <i className="fas fa-sticky-note me-2 text-muted"></i>
                                                    {supplier.notes || 'Chưa có ghi chú'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action buttons centered */}
                                    <div className="d-flex justify-content-center gap-2 mt-4 pt-3">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleBack}
                                        >
                                            <i className="fas fa-arrow-left me-1"></i>
                                            Quay lại
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleEdit}
                                        >
                                            <i className="fas fa-edit me-1"></i>
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Import History Tab
                                <div className="p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0">
                                            <i className="fas fa-history me-2"></i>
                                            Lịch sử nhập hàng
                                        </h5>
                                    </div>
                                    
                                    {importHistory.length > 0 ? (
                                        <DataTables
                                            name="Lịch sử nhập hàng"
                                            columns={importHistoryColumns}
                                            data={importHistory}
                                            numOfPages={1}
                                            currentPage={1}
                                            setCurrentPage={() => {}}
                                            setItemOfPage={() => {}}
                                            onSelectedRows={() => {}}
                                            hideSearch={true}
                                            hideSelected={true}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-inbox text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                            <h5 className="text-muted">Chưa có lịch sử nhập hàng</h5>
                                            <p className="text-muted">Nhà cung cấp này chưa có giao dịch nhập hàng nào.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupplierDetail;
