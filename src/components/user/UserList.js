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
import moment from 'moment';


const UserList = () => {
    const [users, setUsers] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    // Cần truyển url vào để lấy dữ liệu
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(25);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    // Delete
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());
    const [showAssignRole, setShowAssignRole] = useState(false);
    const [assignUserId, setAssignUserId] = useState(null);
    const [hoveredUserId, setHoveredUserId] = useState(null);

    const columns = [
        { title: "Khách hàng", element: row => (
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 120, position: 'relative' }}>
                    <div
                        onMouseEnter={() => row.image_url && row.image_url.thumb_url && setHoveredUserId(row.id)}
                        onMouseLeave={() => setHoveredUserId(null)}
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        {row.image_url && row.image_url.thumb_url ? (
                            <img
                                src={process.env.REACT_APP_API_URL + 'api/images/' + row.image_url.thumb_url}
                                alt="avatar"
                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'contain', border: '1px solid #eee', background: '#fafbfc', marginRight: 10, cursor: 'pointer' }}
                            />
                        ) : (
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee', marginRight: 10 }}>
                                <i className="fas fa-user fa-sm text-secondary"></i>
                            </div>
                        )}
                        {/* Popup preview */}
                        {hoveredUserId === row.id && row.image_url && row.image_url.main_url && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: -110,
                                    left: 0,
                                    zIndex: 100,
                                    background: '#fff',
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                                    padding: 6,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: 100,
                                    minHeight: 100
                                }}
                            >
                                <img
                                    src={process.env.REACT_APP_API_URL + 'api/images/' + row.image_url.main_url}
                                    alt="avatar-large"
                                    style={{ width: 96, height: 96, borderRadius: '12px', objectFit: 'contain', border: '1px solid #eee', background: '#fafbfc' }}
                                />
                            </div>
                        )}
                    </div>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
                </div>
            ), width: '18%' },
        { title: "Email", element: row => row.email, width: '13%' },
        { title: "Số điện thoại", element: row => row.phone, width: '12%' },
        { title: "Giới tính", element: row => row.gender === "male" ? "Nam" : row.gender === "female" ? "Nữ" : "Khác", width: '5%' },
        {
            title: "Ngày sinh",
            element: row => {
                if (!row.date_of_birth) return "";
                // Thử parse với nhiều định dạng
                const m = moment(row.date_of_birth, ["DD/MM/YYYY", "YYYY-MM-DD", "YYYY/MM/DD"], true);
                return m.isValid() ? m.format("DD/MM/YYYY") : "";
            },
            width: '8%'
        },
        // { title: "Xác thực", element: row => row.is_verified ? "Đã xác thực" : "Chưa xác thực" },
        { title: "Ngày tạo", element: row => formatDate(row.created_at), width: '9%' },
        { title: "Ngày cập nhật", element: row => formatDate(row.updated_at), width: '9%' },
        {
            title: "Trạng thái",
            element: row =>
                row.is_active
                    ? <span className="badge bg-success">Hoạt động</span>
                    : <span className="badge bg-secondary">Không hoạt động</span>,
            width: '6%'
        },
        {
            title: "Hành động", element: row => (
                <>
                    <Link className="btn btn-primary btn-sm me-1" to={`/user/${row.id}`}><i className="fas fa-edit"></i></Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}><i className="fas fa-trash"></i></button>
                    {/* <button className="btn btn-warning btn-sm me-1" onClick={() => { setAssignUserId(row.id); setShowAssignRole(true); }}><i className="fas fa-user-tag"></i> Gán vai trò</button> */}
                </>
                
            ), width: '8%'
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
            requestApi(`api/admin/users/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khách hàng thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khách hàng thất bại", toastErrorConfig);
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
            requestApi(`api/admin/users/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa khách hàng thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa khách hàng thất bại", toastErrorConfig);
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
        requestApi(`api/admin/users${query}`, 'GET', []).then((response) => {
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
                <h1 className="mt-4">Danh sách khách hàng</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Danh sách khách hàng</li>

                </ol>
                <div className='mb-3'>
                    <Link className="btn btn-primary me-2 add-custom-btn" to="/user/add"><i className="fas fa-plus"></i> Thêm khách hàng</Link>
                    {selectedRows.length > 0 && <button className="btn btn-danger add-custom-btn" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Xóa</button>}
                </div>
                <DataTables
                    name="Dữ liệu khách hàng"
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
        {/* <AssignRoleModal
            show={showAssignRole}
            onHide={() => setShowAssignRole(false)}
            userId={assignUserId}
            onSuccess={() => setRefresh(Date.now())}
        /> */}
        <Modal show={showModal} onHide={() => {setShowModal(false); setItemDelete(null); setTypeDelete(null)}}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {typeDelete === 'single' ? (
                    <p>Bạn chắc chắn muốn xóa khách hàng này?</p>
                ) : (
                    <p>Bạn chắc chắn muốn xóa các khách hàng này?</p>
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