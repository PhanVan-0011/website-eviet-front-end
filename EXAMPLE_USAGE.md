# Hướng dẫn sử dụng CustomEditor với tính năng xóa ảnh tự động

## 1. Cách sử dụng cơ bản (mặc định: tự động xóa ảnh)

```jsx
import CustomEditor from "../components/common/CustomEditor";

function MyComponent() {
  const [content, setContent] = useState("");

  return (
    <CustomEditor
      data={content}
      onChange={setContent}
      folder="posts" // Thư mục upload
      // autoDeleteImages={true} - mặc định là true
    />
  );
}
```

## 2. Tắt tính năng tự động xóa ảnh

```jsx
<CustomEditor
  data={content}
  onChange={setContent}
  folder="products"
  autoDeleteImages={false} // Tắt tự động xóa
/>
```

## 3. Cách hoạt động

1. **Khi upload ảnh**: CustomUploadAdapter sẽ lưu URL ảnh vào danh sách tracking
2. **Khi user xóa ảnh khỏi editor**: CustomEditor sẽ phát hiện và tự động gọi API `DELETE /api/delete-image` để xóa ảnh khỏi server
3. **Console log**: Bạn sẽ thấy log trong console khi ảnh được xóa thành công hoặc lỗi

## 4. API Backend cần có

```php
Route::delete('delete-image', [ImageController::class, 'deleteImage']);
```

Body request sẽ là:

```json
{
  "image_path": "posts/image_name.jpg",
  "folder": "posts"
}
```

## 5. Lưu ý

- Chỉ xóa những ảnh được upload trong session hiện tại
- Không ảnh hưởng đến ảnh có sẵn từ trước
- Nếu API xóa lỗi, sẽ có warning trong console nhưng không ảnh hưởng editor
- Mỗi CustomEditor sẽ có danh sách tracking riêng biệt
