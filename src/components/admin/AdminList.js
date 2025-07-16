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
                requestApi(`api/admin/admins/${userId}`, 'GET', [])
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
                <Modal.Title>Cập nhật vai trò cho nhân viên</Modal.Title>
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
    // filter
    const [filterIsActive, setFilterIsActive] = useState('');
    const [filterRoleName, setFilterRoleName] = useState('');
    const [roles, setRoles] = useState([]);
    const [hoveredUserId, setHoveredUserId] = useState(null);
    const columns = [
        // { title: "ID", element: row => row.id },
        {
            title: "Tên",
            element: row => (
                <div style={{ display: 'flex', alignItems: 'center', minWidth: 120, position: 'relative' }}>
                    <div
                        onMouseEnter={() => setHoveredUserId(row.id)}
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
                        {hoveredUserId === row.id && (
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
                                {row.image_url && row.image_url.main_url ? (
                                    <img
                                        src={process.env.REACT_APP_API_URL + 'api/images/' + row.image_url.main_url}
                                        alt="avatar-large"
                                        style={{ width: 96, height: 96, borderRadius: '12px', objectFit: 'contain', border: '1px solid #eee', background: '#fafbfc' }}
                                    />
                                ) : (
                                    <div style={{ width: 96, height: 96, borderRadius: 12, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #eee' }}>
                                        <i className="fas fa-user fa-3x text-secondary"></i>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row.name}</span>
                </div>
            )
        },
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
                <>      <Link className="btn btn-info btn-sm me-1" to={`/admin/detail/${row.id}`}>
                            <i className="fas fa-eye"></i>
                        </Link>
                    <Link className="btn btn-primary btn-sm me-1" to={`/admin/${row.id}`}><i className="fas fa-edit"></i></Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}><i className="fas fa-trash"></i></button>
                </>
            ), width: '11%'
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
            requestApi(`api/admin/admins/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhân viên thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhân viên thất bại", toastErrorConfig);
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
            requestApi(`api/admin/admins/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa nhân viên thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa nhân viên thất bại", toastErrorConfig);
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
        requestApi('api/admin/roles?limit=1000', 'GET', []).then((res) => {
            if (res.data && res.data.data) setRoles(res.data.data);
        });
    }, []);

    useEffect(() => {
        let query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        if (filterIsActive !== '') query += `&is_active=${filterIsActive}`;
        if (filterRoleName) query += `&role_name=${filterRoleName}`;
        dispatch(actions.controlLoading(true)); // Bắt đầu loading
        console.log(query);
        requestApi(`api/admin/admins${query}`, 'GET', []).then((response) => {
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
    , [currentPage, itemOfPage, searchText, filterIsActive, filterRoleName, refresh]);
  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                <h1 className="mt-4">Danh sách nhân viên</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Danh sách nhân viên</li>
                </ol>
  
                <div className='mb-3'>
                    <Link className="btn btn-primary me-2" to="/admin/add"><i className="fas fa-plus"></i> Thêm nhân viên</Link>
                
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
                              {/* Bộ lọc */}
                              <div className="row mb-3 g-2 align-items-end">
                    {/* Lọc trạng thái */}
                    <div className="col-md-3">
                        <label className="form-label fw-semibold text-info mb-1" htmlFor="filterIsActive">
                            <i className="fas fa-toggle-on me-1"></i>Trạng thái tài khoản
                        </label>
                        <select
                            id="filterIsActive"
                            className="form-select form-select-sm border-info shadow-sm"
                            style={{ backgroundColor: '#f8f9fa', fontWeight: 500, height: 40, cursor: 'pointer' }}
                            value={filterIsActive}
                            onChange={e => setFilterIsActive(e.target.value)}
                        >
                            <option value="">Tất cả</option>
                            <option value="true">Hoạt động</option>
                            <option value="false">Không hoạt động</option>
                        </select>
                    </div>
                    {/* Lọc vai trò */}
                    <div className="col-md-3">
                        <label className="form-label fw-semibold text-primary mb-1" htmlFor="filterRoleName">
                            <i className="fas fa-user-tag me-1"></i>Vai trò
                        </label>
                        <select
                            id="filterRoleName"
                            className="form-select form-select-sm border-primary shadow-sm"
                            style={{ backgroundColor: '#f8f9fa', fontWeight: 500, height: 40, cursor: 'pointer' }}
                            value={filterRoleName}
                            onChange={e => setFilterRoleName(e.target.value)}
                        >
                            <option value="">Tất cả vai trò</option>
                            {roles.map(role => (
                                <option key={role.name} value={role.name}>{role.display_name || role.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <DataTables 
                    name="Dữ liệu nhân viên"
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
                    <p>Bạn chắc chắn muốn xóa nhân viên này?</p>
                ) : (
                    <p>Bạn chắc chắn muốn xóa các nhân viên này?</p>
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