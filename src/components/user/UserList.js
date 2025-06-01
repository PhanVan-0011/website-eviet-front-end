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

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    // Cần truyển url vào để lấy dữ liệu
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(10);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    // Delete
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    const columns = [
        // { title: "ID", element: row => row.id },
        { title: "Tên", element: row => row.name },
        { title: "Email", element: row => row.email },
        { title: "Số điện thoại", element: row => row.phone },
        { title: "Giới tính", element: row => row.gender === "male" ? "Nam" : row.gender === "female" ? "Nữ" : "Khác" },
        { title: "Ngày sinh", element: row => row.date_of_birth ? formatDate(row.date_of_birth) : "" },
        // { title: "Xác thực", element: row => row.is_verified ? "Đã xác thực" : "Chưa xác thực" },
        { title: "Ngày tạo", element: row => formatDate(row.created_at) },
        { title: "Ngày cập nhật", element: row => formatDate(row.updated_at) },
        {
            title: "Trạng thái",
            element: row =>
                row.is_active
                    ? <span className="badge bg-success">Hoạt động</span>
                    : <span className="badge bg-secondary">Không hoạt động</span>
        },
        {
            title: "Hành động", element: row => (
                <>
                    <Link className="btn btn-primary btn-sm me-1" to={`/user/${row.id}`}><i className="fas fa-edit"></i></Link>
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
            requestApi(`api/users/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa người dùng thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa người dùng thất bại", toastErrorConfig);
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
            requestApi(`api/users/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa người dùng thành công!", { position: "top-right", autoClose: 1000 });
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa người dùng thất bại", toastErrorConfig);
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
        dispatch(actions.controlLoading(true)); // Bắt đầu loading
        requestApi(`api/users${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false)); 
            setUsers(response.data.data);
            setNumOfPages(response.data.last_page);
            console.log("Users: ", response.data);
            console.log("Num of pages: ", response.data.last_page);
            console.log("Current page: ", response.data.page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false)); 
            console.log("Error fetching users: ", error);
        }   
    );
    }
    , [currentPage, itemOfPage, searchText, refresh]);
  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                <h1 className="mt-4">Danh sách người dùng</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Danh sách người dùng</li>

                </ol>
                <div className='mb-3'>
                    <Link className="btn btn-primary me-2" to="/user/add"><i className="fas fa-plus"></i> Thêm người dùng</Link>
                    {selectedRows.length > 0 && <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Delete</button>}
                </div>
                <DataTables 
                    name="Dữ liệu người dùng"
                    columns={columns}
                    data={users}
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
                    <p>Bạn chắc chắn muốn xóa người dùng này?</p>
                ) : (
                    <p>Bạn chắc chắn muốn xóa các người dùng này?</p>
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

export default UserList