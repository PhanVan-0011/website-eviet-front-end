import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import requestApi from '../../helpers/api';
import { toast } from 'react-toastify';
import { toastErrorConfig, toastSuccessConfig } from '../../tools/toastConfig';

const CategoryModal = ({ 
    show, 
    onHide, 
    onSuccess,
    editCategory = null 
}) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 1
    });
    const [loading, setLoading] = useState(false);

    // Initialize form data
    useEffect(() => {
        if (show) {
            if (editCategory) {
                setFormData({
                    name: editCategory.name || '',
                    description: editCategory.description || '',
                    status: editCategory.status || 1
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    status: 1
                });
            }
        }
    }, [show, editCategory]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = editCategory 
                ? `api/admin/categories/${editCategory.id}`
                : 'api/admin/categories';
            const method = editCategory ? 'PUT' : 'POST';

            const response = await requestApi(url, method, formData);
            
            if (response.data && response.data.success) {
                toast.success(
                    editCategory ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục thành công!', 
                    toastSuccessConfig
                );
                onSuccess();
                onHide();
            } else {
                toast.error(response.data.message || 'Có lỗi xảy ra!', toastErrorConfig);
            }
        } catch (error) {
            console.error('Error saving category:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message, toastErrorConfig);
            } else {
                toast.error('Có lỗi xảy ra khi lưu danh mục!', toastErrorConfig);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} size="md" centered>
            <Modal.Header closeButton>
                <Modal.Title>
                    {editCategory ? 'Chỉnh sửa danh mục' : 'Tạo danh mục'}
                </Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <div className="mb-3">
                        <Form.Label>Tên danh mục <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Nhập tên danh mục"
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <Form.Label>Mô tả</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Nhập mô tả danh mục"
                            rows={3}
                        />
                    </div>

                    <div className="mb-3">
                        <Form.Label>Trạng thái</Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                        >
                            <option value={1}>Hoạt động</option>
                            <option value={0}>Không hoạt động</option>
                        </Form.Select>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide} disabled={loading}>
                        Hủy
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Đang lưu...' : (editCategory ? 'Cập nhật' : 'Tạo mới')}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default CategoryModal;
