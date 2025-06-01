import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig } from '../../tools/toastConfig'
const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(5);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    const columns = [
        // { title: "ID", element: row => row.id },
        { title: "Tên danh mục", element: row => row.name },
        { title: "Mô tả", element: row => row.description },
        // { title: "Danh mục cha", element: row => row.parent ? row.parent.name : "" },
        { title: "Ngày tạo", element: row => formatDate(row.created_at) },
        { title: "Ngày cập nhật", element: row => formatDate(row.updated_at) },
        {
            title: () => (
                <span style={{ cursor: 'pointer' }}>
                    Sản phẩm
                </span>
            ),
            element: row => (
                <Link
                    to={`/product?category_id=${row.id}`}
                    className="text-decoration-underline text-primary"
                    title="Xem danh sách sản phẩm"
                    style={{ cursor: 'pointer' }}
                >
                    {row.products_count} sản phẩm
                </Link>
            )
        },
        {
            title: "Trạng thái",
            element: row => row.status === 1
                ? <span className="badge bg-success">Hiển thị</span>
                : <span className="badge bg-secondary">Ẩn</span>
        },
        {
            title: "Hành động", element: row => (
                <>
                    <Link className="btn btn-primary btn-sm me-1" to={`/category/${row.id}`}><i className="fas fa-edit"></i></Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}><i className="fas fa-trash"></i></button>
                </>
            )
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
            requestApi(`api/categories/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa danh mục thành công!", { position: "top-right", autoClose: 1000 });
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa danh mục thất bại", toastErrorConfig);
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
            requestApi(`api/categories/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa danh mục thành công!", { position: "top-right", autoClose: 1000 });
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa danh mục thất bại", toastErrorConfig);
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
        const query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        dispatch(actions.controlLoading(true));
        requestApi(`api/categories${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setCategories(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
        });
    }, [currentPage, itemOfPage, searchText, refresh]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách danh mục</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Danh sách danh mục</li>
                    </ol>
                    <div className='mb-3'>
                        <Link className="btn btn-primary me-2" to="/category/add"><i className="fas fa-plus"></i> Thêm danh mục</Link>
                        {selectedRows.length > 0 && <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Xóa</button>}
                    </div>
                    <DataTables 
                        name="Dữ liệu danh mục"
                        columns={columns}
                        data={categories}
                        numOfPages={numOfPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        setItemOfPage={setItemOfPage}
                        changeKeyword={(keyword) => setSearchText(keyword)}
                        onSelectedRows={ (selectedRows) => setSelectedRows(selectedRows)}
                    />
                </div>
            </main>
            <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {typeDelete === 'single' ? (
                        <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
                    ) : (
                        <p>Bạn có chắc chắn muốn xóa các danh mục này?</p>
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

export default CategoriesList