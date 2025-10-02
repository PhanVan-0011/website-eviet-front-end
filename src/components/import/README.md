# Chức năng Nhập hàng

## Tổng quan

Chức năng nhập hàng cho phép tạo và quản lý phiếu nhập hàng từ các nhà cung cấp với giao diện đơn giản, tập trung vào việc nhập hàng trực tiếp.

## Component chính

### Import.js

- **Mục đích**: Giao diện nhập hàng chính duy nhất
- **Tính năng**:
  - Giao diện 2 cột: bảng sản phẩm (trái) và thông tin phiếu nhập (phải)
  - Thêm/sửa/xóa sản phẩm trong phiếu nhập
  - Chọn nhà cung cấp từ danh sách
  - Tính toán tự động tổng tiền, số tiền cần trả, công nợ
  - Lưu tạm hoặc hoàn thành phiếu nhập
  - Tìm kiếm sản phẩm (F3)
  - Reset form sau khi lưu/hoàn thành thành công

## Cấu trúc dữ liệu

### Phiếu nhập hàng (Import)

```javascript
{
  id: number,
  import_code: string,
  supplier_id: number,
  supplier: {
    id: number,
    name: string,
    code: string
  },
  status: string, // 'Phiếu tạm', 'Hoàn thành', 'Đã hủy'
  total_amount: number,
  discount: number,
  supplier_return_cost: number,
  payable_amount: number,
  paid_amount: number,
  payment_method: string,
  debt_amount: number,
  other_cost: number,
  notes: string,
  user_id: number,
  user: {
    id: number,
    name: string
  },
  items: ImportItem[],
  created_at: string,
  updated_at: string
}
```

### Sản phẩm nhập (ImportItem)

```javascript
{
  id: number,
  code: string,
  name: string,
  unit: string,
  quantity: number,
  unit_price: number,
  discount: number,
  total: number,
  notes: string
}
```

## API Endpoints

### Tạo phiếu nhập mới

- **Method**: POST
- **URL**: `/api/admin/imports`
- **Body**: Import object

## Navigation

Chức năng nhập hàng được thêm vào dropdown menu "Nhà cung cấp" trong NavigationBar với icon `fas fa-box-open`.

## Routes

- `/import` - Giao diện nhập hàng chính

## Dependencies

- React Router DOM
- React Redux
- React Toastify
- Moment.js
- Bootstrap 5
- Font Awesome

## Tính năng đặc biệt

1. **Tính toán tự động**: Tổng tiền, số tiền cần trả, công nợ được tính tự động khi thay đổi dữ liệu
2. **Giao diện responsive**: Hỗ trợ hiển thị tốt trên các thiết bị khác nhau
3. **Tìm kiếm sản phẩm**: Tích hợp LiveSearch component để tìm kiếm sản phẩm nhanh
4. **Validation**: Kiểm tra dữ liệu đầu vào
5. **Loading states**: Hiển thị trạng thái loading khi xử lý dữ liệu
6. **Error handling**: Xử lý lỗi và hiển thị thông báo phù hợp
7. **Reset form**: Tự động reset form sau khi lưu/hoàn thành thành công
