import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig } from '../../tools/toastConfig';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(10);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    // Filter states
    const [categories, setCategories] = useState([]);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterOriginalPrice, setFilterOriginalPrice] = useState('');
    const [filterSalePrice, setFilterSalePrice] = useState('');
    const [filterStock, setFilterStock] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Sort states
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Lấy danh mục cho filter
    useEffect(() => {
        requestApi('api/categories?limit=1000', 'GET', []).then((response) => {
            if (response.data && response.data.data) setCategories(response.data.data);
        });
    }, []);

    // Lấy danh sách sản phẩm
    useEffect(() => {
        const query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        dispatch(actions.controlLoading(true));
        requestApi(`api/products${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setProducts(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, refresh]);

    // 2. Lọc dữ liệu theo filter
    const filteredProducts = products.filter(row =>
        (filterCategory === '' || (row.category && String(row.category.id) === filterCategory)) &&
        (filterOriginalPrice === '' || row.original_price.toString().includes(filterOriginalPrice)) &&
        (filterSalePrice === '' || row.sale_price.toString().includes(filterSalePrice)) &&
        (filterStock === '' || row.stock_quantity.toString().includes(filterStock)) &&
        (filterStatus === '' || String(row.status) === filterStatus)
    );

    // 3. Sắp xếp dữ liệu
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (!sortField) return 0;
        let aValue = a[sortField];
        let bValue = b[sortField];

        // Đặc biệt cho category và status
        if (sortField === 'category') {
            aValue = a.category ? a.category.name : '';
            bValue = b.category ? b.category.name : '';
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

    // 4. Hàm xử lý sort
    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // 5. Icon sort
    const renderSortIcon = (field) => {
        if (sortField !== field) return <i className="fas fa-sort text-secondary ms-1"></i>;
        return sortOrder === 'asc'
            ? <i className="fas fa-sort-up text-primary ms-1"></i>
            : <i className="fas fa-sort-down text-primary ms-1"></i>;
    };

    // 6. Columns với header có sort và width %
    const columns = [
        // { 
        //     title: () => (
        //         <span style={{cursor: 'pointer'}} onClick={() => handleSort('id')}>
        //             ID {renderSortIcon('id')}
        //         </span>
        //     ),
        //     element: row => row.id,
        //     width: "6%"
        // },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('name')}>
                    Tên sản phẩm {renderSortIcon('name')}
                </span>
            ),
            element: row => row.name,
            width: "18%"
        },
        { 
            title: "Hình ảnh", 
            element: row => <img src={row.image_url} alt={row.name} style={{width: 60, height: 40, objectFit: 'cover'}} />,
            width: "15%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('category')}>
                    Danh mục {renderSortIcon('category')}
                </span>
            ),
            element: row => row.category ? row.category.name : "",
            width: "12%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('stock_quantity')}>
                    Số lượng {renderSortIcon('stock_quantity')}
                </span>
            ),
            element: row => row.stock_quantity,
            width: "9%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('original_price')}>
                    Giá gốc {renderSortIcon('original_price')}
                </span>
            ),
            element: row => row.original_price,
            width: "11%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('sale_price')}>
                    Giá bán {renderSortIcon('sale_price')}
                </span>
            ),
            element: row => row.sale_price,
            width: "11%"
        },
        { 
            title: () => (
                <span style={{cursor: 'pointer'}} onClick={() => handleSort('status')}>
                    Trạng thái {renderSortIcon('status')}
                </span>
            ),
            element: row => row.status === 1 ? "Hiển thị" : "Ẩn",
            width: "10%"
        },
        {
            title: "Action", 
            element: row => (
                <div className="d-flex align-items-center">
                    <Link className="btn btn-info btn-sm me-1" to={`/product/detail/${row.id}`}>
                        <i className="fas fa-eye"></i>
                    </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/product/${row.id}`}>
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

    // 7. Filter header
    const filterHeader = [
        null, // ID
        null, // Tên sản phẩm
        null, // Hình ảnh
        <select
            className="form-select form-select-sm"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
        >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
        </select>,
        <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Lọc số lượng"
            value={filterStock}
            onChange={e => setFilterStock(e.target.value)}
        />,
        <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Lọc giá gốc"
            value={filterOriginalPrice}
            onChange={e => setFilterOriginalPrice(e.target.value)}
        />,
        <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Lọc giá bán"
            value={filterSalePrice}
            onChange={e => setFilterSalePrice(e.target.value)}
        />,
        
        <select
            className="form-select form-select-sm"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
        >
            <option value="">Tất cả</option>
            <option value="1">Hiển thị</option>
            <option value="0">Ẩn</option>
        </select>,
        null // Action
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
            requestApi(`api/products/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa sản phẩm thành công!", { position: "top-right", autoClose: 1000 });
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa sản phẩm thất bại", toastErrorConfig);
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
            requestApi(`api/products/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa sản phẩm thành công!", { position: "top-right", autoClose: 1000 });
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa sản phẩm thất bại", toastErrorConfig);
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

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách sản phẩm</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Danh sách sản phẩm</li>
                    </ol>
                    <div className='mb-3'>
                        <Link className="btn btn-primary me-2" to="/product/add"><i className="fas fa-plus"></i>Thêm sản phẩm</Link>
                        {selectedRows.length > 0 && <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Xóa</button>}
                    </div>
                    <DataTables
                        name="Thông tin sản phẩm"
                        columns={columns}
                        data={sortedProducts}
                        numOfPages={numOfPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setItemOfPage={setItemOfPage}
                        changeKeyword={(keyword) => setSearchText(keyword)}
                        onSelectedRows={selectedRows => setSelectedRows(selectedRows)}
                        filterHeader={filterHeader}
                    />
                </div>
            </main>
            <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa sản phẩm này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các sản phẩm này?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => {setShowModal(false)}}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => {requestApiDelete()}}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default ProductList