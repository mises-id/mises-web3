/*
 * @Author: lmk
 * @Date: 2022-06-13 14:36:18
 * @LastEditTime: 2022-09-09 15:14:00
 * @LastEditors: lmk
 * @Description: web3 site and extension site
 */
import { getData } from "@/utils";
import { useThrottleFn } from "ahooks";
import { Image, InfiniteScroll, List, NavBar, PullToRefresh, SideBar } from "antd-mobile";
import React, { useEffect, useRef, useState } from "react";
import categoryJson from './category.json';
import "./index.less";
export interface websiteParams {
  "title": string;
  "url": string;
  "id": number;
  "logo": string;
  "category": string;
}
interface categoryParams {
  id: string;
  type: 'web3' | 'extension';
  name: string;
  list?: Array<websiteParams>;
}

const Home = () => {
  const [category,setcategory] = useState<categoryParams[]>(categoryJson as unknown as categoryParams[]);
  const [activeKey, setactiveKey] = useState<string>()
  const mainElementRef = useRef<HTMLDivElement>(null)
  const sideElementRef = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [pageSize,] = useState<number>(30)

  const { run: handleScroll } = useThrottleFn(
    () => {
      let currentKey = category[0].id
      for (const item of category) {
        const element = document.getElementById(`anchor-${item.id}`)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        if (rect.top <= 60) {
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
    }
  )

  useEffect(() => {
    setactiveKey(`${category[0].id}`)
    const mainElement = mainElementRef.current
    if (!mainElement) return
    mainElement.addEventListener('scroll', handleScroll)
    return () => {
      mainElement.removeEventListener('scroll', handleScroll)
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    const element = document.querySelector('.adm-side-bar-item-active')
    const rect = element?.getBoundingClientRect()
    if(rect&&(rect.top > window.innerHeight || rect.top < 60)){
      element?.scrollIntoView()
    }
  }, [activeKey])
  
  const loadMore = async () => {
    if(isLoading) return;
    setIsLoading(true)
    return getData<websiteParams>({pageNumber: page, pageSize}).then(res=>{
      setPage(page+1)
      res.records.forEach((val: websiteParams) => {
        const index = category.findIndex(item=>item.name===val.category);
        const item = category[index];
        if(item){
          item.list = item.list || [];
          item.list.push(val);
        }
      })
      setcategory(category)
      setHasMore(res.records.length >= pageSize)
    }).finally(()=>{
      setIsLoading(false)
    })
  }

  const onRefresh = async () => {
    if(isLoading) return;
    setIsLoading(true)
    getData({pageNumber: 1, pageSize}).then(res=>{
      setPage(1)
      setHasMore(true)
    }).finally(()=>{
      setIsLoading(false)
    })
  }
  const getSideChange = (key: string) => {
    setactiveKey(`${key}`)
    document.getElementById(`anchor-${key}`)?.scrollIntoView()
  }

  return (
    <div className="container">

      <div className="header">
        <NavBar backArrow={false}>web3 store</NavBar>
      </div>

      <div className="content">
        <div className="side" ref={sideElementRef}>
          <SideBar
            activeKey={activeKey}
            onChange={getSideChange}>{
              category.map(item => (
                <SideBar.Item key={`${item.id}`} title={item.name} />
              ))
            }</SideBar>
        </div>

        <div className="main" ref={mainElementRef}>
          <PullToRefresh onRefresh={onRefresh}>
            <List style={{'--border-top':'none','--border-bottom':'none'}}>
              {category.map(item => {
                return item.list?.length ? <div key={item.id}>
                  <h3 id={`anchor-${item.id}`} className="main-title">{item.name}</h3>
                  {
                    item.list?.map(val=>{
                      return <a key={val.id} className="list-item" href={val.url} target="_blank" rel="noreferrer">
                        <div className="list-item-logo">
                          <Image src={val.logo} alt={val.title} width={40} height={40} fit="cover" style={{borderRadius: '5px'}}/>
                        </div>
                        <div className="list-item-content">
                          <span>{val.title}</span>
                          <p className="desc">description</p>
                        </div>
                      </a>
                    })
                  }
                </div> : null;
              })}
            </List>
            <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
          </PullToRefresh>
        </div>

      </div>
    </div>
  );
};
export default Home;
