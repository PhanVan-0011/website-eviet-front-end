import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTables from '../common/DataTables';
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
import { formatDate } from '../../tools/formatData';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const RuleList = () => {
    const [roles, setRoles] = useState([]);
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

    const columns = [
        { title: "Tên vai trò", element: row => row.name },
        { 
            title: "Danh sách quyền", 
            element: row => row.permissions && row.permissions.length > 0
                ? row.permissions.map(p => `${p.group}:${p.action}`).join(', ')
                : ''
        },
        { title: "Ngày tạo", element: row => formatDate(row.created_at) },
        { title: "Ngày cập nhật", element: row => formatDate(row.updated_at) },
        {
            title: "Hành động", element: row => (
                <>
                    <Link className="btn btn-primary btn-sm me-1" to={`/permision/${row.id}`}><i className="fas fa-edit"></i></Link>
                    <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}><i className="fas fa-trash"></i></button>
                </>
            )
        }
    ];

    // Xử lý xóa 1 vai trò
    const handleDelete = (id) => {
        setItemDelete(id);
        setTypeDelete('single');
        setShowModal(true);
   
    };
    // Xử lý xóa nhiều vai trò
    const multiDelete = () => {
        setTypeDelete('multi');
        setShowModal(true);
    };
    // Gọi API xóa
    const requestApiDelete = () => {
        dispatch(actions.controlLoading(true));
        if(typeDelete === 'single'){
            requestApi(`api/admin/roles/${itemDelete}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa vai trò thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa vai trò thất bại", toastErrorConfig);
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
            requestApi(`api/admin/roles/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                dispatch(actions.controlLoading(false));
                setShowModal(false);
                if (response.data && response.data.success) {
                    toast.success(response.data.message || "Xóa vai trò thành công!", toastSuccessConfig);
                    setRefresh(Date.now());
                } else {
                    toast.error(response.data.message || "Xóa vai trò thất bại", toastErrorConfig);
                }
                setSelectedRows([]);
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

    useEffect(() => {
        const query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        dispatch(actions.controlLoading(true));
        requestApi(`api/admin/roles${query}`, 'GET', []).then((response) => {
            dispatch(actions.controlLoading(false));
            setRoles(response.data.data);
            setNumOfPages(response.data.pagination.last_page);
        }).catch((error) => {
            dispatch(actions.controlLoading(false));
            console.log("Error fetching roles: ", error);
        });
    }, [currentPage, itemOfPage, searchText, refresh]);

    return (
        <div id="layoutSidenav_content">
            <main>
                <div className="container-fluid px-4">
                    <h1 className="mt-4">Danh sách vai trò</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                        <li className="breadcrumb-item active">Danh sách vai trò</li>
                    </ol>
                    <div className='mb-3'>
                        <Link className="btn btn-primary me-2" to="/permision/add"><i className="fas fa-plus"></i> Thêm vai trò</Link>
                        {selectedRows.length > 0 && <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Xóa</button>}
                    </div>
                    <DataTables
                        name="Dữ liệu vai trò"
                        columns={columns}
                        data={roles}
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
                        <p>Bạn chắc chắn muốn xóa vai trò này?</p>
                    ) : (
                        <p>Bạn chắc chắn muốn xóa các vai trò này?</p>
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
    );
};

export default RuleList;
