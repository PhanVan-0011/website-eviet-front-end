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

const AssignRoleModal = ({ show, onHide, userId, onSuccess }) => {
    const dispatch = useDispatch();
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (show) {
            dispatch(actions.controlLoading(true));
            Promise.all([
                requestApi('api/admin/roles?limit=1000', 'GET', []),
                requestApi(`api/admin/users/${userId}`, 'GET', [])
            ]).then(([rolesRes, userRes]) => {
                if (rolesRes.data && rolesRes.data.data) setRoles(rolesRes.data.data);
                if (userRes.data && userRes.data.data && userRes.data.data.roles) {
                    setSelectedRoles(userRes.data.data.roles.map(r => r.name));
                }
            }).finally(() => {
                dispatch(actions.controlLoading(false));
            });
        }
    }, [show, userId]);

    const handleChange = (roleName) => {
        setSelectedRoles(prev =>
            prev.includes(roleName)
                ? prev.filter(r => r !== roleName)
                : [...prev, roleName]
        );
    };

    const handleSubmit = async () => {
        dispatch(actions.controlLoading(true));
        setLoading(true);
        try {
            const res = await requestApi(
                `api/admin/assign-role/${userId}`,
                'POST',
                { roles: selectedRoles },
                'json',
                'application/json'
            );
            if (res.data && res.data.success) {
                dispatch(actions.controlLoading(false));
                toast.success(res.data.message || 'Cập nhật vai trò thành công!', toastSuccessConfig);
                onSuccess && onSuccess();
                onHide();
            } else {
                dispatch(actions.controlLoading(false));
                toast.error(res.data.message || 'Cập nhật vai trò thất bại!', toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(true));
            toast.error('Lỗi server!', toastErrorConfig);
        }
        setLoading(false);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Cập nhật vai trò cho người dùng</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {roles.map(role => (
                    <div className="form-check" key={role.name}>
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`role_${role.name}`}
                            checked={selectedRoles.includes(role.name)}
                            onChange={() => handleChange(role.name)}
                        />
                        <label className="form-check-label" htmlFor={`role_${role.name}`}>
                            {role.display_name || role.name}
                        </label>
                    </div>
                ))}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Hủy</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const AdminList = () => {
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

    const columns = [
        // { title: "ID", element: row => row.id },
        { title: "Tên", element: row => row.name },
        { title: "Email", element: row => row.email },
        { title: "Số điện thoại", element: row => row.phone },
      
        // { title: "Xác thực", element: row => row.is_verified ? "Đã xác thực" : "Chưa xác thực" },
        { title: "Ngày tạo", element: row => formatDate(row.created_at) },
        { title: "Ngày cập nhật", element: row => formatDate(row.updated_at) },
        {
            title: "Vai trò",
            element: row => Array.isArray(row.roles) && row.roles.length > 0
                ? row.roles.map(r => r.display_name || r.name).join(", ")
                : <span className="text-muted">Chưa có</span>
        },
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
                    <Link className="btn btn-primary btn-sm me-1" to={`/admin/${row.id}`}><i className="fas fa-edit"></i></Link>
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
            requestApi(`api/admin/users/${itemDelete}`, 'DELETE', []).then((response) => {
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
            requestApi(`api/admin/users/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
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
                <h1 className="mt-4">Danh sách người dùng</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Danh sách người dùng</li>

                </ol>
                <div className='mb-3'>
                    <Link className="btn btn-primary me-2" to="/admin/add"><i className="fas fa-plus"></i> Thêm người dùng</Link>
                
                    {selectedRows.length > 0 && <button
                        className="btn btn-warning me-2"
                        // disabled={selectedRows.length !== 1}
                        onClick={() => { setAssignUserId(selectedRows[0]); setShowAssignRole(true); }}
                    >
                        <i className="fas fa-user-tag"></i> Cập nhật vai trò
                    </button>
                    }
                    {selectedRows.length > 0 && <button className="btn btn-danger me-2" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Delete</button>}
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
        <AssignRoleModal
            show={showAssignRole}
            onHide={() => setShowAssignRole(false)}
            userId={assignUserId}
            onSuccess={() => setRefresh(Date.now())}
        />
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

export default AdminList