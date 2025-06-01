
import React, { useEffect, useState } from 'react'
const LiveSearch = ({changeKeyword}) => {
    const [searchText, setSearchText] = useState('')
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            changeKeyword(searchText)
        }, 500);
        return () => clearTimeout(delayDebounce)
    }, [searchText])

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
        className="form-control form-control-sm ms-1 w-auto"
        placeholder="Gõ để tìm..."
    />
  )
}

export default LiveSearch