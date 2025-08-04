import React, { use, useEffect, useState } from 'react'
import LiveSearch from './LiveSearch';
import { useRef } from 'react';


const DataTables = (props) => {
    console.log("DataTables props: ", props);
   const { name, columns, data, numOfPages, currentPage, setCurrentPage, setItemOfPage, changeKeyword, onSelectedRows, filterHeader, hideSelected, isLoading = false } = props;
   const [selectedRows, setSelectedRows] = useState([]);
   const [visibleColumns, setVisibleColumns] = useState(props.columns ? props.columns.map((col, idx) => idx) : []);
   const [showColumnSelector, setShowColumnSelector] = useState(false);
   const columnSelectorRef = useRef();

   useEffect(() => {
       console.log("Selected rows: ", selectedRows);
       onSelectedRows(selectedRows);
    }, [selectedRows]);

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

   const renderTableHeader = () => {
        // Tính lại width động cho các cột đang hiển thị
        const visibleIdx = columns.map((_, idx) => idx).filter(idx => visibleColumns.includes(idx));
        const allWidths = columns.map(col => getWidthNumber(col.width));
        const sumAll = allWidths.reduce((a, b) => a + b, 0);
        const visibleWidths = visibleIdx.map(idx => allWidths[idx]);
        const sumVisible = visibleWidths.reduce((a, b) => a + b, 0);
        // width mới cho các cột còn lại
        const newWidths = visibleIdx.map((idx, i) => {
            if (sumVisible === 0) return '';
            const ratio = allWidths[idx] / sumVisible;
            return (ratio * sumAll).toFixed(2) + '%';
        });
        let widthIdx = 0;
        return columns.map((col, index) =>
            visibleColumns.includes(index) && (
                <th
                    key={index}
                    scope="col"
                    style={col.thClass ? { ...col.thClass, width: newWidths[widthIdx++] } : { width: newWidths[widthIdx++] }}
                    className={col.thClass || ""}
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
                    <th key={idx} style={columns[idx] && columns[idx].width ? { width: columns[idx].width } : {}}>
                        {filter}
                    </th>
                ))}
            </tr>
        );
    };

    const renderTableData = () => {
        // Tính lại width động cho các cột đang hiển thị
        const visibleIdx = columns.map((_, idx) => idx).filter(idx => visibleColumns.includes(idx));
        const allWidths = columns.map(col => getWidthNumber(col.width));
        const sumAll = allWidths.reduce((a, b) => a + b, 0);
        const visibleWidths = visibleIdx.map(idx => allWidths[idx]);
        const sumVisible = visibleWidths.reduce((a, b) => a + b, 0);
        const newWidths = visibleIdx.map((idx, i) => {
            if (sumVisible === 0) return '';
            const ratio = allWidths[idx] / sumVisible;
            return (ratio * sumAll).toFixed(2) + '%';
        });
        return (
            data.map((row, index) => {
                let widthIdx = 0;
                return (
                    <tr key={row.id}>
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
                                    {col.element(row)}
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
                    <div className="col-md-6 d-flex justify-content-end">
                        <label className="me-2 mb-0" htmlFor="searchBox">Tìm kiếm:</label>
                        <LiveSearch changeKeyword={changeKeyword}/>
                    </div>
                </div>
                <table className="table table-bordered table-hover " id="datatablesSimple" style={{ width: "100%" }} cellSpacing="0">
                    {data.length > 0 && (
                        <thead className="custom-table">
                            {renderFilterHeader()}
                            <tr>
                                {!hideSelected && (
                                    <th style={{ width: '1%' }}>
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
                            renderTableData()
                        )}
                    </tbody>
                </table>
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