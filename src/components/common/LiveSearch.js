
import React, { useEffect, useState } from 'react'
const LiveSearch = ({changeKeyword, placeholder = "Gõ để tìm..."}) => {
    const [searchText, setSearchText] = useState('')
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (changeKeyword && typeof changeKeyword === 'function') {
                changeKeyword(searchText)
            }
        }, 500);
        return () => clearTimeout(delayDebounce)
    }, [searchText, changeKeyword])

    console.log("Change keyword: ", changeKeyword)

    const changeSearchText = (e) => {
        setSearchText(e.target.value)
        console.log("Search text: ", e.target.value)
        
    }
  return (
    <input
        onChange={changeSearchText}
        value={searchText}
        type="search"
        id="searchBox"
        className="form-control"
        placeholder={placeholder}
    />
  )
}

export default LiveSearch