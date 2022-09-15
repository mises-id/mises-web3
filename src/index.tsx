/*
 * @Author: lmk
 * @Date: 2022-06-13 14:30:44
 * @LastEditTime: 2022-09-14 17:59:30
 * @LastEditors: lmk
 * @Description: 
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@/styles/global.css'
import reportWebVitals from './reportWebVitals';
import './locales'
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
