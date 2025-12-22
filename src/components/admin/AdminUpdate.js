import React, { use, useEffect, useState} from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { set, useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import * as actions from '../../redux/actions/index';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import moment from 'moment';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig'
import Permission from '../common/Permission';
import { PERMISSIONS } from '../../constants/permissions';
import { Modal, Button } from 'react-bootstrap';
import { vi } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { selectStyles } from '../common/FilterComponents';

// Constants cho branch scope
const SCOPE_ALL_BRANCHES = 'all_branches'; // Tự động chọn tất cả branches
const SCOPE_SINGLE_BRANCH = 'single_branch'; // Chỉ được chọn 1 branch
const SCOPE_MULTIPLE_BRANCHES = 'multiple_branches'; // Chọn nhiều branches (ít nhất 1)

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
     const [selectedRole, setSelectedRole] = useState(null);
     const roleOptions = roles.map(role => ({ value: role.id, label: role.display_name || role.name }));
     
     // State cho branches và branch_ids (đa chi nhánh)
     const [branches, setBranches] = useState([]);
     const [selectedBranches, setSelectedBranches] = useState([]);
     const branchOptions = branches.map(branch => ({ value: branch.id, label: branch.name }));
     
     // State cho branch scope (tính từ selected roles)
     const [branchScope, setBranchScope] = useState(null);
     
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
                
                // Xử lý roles và branches - PHẢI load trước khi set role_id
                if (rolesRes.data && rolesRes.data.data) {
                    setRoles(rolesRes.data.data);
                }
                if (branchesRes.data && branchesRes.data.data) {
                    setBranches(branchesRes.data.data);
                }
                
                // Xử lý role_id (chỉ 1 vai trò) - SAU KHI roles đã load
                console.log('=== DEBUG ROLE DATA ===');
                console.log('Full data object:', data);
                console.log('data.role_id:', data.role_id);
                console.log('data.role:', data.role);
                console.log('data.roles:', data.roles);
                console.log('Available roles from API:', rolesRes.data?.data);
                
                let roleIdToSet = null;
                
                // Ưu tiên: data.role.id > data.role_id > data.roles[0]
                if (data.role && data.role.id) {
                    // Trường hợp backend trả về role object (theo API response)
                    roleIdToSet = String(data.role.id);
                    console.log('Lấy role_id từ data.role.id:', roleIdToSet);
                } else if (data.role_id) {
                    // Trường hợp backend trả về role_id trực tiếp
                    roleIdToSet = String(data.role_id);
                    console.log('Lấy role_id từ data.role_id:', roleIdToSet);
                } else if (data.roles && Array.isArray(data.roles) && data.roles.length > 0) {
                    // Trường hợp backend trả về roles array (lấy role đầu tiên)
                    const firstRole = data.roles[0];
                    if (firstRole && firstRole.id) {
                        roleIdToSet = String(firstRole.id);
                        console.log('Lấy role_id từ data.roles[0].id:', roleIdToSet);
                    } else if (typeof firstRole === 'number' || typeof firstRole === 'string') {
                        roleIdToSet = String(firstRole);
                        console.log('Lấy role_id từ data.roles[0] (primitive):', roleIdToSet);
                    }
                }
                
                console.log('Final roleIdToSet:', roleIdToSet);
                
                // Set role_id SAU KHI roles đã được load
                if (roleIdToSet && rolesRes.data && rolesRes.data.data) {
                    // Đảm bảo role_id tồn tại trong danh sách roles
                    const roleExists = rolesRes.data.data.find(r => String(r.id) === roleIdToSet);
                    if (roleExists) {
                        setSelectedRole(roleIdToSet);
                        setValue('role_id', roleIdToSet, { shouldValidate: false });
                        console.log('✅ Đã set role_id thành công:', roleIdToSet);
                        console.log('Selected role object:', roleExists);
                    } else {
                        console.warn('⚠️ Role ID không tồn tại trong danh sách roles:', roleIdToSet);
                        console.warn('Available role IDs:', rolesRes.data.data.map(r => r.id));
                    }
                } else if (roleIdToSet) {
                    // Nếu chưa có roles nhưng có roleIdToSet, vẫn set để khi roles load xong sẽ có giá trị
                    setSelectedRole(roleIdToSet);
                    setValue('role_id', roleIdToSet, { shouldValidate: false });
                    console.log('⏳ Đã set role_id (chờ roles load):', roleIdToSet);
                } else {
                    console.warn('❌ Không tìm thấy role_id trong dữ liệu!');
                }
                console.log('======================');
                // Xử lý branch_ids (đa chi nhánh)
                if (data.branches && Array.isArray(data.branches)) {
                    const branchIds = data.branches.map(b => String(b.id));
                    setSelectedBranches(branchIds);
                    setValue('branch_ids', branchIds);
                } else if (data.branch_ids && Array.isArray(data.branch_ids)) {
                    const branchIds = data.branch_ids.map(id => String(id));
                    setSelectedBranches(branchIds);
                    setValue('branch_ids', branchIds);
                } else if (data.branch_id) {
                    // Fallback cho trường hợp backend vẫn trả về branch_id (single)
                    setSelectedBranches([String(data.branch_id)]);
                    setValue('branch_ids', [String(data.branch_id)]);
                }
                dispatch(actions.controlLoading(false));
            } catch (error) {
                dispatch(actions.controlLoading(false));
                console.error("Error fetching data: ", error);
            }
        };
        fetchAll();
    }, [params.id, setValue]);

    // useEffect riêng để set lại role sau khi roles state đã được update
    useEffect(() => {
        if (selectedRole && roles.length > 0) {
            // Kiểm tra xem role có tồn tại trong danh sách roles không
            const roleExists = roles.find(r => String(r.id) === String(selectedRole));
            if (roleExists) {
                // Đảm bảo form value được set đúng
                setValue('role_id', String(selectedRole), { shouldValidate: false });
                console.log('🔄 Re-set role_id sau khi roles state updated:', selectedRole);
            } else {
                console.warn('⚠️ Role không tồn tại trong roles list:', selectedRole);
            }
        }
    }, [roles, selectedRole, setValue]);

    // Tính toán branch scope dựa trên selected role
    useEffect(() => {
        if (!selectedRole || roles.length === 0) {
            setBranchScope(null);
            return;
        }

        // Lấy role object đã chọn
        const selectedRoleObject = roles.find(r => String(r.id) === String(selectedRole) || r.id === selectedRole);
        
        if (!selectedRoleObject) {
            setBranchScope(null);
            return;
        }

        // Lấy scope từ role đã chọn
        const scope = selectedRoleObject.branch_scope;

        // Xử lý theo scope
        if (scope === SCOPE_ALL_BRANCHES) {
            setBranchScope(SCOPE_ALL_BRANCHES);
            // Tự động chọn tất cả branches
            const allBranchIds = branches.map(b => b.id);
            setSelectedBranches(allBranchIds);
            setValue('branch_ids', allBranchIds, { shouldValidate: true });
        } else if (scope === SCOPE_MULTIPLE_BRANCHES) {
            setBranchScope(SCOPE_MULTIPLE_BRANCHES);
        } else if (scope === SCOPE_SINGLE_BRANCH) {
            setBranchScope(SCOPE_SINGLE_BRANCH);
            // Nếu đã chọn nhiều hơn 1 branch, chỉ giữ lại branch đầu tiên
            if (selectedBranches.length > 1) {
                const firstBranch = [selectedBranches[0]];
                setSelectedBranches(firstBranch);
                setValue('branch_ids', firstBranch, { shouldValidate: true });
            }
        } else {
            // Mặc định là single_branch nếu không có scope
            setBranchScope(SCOPE_SINGLE_BRANCH);
            if (selectedBranches.length > 1) {
                const firstBranch = [selectedBranches[0]];
                setSelectedBranches(firstBranch);
                setValue('branch_ids', firstBranch, { shouldValidate: true });
            }
        }
    }, [selectedRole, roles, branches, setValue]);
    const handleSubmitForm = async (data) => {
        // Validate role_id, branch_ids và gender
        const validRole = await trigger('role_id');
        const validBranch = await trigger('branch_ids');
        const validGender = await trigger('gender');
        if (!validRole || !validBranch || !validGender) return;
        setIsSubmitting(true);
        try {
            dispatch(actions.controlLoading(true));
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (key !== 'role_id' && key !== 'branch_ids') formData.append(key, data[key]);
            });
            // Gửi role_id (single value)
            if (data.role_id) {
                formData.append('role_id', data.role_id);
            }
            // Gửi branch_ids dạng array
            if (Array.isArray(data.branch_ids)) {
                data.branch_ids.forEach(id => formData.append('branch_ids[]', id));
            }
            // Gửi ảnh nếu có
            if (imageFile) {
                formData.append('image_url', imageFile);
            }
            // Gửi ngày sinh nếu có
            if (dob instanceof Date && !isNaN(dob.getTime())) {
                formData.set('date_of_birth', dob.toISOString().split('T')[0]);
            }
            
            // Hiển thị dữ liệu FormData trước khi gửi API
            console.log('=== DỮ LIỆU GỬI LÊN API (AdminUpdate) ===');
            console.log('User ID:', params.id);
            console.log('Form Data Object:', data);
            console.log('Selected Role:', selectedRole);
            console.log('Selected Branches:', selectedBranches);
            console.log('Date of Birth:', dob instanceof Date && !isNaN(dob.getTime()) ? dob.toISOString().split('T')[0] : null);
            console.log('Image File:', imageFile ? imageFile.name : null);
            console.log('Old Avatar:', oldAvatar);
            
            // Hiển thị tất cả entries trong FormData
            const formDataEntries = {};
            for (let pair of formData.entries()) {
                if (pair[0] === 'image_url') {
                    formDataEntries[pair[0]] = `[File: ${pair[1].name}]`;
                } else {
                    formDataEntries[pair[0]] = pair[1];
                }
            }
            console.log('FormData Entries:', formDataEntries);
            console.log('==========================================');
            
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

                                {/* Vai trò và Chi nhánh - cùng hàng */}
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Vai trò <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <Select
                                                options={roleOptions}
                                                value={roleOptions.find(opt => String(opt.value) === String(selectedRole))}
                                                onChange={opt => {
                                                    const value = opt ? opt.value : null;
                                                    setSelectedRole(value);
                                                    setValue('role_id', value, { shouldValidate: true });
                                                    // Trigger validation lại cho branch_ids khi role thay đổi
                                                    setTimeout(() => trigger('branch_ids'), 100);
                                                }}
                                                placeholder="Chọn vai trò..."
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...selectStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                                onBlur={() => trigger('role_id')}
                                            />
                                            <input
                                                type="hidden"
                                                {...register('role_id', {
                                                    required: 'Vai trò là bắt buộc!'
                                                })}
                                            />
                                            {errors.role_id && <div className="text-danger mt-1">{errors.role_id.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="mb-3">
                                            <label className="form-label fw-semibold">
                                                Chi nhánh <span style={{ color: 'red' }}>*</span>
                                            </label>
                                            <Select
                                                options={branchOptions}
                                                isMulti={branchScope !== SCOPE_SINGLE_BRANCH}
                                                value={branchOptions.filter(opt => selectedBranches.includes(String(opt.value)) || selectedBranches.includes(opt.value))}
                                                onChange={opts => {
                                                    let values = [];
                                                    
                                                    if (branchScope === SCOPE_SINGLE_BRANCH) {
                                                        // Single select mode: opts là object đơn lẻ
                                                        values = opts ? [opts.value] : [];
                                                    } else {
                                                        // Multi select mode: opts là array
                                                        values = opts ? (Array.isArray(opts) ? opts.map(opt => opt.value) : [opts.value]) : [];
                                                    }
                                                    
                                                    setSelectedBranches(values);
                                                    setValue('branch_ids', values, { shouldValidate: true });
                                                }}
                                                placeholder={
                                                    branchScope === SCOPE_ALL_BRANCHES 
                                                        ? "Tự động áp dụng cho tất cả chi nhánh" 
                                                        : branchScope === SCOPE_SINGLE_BRANCH
                                                        ? "Chọn 1 chi nhánh..."
                                                        : "Tìm kiếm & chọn chi nhánh..."
                                                }
                                                isDisabled={branchScope === SCOPE_ALL_BRANCHES}
                                                classNamePrefix="react-select"
                                                styles={{
                                                    ...selectStyles,
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                                                }}
                                                menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                menuPosition="fixed"
                                                onBlur={() => trigger('branch_ids')}
                                            />
                                            {branchScope === SCOPE_ALL_BRANCHES && (
                                                <small className="text-muted d-block mt-1">
                                                    <i className="fas fa-info-circle me-1"></i>
                                                    Vai trò này tự động áp dụng cho tất cả chi nhánh
                                                </small>
                                            )}
                                            <input
                                                type="hidden"
                                                {...register('branch_ids', {
                                                    validate: (value) => {
                                                        if (branchScope === SCOPE_ALL_BRANCHES) {
                                                            return true; // Không cần validate nếu là all_branches
                                                        }
                                                        if (!value || value.length === 0) {
                                                            return branchScope === SCOPE_SINGLE_BRANCH 
                                                                ? 'Phải chọn 1 chi nhánh!' 
                                                                : 'Phải chọn ít nhất 1 chi nhánh!';
                                                        }
                                                        if (branchScope === SCOPE_SINGLE_BRANCH && value.length > 1) {
                                                            return 'Vai trò này chỉ được chọn 1 chi nhánh!';
                                                        }
                                                        return true;
                                                    }
                                                })}
                                            />
                                            {errors.branch_ids && <div className="text-danger mt-1">{errors.branch_ids.message}</div>}
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
                                        <Permission permission={PERMISSIONS.ADMIN_USERS_DELETE}>
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => setShowModal(true)}
                                                disabled={isSubmitting}
                                            >
                                                <i className="fas fa-trash me-1"></i><span className="d-none d-sm-inline">Xóa</span>
                                            </button>
                                        </Permission>
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