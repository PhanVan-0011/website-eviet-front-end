import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { set, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
const UserAdd = () => {
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();
     const dispatch = useDispatch();
     const [isSubmitting, setIsSubmitting] = useState(false); // Thêm trạng thái isSubmitting
    const handleSubmitForm = async (data) => {
       try {
         dispatch(actions.controlLoading(true));
        const response = await requestApi('api/users/create', 'POST', data);
        dispatch(actions.controlLoading(false));
        
        toast.success("Create user success", { position: "top-right" , autoClose: 1000});
        // Chuyển hướng về trang danh sách người dùng
        setTimeout(() => {
            navigation('/user');
        }
        , 1500);
    } catch (e) {
        dispatch(actions.controlLoading(false));
        console.log("Error creating user: ", e);
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
                <h1 className="mt-4">User Add</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Dashboard</Link></li>
                    <li className="breadcrumb-item active">User Add</li>
                </ol>
                <div className='card mb-3'>
                    <div className='card-header'>
                        <i className="fas fa-table me-1"></i>
                        Add
                    </div>
                    <div className='card-body'>
                        <div className='mb-3 row'>
                            <form onSubmit={handleSubmit(handleSubmitForm)}>
    <div className="row mb-3">
        <div className="col-md-6">
            <div className="form-floating mb-3 mb-md-0">
                <input
                    className="form-control"
                    id="inputName"
                    {...register('name', { required: 'Tên người dùng là bắt buộc' })}
                    placeholder="Nhập tên người dùng"
                />
                <label htmlFor="inputName">
                    Tên người dùng <span style={{color: 'red'}}>*</span>
                </label>
                {errors.name && <div className="text-danger">{errors.name.message}</div>}
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-floating">
                <input
                    className="form-control"
                    id="inputAddress"
                    {...register('address')}
                    placeholder="Nhập địa chỉ"
                />
                <label htmlFor="inputAddress">Địa chỉ</label>
            </div>
        </div>
    </div>

    <div className="row mb-3">
        <div className="col-md-6">
            <div className="form-floating mb-3 mb-md-0">
                <input
                    className="form-control"
                    id="inputPhone"
                    {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                    placeholder="Nhập số điện thoại"
                />
                <label htmlFor="inputPhone">
                    Số điện thoại <span style={{color: 'red'}}>*</span>
                </label>
                {errors.phone && <div className="text-danger">{errors.phone.message}</div>}
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-floating">
                <input
                    className="form-control"
                    id="inputEmail"
                    type="email"
                    {...register('email', { required: 'Email là bắt buộc' })}
                    placeholder="Nhập email"
                />
                <label htmlFor="inputEmail">
                    Email <span style={{color: 'red'}}>*</span>
                </label>
                {errors.email && <div className="text-danger">{errors.email.message}</div>}
            </div>
        </div>
    </div>

    <div className="row mb-3">
        <div className="col-md-6">
            <div className="form-floating mb-3 mb-md-0">
                <input
                    className="form-control"
                    id="inputPassword"
                    type="password"
                    {...register('password', { required: 'Mật khẩu là bắt buộc' })}
                    placeholder="Nhập mật khẩu"
                />
                <label htmlFor="inputPassword">
                    Mật khẩu <span style={{color: 'red'}}>*</span>
                </label>
                {errors.password && <div className="text-danger">{errors.password.message}</div>}
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-floating mb-3 mb-md-0">
                <input
                    className="form-control"
                    id="inputPasswordConfirm"
                    type="password"
                    {...register('password_confirmation', { required: 'Vui lòng xác nhận mật khẩu' })}
                    placeholder="Xác nhận mật khẩu"
                />
                <label htmlFor="inputPasswordConfirm">
                    Xác nhận mật khẩu <span style={{color: 'red'}}>*</span>
                </label>
                {errors.password_confirmation && <div className="text-danger">{errors.password_confirmation.message}</div>}
            </div>
        </div>
    </div>

    <div className="row mb-3">
        <div className="col-md-6">
            <div className="form-floating mb-3 mb-md-0">
                <select
                    className="form-select"
                    id="inputGender"
                    {...register('gender')}
                    defaultValue=""
                >
                    <option value="" disabled>Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                </select>
                <label htmlFor="inputGender">Giới tính</label>
            </div>
        </div>
        <div className="col-md-6">
            <div className="form-floating">
                <input
                    className="form-control"
                    id="inputDob"
                    type="date"
                    {...register('date_of_birth')}
                    placeholder="Ngày sinh"
                />
                <label htmlFor="inputDob">Ngày sinh</label>
            </div>
        </div>
    </div>

    <div className="row mb-3">
        <div className="col-md-6">
            <div className="form-floating mb-3 mb-md-0">
                <select className="form-select" id="is_active" {...register('is_active', { required: true })}>
                    <option value="1">Hoạt động</option>
                    <option value="0">Chưa Hoạt động</option>
                </select>
                <label htmlFor="is_active">Hoạt động</label>
            </div>
        </div>
       
    </div>

   

    <div className="mt-4 mb-0">
        <div className="d-grid">
            <button className="btn btn-primary btn-block" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Đang gửi..." : "Thêm mới"}
            </button>
        </div>
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

export default UserAdd