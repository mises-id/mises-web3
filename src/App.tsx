/*
 * @Author: lmk
 * @Date: 2022-06-13 14:30:44
 * @LastEditTime: 2022-08-17 17:55:51
 * @LastEditors: lmk
 * @Description: 
 */
import { ConfigProvider } from 'antd-mobile';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Routes from './routes';
import enUS from 'antd-mobile/es/locales/en-US'
import { RecoilRoot } from "recoil"
function App() {
  return (
    <div className="App">
      <RecoilRoot>
        <ConfigProvider locale={enUS}>
          <BrowserRouter>
            <Routes />
          </BrowserRouter>
        </ConfigProvider>
      </RecoilRoot>
    </div>
  );
}

export default App;
