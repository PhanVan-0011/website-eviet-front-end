import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import requestApi from '../../helpers/api';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../redux/actions/index';
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import moment from 'moment';
import DataTables from '../common/DataTables';
import { Modal, Button } from 'react-bootstrap';

// Component hiển thị từng field thông tin
const InfoItem = ({ label, value, isDanger = false }) => (
    <div className="col-md-3 mb-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className={`fw-semibold border-bottom pb-2 ${isDanger ? 'text-danger' : ''}`}>
            {value ?? 'Chưa có'}
        </div>
    </div>
);

const SupplierDetail = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { id } = useParams();
    const isLoading = useSelector(state => state.globalLoading.isLoading);
    
    const [supplier, setSupplier] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('thong-tin');
    const [importHistory, setImportHistory] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(10);
    const [numOfPages, setNumOfPages] = useState(1);

    // Load supplier data
    useEffect(() => {
        if (id) {
            setLoading(true);
            dispatch(actions.controlLoading(true));
            requestApi(`api/admin/suppliers/${id}`, 'GET', []).then((response) => {
                setLoading(false);
                dispatch(actions.controlLoading(false));
                if (response.data && response.data.data) {
                    setSupplier(response.data.data);
                }
            }).catch((error) => {
                setLoading(false);
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

    // Reset to page 1 when changing items per page
    useEffect(() => {
        setCurrentPage(1);
    }, [itemOfPage]);

    // Load import history
    useEffect(() => {
        if (id) {
            dispatch(actions.controlLoading(true));
            requestApi(`api/admin/suppliers/${id}/purchase-history?page=${currentPage}&limit=${itemOfPage}`, 'GET', []).then((response) => {
                dispatch(actions.controlLoading(false));
                console.log('Purchase history response:', response);
                if (response.data) {
                    // Xử lý dữ liệu
                    const historyData = response.data.data || response.data;
                    if (Array.isArray(historyData)) {
                        setImportHistory(historyData);
                    } else if (historyData && historyData.data && Array.isArray(historyData.data)) {
                        setImportHistory(historyData.data);
                    }
                    
                    // Xử lý pagination
                    if (response.data.pagination) {
                        setNumOfPages(response.data.pagination.last_page || 1);
                    }
                }
            }).catch((error) => {
                dispatch(actions.controlLoading(false));
                console.log('Error loading purchase history:', error);
                setImportHistory([]);
            });
        }
    }, [id, currentPage, itemOfPage, dispatch]);

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
                <span className="text-primary fw-bold">{row?.invoice_code || '-'}</span>
            ),
            width: "12%"
        },
        {
            title: "Thời gian",
            element: row => row?.invoice_date ? moment(row.invoice_date).format('DD/MM/YYYY HH:mm') : '-',
            width: "15%"
        },
        {
            title: "Người tạo",
            element: row => row?.user?.name || '-',
            width: "15%"
        },
        {
            title: "Chi nhánh",
            element: row => row?.branch?.name || '-',
            width: "15%"
        },
        {
            title: "Tổng cộng",
            element: row => row?.total_amount ? `${formatVND(parseInt(row.total_amount))} ₫` : '0 ₫',
            width: "12%"
        },
        {
            title: "Trạng thái",
            element: row => {
                const statusMap = {
                    'draft': { label: 'Nháp', class: 'bg-secondary' },
                    'received': { label: 'Đã nhập hàng', class: 'bg-success' },
                    'cancelled': { label: 'Đã hủy', class: 'bg-danger' }
                };
                const status = statusMap[row?.status] || { label: row?.status || '-', class: 'bg-secondary' };
                return <span className={`badge ${status.class}`}>{status.label}</span>;
            },
            width: "12%"
        }
    ];

    // Columns for debt history table
    const debtHistoryColumns = [
        {
            title: "Mã phiếu",
            element: row => (
                <span className="text-primary fw-bold">{row?.invoice_code || '-'}</span>
            ),
            width: "15%"
        },
        {
            title: "Thời gian",
            element: row => row?.invoice_date ? moment(row.invoice_date).format('DD/MM/YYYY HH:mm') : '-',
            width: "18%"
        },
        {
            title: "Loại",
            element: row => <span>Nhập hàng</span>,
            width: "12%"
        },
        {
            title: "Giá trị",
            element: row => row?.total_amount ? `${formatVND(parseInt(row.total_amount))} ₫` : '0 ₫',
            width: "15%"
        },
        {
            title: "Nợ cần trả nhà cung cấp",
            element: row => row?.amount_owed ? `${formatVND(parseInt(row.amount_owed))} ₫` : '0 ₫',
            width: "18%"
        }
    ];

    // Chỉ hiển thị nội dung chính khi đã load xong
    if (loading) {
        return (
            <div className="container-fluid">
                <div className="d-flex justify-content-center align-items-center vh-100">
                    {/* Loading state */}
                </div>
            </div> 
        );
    }

    if (!supplier) {
        return (
            <div className="container-fluid px-4">
                <div className="mt-4 mb-3">
                    <h1 className="mt-4">Chi tiết nhà cung cấp</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/supplier">Nhà cung cấp</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>
                </div>
                
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/6134/6134065.png"
                        alt="Không tìm thấy nhà cung cấp"
                        style={{ width: 120, marginBottom: 24, opacity: 0.85 }}
                    />
                    <h2 className="text-danger mb-2" style={{ fontWeight: 700 }}>
                        Không tìm thấy nhà cung cấp!
                    </h2>
                    <p className="text-secondary mb-4 fs-5 text-center" style={{ maxWidth: 400 }}>
                        Nhà cung cấp bạn tìm kiếm không tồn tại hoặc đã bị xóa khỏi hệ thống.<br />
                        Vui lòng kiểm tra lại hoặc quay về trang danh sách nhà cung cấp.
                    </p>
                    <Link to="/supplier" className="btn btn-outline-primary px-4 py-2">
                        <i className="fas fa-arrow-left me-2"></i>Quay về danh sách nhà cung cấp
                    </Link>
                </div>
            </div>
        );
    }

    // Hàm xóa nhà cung cấp
    const handleOpenDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        setShowDeleteModal(false);
        dispatch(actions.controlLoading(true));
        try {
            const res = await requestApi(`api/admin/suppliers/${id}`, 'DELETE');
            dispatch(actions.controlLoading(false));
            toast.success(res.data?.message || 'Xóa nhà cung cấp thành công!', toastSuccessConfig);
            navigate('/supplier');
        } catch (e) {
            dispatch(actions.controlLoading(false));
            toast.error(
                e?.response?.data?.message || 'Xóa nhà cung cấp thất bại!', toastErrorConfig
            );
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <div className="d-flex align-items-center justify-content-between mt-4 mb-2">
                        <h2 className="mb-0">Chi tiết nhà cung cấp #{supplier.id}</h2>
                    </div>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item"><Link to="/supplier">Nhà cung cấp</Link></li>
                        <li className="breadcrumb-item active">Chi tiết</li>
                    </ol>

                    <div className="card border">
                        {/* Tab Navigation */}
                        <ul className="nav nav-tabs" id="supplierDetailTabs" role="tablist" style={{borderBottom: '2px solid #dee2e6'}}>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'thong-tin' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('thong-tin')}
                                    style={{ 
                                        color: activeTab === 'thong-tin' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'thong-tin' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'thong-tin' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'thong-tin' ? '500' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <i className="fas fa-info-circle me-2"></i>
                                    Thông tin
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'lich-su' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('lich-su')}
                                    style={{ 
                                        color: activeTab === 'lich-su' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'lich-su' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'lich-su' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'lich-su' ? '500' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <i className="fas fa-history me-2"></i>
                                    Lịch sử nhập hàng
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className={`nav-link ${activeTab === 'no' ? 'active' : ''}`}
                                    type="button"
                                    onClick={() => setActiveTab('no')}
                                    style={{ 
                                        color: activeTab === 'no' ? '#007bff' : '#6c757d',
                                        borderBottomColor: activeTab === 'no' ? '#007bff' : 'transparent',
                                        borderBottomWidth: activeTab === 'no' ? '2px' : '1px',
                                        textDecoration: 'none',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === 'no' ? '500' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    <i className="fas fa-credit-card me-2"></i>
                                    Nợ nhà cung cấp
                                </button>
                            </li>
                        </ul>

                        <div style={{ padding: '1.5rem' }}>
                            {/* Tab Thông tin */}
                            {activeTab === 'thong-tin' && (
                                <div>
                                    {/* Header: Thông tin nhà cung cấp */}
                                    <div style={{marginBottom: '1.5rem', paddingBottom: '1.5rem'}}>
                                        {/* Tên nhà cung cấp */}
                                        <h3 style={{marginBottom: '0.75rem', marginTop: 0, fontWeight: 'bold', color: '#000'}}>
                                            {supplier.code} - {supplier.name}
                                        </h3>

                                        {/* Badges */}
                                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem'}}>
                                            {supplier.active === 1 ? (
                                                <span className="badge bg-success"><i className="fas fa-check-circle me-1"></i>Hoạt động</span>
                                            ) : (
                                                <span className="badge bg-danger"><i className="fas fa-ban me-1"></i>Không hoạt động</span>
                                            )}
                                        </div>

                                        {/* Nhóm nhà cung cấp */}
                                        <div className="mb-3">
                                            <small className="text-muted d-block fw-semibold">Nhóm nhà cung cấp:</small>
                                            <span className="text-dark">{supplier.group?.name || 'Chưa có'}</span>
                                        </div>

                                        {/* Lưới thông tin */}
                                        <div className="row">
                                            <InfoItem label="Mã nhà cung cấp" value={supplier.code || supplier.id} />
                                            <InfoItem label="Điện thoại" value={supplier.phone_number} />
                                            <InfoItem label="Email" value={supplier.email} />
                                            <InfoItem label="Ngày tạo" value={supplier.created_at ? moment(supplier.created_at).format('DD/MM/YYYY') : 'Chưa có'} />

                                            <InfoItem label="Địa chỉ" value={supplier.address} />
                                            <InfoItem label="Mã số thuế" value={supplier.tax_code} />
                                            <InfoItem label="Người tạo" value={supplier.user?.name} />
                                            <InfoItem label="Trạng thái" value={supplier.active === 1 ? 'Hoạt động' : 'Không hoạt động'} />

                                            <InfoItem label="Tổng mua" value={supplier.total_purchase_amount ? `${formatVND(parseInt(supplier.total_purchase_amount))} ₫` : '0 ₫'} isDanger />
                                            <InfoItem label="Nợ cần trả" value={supplier.balance_due ? `${formatVND(parseInt(supplier.balance_due))} ₫` : '0 ₫'} isDanger />
                                        </div>

                                        {/* Ghi chú */}
                                        {supplier.notes && (
                                            <div className="mt-4 p-3 border rounded bg-light">
                                                <small className="text-muted d-block mb-2 fw-semibold">Ghi chú:</small>
                                                <p className="mb-0">{supplier.notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons */}
                                    <div className="d-flex justify-content-end gap-2 mt-4 pt-3">
                                        <Permission permission={PERMISSIONS.SUPPLIERS_UPDATE}>
                                            <Link to={`/supplier/${supplier.id}`} className="btn btn-primary">
                                                <i className="fas fa-edit me-1"></i>
                                                Chỉnh sửa
                                            </Link>
                                        </Permission>
                                    </div>
                                </div>
                            )}

                            {/* Tab Lịch sử nhập hàng */}
                            {activeTab === 'lich-su' && (
                                <div>
                                    {importHistory.length > 0 ? (
                                        <DataTables
                                            name="Lịch sử nhập hàng"
                                            columns={importHistoryColumns}
                                            data={importHistory}
                                            numOfPages={numOfPages}
                                            currentPage={currentPage}
                                            setCurrentPage={setCurrentPage}
                                            setItemOfPage={setItemOfPage}
                                            selectedRows={[]}
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

                            {/* Tab Nợ nhà cung cấp */}
                            {activeTab === 'no' && (
                                <div>
                                    {importHistory.length > 0 ? (
                                        <DataTables
                                            name="Nợ nhà cung cấp"
                                            columns={debtHistoryColumns}
                                            data={importHistory}
                                            numOfPages={numOfPages}
                                            currentPage={currentPage}
                                            setCurrentPage={setCurrentPage}
                                            setItemOfPage={setItemOfPage}
                                            selectedRows={[]}
                                            onSelectedRows={() => {}}
                                            hideSearch={true}
                                            hideSelected={true}
                                        />
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-credit-card text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                                            <h5 className="text-muted">Chưa có nợ nhà cung cấp</h5>
                                            <p className="text-muted">Nhà cung cấp này hiện không có nợ.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nút thao tác */}
                    <div className="row mt-4 mb-4">
                        <div className="col-12 d-flex justify-content-center gap-2">
                            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
                                <i className="fas fa-arrow-left me-1"></i>Quay lại
                            </button>
                            <Link className="btn btn-primary btn-sm" to={`/supplier/${supplier.id}`}>
                                <i className="fas fa-edit me-1"></i>Sửa nhà cung cấp
                            </Link>
                            <button className="btn btn-danger btn-sm" onClick={handleOpenDeleteModal}>
                                <i className="fas fa-trash-alt me-1"></i>Xóa nhà cung cấp
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Bạn có chắc chắn muốn xóa nhà cung cấp này?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SupplierDetail;
