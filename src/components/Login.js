
import { Link,useNavigate } from 'react-router-dom'
import { useState } from 'react';
import { useEffect } from 'react';
import React from 'react'
import requestApi from '../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig } from '../tools/toastConfig';
import { useDispatch } from 'react-redux';
import * as actions from '../redux/actions/index';

const Login = () => {
    const dispatch = useDispatch();
    const navigation = useNavigate();
    const [loginData, setLoginData] =  useState({});
    const [errors, setErrors] = useState({});
    
    const [isSubmit, setIsSubmit] = useState(false); // Biến trạng thái để kiểm tra submit  
    const onChange = (e) => {
        
        setLoginData({...loginData, [e.target.name]: e.target.value});
        // console.log("Login data: ", loginData);
    }
    const onSubmit = (e) => { 
        let isValid = validateForm();
        if(isValid) {
            // Call API to login user
            dispatch(actions.controlLoading(true)); // Bắt đầu loading
            requestApi('/auth/login', 'POST', loginData).then((response) => {
                localStorage.setItem('access_token', response.data.access_token); // Lưu token vào localStorage
                localStorage.setItem('refresh_token', response.data.refresh_token);
                 // Lưu token vào localStorage
                 console.log("Login success: ");
                dispatch(actions.controlLoading(false)); 
                navigation('/'); // Chuyển hướng về trang chủ
            }).catch((error) => {
                dispatch(actions.controlLoading(false)); 
                console.log("Login error: ", error);
                if(typeof error.response.data.message !== "undefined"){
                    toast.error(error.response.data.message, toastErrorConfig);
                }else{
                    toast.error("Server error", toastErrorConfig);
                }
            });
        }
        setIsSubmit(true); // Đánh dấu là đã submit
    }

    useEffect(() => {
        if (isSubmit) {
            validateForm(); // Gọi validateForm khi dữ liệu thay đổi sau khi submit
        }
    }, [loginData]);

    const validateForm = () => {
        let isValid = true;
        let objErrors = {};
        if(loginData.email === undefined || loginData.email === "") {
            objErrors.email = "Please enter email address";
        }else{
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!regex.test(loginData.email)) {
                objErrors.email = "Please enter valid email address";
            }
        }
        if(loginData.password === undefined || loginData.password === "") {
            objErrors.password = "Please enter password";
        }

        if(Object.keys(objErrors).length > 0) {
            setErrors(objErrors);
            isValid = false;
        }else{
            setErrors({});
        }
        return isValid;
    }

  return (
        <div id="layoutAuthentication" className="bg-primary">
    <div id="layoutAuthentication_content">
        <main>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-5">
                        <div className="card shadow-lg border-0 rounded-lg mt-5">
                            <div className="card-header"><h3 className="text-center font-weight-light my-4">Login</h3></div>
                            <div className="card-body">
                                <form>
                                    <div className="form-floating mb-3">
                                        <input className="form-control" id="inputEmail" type="email" placeholder="name@example.com" name="email" onChange={onChange}/>
                                        <label>Email address</label>
                                        {errors.email && <div className="text-danger">{errors.email}</div>}
                                    </div>
                                    <div className="form-floating mb-3">
                                        <input className="form-control" id="inputPassword" type="password" placeholder="Password" name="password" onChange={onChange}/>
                                        <label>Password</label>
                                        {errors.password && <div className="text-danger">{errors.password}</div>}
                                    </div>
                                    <div className="form-check mb-3">
                                        <input className="form-check-input" id="inputRememberPassword" type="checkbox" value="" />
                                        <label className="form-check-label" >Remember Password</label>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between mt-4 mb-0">
                                        <Link className="small" to="#">Forgot Password?</Link>
                                        <button className="btn btn-primary" type="button" onClick={onSubmit}>Login</button>
                                    </div>
                                </form>
                            </div>
                            <div className="card-footer text-center py-3">
                            <Link className="small" to="#">Forgot Password?</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <div id="layoutAuthentication_footer">
        <footer className="py-4 bg-light mt-auto">
            <div className="container-fluid px-4">
                <div className="d-flex align-items-center justify-content-between small">
                    <div className="text-muted">Copyright &copy; Your Website 2023</div>
                    <div>
                        <a href="#">Privacy Policy</a>
                        &middot;
                        <a href="#">Terms &amp; Conditions</a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
        </div>
  )
}

export default Login