import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import requestApi from '../helpers/api'
import { toast } from 'react-toastify'
import { toastErrorConfig } from '../tools/toastConfig'
import { useDispatch } from 'react-redux'
import * as actions from '../redux/actions/index'

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    address: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    gender: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name || e.target.id.replace('input', '').toLowerCase()]: e.target.value });
  };

  const validateForm = () => {
    let objErrors = {};
    console.log( formData.password);
    console.log( formData.password_confirmation);
 
    if (!formData.userName) objErrors.userName = "Vui lòng nhập tên đăng nhập";
    if (!formData.phone) objErrors.phone = "Vui lòng nhập số điện thoại";
    if (!formData.email) objErrors.email = "Vui lòng nhập email";
    else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regex.test(formData.email)) objErrors.email = "Email không hợp lệ";
    }
    if (!formData.password) objErrors.password = "Vui lòng nhập mật khẩu";
    if (!formData.password_confirmation) objErrors.password_confirmation = "Vui lòng xác nhận mật khẩu";
    // Sửa lỗi logic: chỉ kiểm tra khi cả hai trường đều có giá trị
    if (
      formData.password &&
      formData.password_confirmation &&
      formData.password.trim() !== formData.password_confirmation.trim()
    ) {
        console.log( formData.password.trim() !== formData.password_confirmation.trim());
      objErrors.password_confirmation = "Mật khẩu xác nhận không khớp";
    }
    setErrors(objErrors);
    return Object.keys(objErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setIsSubmit(true);
    console.log("Form data: ", formData);
    if (validateForm()) {
      dispatch(actions.controlLoading(true));
      // Chuẩn hóa dữ liệu gửi lên API
      const payload = {
        name: formData.userName,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        gender: formData.gender || null,
        date_of_birth: formData.dob || null
      };
      requestApi('api/register', 'POST', payload)
        .then((response) => {
          dispatch(actions.controlLoading(false));
          toast.success("Đăng ký thành công!", { autoClose: 2000 });
            localStorage.setItem('access_token', response.data.access_token); 
          navigate('/');
        })
        .catch((error) => {
          dispatch(actions.controlLoading(false));
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message, toastErrorConfig);
          } else {
            toast.error("Server error", toastErrorConfig);
          }
        });
    }
  };

  return (
    <div id="layoutAuthentication" className="bg-primary">
      <div id="layoutAuthentication_content">
        <main>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-7">
                <div className="card shadow-lg border-0 rounded-lg mt-5">
                  <div className="card-header">
                    <h3 className="text-center font-weight-light my-4">Create Account</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={onSubmit}>
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3 mb-md-0">
                            <input
                              className="form-control"
                              id="inputUserName"
                              name="userName"
                              type="text"
                              placeholder="Enter your user name"
                              required
                              value={formData.userName}
                              onChange={onChange}
                            />
                            <label htmlFor="inputUserName">
                              User name <span style={{color: 'red'}}>*</span>
                            </label>
                            {errors.userName && <div className="text-danger">{errors.userName}</div>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              className="form-control"
                              id="inputAddress"
                              name="address"
                              type="text"
                              placeholder="Enter your address"
                              value={formData.address}
                              onChange={onChange}
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
                              name="phone"
                              type="text"
                              placeholder="Enter your phone number"
                              required
                              value={formData.phone}
                              onChange={onChange}
                            />
                            <label htmlFor="inputPhone">
                              Số điện thoại <span style={{color: 'red'}}>*</span>
                            </label>
                            {errors.phone && <div className="text-danger">{errors.phone}</div>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              className="form-control"
                              id="inputEmail"
                              name="email"
                              type="email"
                              placeholder="Enter your email"
                              required
                              value={formData.email}
                              onChange={onChange}
                            />
                            <label htmlFor="inputEmail">
                              Email <span style={{color: 'red'}}>*</span>
                            </label>
                            {errors.email && <div className="text-danger">{errors.email}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3 mb-md-0">
                            <input
                              className="form-control"
                              id="inputPassword"
                              name="password"
                              type="password"
                              placeholder="Create a password"
                              required
                              value={formData.password}
                              onChange={onChange}
                            />
                            <label htmlFor="inputPassword">
                              Password <span style={{color: 'red'}}>*</span>
                            </label>
                            {errors.password && <div className="text-danger">{errors.password}</div>}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating mb-3 mb-md-0">
                            <input
                              className="form-control"
                              id="inputpassword_confirmation"
                              name="password_confirmation"
                              type="password"
                              placeholder="Confirm password"
                              required
                              value={formData.password_confirmation}
                              onChange={onChange}
                            />
                            <label htmlFor="inputpassword_confirmation">
                              Confirm Password <span style={{color: 'red'}}>*</span>
                            </label>
                            {errors.password_confirmation && <div className="text-danger">{errors.password_confirmation}</div>}
                          </div>
                        </div>
                      </div>

                      <div className="row mb-3">
                        <div className="col-md-6">
                          <div className="form-floating mb-3 mb-md-0">
                            <select
                              className="form-select"
                              id="inputGender"
                              name="gender"
                              value={formData.gender}
                              onChange={onChange}
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
                              name="dob"
                              type="date"
                              placeholder="Ngày sinh"
                              value={formData.dob}
                              onChange={onChange}
                            />
                            <label htmlFor="inputDob">Ngày sinh</label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 mb-0">
                        <div className="d-grid">
                          <button className="btn btn-primary btn-block" type="submit">
                            Create Account
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="card-footer text-center py-3">
                    <div className="small">
                      <a href="login.html">Have an account? Go to login</a>
                    </div>
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

export default Register