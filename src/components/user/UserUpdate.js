import React, { use, useEffect, useState} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { set, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';

const UserUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();
     const dispatch = useDispatch();
     const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Lấy thông tin người dùng từ API
        const fetchUserData = async () => {
            try {
                const response = await requestApi(`/users/${params.id}`, 'GET');
                const fields = ['firstName', 'lastName', 'status'];
                // Gán giá trị cho các trường trong form
                fields.forEach(field => {
                    setValue(field, response.data[field]);
                });

            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };
        fetchUserData();
    })
    const handleSubmitForm = async (data) => {
       try {
         dispatch(actions.controlLoading(true));
        const response = await requestApi(`/users/update/${params.id}`, 'PUT', data);
        dispatch(actions.controlLoading(false));
        
        toast.success("Update user success", { position: "top-right" , autoClose: 1000});
        // Chuyển hướng về trang danh sách người dùng
        setTimeout(() => {
            navigation('/user');
        }
        , 1500);
    } catch (e) {
        dispatch(actions.controlLoading(false));
        console.log("Error Update user: ", e);
        if (typeof e.response.data.message !== "undefined") {
            toast.error(e.response.data.message, { position: "top-right" , autoClose: 1000});
        } else {
            toast.error("Server error", { position: "top-right" , autoClose: 1000});
        }
    }finally{
        setIsSubmitting(true); // Đặt lại trạng thái isSubmitting
    }
}


  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                <h1 className="mt-4">User Update</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                    <li className="breadcrumb-item active">User Update</li>
                </ol>
                <div className='card mb-3'>
                    <div className='card-header'>
                        <i className="fas fa-table me-1"></i>
                        Update
                    </div>
                    <div className='card-body'>
                        <div className='mb-3 row'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="col-md-6">
                                    <div className="mb-3 mt-3">
                                        <label htmlFor="firstName" className="form-label">Firstname</label>
                                        <input {...register('firstName', {required: 'Firstname is required'})} type="text" className="form-control" id="firstName" placeholder="Enter firstname" />
                                        {errors.firstName && <p style={{color: 'red'}}>{errors.firstName.message}</p>}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="lastName" className="form-label">Lastname</label>
                                        <input {...register('lastName', {required: 'Lastname is required'})} type="text" className="form-control" id="lastName" placeholder="Enter lastname" />
                                         {errors.lastName && <p style={{color: 'red'}}>{errors.lastName.message}</p>}
                                    </div>
                                    {/* <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input {...register('email', { required: 'Email is required'}, {
                                
                                        })} type="email" className="form-control" id="email" placeholder="Enter email" />
                                        {errors.email && <p style={{color: 'red'}}>{errors.email.message}</p>}
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="passWord" className="form-label">Password</label>
                                        <input {...register('passWord', { required: 'Password is required' })} type="passWord" className="form-control" id="passWord" placeholder="Enter password" />
                                         {errors.passWord && <p style={{color: 'red'}}>{errors.passWord.message}</p>}
                                    </div> */}
                                    <div className="mb-3">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <select className="form-select" id="status" {...register('status')}>
                                            <option value="1">Active</option>
                                            <option value="0">Inactive</option>
                                        </select>
                                        
                                    </div>
                                    <button type="submit" className="btn btn-primary mt-3" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</button>
                                </div>
                                

                            </form>
                        </div>
                    </div>                        
                </div>
            </div>
        </main>
    </div>
  )
}

export default UserUpdate