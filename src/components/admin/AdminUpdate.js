import React, { use, useEffect, useState} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { set, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
import { Modal, Button } from 'react-bootstrap';
import { vi } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';

const AdminUpdate = () => {
    const params = useParams();
    const navigation = useNavigate();
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        trigger,
    } = useForm();
     const dispatch = useDispatch();
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [showModal, setShowModal] = useState(false);
     const [roles, setRoles] = useState([]);
     const [dob, setDob] = useState(null);
     // Thêm các state cho avatar
     const [imagePreview, setImagePreview] = useState(null);
     const [imageFile, setImageFile] = useState(null);
     const [oldAvatar, setOldAvatar] = useState(null);
     const [selectedRoles, setSelectedRoles] = useState([]);
     const roleOptions = roles.map(role => ({ value: role.id, label: role.display_name || role.name }));
     
     // State cho branches và branch_id
     const [branches, setBranches] = useState([]);
     const [selectedBranch, setSelectedBranch] = useState(null);
     const branchOptions = branches.map(branch => ({ value: branch.id, label: branch.name }));
     
     // State cho giới tính và trạng thái
     const [selectedGender, setSelectedGender] = useState(null);
     const [selectedStatus, setSelectedStatus] = useState(null);
     const genderOptions = [
         { value: 'male', label: 'Nam' },
         { value: 'female', label: 'Nữ' },
         { value: 'other', label: 'Khác' }
     ];
     const statusOptions = [
         { value: '1', label: 'Hoạt động' },
         { value: '0', label: 'Không Hoạt động' }
     ];

    useEffect(() => {
        // Lấy dữ liệu user, roles và branches song song
        const fetchAll = async () => {
            try {
                dispatch(actions.controlLoading(true));
                const [userRes, rolesRes, branchesRes] = await Promise.all([
                    requestApi(`api/admin/admins/${params.id}`, 'GET'),
                    requestApi('api/admin/roles?limit=1000', 'GET', []),
                    requestApi('api/admin/branches?limit=1000', 'GET', [])
                ]);
                // Xử lý user
                const data = userRes.data.data;
                setValue('name', data.name);
                setValue('address', data.address);
                setValue('phone', data.phone);
                setValue('email', data.email);
                setValue('gender', data.gender);
                setSelectedGender(data.gender);
                setValue('is_active', data.is_active ? "1" : "0");
                setSelectedStatus(data.is_active ? "1" : "0");
                if (data.date_of_birth) {
                    const date = moment(data.date_of_birth, ['DD/MM/YYYY', 'YYYY-MM-DD']).toDate();
                    setDob(date);
                    setValue('date_of_birth', moment(date).format('YYYY-MM-DD'));
                } else {
                    setDob(null);
                    setValue('date_of_birth', '');
                }
                if (data.image_url && data.image_url.main_url) {
                    setOldAvatar(data.image_url.main_url);
                }
                if (data.roles && Array.isArray(data.roles)) {
                    const roleIds = data.roles.map(r => String(r.id));
                    setSelectedRoles(roleIds);
                    setValue('role_ids', roleIds);
                }
                // Xử lý branch_id
                if (data.branch_id) {
                    setSelectedBranch(data.branch_id);
                    setValue('branch_id', data.branch_id);
                }
                // Xử lý roles và branches
                if (rolesRes.data && rolesRes.data.data) setRoles(rolesRes.data.data);
                if (branchesRes.data && branchesRes.data.data) setBranches(branchesRes.data.data);
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                console.error("Error fetching data: ", error);
            }
        };
        fetchAll();
    }, [params.id, setValue]);
    const handleSubmitForm = async (data) => {
        // Validate role_ids, branch_id và gender
        const validRole = await trigger('role_ids');
        const validBranch = await trigger('branch_id');
        const validGender = await trigger('gender');
        if (!validRole || !validBranch || !validGender) return;
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key !== 'role_ids') formData.append(key, data[key]);
            });
            // Gửi role_ids dạng array
            if (Array.isArray(data.role_ids)) {
                data.role_ids.forEach(id => formData.append('role_ids[]', id));
            }
            // Gửi ảnh nếu có
            if (imageFile) {
                formData.append('image_url', imageFile);
            }
            // Gửi ngày sinh nếu có
            if (dob instanceof Date && !isNaN(dob.getTime())) {
                formData.set('date_of_birth', dob.toISOString().split('T')[0]);
            }
            const response = await requestApi(
                `api/admin/admins/${params.id}`,
                'POST',
                formData,
                'json',
                'multipart/form-data'
            );
            dispatch(actions.controlLoading(false));
            if (response.data && response.data.success) {
                toast.success(response.data.message || "Cập nhật thông tin thành công", toastSuccessConfig);
                
                navigation('/admin');
               
            } else {
                toast.error(response.data.message || "Cập nhật thất bại", toastErrorConfig);
            }
        } catch (e) {
            dispatch(actions.controlLoading(false));
            console.log("Error Update user: ", e);
            if (e.response && e.response.data && e.response.data.message) {
                toast.error(e.response.data.message, toastErrorConfig);
            } else {
                toast.error("Server error", toastErrorConfig);
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    // Hàm chọn ảnh mới
    const onChangeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ảnh phải nhỏ hơn 2MB!', toastErrorConfig);
                e.target.value = "";
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(file.type)) {
                toast.error('Chỉ chấp nhận ảnh jpg, jpeg, png, gif', toastErrorConfig);
                e.target.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        } else {
            setImagePreview(null);
            setImageFile(null);
        }
        e.target.value = "";
    };

    // Hàm xóa ảnh
    const handleRemoveImage = () => {
        setImagePreview(null);
        setImageFile(null);
        setOldAvatar(null);
    };


  return (
    <div id="layoutSidenav_content">
        <main>
            <div className="container-fluid px-4">
                <h1 className="mt-4">Chỉnh sửa nhân viên</h1>
                <ol className="breadcrumb mb-4">
                    <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                    <li className="breadcrumb-item active">Chỉnh sửa nhân viên</li>
                </ol>
                <div className='card mb-3'>
                    <div className='card-header'>
                        <i className="fas fa-table me-1"></i>
                        Dữ liệu nhân viên
                    </div>
                    <div className='card-body'>
                        <div className='mb-3 row'>
                              <form onSubmit={handleSubmit(handleSubmitForm)}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="inputName" className="form-label fw-semibold">
                                                Tên nhân viên <span style={{color: 'red'}}>*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputName"
                                                {...register('name', { required: 'Tên nhân viên là bắt buộc' })}
                                                placeholder="Nhập tên nhân viên"
                                            />
                                            {errors.name && <div className="text-danger mt-1">{errors.name.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="inputAddress" className="form-label fw-semibold">
                                                Địa chỉ <span style={{color: 'red'}}>*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputAddress"
                                                {...register('address', { required: 'Địa chỉ là bắt buộc' })}
                                                placeholder="Nhập địa chỉ"
                                            />
                                            {errors.address && <div className="text-danger mt-1">{errors.address.message}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="inputPhone" className="form-label fw-semibold">
                                                Số điện thoại <span style={{color: 'red'}}>*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputPhone"
                                                {...register('phone', { required: 'Số điện thoại là bắt buộc' })}
                                                placeholder="Nhập số điện thoại"
                                            />
                                            {errors.phone && <div className="text-danger mt-1">{errors.phone.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label htmlFor="inputEmail" className="form-label fw-semibold">
                                                Email <span style={{color: 'red'}}>*</span>
                                            </label>
                                            <input
                                                className="form-control"
                                                id="inputEmail"
                                                type="email"
                                                {...register('email', { required: 'Email là bắt buộc' })}
                                                placeholder="Nhập email"
                                            />
                                            {errors.email && <div className="text-danger mt-1">{errors.email.message}</div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Giới tính <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <Select
                                                options={genderOptions}
                                                value={genderOptions.find(opt => opt.value === selectedGender)}
                                                onChange={opt => {
                                                    const value = opt ? opt.value : null;
                                                    setSelectedGender(value);
                                                    setValue('gender', value, { shouldValidate: true });
                                                }}
                                                placeholder="Chọn giới tính..."
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...selectStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                                onBlur={() => trigger('gender')}
                                            />
                                            <input
                                                type="hidden"
                                                {...register('gender', {
                                                    required: 'Giới tính là bắt buộc!'
                                                })}
                                            />
                                            {errors.gender && <div className="text-danger mt-1">{errors.gender.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Trạng thái
                                            </label>
                                            <Select
                                                options={statusOptions}
                                                value={statusOptions.find(opt => opt.value === selectedStatus)}
                                                onChange={opt => {
                                                    const value = opt ? opt.value : '1';
                                                    setSelectedStatus(value);
                                                    setValue('is_active', value, { shouldValidate: true });
                                                }}
                                                placeholder="Chọn trạng thái..."
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...selectStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                            />
                                            <input
                                                type="hidden"
                                                {...register('is_active', { required: true })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Chi nhánh và Vai trò - cùng hàng */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Chi nhánh <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <Select
                                                options={branchOptions}
                                                value={branchOptions.find(opt => opt.value === selectedBranch)}
                                                onChange={opt => {
                                                    const value = opt ? opt.value : null;
                                                    setSelectedBranch(value);
                                                    setValue('branch_id', value, { shouldValidate: true });
                                                }}
                                                placeholder="Chọn chi nhánh..."
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...selectStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                                onBlur={() => trigger('branch_id')}
                                            />
                                            <input
                                                type="hidden"
                                                {...register('branch_id', {
                                                    required: 'Chi nhánh là bắt buộc!'
                                                })}
                                            />
                                            {errors.branch_id && <div className="text-danger mt-1">{errors.branch_id.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Vai trò <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <Select
                                                options={roleOptions}
                                                isMulti
                                                value={roleOptions.filter(opt => selectedRoles.includes(String(opt.value)) || selectedRoles.includes(opt.value))}
                                                onChange={opts => {
                                                    const values = opts ? opts.map(opt => opt.value) : [];
                                                    setSelectedRoles(values);
                                                    setValue('role_ids', values, { shouldValidate: true });
                                                }}
                                                placeholder="Tìm kiếm & chọn vai trò..."
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...selectStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                                onBlur={() => trigger('role_ids')}
                                            />
                                            <input
                                                type="hidden"
                                                {...register('role_ids', {
                                                    validate: value => (value && value.length > 0) || 'Phải chọn ít nhất 1 vai trò!'
                                                })}
                                            />
                                            {errors.role_ids && <div className="text-danger mt-1">{errors.role_ids.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                {/* Ảnh đại diện và Ngày sinh */}
                                <div className="row mb-3">
                                    <div className="col-12 col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Ảnh đại diện
                                            </label>
                                            <div className="d-flex gap-2 align-items-start">
                                                <div 
                                                    className="position-relative rounded-circle bg-light d-flex align-items-center justify-content-center border border-2 border-secondary border-dashed"
                                                    style={{ width: 100, height: 100, overflow: 'hidden' }}
                                                >
                                                    {imagePreview ? (
                                                        <img
                                                            src={imagePreview}
                                                            alt="Avatar preview"
                                                            className="w-100 h-100"
                                                            style={{ objectFit: 'fill' }}
                                                        />
                                                    ) : oldAvatar ? (
                                                        <img
                                                            src={process.env.REACT_APP_API_URL + 'api/images/' + oldAvatar}
                                                            alt="Avatar"
                                                            className="w-100 h-100"
                                                            style={{ objectFit: 'fill' }}
                                                        />
                                                    ) : (
                                                        <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100">
                                                            <i className="fas fa-user fs-1 text-secondary"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="d-flex flex-column gap-2">
                                                    <div className="text-muted small">
                                                        Chỉ chọn 1 ảnh, định dạng: jpg, png...<br/>
                                                        Kích thước tối đa: 2MB
                                                    </div>
                                                    <label htmlFor="inputAvatar" className="btn btn-secondary mb-0">
                                                        <i className="fas fa-upload me-2"></i>Chọn ảnh
                                                    </label>
                                                    <input
                                                        id="inputAvatar"
                                                        type="file"
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={onChangeImage}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold" htmlFor='inputDob'>
                                                Ngày sinh
                                            </label>
                                            <div className="d-flex align-items-center">
                                                <label htmlFor="inputDob" className="form-label me-2" style={{
                                                        color: '#0d6efd',
                                                        fontSize: 20,
                                                        marginRight: 10,
                                                        minWidth: 24,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>            
                                                    <i className="fas fa-calendar-alt"></i>
                                                </label>
                                                <DatePicker
                                                    id="inputDob"
                                                    selected={dob}
                                                    onChange={date => {
                                                        setDob(date);
                                                        setValue('date_of_birth', date ? date.toISOString().split('T')[0] : '');
                                                    }}
                                                    dateFormat="dd/MM/yyyy"
                                                    locale={vi}
                                                    className="form-control"
                                                    placeholderText="dd/mm/yyyy"
                                                    showMonthDropdown
                                                    showYearDropdown
                                                    dropdownMode="select"
                                                    isClearable
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 mb-0">
                                    <div className="d-flex justify-content-center detail-action-buttons">
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => setShowModal(true)}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-trash me-1"></i><span className="d-none d-sm-inline">Xóa</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() => navigation('/admin')}
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-times me-1"></i><span className="d-none d-sm-inline">Hủy bỏ</span>
                                        </button>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            type="submit"
                                            disabled={isSubmitting}
                                        >
                                            <i className="fas fa-check me-1"></i>
                                            <span className="d-none d-sm-inline">{isSubmitting ? "Đang gửi..." : "Cập nhật"}</span>
                                            {isSubmitting && <span className="d-sm-none">...</span>}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>                        
                </div>
            </div>
        </main>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
                <Modal.Title>Xác nhận xóa</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Bạn chắc chắn muốn xóa nhân viên này?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Hủy
                </Button>
                <Button
                    variant="danger"
                    onClick={async () => {
                        setShowModal(false);
                       
                            try {
                                dispatch(actions.controlLoading(true));
                                const response = await requestApi(`api/admin/users/${params.id}`, 'DELETE', []);
                                dispatch(actions.controlLoading(false));
                                if (response.data && response.data.success) {
                                    toast.success(response.data.message || "Xóa nhân viên thành công!", toastSuccessConfig);
                                    
                                    navigation('/admin');
                                    
                                } else {
                                    toast.error(response.data.message || "Xóa nhân viên thất bại", toastErrorConfig);
                                }
                            } catch (e) {
                                dispatch(actions.controlLoading(false));
                                if (e.response && e.response.data && e.response.data.message) {
                                    toast.error(e.response.data.message, toastErrorConfig);
                                } else {
                                    toast.error("Server error", toastErrorConfig);
                                }
                            }
                       
                    }}
                    disabled={isSubmitting}
                >
                    Xóa
                </Button>
            </Modal.Footer>
        </Modal>
    </div>
  )
}

export default AdminUpdate