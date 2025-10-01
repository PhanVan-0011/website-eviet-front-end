import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import {
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import LiveSearch from '../common/LiveSearch';

const BranchList = () => {
    const [branches, setBranches] = useState([]);
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

    // Filter states
    const [filterValues, setFilterValues] = useState({
        status: 'all',
        dateRange: { from: null, to: null }
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    const columns = [
        { 
            title: "Mã chi nhánh", 
            element: row => row.code,
            width: "15%"
        },
        { 
            title: "Tên chi nhánh", 
            element: row => row.name,
            width: "25%"
        },
        { 
            title: "Địa chỉ", 
            element: row => row.address,
            width: "30%"
        },
        { 
            title: "Số điện thoại", 
            element: row => row.phone_number,
            width: "15%"
        },
        { 
            title: "Ngày tạo", 
            element: row => formatDate(row.created_at),
            width: "12%"
        },
        {
            title: "Trạng thái",
            element: row => row.active === 1
                ? <span className="badge bg-success">Hoạt động</span>
                : <span className="badge bg-secondary">Không hoạt động</span>,
            width: "10%"
        },
        {
            title: "Hành động", 
            element: row => (
                <div className="d-flex gap-1">
                    <Link className="btn btn-primary btn-sm" to={`/branch/${row.id}`} title="Chỉnh sửa">
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)} title="Xóa">
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: "12%"
        }
    ];

    // Handle single Delete
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
    }
    
    // Handle Multi Delete
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    }
    
    // Delete
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if(typeDelete === 'single'){
            requestApi(`api/admin/branches/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa chi nhánh thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa chi nhánh thất bại", toastErrorConfig);
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
            requestApi(`api/admin/branches/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa chi nhánh thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa chi nhánh thất bại", toastErrorConfig);
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
    }

    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        
        // Thêm filter status
        if (filterValues.status !== 'all') {
            query += `&active=${filterValues.status === 'active' ? '1' : '0'}`;
        }
        
        // Thêm filter date range
        if (filterValues.dateRange.from && filterValues.dateRange.to) {
            const startDate = filterValues.dateRange.from.toISOString().split('T')[0];
            const endDate = filterValues.dateRange.to.toISOString().split('T')[0];
            query += `&start_date=${startDate}&end_date=${endDate}`;
        }
        
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/branches${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setBranches(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, refresh, filterValues]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Danh sách chi nhánh</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* Trạng thái */}
                                    <FilterButtonGroup
                                        label="Trạng thái"
                                        value={filterValues.status || 'all'}
                                        onChange={(value) => updateFilter('status', value)}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: 'active', label: 'Hoạt động' },
                                            { value: 'inactive', label: 'Không hoạt động' }
                                        ]}
                                    />

                                    {/* Thời gian tạo */}
                                    <FilterDateRange
                                        label="Thời gian tạo"
                                        value={filterValues.dateRange || { from: null, to: null }}
                                        onChange={(dateRange) => updateFilter('dateRange', dateRange)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Nội dung chính */}
                        <div className={`main-content-area ${isFilterVisible ? 'col-md-10' : 'col-md-12'} transition-all d-flex flex-column ${!isFilterVisible ? 'expanded' : ''}`}>
                            {/* Search bar với các nút action */}
                            <div className="p-3 border-bottom bg-light search-bar">
                                <div className="row align-items-center">
                                    <div className="col-md-4">
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <i className="fas fa-search"></i>
                                            </span>
                                            <LiveSearch 
                                                changeKeyword={setSearchText}
                                                placeholder="Tìm kiếm theo tên hoặc mã chi nhánh..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-end gap-2">
                                            {/* Nút tạo mới */}
                                            <Link className="btn btn-primary" to="/branch/add">
                                                <i className="fas fa-plus me-1"></i> Tạo mới
                                            </Link>
                                            
                                            {/* Nút xóa nhiều */}
                                            {selectedRows.length > 0 && (
                                                <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                                    <i className="fas fa-trash me-1"></i> Xóa ({selectedRows.length})
                                                </button>
                                            )}
                                            
                                            {/* Các nút khác */}
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-upload me-1"></i> Import file
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-download me-1"></i> Xuất file
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-cog"></i>
                                            </button>
                                            <button className="btn btn-secondary">
                                                <i className="fas fa-question-circle"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Search results info */}
                                {searchText && (
                                    <div className="search-results-info">
                                        <small>
                                            <i className="fas fa-info-circle me-1"></i>
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {branches.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-dark">Danh sách chi nhánh</h4>
                                    {/* Filter Toggle Button */}
                                    <FilterToggleButton
                                        key={`toggle-${isFilterVisible}`}
                                        isVisible={isFilterVisible}
                                        onToggle={() => {
                                            setIsPulsing(true);
                                            setTimeout(() => setIsPulsing(false), 600);
                                            toggleFilterVisibility();
                                        }}
                                        isPulsing={isPulsing}
                                    />
                                </div>
                            </div>

                            {/* Data Table */}
                            <div className="flex-grow-1 overflow-auto">
                                <div className="p-3">
                                    <DataTables 
                                        name="Danh sách chi nhánh"
                                        columns={columns}
                                        data={branches}
                                        numOfPages={numOfPages}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setItemOfPage={setItemOfPage}
                                        hideSearch={true}
                                        onSelectedRows={ (selectedRows) => setSelectedRows(selectedRows)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa chi nhánh này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các chi nhánh này?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {setShowModal(false)}}>
                        Hủy
                    </Button>
                    <Button variant="danger" onClick={() => {requestApiDelete()}}>
                        Xóa
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default BranchList
