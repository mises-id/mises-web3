import "./index.less";
import React, { useState } from 'react';

const SearchComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchData = () => {
    // window.location.href = `https://www.google.com/search?q=${searchTerm}`;
    window.location.href = `https://portal.gosrch.co/search/?search_term=${searchTerm}&brand=B2`;
    return;
  };

  return (
    <div className="outer-search-container">
      <div className="flex items-center justify-center">
        <div className="inner-search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={(e) => {if(e.key === "Enter"){fetchData()}}}
            placeholder="Search the web..."
            className="margin-right-10 flex-grow width-70 px-4 py-2 border border-gray-300 rounded-l-md rounded-r-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          <button
            onClick={() => searchTerm !== '' && fetchData()}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-l-md rounded-r-md flex-grow"
          >
            Search
          </button>
        </div>   
      </div>
    </div>
   );
   
   
};

export default SearchComponent;
