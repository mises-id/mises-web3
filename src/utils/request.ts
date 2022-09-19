/*
 * @Author: lmk
 * @Date: 2022-05-05 20:50:25
 * @LastEditTime: 2022-09-19 11:27:12
 * @LastEditors: lmk
 * @Description:
 */
import { Toast } from 'antd-mobile';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
const headers:{[key: string]: string} = {
  'Content-Type': 'application/json'
}
const isProd = process.env.REACT_APP_NODE_ENV==='production'
// if(istest){
//   headers['Mises-Env'] = 'development'
// }
console.log(process.env)
const baseURL = isProd ? 'https://api.alb.mises.site/api/v1/' : 'https://api.test.mises.site/api/v1/'
const request = axios.create({
  headers,
  baseURL,
  timeout: 10000,
});

// add request interceptors
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  function (error:any) {
    return Promise.reject(error);
  },
);

// add response interceptors
request.interceptors.response.use((response: AxiosResponse) => {
  const { data } = response;
  if (data.code === 0) return data.data;
  Toast.show(data.msg);
  return Promise.reject(data.data);
});

export default request;
