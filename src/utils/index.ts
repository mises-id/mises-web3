/*
 * @Author: lmk
 * @Date: 2022-06-13 15:02:32
 * @LastEditTime: 2022-09-07 15:14:37
 * @LastEditors: lmk
 * @Description: 
 */
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
