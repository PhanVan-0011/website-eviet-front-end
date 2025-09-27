# FilterComponents - Các Component Filter Đơn Giản

## Tổng quan

Bộ sưu tập các component filter đơn giản, dễ sử dụng và có thể tái sử dụng cho mọi loại danh sách.

## Các Component có sẵn

### 1. FilterSelectSingle

Select đơn lựa chọn

```jsx
<FilterSelectSingle
  label="Trạng thái"
  value={statusOption}
  onChange={setStatus}
  options={[
    { value: "active", label: "Hoạt động" },
    { value: "inactive", label: "Không hoạt động" },
  ]}
  placeholder="Chọn trạng thái"
/>
```

### 2. FilterSelectMulti

Select nhiều lựa chọn

```jsx
<FilterSelectMulti
  label="Danh mục"
  value={categories}
  onChange={setCategories}
  options={categoryOptions}
  placeholder="Chọn danh mục"
/>
```

### 3. FilterCheckboxGroup

Nhóm checkbox

```jsx
<FilterCheckboxGroup
  label="Tính năng"
  value={features}
  onChange={setFeatures}
  options={[
    { value: "featured", label: "Nổi bật" },
    { value: "sale", label: "Giảm giá" },
  ]}
/>
```

### 4. FilterRadioGroup

Nhóm radio button

```jsx
<FilterRadioGroup
  label="Độ ưu tiên"
  value={priority}
  onChange={setPriority}
  options={[
    { value: "low", label: "Thấp" },
    { value: "high", label: "Cao" },
  ]}
/>
```

### 5. FilterButtonGroup

Nhóm button toggle

```jsx
<FilterButtonGroup
  label="Loại"
  value={type}
  onChange={setType}
  options={[
    { value: "all", label: "Tất cả" },
    { value: "product", label: "Sản phẩm" },
  ]}
/>
```

### 6. FilterDateRange

Chọn khoảng thời gian

```jsx
<FilterDateRange
  label="Thời gian"
  value={{ from: dateFrom, to: dateTo }}
  onChange={setDateRange}
/>
```

### 7. FilterTextInput

Input text

```jsx
<FilterTextInput
  label="Tìm kiếm"
  value={searchText}
  onChange={setSearchText}
  placeholder="Nhập từ khóa..."
  type="text"
/>
```

### 8. FilterNumberRange

Khoảng số

```jsx
<FilterNumberRange
  label="Khoảng giá"
  value={{ min: minPrice, max: maxPrice }}
  onChange={setPriceRange}
/>
```

### 9. FilterToggleButton

Nút toggle hiện/ẩn filter panel (style giống như cũ)

```jsx
<FilterToggleButton
  isVisible={isFilterVisible}
  onToggle={toggleFilterVisibility}
  isPulsing={isPulsing}
  className="ms-2"
/>
```

**Đặc điểm:**

- Button nhỏ (`btn-sm`) với style `btn-outline-secondary`
- Icon thay đổi: `fa-angle-left` (<) khi hiện, `fa-angle-right` (>) khi ẩn
- Có hiệu ứng pulse khi click
- Chỉ có icon, không có text

## Cách sử dụng

### 1. Import component cần dùng

```jsx
import {
  FilterSelectSingle,
  FilterSelectMulti,
  FilterButtonGroup,
  FilterDateRange,
  FilterToggleButton,
} from "../common/FilterComponents";
```

### 2. Sử dụng trong component

```jsx
const MyComponent = () => {
  const [status, setStatus] = useState("all");
  const [categories, setCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [isPulsing, setIsPulsing] = useState(false);

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prev) => !prev);
  };

  return (
    <div className="row g-0">
      {/* Filter Panel */}
      <div
        className={`filter-panel ${isFilterVisible ? "col-md-2" : "col-md-0"}`}
      >
        {isFilterVisible && (
          <div className="filter-content">
            <FilterSelectSingle
              label="Trạng thái"
              value={statusOptions.find((opt) => opt.value === status)}
              onChange={(selected) =>
                setStatus(selected ? selected.value : "all")
              }
              options={statusOptions}
            />

            <FilterSelectMulti
              label="Danh mục"
              value={categories}
              onChange={setCategories}
              options={categoryOptions}
            />

            <FilterDateRange
              label="Thời gian"
              value={dateRange}
              onChange={setDateRange}
            />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div
        className={`main-content ${
          isFilterVisible ? "col-md-10" : "col-md-12"
        }`}
      >
        <div className="header">
          <h4>Danh sách</h4>
          <FilterToggleButton
            isVisible={isFilterVisible}
            onToggle={() => {
              setIsPulsing(true);
              setTimeout(() => setIsPulsing(false), 600);
              toggleFilterVisibility();
            }}
            isPulsing={isPulsing}
          />
        </div>
        {/* Nội dung khác */}
      </div>
    </div>
  );
};
```

## Props chung

Tất cả component đều có các props chung:

| Prop        | Type     | Default | Mô tả                 |
| ----------- | -------- | ------- | --------------------- |
| `label`     | string   | -       | Nhãn hiển thị         |
| `value`     | any      | -       | Giá trị hiện tại      |
| `onChange`  | function | -       | Callback khi thay đổi |
| `className` | string   | "mb-3"  | CSS class             |

### FilterToggleButton Props đặc biệt:

| Prop        | Type     | Default | Mô tả               |
| ----------- | -------- | ------- | ------------------- |
| `isVisible` | boolean  | -       | Trạng thái hiện/ẩn  |
| `onToggle`  | function | -       | Callback khi toggle |
| `isPulsing` | boolean  | false   | Hiệu ứng pulse      |

## Lợi ích

- ✅ **Đơn giản**: Dễ hiểu, dễ sử dụng
- ✅ **Tái sử dụng**: Một lần tạo, dùng mãi mãi
- ✅ **Nhất quán**: UI/UX giống nhau
- ✅ **Linh hoạt**: Dễ dàng tùy chỉnh
- ✅ **Nhẹ**: Không phụ thuộc phức tạp

## Ví dụ hoàn chỉnh

Xem file `src/components/demo/SimpleFilterDemo.js` để có ví dụ đầy đủ.
