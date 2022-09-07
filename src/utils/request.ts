/*
 * @Author: lmk
 * @Date: 2022-05-05 20:50:25
 * @LastEditTime: 2022-05-28 22:43:29
 * @LastEditors: lmk
 * @Description:
 */
import { Toast } from 'antd-mobile';
import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
const codeMessage: Record<number, string> = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
// /**
//  * @zh-CN 异常处理程序
//  * @en-US Exception handler
//  */
const errorHandler = (error: {
  response: AxiosResponse;
  config: AxiosRequestConfig;
}) => {
  const { response, config } = error;
  if (response && response.status) {
    const errorText =
      response?.data.msg || codeMessage[response.status] || response.statusText;
    // const { status } = response;
    Toast.show(errorText);
    return Promise.reject(error);
  }
  if (!response) {
    Toast.show('你的网络不正常，无法连接到服务器');
    return Promise.reject(error);
  }
  if (config) {
    Toast.show('出错啦');
  }
  // return response;
  return Promise.reject(error);
};
const request = axios.create({
  headers: { 'Content-Type': 'application/json' },
  baseURL: 'https://api.alb.mises.site/api/v1/',
  timeout: 10000,
});

// 添加请求拦截器
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    return config;
  },
  function (error:any) {

    // 对请求错误做些什么
    return Promise.reject(error);
  },
);

// 添加响应拦截器
request.interceptors.response.use((response: AxiosResponse) => {
  const { data } = response;
  if (data.code === '200') return data.data;
  Toast.show(data.msg);
  return Promise.reject(data.data);
}, errorHandler);

export default request;
