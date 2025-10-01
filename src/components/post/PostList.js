import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import moment from 'moment';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';
import ImageList from '../common/ImageList';
import {
    FilterSelectSingle,
    FilterSelectMulti,
    FilterButtonGroup,
    FilterDateRange,
    FilterToggleButton
} from '../common/FilterComponents';
import LiveSearch from '../common/LiveSearch';
const urlImage = process.env.REACT_APP_API_URL + 'api/images/';

const PostList = () => {
    const [posts, setPosts] = useState([]);
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
        category: 'all',
        status: 'all'
    });
    const [isFilterVisible, setIsFilterVisible] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    // Data for filters
    const [categories, setCategories] = useState([]);

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');


    const updateFilter = (key, value) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
    };

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Lấy danh mục cho filter
    useEffect(() => {
        requestApi('api/admin/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
        });
    }, []);

    // Lấy danh sách bài viết
    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        
        // New filter panel filters
        if (filterValues.category && filterValues.category !== 'all') {
            query += `&category_id=${filterValues.category}`;
        }
        if (filterValues.status && filterValues.status !== 'all') {
            query += `&status=${filterValues.status}`;
        }

        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/posts${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setPosts(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch(() => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, filterValues, refresh, dispatch]);

    // Sắp xếp
    const sortedPosts = [...posts].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'category') {
            aValue = a.categories && a.categories[0] ? a.categories[0].name : '';
            bValue = b.categories && b.categories[0] ? b.categories[0].name : '';
        }
        if (sortField === 'status') {
            aValue = a.status;
            bValue = b.status;
        }
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

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
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('title')}>
                    Tiêu đề {renderSortIcon('title')}
                </span>
            ),
            element: row => row.title,
            width: "22%"
        },
        {
            title: "Hình ảnh",
            element: row => (
                row.featured_image && row.featured_image.thumb_url ? (
                    <ImageList
                        src={urlImage + row.featured_image.thumb_url}
                        alt={row.title}
                    />
                ) : (
                    <ImageList icon alt="Không có ảnh" />
                )
            ),
            width: "16%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    Danh mục {renderSortIcon('category')}
                </span>
            ),
            element: row =>
                row.categories && row.categories.length > 0
                    ? row.categories.map(cat => cat.name).join(', ')
                    : <span className="text-muted">Chưa phân loại</span>,
            width: "18%"
        },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                    Trạng thái {renderSortIcon('status')}
                </span>
            ),
            element: row =>
                row.status === 1
                    ? <span className="badge bg-success">Hiển thị</span>
                    : <span className="badge bg-secondary">Ẩn</span>,
            width: "10%"
        },
        {
            title: "Ngày tạo",
            element: row => (
                <>
                    <span>{moment(row.created_at).format('HH:mm')}</span><br />
                    <span>{moment(row.created_at).format('DD-MM-YYYY')}</span>
                </>
            ),
            width: "12%"
        },
        {
            title: "Ngày cập nhật",
            element: row => (
                <>
                    <span>{moment(row.updated_at).format('HH:mm')}</span><br />
                    <span>{moment(row.updated_at).format('DD-MM-YYYY')}</span>
                </>
            ),
            width: "12%"
        },
        {
            title: "Hành động",
            element: row => (
                <div className="d-flex align-items-center">
                    <Link className="btn btn-info btn-sm me-1" to={`/post/detail/${row.id}`}>
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/post/${row.id}`}>
                        <i className="fas fa-edit"></i>
                    </Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}>
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            ),
            width: "10%"
        }
    ];

    // Xử lý xóa
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
            requestApi(`api/admin/posts/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa bài viết thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa bài viết thất bại", toastErrorConfig);
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
            requestApi(`api/admin/posts/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa bài viết thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa bài viết thất bại", toastErrorConfig);
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
                    <h1 className="mt-4"></h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Tổng quan</Link></li>
                        <li className="breadcrumb-item active">Danh sách bài viết</li>
                    </ol>
                    
                    {/* Layout chính với FilterPanel và nội dung */}
                    <div className="row g-0">
                        {/* Filter Panel */}
                        <div className={`position-relative filter-panel ${isFilterVisible ? 'col-md-2' : 'col-md-0'} transition-all d-flex flex-column`}>
                            {isFilterVisible && (
                                <div className="p-3 filter-content">
                                    {/* <h6 className="fw-bold mb-3 text-primary text-center" style={{ fontSize: '0.9rem' }}>
                                        <i className="fas fa-newspaper me-1"></i>
                                        Bài viết
                                    </h6> */}

                                    {/* Danh mục */}
                                    <FilterSelectSingle
                                        label="Danh mục"
                                        value={filterValues.category ? {
                                            value: filterValues.category,
                                            label: filterValues.category === 'all' ? 'Tất cả' : 
                                                   categories.find(cat => cat.id == filterValues.category)?.name || filterValues.category
                                        } : null}
                                        onChange={(selected) => updateFilter('category', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            ...categories.map(cat => ({
                                                value: cat.id,
                                                label: cat.name
                                            }))
                                        ]}
                                        placeholder="Chọn danh mục"
                                    />

                                    {/* Trạng thái */}
                                    <FilterSelectSingle
                                        label="Trạng thái"
                                        value={filterValues.status ? {
                                            value: filterValues.status,
                                            label: filterValues.status === 'all' ? 'Tất cả' : 
                                                   filterValues.status === '1' ? 'Hiển thị' : 'Ẩn'
                                        } : null}
                                        onChange={(selected) => updateFilter('status', selected ? selected.value : 'all')}
                                        options={[
                                            { value: 'all', label: 'Tất cả' },
                                            { value: '1', label: 'Hiển thị' },
                                            { value: '0', label: 'Ẩn' }
                                        ]}
                                        placeholder="Chọn trạng thái"
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
                                                placeholder="Tìm kiếm theo tiêu đề, nội dung..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <div className="d-flex justify-content-end gap-2">
                                            {/* Nút tạo mới */}
                                            <Link className="btn btn-primary" to="/post/add">
                                                <i className="fas fa-plus me-1"></i> Tạo mới
                                            </Link>
                                            
                                            {/* Nút xóa nhiều */}
                                            {selectedRows.length > 0 && (
                                                <button className="btn btn-danger" onClick={multiDelete}>
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
                                            Đang tìm kiếm: "<strong>{searchText}</strong>" - Tìm thấy {sortedPosts.length} kết quả
                                        </small>
                                    </div>
                                )}
                            </div>

                            {/* Header với tiêu đề */}
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white flex-shrink-0">
                                <div className="d-flex align-items-center gap-2">
                                    <h4 className="mb-0 fw-bold text-primary">Danh sách bài viết</h4>
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
                                        name="Danh sách bài viết"
                                        columns={columns}
                                        data={sortedPosts}
                                        numOfPages={numOfPages}
                                        currentPage={currentPage}
                                        setCurrentPage={setCurrentPage}
                                        setItemOfPage={setItemOfPage}
                                        onSelectedRows={setSelectedRows}
                                        hideSearch={true}
                                        showSummary={false}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Modal show={showModal} onHide={() => { setShowModal(false); setItemDelete(null); setTypeDelete(null); }}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa bài viết này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các bài viết này?</p>
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

export default PostList;