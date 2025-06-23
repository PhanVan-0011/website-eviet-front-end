import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const PromotionList = () => {
    const [promotions, setPromotions] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(25);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    // Bộ lọc
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Lấy danh sách promotion với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}`;
        if (searchText) query += `&keyword=${searchText}`;
        if (filterStatus !== '') query += `&is_active=${filterStatus}`;
        if (filterType) query += `&type=${filterType}`;
        if (filterStartDate) query += `&start_date=${filterStartDate}`;
        if (filterEndDate) query += `&end_date=${filterEndDate}`;

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/promotions${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setPromotions(response.data.data);
            setNumOfPages(response.data.pagination ? response.data.pagination.last_page : 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, filterStatus, filterType, filterStartDate, filterEndDate, refresh, dispatch]);

    // Sort logic
    const sortedPromotions = [...promotions].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'value') {
            aValue = Number(aValue);
            bValue = Number(bValue);
        } else {
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const renderSortIcon = (field) => {
        if (sortField !== field) return <i className="fas fa-sort text-secondary ms-1"></i>;
        return sortOrder === 'asc'
            ? <i className="fas fa-sort-up text-primary ms-1"></i>
            : <i className="fas fa-sort-down text-primary ms-1"></i>;
    };

    // Columns
    const columns = [
        {
            title: "Tên khuyến mãi",
            element: row => row.name,
            width: "16%"
        },
        {
            title: "Mã code",
            element: row => <span className="badge bg-info text-dark">{row.code}</span>,
            width: "10%"
        },
        {
            title: "Áp dụng cho",
            element: row => {
                if (row.application_type === "orders") return <span className="badge bg-secondary">Đơn hàng</span>;
                if (row.application_type === "products") return <span className="badge bg-primary">Sản phẩm</span>;
                if (row.application_type === "categories") return <span className="badge bg-warning text-dark">Danh mục</span>;
                if (row.application_type === "combos") return <span className="badge bg-success">Combo</span>;
                return <span className="badge bg-secondary">-</span>;
            },
            width: "12%"
        },
        {
            title: "Hình thức",
            element: row => {
                if (row.type === 'percentage') return <span className="badge bg-success">%</span>;
                if (row.type === 'fixed_amount') return <span className="badge bg-info text-dark">VNĐ</span>;
                if (row.type === 'free_shipping') return <span className="badge bg-primary">Miễn phí ship</span>;
                return <span className="badge bg-secondary">-</span>;
            },
            width: "10%"
        },
        {
            title: "Giá trị",
            element: row => {
                if (row.type === 'percentage') return `${row.value}%`;
                if (row.type === 'fixed_amount') return row.value?.toLocaleString() + ' ₫';
                if (row.type === 'free_shipping') return <span className="text-success">Miễn phí vận chuyển</span>;
                return '-';
            },
            width: "10%"
        },
        {
            title: "Thời gian",
            element: row => (
                <div>
                    <div>
                        <span className="text-secondary small">Từ: </span>
                        {row.dates?.start_date ? new Date(row.dates.start_date).toLocaleDateString() : '-'}
                    </div>
                    <div>
                        <span className="text-secondary small">Đến: </span>
                        {row.dates?.end_date ? new Date(row.dates.end_date).toLocaleDateString() : '-'}
                    </div>
                </div>
            ),
            width: "14%"
        },
        {
            title: "Trạng thái",
            element: row => row.is_active
                ? <span className="badge bg-success">Hiển thị</span>
                : <span className="badge bg-secondary">Ẩn</span>,
            width: "8%"
        },
        {
            title: "Tình trạng",
            element: row => (
                <span className="badge bg-info text-dark">{row.status_text}</span>
            ),
            width: "8%"
        },
        {
            title: "Hành động",
            element: row => (
                <div className="d-flex align-items-center">
                    <Link className="btn btn-info btn-sm me-1" to={`/promotion/detail/${row.id}`}>
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/promotion/${row.id}`}>
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: "12%"
        }
    ];

    // Delete logic
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
    };
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    };
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if (typeDelete === 'single') {
            requestApi(`api/admin/promotions/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khuyến mãi thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khuyến mãi thất bại", toastErrorConfig);
                }
            }).catch((e) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (e.response && e.response.data && e.response.data.message) {
                    toast.error(e.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Server error", toastErrorConfig);
                }
            });
        } else {
            requestApi(`api/admin/promotions/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khuyến mãi thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khuyến mãi thất bại", toastErrorConfig);
                }
            }).catch((e) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (e.response && e.response.data && e.response.data.message) {
                    toast.error(e.response.data.message, toastErrorConfig);
                } else {
                    toast.error("Server error", toastErrorConfig);
                }
            });
        }
    };

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách khuyến mãi</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Khuyến mãi</li>
                    </ol>
                    <div className='mb-3'>
                        <Link className="btn btn-primary me-2" to="/promotion/add">
                            <i className="fas fa-plus"></i> Thêm khuyến mãi
                        </Link>
                        {selectedRows.length > 0 && (
                            <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                <i className="fas fa-trash"></i> Xóa
                            </button>
                        )}
                    </div>
                    {/* Bộ lọc */}
                    <div className="row mb-3 g-2 align-items-end">
                        {/* Trạng thái */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-info mb-1" htmlFor="filterStatus">
                                <i className="fas fa-toggle-on me-1"></i>Trạng thái
                            </label>
                            <select
                                id="filterStatus"
                                className="form-select form-select-sm border-info shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500, cursor: 'pointer' }}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Hiển thị</option>
                                <option value="false">Không hiển thị</option>
                            </select>
                        </div>
                        {/* Loại khuyến mãi */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-success mb-1" htmlFor="filterType">
                                <i className="fas fa-percent me-1"></i>Loại khuyến mãi
                            </label>
                            <select
                                id="filterType"
                                className="form-select form-select-sm border-success shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500, cursor: 'pointer' }}
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="percentage">Phần trăm (%)</option>
                                <option value="fixed_amount">Tiền cố định (VNĐ)</option>
                            </select>
                        </div>
                        {/* Ngày bắt đầu */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-primary mb-1" htmlFor="filterStartDate">
                                <i className="fas fa-calendar-alt me-1"></i>Bắt đầu từ
                            </label>
                            <input
                                id="filterStartDate"
                                type="date"
                                className="form-control form-control-sm border-primary shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500 }}
                                value={filterStartDate}
                                onChange={e => setFilterStartDate(e.target.value)}
                            />
                        </div>
                        {/* Ngày kết thúc */}
                        <div className="col-md-2">
                            <label className="form-label fw-semibold text-danger mb-1" htmlFor="filterEndDate">
                                <i className="fas fa-calendar-check me-1"></i>Kết thúc đến
                            </label>
                            <input
                                id="filterEndDate"
                                type="date"
                                className="form-control form-control-sm border-danger shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500 }}
                                value={filterEndDate}
                                onChange={e => setFilterEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                    <DataTables
                        name="Dữ liệu khuyến mãi"
                        columns={columns}
                        data={sortedPromotions}
                        numOfPages={numOfPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setItemOfPage={setItemOfPage}
                        changeKeyword={setSearchText}
                        onSelectedRows={setSelectedRows}
                    />
                </div>
            </main>
            <Modal show={showModal} onHide={() => { setShowModal(false); setItemDelete(null); setTypeDelete(null); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa khuyến mãi này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các khuyến mãi này?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={requestApiDelete}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default PromotionList;