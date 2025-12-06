import React, { useEffect, useState, useRef } from 'react'
import LiveSearch from './LiveSearch';


const DataTables = (props) => {
    console.log("DataTables props: ", props);
   const { name, columns, data, numOfPages, currentPage, setCurrentPage, setItemOfPage, changeKeyword, onSelectedRows, selectedRows: externalSelectedRows, filterHeader, hideSelected, hideSearch = false, isLoading = false, showSummary = false, customSummaryData = {}, tableHeight = '60vh' } = props;
   const [selectedRows, setSelectedRows] = useState([]);
   const isFirstRender = useRef(true);
   
   
   // Tính toán tableHeight động dựa trên có phân trang hay không
   // Khi có phân trang, vẫn giữ nguyên chiều cao để hiển thị nhiều item hơn
   // Pagination nằm ngoài datatable-compact nên không ảnh hưởng đến chiều cao scroll
   const dynamicTableHeight = tableHeight;
   
   // Đồng bộ selectedRows từ props (controlled component)
   useEffect(() => {
       if (Array.isArray(externalSelectedRows)) {
           setSelectedRows(externalSelectedRows);
       }
   }, [externalSelectedRows]);
   
   // --- Lấy trạng thái cột hiển thị từ localStorage khi component mount ---
   const [visibleColumns, setVisibleColumns] = useState(() => {
        // Nếu có trạng thái đã lưu thì lấy ra, không thì hiển thị tất cả cột
        const saved = name && localStorage.getItem(`datatable_visible_columns_${name}`);
        if (saved) return JSON.parse(saved);
        return props.columns ? props.columns.map((col, idx) => idx) : [];
   });
   const [showColumnSelector, setShowColumnSelector] = useState(false);
   const columnSelectorRef = useRef();

   useEffect(() => {
       console.log("Selected rows: ", selectedRows);
       // Tránh gọi onSelectedRows lần đầu tiên khi component mount
       if (isFirstRender.current) {
           isFirstRender.current = false;
       } else {
           onSelectedRows(selectedRows);
       }
    }, [selectedRows]);

    // --- Lưu trạng thái cột hiển thị vào localStorage mỗi khi visibleColumns thay đổi ---
    useEffect(() => {
        if (name) {
            localStorage.setItem(`datatable_visible_columns_${name}`, JSON.stringify(visibleColumns));
        }
    }, [visibleColumns, name]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target)) {
                setShowColumnSelector(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleCheckboxChange = (event) => {
        const isChecked = event.target.checked;
        const rowId = event.target.value;
        if(isChecked){
            if(!selectedRows.includes(rowId)){
                setSelectedRows([...selectedRows, rowId]);
            }
        }else {
            setSelectedRows([...selectedRows.filter((row) => row !== rowId)]);
        }
    };
    // Handle check all checkbox
    const handleCheckedAll = (event) => {
        console.log("Check all checkbox: ", event.target.checked);
        const isChecked = event.target.checked;
        const allRowIds = data.map((row) => String(row.id));
        if(isChecked){
            setSelectedRows(allRowIds);
        }else {
            setSelectedRows([]);
        }
    };

    const handleColumnToggle = (idx) => {
        setVisibleColumns((prev) =>
            prev.includes(idx)
                ? prev.filter((i) => i !== idx)
                : [...prev, idx]
        );
    };

    // Helper để lấy width số từ chuỗi %
    const getWidthNumber = (w) => {
        if (!w) return 0;
        if (typeof w === 'string' && w.endsWith('%')) return parseFloat(w);
        return Number(w) || 0;
    };

    // Helper để tính tổng cho các cột có thể tính tổng
    const calculateSummary = () => {
        if (!showSummary || !data || data.length === 0) return {};
        
        const summary = {};
        columns.forEach((col, index) => {
            const title = typeof col.title === "function" ? col.title() : col.title;
            const titleStr = typeof title === 'string' ? title : '';
            
            // Kiểm tra xem cột có phải là cột số có thể tính tổng không
            const isSummableColumn = titleStr.toLowerCase().includes('tổng') || 
                                   titleStr.toLowerCase().includes('nợ') || 
                                   titleStr.toLowerCase().includes('giá') || 
                                   titleStr.toLowerCase().includes('tiền') ||
                                   titleStr.toLowerCase().includes('số lượng') ||
                                   titleStr.toLowerCase().includes('tồn') ||
                                   col.summarizable === true;
            
            if (isSummableColumn) {
                let total = 0;
                data.forEach(row => {
                    if (!row) return;
                    const value = col.element(row);
                    let number = 0;
                    
                    // Lấy giá trị số từ element (có thể là JSX)
                    if (typeof value === 'object' && value && value.props && value.props.children) {
                        const text = value.props.children.toString();
                        // Xử lý format tiền Việt Nam: "9.729,514 ₫" -> 9729514
                        number = parseFloat(text.replace(/[^\d]/g, ''));
                    } else if (typeof value === 'number') {
                        number = value;
                    } else if (typeof value === 'string') {
                        // Xử lý format tiền Việt Nam: "9.729,514 ₫" -> 9729514
                        number = parseFloat(value.replace(/[^\d]/g, ''));
                    }
                    
                    if (!isNaN(number)) {
                        total += number;
                    }
                });
                summary[index] = total;
            }
        });
        return summary;
    };

    // Helper để tính toán width cho cột
    const calculateColumnWidths = () => {
        // Xác định các cột đang hiển thị
        const visibleIdx = columns.map((_, idx) => idx).filter(idx => visibleColumns.includes(idx));
        // Lấy width gốc của các cột
        const baseWidths = columns.map(col => {
            const w = col.width;
            if (w && typeof w === 'string' && w.endsWith('%')) return parseFloat(w);
            if (w && typeof w === 'string' && w.endsWith('px')) return 0;
            if (typeof w === 'number') return w;
            return 0;
        });
        
        // Phân loại cột cố định (hình ảnh) và cột linh hoạt
        const fixedWidthColumns = visibleIdx.filter(idx => {
            const col = columns[idx];
            const title = typeof col.title === "function" ? col.title() : col.title;
            const titleStr = typeof title === 'string' ? title : '';
            return col.fixedWidth || titleStr.toLowerCase().includes('hình ảnh') || titleStr.toLowerCase().includes('ảnh');
        });
        const flexibleColumns = visibleIdx.filter(idx => !fixedWidthColumns.includes(idx));
        
        // Tính tổng width của cột bị ẩn (chỉ từ cột linh hoạt)
        const totalHiddenFlexibleWidth = columns.reduce((sum, col, idx) => {
            if (!visibleColumns.includes(idx)) {
                const title = typeof col.title === "function" ? col.title() : col.title;
                const titleStr = typeof title === 'string' ? title : '';
                const isFixed = col.fixedWidth || titleStr.toLowerCase().includes('hình ảnh') || titleStr.toLowerCase().includes('ảnh');
                if (!isFixed) {
                    return sum + baseWidths[idx];
                }
            }
            return sum;
        }, 0);
        
        // Tính width mới
        const newWidths = visibleIdx.map(idx => {
            const base = baseWidths[idx];
            // Nếu là cột cố định thì giữ nguyên width
            if (fixedWidthColumns.includes(idx)) {
                return base.toFixed(2) + '%';
            }
            // Nếu là cột linh hoạt thì phân bổ thêm width từ cột bị ẩn
            const plus = flexibleColumns.length > 0 ? totalHiddenFlexibleWidth / flexibleColumns.length : 0;
            return (base + plus).toFixed(2) + '%';
        });
        
        return { visibleIdx, newWidths };
    };

   const renderTableHeader = () => {
        const { visibleIdx, newWidths } = calculateColumnWidths();
        
        let widthIdx = 0;
        return columns
            .map((col, index) => {
                if (!visibleColumns.includes(index)) return null;
                return (
                    <th
                        key={index}
                        scope="col"
                        style={{ width: newWidths[widthIdx++] }}
                        className="datatable-th"
                    >
                        {typeof col.title === "function" ? col.title() : col.title}
                    </th>
                );
            })
            .filter(Boolean);
    };

    const renderFilterHeader = () => {
        if (!filterHeader) return null;
        return (
            <tr>
                <td></td>
                {filterHeader.map((filter, idx) => (
                    <th key={idx} style={columns[idx] && columns[idx].width ? { width: columns[idx].width } : {}} className="text-dark fw-bold">
                        {filter}
                    </th>
                ))}
            </tr>
        );
    };

    const renderSummaryRow = () => {
        if (!showSummary) return null;
        
        const summary = Object.keys(customSummaryData).length > 0 ? customSummaryData : calculateSummary();
        const { visibleIdx, newWidths } = calculateColumnWidths();
        let widthIdx = 0;
        
        return (
            <tr key="summary" className="datatable-summary-row">
                {!hideSelected && <td className="datatable-checkbox-col"></td>}
                {columns
                    .map((col, colIndex) => {
                        if (!visibleColumns.includes(colIndex)) return null;
                        
                        const title = typeof col.title === "function" ? col.title() : col.title;
                        const titleStr = typeof title === 'string' ? title : '';
                        const isSummableColumn = titleStr.toLowerCase().includes('tổng') || 
                                               titleStr.toLowerCase().includes('nợ') || 
                                               titleStr.toLowerCase().includes('giá') || 
                                               titleStr.toLowerCase().includes('tiền') ||
                                               titleStr.toLowerCase().includes('số lượng') ||
                                               titleStr.toLowerCase().includes('tồn') ||
                                               col.summarizable === true;
                        
                        return (
                            <td key={`summary-${colIndex}`} style={{ width: newWidths[widthIdx++] }} className="datatable-td">
                                {isSummableColumn && summary[colIndex] !== undefined ? (
                                    <strong>{formatSummaryValue(summary[colIndex], col, titleStr)}</strong>
                                ) : ''}
                            </td>
                        );
                    })
                    .filter(Boolean)}
            </tr>
        );
    };

    // Helper để format giá trị tổng theo format của cột gốc
    const formatSummaryValue = (value, col, titleStr) => {
        // Kiểm tra format thực tế từ dữ liệu mẫu
        if (data && data.length > 0 && data[0]) {
            const sampleValue = col.element(data[0]);
            
            // Kiểm tra xem có chứa ký hiệu tiền tệ không
            if (typeof sampleValue === 'object' && sampleValue && sampleValue.props && sampleValue.props.children) {
                const text = sampleValue.props.children.toString();
                if (text.includes('₫')) {
                    // Format tiền tệ với ký hiệu ₫
                    return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
                }
            } else if (typeof sampleValue === 'string' && sampleValue.includes('₫')) {
                // Format tiền tệ với ký hiệu ₫
                return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
            }
        }
        
        // Fallback: Kiểm tra theo tên cột
        if (titleStr.toLowerCase().includes('giá') || titleStr.toLowerCase().includes('tiền')) {
            // Format tiền tệ
            return `${new Intl.NumberFormat('vi-VN').format(value)} ₫`;
        } else if (titleStr.toLowerCase().includes('tồn') || titleStr.toLowerCase().includes('số lượng')) {
            // Format số nguyên
            return new Intl.NumberFormat('vi-VN').format(Math.round(value));
        } else {
            // Format mặc định
            return new Intl.NumberFormat('vi-VN').format(value);
        }
    };

    const renderTableData = () => {
        const { visibleIdx, newWidths } = calculateColumnWidths();
        
        return data
            .filter(row => row != null)
            .map((row, index) => {
                let widthIdx = 0;
                return (
                    <tr key={row.id || `row-${index}`}>
                        {!hideSelected && (
                            <td className="datatable-checkbox-col">
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(String(row.id))}
                                    className="form-check-input"
                                    onChange={handleCheckboxChange}
                                    value={row.id}
                                />
                            </td>
                        )}
                        {columns
                            .map((col, colIndex) => {
                                if (!visibleColumns.includes(colIndex)) return null;
                                return (
                                    <td key={`${row.id}-${colIndex}`} style={{ width: newWidths[widthIdx++] }} className="datatable-td">
                                        {col.element ? col.element(row) : ''}
                                    </td>
                                );
                            })
                            .filter(Boolean)}
                    </tr>
                );
            });
    };

    const renderPagination = () => {
        const paginationItems = [];
        const nextPage = currentPage + 1 > numOfPages ? null : currentPage + 1;
        const prevPage = currentPage - 1 < 1 ? null : currentPage - 1;
        console.log("Num of page: ", numOfPages);
        
            paginationItems.push(
                <li className={prevPage ? "page-item" : "page-item disabled"} key="prev">
                    <button className="page-link" type="button" onClick={() => setCurrentPage(prevPage)}>&laquo;</button>
                </li>
            );
            
            for (let i = 1; i <= numOfPages; i++) {
                console.log(currentPage)
                    paginationItems.push(
                        <li className={currentPage === i ? "page-item active" : "page-item"} key={i}>
                            <button className="page-link" type="button" onClick={() => setCurrentPage(i)}>{i}</button>
                        </li>
                    );
            }
    

            paginationItems.push(
                <li className={nextPage ? "page-item" : "page-item disabled"} key="next">
                    <button className="page-link"onClick={() => setCurrentPage(nextPage)} >&raquo;</button>
                </li>
            );
            return paginationItems
    }
        

    

  const visibleColumnCount = props.columns ? props.columns.filter((_, idx) => visibleColumns.includes(idx)).length : 0;
  const tableMinWidth = visibleColumnCount >= 9 ? 1600 : 1200;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div className="datatable-compact" style={{ flex: 1, minHeight: 0 }}>
                {/* Header row với hiển thị mục và column selector */}
                <div className="datatable-toolbar">
                    <div className="datatable-entries">
                        <span className="text-muted small">Hiển thị</span>
                        <select 
                            className="form-select form-select-sm datatable-select-small"
                            onChange={(e) => setItemOfPage(e.target.value)}
                            defaultValue="25"
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span className="text-muted small">mục</span>
                    </div>
                    <div className="datatable-actions">
                        <button
                            type="button"
                            className="btn btn-sm btn-light datatable-column-btn"
                            onClick={() => setShowColumnSelector((prev) => !prev)}
                            title="Chọn cột hiển thị"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        {showColumnSelector && (
                            <div ref={columnSelectorRef} className="datatable-column-selector">
                                <div className="datatable-column-selector-title">Chọn cột hiển thị</div>
                                {columns.map((col, idx) => (
                                    <div key={idx} className="datatable-column-item">
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns.includes(idx)}
                                            onChange={() => handleColumnToggle(idx)}
                                            id={`col-toggle-${idx}`}
                                        />
                                        <label htmlFor={`col-toggle-${idx}`}>
                                            {typeof col.title === "function" ? col.title() : col.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Search inline (nếu cần) */}
                {!hideSearch && (
                    <div className="datatable-search">
                        <label className="text-muted" htmlFor="searchBox">Tìm kiếm:</label>
                        <div className="datatable-search-input">
                            <LiveSearch changeKeyword={changeKeyword}/>
                        </div>
                    </div>
                )}
                
                {/* Vùng scroll cho thân bảng */}
                <div className="datatable-scroll" style={{ flex: 1, minHeight: 0 }}>
                    <table className={`table table-compact mb-0 ${(isLoading || data.length === 0) ? 'datatable-empty-state' : ''}`} style={{ minWidth: (isLoading || data.length === 0) ? '100%' : tableMinWidth }}>
                        {/* Ẩn thead khi không có dữ liệu để không hiển thị border */}
                        {(!isLoading && data.length > 0) && (
                            <thead className="datatable-header">
                                {filterHeader && renderFilterHeader()}
                                <tr>
                                    {!hideSelected && (
                                        <th className="datatable-checkbox-col">
                                            <input 
                                                type="checkbox" 
                                                checked={data.length === selectedRows.length && data.length > 0} 
                                                className="form-check-input" 
                                                onChange={handleCheckedAll}
                                            />
                                        </th>
                                    )}
                                    {renderTableHeader()}
                                </tr>
                            </thead>
                        )}
                        <tbody>
                            {isLoading ? (
                                <tr key="loading">
                                    <td colSpan={(!hideSelected ? 1 : 0) + columns.length} className="datatable-empty">
                                        <div className="spinner-border text-primary mb-2" role="status"></div>
                                        <div>Đang tải dữ liệu...</div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr key="empty">
                                    <td colSpan={(!hideSelected ? 1 : 0) + columns.length} className="datatable-empty">
                                        <i className="fas fa-database mb-2"></i>
                                        <div>Không có dữ liệu</div>
                                        <small className="text-muted">Không tìm thấy dòng dữ liệu nào phù hợp.</small>
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {renderSummaryRow()}
                                    {renderTableData()}
                                </>
                            )}
                        </tbody>
                    </table>
                    
                    {/* Pagination - nằm cuối nội dung bảng, chỉ hiển thị khi scroll xuống */}
                    {numOfPages > 1 && (
                        <div className="datatable-pagination-inline">
                            <ul className="pagination pagination-sm mb-0">
                                {renderPagination()}
                            </ul>
                        </div>
                    )}
                </div>
        </div>
    </div>
  )
}

export default DataTables