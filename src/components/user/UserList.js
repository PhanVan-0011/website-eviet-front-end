import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DataTables from '../common/DataTables'
import requestApi from '../../helpers/api';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import { Modal, Button } from 'react-bootstrap';
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [numOfPages, setNumOfPages] = useState(1);
    // Cần truyển url vào để lấy dữ liệu
    const [currentPage, setCurrentPage] = useState(1);
    const [itemOfPage, setItemOfPage] = useState(5);
    const dispatch = useDispatch();
    const [searchText, setSearchText] = useState('')
    // Delete
    const [selectedRows, setSelectedRows] = useState([]);
    const [itemDelete, setItemDelete] = useState(null);
    const [typeDelete, setTypeDelete] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [refresh, setRefresh] = useState(Date.now());

    const columns = [
        {title: "ID", element: row => row.id},
        {title: "First Name", element: row => row.firstName},
        {title: "Last Name", element: row => row.lastName},
        {title: "Email", element: row => row.email},
        {title: "CreatedAt", element: row => row.createdAt},
        {title: "UpdatedAt", element: row => row.updatedAt},
        {title: "Action", element: row => (<>
            
            <Link className="btn btn-primary btn-sm me-1" to={`/user/${row.id}`}><i className="fas fa-edit"></i></Link>
            <button className="btn btn-danger btn-sm me-1" onClick={() => handleDelete(row.id)}><i className="fas fa-trash"></i></button>
        </>)}
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
        dispatch(actions.controlLoading(true)); // Bắt đầu loading
        if(typeDelete === 'single'){
            requestApi(`/users/delete/${itemDelete}`, 'DELETE', []).then((response) => {
                console.log("Delete user response: ", response.data);
                setShowModal(false);
                dispatch(actions.controlLoading(false));
                setRefresh(Date.now());
            }).catch((e) => {
                console.log("Error deleting user: ", e);
                setShowModal(false);
                dispatch(actions.controlLoading(false));
            }
            )
        
        }else{
            requestApi(`/users/multi-delete?ids=${selectedRows.toString()}`, 'DELETE', []).then((response) => {
                console.log("Delete user response: ", response.data);
                setShowModal(false);
                dispatch(actions.controlLoading(false));
                setRefresh(Date.now());
            }).catch((e) => {
                console.log("Error deleting user: ", e);
                setShowModal(false);
                dispatch(actions.controlLoading(false));
            }
            )
        }
    }


    useEffect(() => {
        const query = `?limit=${itemOfPage}&page=${currentPage}&keyword=${searchText}`;
        dispatch(actions.controlLoading(true)); // Bắt đầu loading
        requestApi(`/users${query}`, 'GET', []).then((response) => {
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
                <h1 className="mt-4">User List</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                    <li className="breadcrumb-item active">User List</li>

                </ol>
                <div className='mb-3'>
                    <Link className="btn btn-primary me-2" to="/user/add"><i className="fas fa-plus"></i> Add User</Link>
                    {selectedRows.length > 0 && <button className="btn btn-danger" onClick={() => multiDelete(selectedRows)}><i className="fas fa-trash"></i> Delete</button>}
                </div>
                <DataTables 
                    name="User List"
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
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {typeDelete === 'single' ? (
                    <p>Are you sure you want to delete this user?</p>
                ) : (
                    <p>Are you sure you want to delete these users?</p>
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

export default UserList