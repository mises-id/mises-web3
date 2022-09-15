/*
 * @Author: lmk
 * @Date: 2022-06-13 14:36:18
 * @LastEditTime: 2022-09-14 18:00:23
 * @LastEditors: lmk
 * @Description: web3 site and extension site
 */
import { getCategory, getData} from "@/api/web3sites";
import Loading from "@/components/pageLoading";
import { useThrottleFn } from "ahooks";
import { Image, InfiniteScroll, List, NavBar, PullToRefresh, Tabs } from "antd-mobile";
import React, { useEffect, useRef, useState } from "react";
import "./home.less";
export interface websiteParams {
  "title": string;
  "url": string;
  "id": string;
  "logo": string;
  "website_category_id": string;
  "desc": string;
}
interface categoryParams {
  id: string;
  type_string: 'web3' | 'extension';
  name: string;
  list?: Array<websiteParams>;
}
interface currentParamsType {
  [key : string]: {
    pageNum: number;
    hasMore: boolean;
    currentKeyIndex: number;
  };
}
const Home = () => {
  const [category,setcategory] = useState<categoryParams[]>([]);
  const [activeKey, setactiveKey] = useState<string>()
  const [activeRequestKey, setactiveRequestKey] = useState<string>()
  const [currentParams, setcurrentParams] = useState<currentParamsType>({})
  const mainElementRef = useRef<HTMLDivElement>(null)
  const sideElementRef = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const topBarHeight = 97

  const { run: handleScroll } = useThrottleFn(() => {
    let currentKey = category[0].id
    for (const item of category) {
      const element = document.getElementById(`anchor-${item.id}`)
      if (!element) continue
      const rect = element.getBoundingClientRect()
      if (rect.top <= topBarHeight) {
        currentKey = item.id
      } else {
        break
      }
    }
    setactiveKey(`${currentKey}`)
  },
  {
    leading: true,
    trailing: true,
    wait: 100,
  })

  useEffect(() =>{
    getCategory().then((res)=>{
      if(Array.isArray(res) && res.length > 0){
        setactiveKey(res[0].id)
        setactiveRequestKey(res[0].id)
        setcurrentParams({
          [res[0].id]:{
            hasMore: true,
            pageNum: 1,
            currentKeyIndex: 0
          }
        })
        setcategory(res)
      }
    })
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
    // eslint-disable-next-line
  }, [])

  const loadMore = async () => {
    if(isLoading) return;
    setIsLoading(true)
    const currentItem = currentParams[activeRequestKey!]
    return getData({
      page_size: 30,
      page_num: currentItem.pageNum,
      website_category_id: activeRequestKey!
    }).then((res: any) => {
      const hasMore = !(res.length < 30);
      currentItem.hasMore = hasMore;
      renderList(res)
      checkHasMoreList(hasMore)
      
    }).finally(()=>{
      setIsLoading(false)
    })
  }

  const renderList = (list:Array<websiteParams>) => {
    list.forEach((val: websiteParams) => {
      const index = category.findIndex(item => item.id === val.website_category_id);
      const item = category[index];
      if (item) {
        item.list = item.list || [];
        item.list.push(val);
      }
    })
    setcategory(category)
  }

  const checkHasMoreList = (hasMore: boolean) => {
    const currentItem = currentParams[activeRequestKey!]
    if(hasMore) currentItem.pageNum = currentItem.pageNum + 1;
    if(!hasMore){
      // get next category
      const index = currentItem.currentKeyIndex + 1;
      const categoryItem = category[index];

      if(!categoryItem) setHasMore(false);
      if(categoryItem){
        setactiveRequestKey(categoryItem.id);
        setcurrentParams({
          ...currentParams,
          [categoryItem.id]:{
            hasMore: true,
            pageNum: 1,
            currentKeyIndex: index
          }
        })
      }
    }
  }
  const onRefresh = async () => {
    if(isLoading) return;
    setIsLoading(true)
  }
  const getSideChange = (key: string) => {
    // const categoryIndex = category.findIndex(c => c.id === key);
    // if(categoryIndex>-1){
    //   const categoryItem = category[categoryIndex];
    //   setactiveRequestKey(categoryItem.id);
    //   setcurrentParams({
    //     ...currentParams,
    //     [categoryItem.id]:{
    //       hasMore: true,
    //       pageNum: 1,
    //       currentKeyIndex: categoryIndex
    //     }
    //   })
    //   loadMore()
    // }
    document.getElementById(`anchor-${key}`)?.scrollIntoView()
    window.scrollTo({ top: window.scrollY - 90 })
  }
  if(!activeKey) return <Loading />

  return (
    <div className="container">
      <div className="top-bar">
        <div className="header">
          <NavBar backArrow={false}>web3 store</NavBar>
        </div>

        <div className="side" ref={sideElementRef}>
          <Tabs
            activeKey={activeKey}
            onChange={getSideChange}>{
              category.map(item => (
                <Tabs.Tab key={`${item.id}`} title={item.name} />
              ))
            }</Tabs>
        </div>
      </div>

      <div className="main" ref={mainElementRef}>
        {/* <PullToRefresh onRefresh={onRefresh}> */}
          <List style={{'--border-top':'none','--border-bottom':'none'}}>
            {category.map((item,index) => {
              return item.list?.length ? <div key={item.id}>
              <h3 id={`anchor-${item.id}`} className="main-title">{item.name}</h3>
              <div className="website-container">
                {
                  item.list?.map(val=>{
                    return <a key={val.id} className="list-item" href={val.url} target="_blank" rel="noreferrer">
                      <div className="list-item-logo">
                        <Image src={val.logo} alt={val.title} width={35} height={35} fit="cover" style={{borderRadius: '5px'}} />
                      </div>
                      <div className="list-item-content">
                        <span>{val.title}</span>
                        {val.desc&&<p className="desc">{val.desc}</p>}
                      </div>
                    </a>
                  })
                }
              </div>
            </div> : null;
            })}
          </List>
          <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
        {/* </PullToRefresh> */}
      </div>
    </div>
  );
};
export default Home;
