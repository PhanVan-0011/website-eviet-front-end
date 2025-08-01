import React, { use, useEffect, useState } from 'react'
import LiveSearch from './LiveSearch';


const DataTables = (props) => {
    console.log("DataTables props: ", props);
   const { name, columns, data, numOfPages, currentPage, setCurrentPage, setItemOfPage, changeKeyword, onSelectedRows, filterHeader, hideSelected, isLoading = false } = props;
   const [selectedRows, setSelectedRows] = useState([]);

   useEffect(() => {
       console.log("Selected rows: ", selectedRows);
       onSelectedRows(selectedRows);
    }, [selectedRows]);

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

   const renderTableHeader = () => {
        return columns.map((col, index) => (
            <th
                key={index}
                scope="col"
                style={col.width ? { width: col.width } : {}}
                className={col.thClass || ""}
            >
                {typeof col.title === "function" ? col.title() : col.title}
            </th>
        ));
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
        return (
            data.map((row, index) => (
                <tr key={row.id}>
                    {!hideSelected && (
                        <td>
                            <input
                                type="checkbox"
                                checked={selectedRows.includes(String(row.id))}
                                className="form-check-input"
                                onChange={handleCheckboxChange}
                                value={row.id}
                            />
                        </td>
                    )}
                    {columns.map((col, colIndex) => (
                        <td
                            key={colIndex}
                            style={col.width ? { width: col.width } : {}}
                            className={col.tdClass || ""}
                        >
                            {col.element(row)}
                        </td>
                    ))}
                </tr>
            ))
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
            <div className="card-header">
                <i className="fas fa-table me-1"></i>
                {name}
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
                <table className="table table-bordered table-hover " id="datatablesSimple" width="100%" cellSpacing="0">
                    {data.length > 0 && (
                        <thead className="custom-table">
                            {renderFilterHeader()}
                            <tr>
                                {!hideSelected && (
                                    <td>
                                        <input type="checkbox" checked={data.length === selectedRows.length && data.length > 0 ? true : false} className="form-check-input" onChange={handleCheckedAll}/>
                                    </td>
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
                            data.map((row) => (
                                <tr key={row.id}>
                                    {!hideSelected && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedRows.includes(String(row.id))}
                                                className="form-check-input"
                                                onChange={handleCheckboxChange}
                                                value={row.id}
                                            />
                                        </td>
                                    )}
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            style={col.width ? { width: col.width } : {}}
                                            className={col.tdClass || ""}
                                        >
                                            {col.element(row)}
                                        </td>
                                    ))}
                                </tr>
                            ))
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