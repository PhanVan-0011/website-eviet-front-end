import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import ImageList from '../common/ImageList';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { vi } from 'date-fns/locale';
import moment from 'moment';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const ComboList = () => {
    const [combos, setCombos] = useState([]);
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
    const [filterStartDateFrom, setFilterStartDateFrom] = useState(null);
    const [filterStartDateTo, setFilterStartDateTo] = useState(null);
    const [filterEndDateFrom, setFilterEndDateFrom] = useState(null);
    const [filterEndDateTo, setFilterEndDateTo] = useState(null);
    const [filterPriceRange, setFilterPriceRange] = useState('');

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Lấy danh sách combo với filter
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        if (filterStatus !== '') query += `&is_active=${filterStatus}`;
        if (filterStartDateFrom) query += `&start_date_from=${moment(filterStartDateFrom).format('YYYY-MM-DD')}`;
        if (filterStartDateTo) query += `&start_date_to=${moment(filterStartDateTo).format('YYYY-MM-DD')}`;
        if (filterEndDateFrom) query += `&end_date_from=${moment(filterEndDateFrom).format('YYYY-MM-DD')}`;
        if (filterEndDateTo) query += `&end_date_to=${moment(filterEndDateTo).format('YYYY-MM-DD')}`;
        if (filterPriceRange) {
            const [min, max] = filterPriceRange.split('-');
            if (min) query += `&min_price=${min}`;
            if (max) query += `&max_price=${max}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/combos${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setCombos(response.data.data);
            setNumOfPages(response.data.pagination ? response.data.pagination.last_page : 1);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [
        currentPage,
        itemOfPage,
        searchText,
        filterStatus,

        filterStartDateFrom,
        filterEndDateTo,
        filterPriceRange,
        refresh,
        dispatch
    ]);

    // Sort logic
    const sortedCombos = [...combos].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'price') {
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
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Tên combo {renderSortIcon('name')}
                </span>
            ),
            element: row => row.name,
            width: "18%"
        },
    
         {
          title: "Hình ảnh",
          element: row => {
            let featured = null;
            if (Array.isArray(row.image_urls) && row.image_urls.length > 0) {
              featured = row.image_urls.find(img => img.is_featured) || row.image_urls[0];
            }
            return featured && featured.thumb_url ? (
              <ImageList src={urlImage + featured.thumb_url} alt={row.name} />
            ) : (
              <ImageList icon alt="Không có ảnh" />
            );
          },
          width: '12%'
        },
        {
            title: "Mô tả",
            element: row => (
                <div
                    style={{
                        maxWidth: 320,
                        maxHeight: 120,
                        overflow: 'auto',
                        whiteSpace: 'pre-line',
                        textOverflow: 'ellipsis'
                    }}
                    dangerouslySetInnerHTML={{ __html: row.description }}
                />
            ),
            width: "20%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('price')}>
                    Giá {renderSortIcon('price')}
                </span>
            ),
            element: row => (
                <div>
                    {Number(row.price).toLocaleString()} ₫
                </div>
            ),
            width: "10%"
        },
        {
            title: "Ngày bắt đầu",
            element: row => row.start_date ? moment(row.start_date).format('DD/MM/YYYY') : '',
            width: "10%"
        },
        {
            title: "Ngày kết thúc",
            element: row => row.end_date ? moment(row.end_date).format('DD/MM/YYYY') : '',
            width: "10%"
        },
        {
            title: "Trạng thái",
            element: row => row.is_active
                ? <span className="badge bg-success">Hiển thị</span>
                : <span className="badge bg-secondary">Không hiển thị</span>,
            width: "10%"
        },
        {
            title: "Hành động",
            element: row => (
                
                <div className="d-flex align-items-center">
                     <Link className="btn btn-info btn-sm me-1" to={`/combo/detail/${row.id}`}>
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/combo/${row.id}`}>
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: "10%"
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
            requestApi(`api/admin/combos/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa combo thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa combo thất bại", toastErrorConfig);
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
            requestApi(`api/admin/combos/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa combo thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa combo thất bại", toastErrorConfig);
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
                    <h1 className="mt-4">Danh sách combo</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Combo</li>
                    </ol>
                    <div className='mb-3'>
                        <Link className="btn btn-primary me-2" to="/combo/add">
                            <i className="fas fa-plus"></i> Thêm combo
                        </Link>
                        {selectedRows.length > 0 && (
                            <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}>
                                <i className="fas fa-trash"></i> Xóa
                            </button>
                        )}
                    </div>
                    {/* Bộ lọc */}
                    <div className="row mb-3 g-1 align-items-end">
                        {/* Trạng thái */}
                        <div className="col-3 d-flex flex-column">
                            <label className="form-label fw-semibold text-info mb-1" htmlFor="filterStatus">
                                <i className="fas fa-toggle-on me-1"></i>Trạng thái
                            </label>
                            <select
                                id="filterStatus"
                                className="form-select form-select-sm border-info shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500,height:40, cursor: 'pointer' }}
                                value={filterStatus}
                                onChange={e => setFilterStatus(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="true">Hiển thị</option>
                                <option value="false">Không hiển thị</option>
                            </select>
                        </div>
                        {/* Giá tối thiểu */}
                        <div className="col-3 d-flex flex-column">
                            <label className="form-label fw-semibold text-success mb-1" htmlFor="filterPriceRange">
                                <i className="fas fa-money-bill-wave me-1"></i>Khoảng giá
                            </label>
                            <select
                                id="filterPriceRange"
                                className="form-select form-select-sm border-success shadow-sm"
                                style={{ backgroundColor: '#f8f9fa', fontWeight: 500,height:40, cursor: 'pointer' }}
                                value={filterPriceRange}
                                onChange={e => setFilterPriceRange(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="0-10000">Dưới 10.000 ₫</option>
                                <option value="10000-20000">10.000 ₫ - 20.000 ₫</option>
                                <option value="20000-40000">20.000 ₫ - 40.000 ₫</option>
                                <option value="40000-70000">40.000 ₫ - 70.000 ₫</option>
                                <option value="70000-100000">70.000 ₫ - 100.000 ₫</option>
                                <option value="100000-200000">100.000 ₫ - 200.000 ₫</option>
                                <option value="200000-">Trên 200.000 ₫</option>
                            </select>
                        </div>
                        {/* Khoảng ngày bắt đầu và kết thúc chia làm 4 cột riêng biệt */}
                        <div className="col-3 d-flex flex-column">
                            <label className="form-label fw-semibold text-primary mb-1">
                                <i className="fas fa-calendar-alt me-1"></i>Bắt đầu từ
                            </label>
                            <DatePicker
                                selected={filterStartDateFrom}
                                onChange={date => setFilterStartDateFrom(date)}
                                locale={vi}
                                dateFormat="dd/MM/yyyy"
                                className="form-control form-control-sm border-primary shadow-sm select-date-custom"

                                placeholderText="Chọn ngày: dd/mm/yyyy"
                                id="filterStartDateFrom"
                                isClearable
                            />
                        </div>
            
                        <div className="col-3 d-flex flex-column">
                            <label className="form-label fw-semibold text-danger mb-1">
                                <i className="fas fa-calendar-check me-1"></i>Kết thúc đến
                            </label>
                            <DatePicker
                                selected={filterEndDateTo}
                                onChange={date => setFilterEndDateTo(date)}
                                locale={vi}
                                dateFormat="dd/MM/yyyy"
                                className="form-control form-control-sm border-danger shadow-sm select-date-custom"
                                
                                placeholderText="Chọn ngày: dd/mm/yyyy"
                                id="filterEndDateTo"
                                isClearable
                            />
                        </div>
                    </div>
                    <DataTables
                        name="Dữ liệu combo"
                        columns={columns}
                        data={sortedCombos}
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
                        <p>Bạn có chắc chắn muốn xóa combo này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các combo này?</p>
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

export default ComboList;