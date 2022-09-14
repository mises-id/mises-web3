/*
 * @Author: lmk
 * @Date: 2022-05-05 20:50:25
 * @LastEditTime: 2022-09-14 18:02:09
 * @LastEditors: lmk
 * @Description:
 */
import { Toast } from 'antd-mobile';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';

const request = axios.create({
  headers: { 'Content-Type': 'application/json' },
  baseURL: 'https://api.alb.mises.site/api/v1/',
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
