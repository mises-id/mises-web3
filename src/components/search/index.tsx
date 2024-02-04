import "./index.less";
import React, { useState } from 'react';
import { SearchBar, Button } from 'antd-mobile';

const SearchComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const onChange = (value: string) => {
    setSearchTerm(value);
  };

  const onSubmit = () => {
    const keyword = searchTerm.trim();
    if(keyword){
      window.location.href = `https://search.mises.site/?q=${keyword}`;
      return;
    }
  };

  return (
    <div className="outer-search-container">
      <div className="flex items-center justify-center">
        <div className="inner-search-container">
          <SearchBar
            value={searchTerm}
            placeholder=""
            onChange={onChange}
            onSearch={onSubmit}
            className="margin-right-10 flex-grow width-70"
          />
          <Button className="inner-search-button flex-grow" onClick={onSubmit}>Search</Button>
        </div>   
      </div>
    </div>
  );
}

export default SearchComponent;
