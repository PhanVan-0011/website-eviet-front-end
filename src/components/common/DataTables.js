import React, { use, useEffect, useState } from 'react'
import LiveSearch from './LiveSearch';
import { useRef } from 'react';


const DataTables = (props) => {
    console.log("DataTables props: ", props);
   const { name, columns, data, numOfPages, currentPage, setCurrentPage, setItemOfPage, changeKeyword, onSelectedRows, filterHeader, hideSelected, hideSearch = false, isLoading = false, showSummary = false } = props;
   const [selectedRows, setSelectedRows] = useState([]);
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
       onSelectedRows(selectedRows);
    }, [selectedRows]);

    // Clear selected rows when data changes (e.g., after delete)
    useEffect(() => {
        if (data && data.length === 0) {
            setSelectedRows([]);
        } else if (data && selectedRows.length > 0) {
            // Remove selected rows that no longer exist in data
            const existingIds = data.map(row => String(row.id));
            const validSelectedRows = selectedRows.filter(id => existingIds.includes(id));
            if (validSelectedRows.length !== selectedRows.length) {
                setSelectedRows(validSelectedRows);
            }
        }
    }, [data, selectedRows]);

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
        return columns.map((col, index) =>
            visibleColumns.includes(index) && (
                <th
                    key={index}
                    scope="col"
                    style={col.thClass ? { ...col.thClass, width: newWidths[widthIdx++] } : { width: newWidths[widthIdx++] }}
                    className={`text-dark fw-bold ${col.thClass || ""}`}
                >
                    {typeof col.title === "function" ? col.title() : col.title}
                </th>
            )
        );
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
        
        const summary = calculateSummary();
        const { visibleIdx, newWidths } = calculateColumnWidths();
        let widthIdx = 0;
        
        return (
            <tr className="table-info fw-bold" style={{ backgroundColor: '#e3f2fd' }}>
                {!hideSelected && (
                    <td style={{ width: '1%' }}>
                    </td>
                )}
                {columns.map((col, colIndex) => {
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
                        <td
                            key={colIndex}
                            style={col.tdClass ? { ...col.tdClass, width: newWidths[widthIdx++] } : { width: newWidths[widthIdx++] }}
                            className={col.tdClass || ""}
                        >
                            {isSummableColumn && summary[colIndex] !== undefined ? (
                                // Sử dụng cùng format với cột gốc nhưng in đậm
                                <div className="fw-bold">
                                    {formatSummaryValue(summary[colIndex], col, titleStr)}
                                </div>
                            ) : (
                                ''
                            )}
                        </td>
                    );
                })}
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
        
        return (
            data.map((row, index) => {
                if (!row) return null;
                let widthIdx = 0;
                return (
                    <tr key={row.id || index}>
                        {!hideSelected && (
                            <td style={{ width: '1%' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(String(row.id))}
                                    className="form-check-input"
                                    onChange={handleCheckboxChange}
                                    value={row.id}
                                />
                            </td>
                        )}
                        {columns.map((col, colIndex) =>
                            visibleColumns.includes(colIndex) && (
                                <td
                                    key={colIndex}
                                    style={col.tdClass ? { ...col.tdClass, width: newWidths[widthIdx++] } : { width: newWidths[widthIdx++] }}
                                    className={col.tdClass || ""}
                                >
                                    {col.element ? col.element(row) : ''}
                                </td>
                            )
                        )}
                    </tr>
                );
            })
        );
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
    <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                    <i className="fas fa-table me-1"></i>
                    {name}
                </div>
                <div style={{ position: "relative" }}>
                    <button
                        type="button"
                        style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer" }}
                        onClick={() => {
                            setShowColumnSelector((prev) => !prev);
                            console.log("showColumnSelector", showColumnSelector);
                        }}
                        title="Chọn cột hiển thị"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                    {showColumnSelector && (
                        <div
                            ref={columnSelectorRef}
                            style={{
                                position: "absolute",
                                right: 0,
                                top: "100%",
                                background: "#fff",
                                border: "1px solid #ccc",
                                zIndex: 1000,
                                padding: 10,
                                minWidth: 200,
                                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                            }}
                        >
                            <strong>Chọn cột hiển thị</strong>
                            <div>
                                {columns.map((col, idx) => (
                                    <div key={idx}>
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns.includes(idx)}
                                            onChange={() => handleColumnToggle(idx)}
                                            id={`col-toggle-${idx}`}
                                        />
                                        <label htmlFor={`col-toggle-${idx}`} style={{ marginLeft: 8 }}>
                                            {typeof col.title === "function" ? col.title() : col.title}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="card-body">
                <div className="row mb-3">
                    <div className="col-md-6 d-flex align-items-center">
                        <label className="me-2 mb-0" htmlFor="entriesSelect">Hiển thị</label>
                        <select id="entriesSelect" className="htmlFor-select w-auto" onChange={(e) => setItemOfPage(e.target.value)}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25" selected>25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span className="ms-2">mục</span>
                    </div>
                    {!hideSearch && (
                        <div className="col-md-6 d-flex justify-content-end">
                            <label className="me-2 mb-0" htmlFor="searchBox">Tìm kiếm:</label>
                            <LiveSearch changeKeyword={changeKeyword}/>
                        </div>
                    )}
                </div>
                {/* Bọc bảng trong div để hỗ trợ scroll ngang */}
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table className="table table-bordered table-hover " id="datatablesSimple" style={{minWidth: tableMinWidth, width: '100%'}} cellSpacing="0">
                        {data.length > 0 && (
                            <thead className="custom-table" style={{ backgroundColor: '#f8f9fa' }}>
                                {renderFilterHeader()}
                                <tr>
                                    {!hideSelected && (
                                        <th style={{ width: '1%' }} className="text-dark fw-bold">
                                            <input type="checkbox" checked={data.length === selectedRows.length && data.length > 0 ? true : false} className="form-check-input" onChange={handleCheckedAll}/>
                                        </th>
                                    )}
                                    {renderTableHeader()}
                                </tr>
                            </thead>
                        )}
                        {data.length > 0 && (
                            <tfoot>
                                <tr>
                                    {!hideSelected && <td></td>}
                                    {/* {renderTableHeader()} */}
                                </tr>
                            </tfoot>
                        )}
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={(!hideSelected ? 1 : 0) + columns.length} className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center justify-content-center" style={{opacity:0.8}}>
                                            <div className="spinner-border text-primary mb-2" style={{width:48, height:48}} role="status"></div>
                                            <div className="fw-bold text-secondary" style={{fontSize:20}}>Đang tải dữ liệu...</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan={(!hideSelected ? 1 : 0) + columns.length} className="text-center py-5">
                                        <div className="d-flex flex-column align-items-center justify-content-center" style={{opacity:0.8}}>
                                            <i className="fas fa-database mb-2" style={{fontSize:48, color:'#bdbdbd'}}></i>
                                            <div className="fw-bold text-secondary" style={{fontSize:20}}>Không có dữ liệu</div>
                                            <div className="text-muted" style={{fontSize:14}}>Không tìm thấy dòng dữ liệu nào phù hợp.</div>
                                        </div>
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
                </div>
            </div>
            {numOfPages > 1 && 
                <div className="row">
                    <div className="col-12 d-flex justify-content-center">
                        <ul className="pagination">
                            {renderPagination()}
                        </ul>
                    </div>
                </div>
            }
        </div>
  )
}

export default DataTables