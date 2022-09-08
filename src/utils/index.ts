/*
 * @Author: lmk
 * @Date: 2022-06-13 15:02:32
 * @LastEditTime: 2022-09-08 18:17:45
 * @LastEditors: lmk
 * @Description: 
 */
import { websiteParams } from '@/pages/home';
import websiteJson from '@/pages/home/website.json';

export function urlToJson(url = window.location.href) {
  let obj:{[key:string]:any} = {},
    index = url.indexOf("?"),
    params = url.substr(index + 1);

  if (index !== -1) {
    // 有参数时
    let parr = params.split("&");
    for (let i of parr) {
      let arr = i.split("=");
      obj[arr[0]] = arr[1];
    }
  }

  return obj;
}
interface user {
  username: string;
  misesid: string
}
export function username(val:user, defaultName = "Anonymous") {
  if (val?.username) return val?.username;
  if (val.misesid && val.misesid.length > 26) {
    const name = `${shortenAddress(val.misesid)}`;
    return name.replace("did:mises:", "");
  }
  return defaultName;
}
export function shortenAddress(address = "") {
  return `${address.slice(0, 18)}...${address.slice(-4)}`;
}
export function isMisesBrowser() {
  return (
    navigator.userAgent.indexOf("Chrome/77.0.3865.116 Mobile Safari/537.36") >
    -1
  );
}
// 临时的
export function getData<T>({pageNumber, pageSize}:{pageNumber: number, pageSize: number}={pageNumber:1, pageSize: 10}): Promise<{
  total: number;
  pageNumber: number;
  pageSize: number;
  records: T[];
}>{
  const endNumber = pageSize * pageNumber
  const startNumber = (pageNumber - 1) * pageSize
  const newData = [...websiteJson]
  return Promise.resolve({
    total: websiteJson.length,
    pageNumber,
    pageSize,
    records: newData.slice(startNumber, endNumber) as unknown as T[]
  })
}