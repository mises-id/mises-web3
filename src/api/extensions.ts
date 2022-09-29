/*
 * @Author: lmk
 * @Date: 2022-09-14 15:01:37
 * @LastEditTime: 2022-09-28 17:31:16
 * @LastEditors: lmk
 * @Description: 
 */
import request from "@/utils/request";

export function getCategory(){
  return request({
    url: 'extensions_category/list', 
  })
}
export interface categoryListRequest{
  page_num: number,
  page_size: number,
  website_category_id: string,
}
export function getData(params: categoryListRequest){
  return request({
    url: 'extensions/page',
    params
  })
}