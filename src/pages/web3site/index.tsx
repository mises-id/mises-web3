/*
 * @Author: lmk
 * @Date: 2022-06-13 14:36:18
 * @LastEditTime: 2022-09-28 17:37:48
 * @LastEditors: lmk
 * @Description: web3 site and extension site
 */
import { getCategory, getData } from "@/api/web3sites";
import Loading from "@/components/pageLoading";
import { web3sitesCacheKey } from "@/utils";
import { useThrottleFn } from "ahooks";
import { Image, InfiniteScroll, List, NavBar, Popup, PullToRefresh, Tabs } from "antd-mobile";
import React, { useEffect, useRef, useState } from "react";
import "./index.less";
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
  shorter_name: string;
}
interface categoryListType extends categoryParams {
  pageNum: number;
  hasMore: boolean;
  currentKeyIndex: number;
  list?: Array<websiteParams>;
}
const Home = () => {
  const [category, setcategory] = useState<categoryParams[]>([]);
  const [activeKey, setactiveKey] = useState<string>()
  const [activeKeyIndex, setactiveKeyIndex] = useState<number>(0)
  const [activeRequestKey, setactiveRequestKey] = useState<string>()
  const [categoryListParams, setcategoryListParams] = useState<categoryListType[]>([])
  const mainElementRef = useRef<HTMLDivElement>(null)
  const sideElementRef = useRef<HTMLDivElement>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isDisabled, setIsDisabled] = useState<boolean>(false)
  const [visible, setVisible] = useState<boolean>(false)
  const topBarHeight = 97
  const pageSize = 30;
  const defalutParams = {
    hasMore: true,
    pageNum: 1,
  }
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
    setactiveKey(currentKey)
    findActiveKeyIndex(currentKey)
  },
    {
      leading: true,
      trailing: true,
      wait: 100,
    })
  const findActiveKeyIndex = (key: string) => {
    const index = category.findIndex(c => c.id === key)
    setactiveKeyIndex(index)
    return index
  }
  const setcategoryLayout = (res: categoryParams[]) => {
    setactiveKey(res[0].id)
    setactiveRequestKey(res[0].id)
    setcategoryListParams([{
      ...defalutParams,
      currentKeyIndex: 0,
      ...res[0]
    }])
    setcategory(res)
  }
  useEffect(() => {
    const getCategoryCache = localStorage.getItem(web3sitesCacheKey)
    let localCategoryCache: categoryParams[] = []
    if(getCategoryCache){
      localCategoryCache = JSON.parse(getCategoryCache)
      setcategoryLayout(localCategoryCache)
    }
    getCategory().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        if(Array.isArray(res) && JSON.stringify(res) !== getCategoryCache){
          // update category cache
          localStorage.setItem(web3sitesCacheKey, JSON.stringify(res))
          if(localCategoryCache.length===0 || localCategoryCache[0]?.id!==res[0].id){
            setcategoryLayout(res)
          }
        }
        
        // setcategoryLayout(res)
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

  const loadMore = async (id?: string) => {
    if (isLoading) return;
    setIsLoading(true)
    const website_category_id = id || activeRequestKey!
    const currentCategaryIndex = categoryListParams.findIndex(item => item.id === website_category_id)
    const currentCategary = categoryListParams[currentCategaryIndex];
    return getData({
      page_size: pageSize,
      page_num: currentCategary.pageNum,
      website_category_id
    }).then((res: any) => {
      const hasMore = !(res.length < pageSize);
      currentCategary.hasMore = hasMore;
      if (hasMore) currentCategary.pageNum = currentCategary.pageNum + 1;
      if (!hasMore && !id) {
        // get next category
        const index = currentCategary.currentKeyIndex + 1;
        const nextCategoryItem = category[index];
        if (!nextCategoryItem) setHasMore(false);
        if (nextCategoryItem) {
          setactiveRequestKey(nextCategoryItem.id);
          const hasActiveCategory = categoryListParams.some(val => val.id === nextCategoryItem.id)
          if (!hasActiveCategory) {
            categoryListParams.push({
              ...nextCategoryItem,
              ...defalutParams,
              currentKeyIndex: index
            })
          }

        }
      }
      renderList(res, currentCategaryIndex)

    }).finally(() => {
      setIsLoading(false)
    })
  }

  const renderList = (list: Array<websiteParams>, currentCategaryIndex: number) => {
    list.forEach((val: websiteParams) => {
      const item = categoryListParams[currentCategaryIndex];
      if (item) {
        item.list = item.list || [];
        item.list.push(val);
      }
    })
    setcategoryListParams([...categoryListParams])
  }
  const onRefresh = async () => {
    // if(isLoading) return;
    // setIsLoading(true)
    const preCategory = category[activeKeyIndex - 1]
    if (preCategory) {
      // if (!hasMore) setHasMore(true);
      setactiveKey(preCategory.id)
      setactiveRequestKey(preCategory.id)
      findActiveKeyIndex(preCategory.id)
      categoryListParams.unshift({
        ...defalutParams,
        currentKeyIndex: activeKeyIndex - 1,
        ...preCategory,
      })
      setcategoryListParams([...categoryListParams])
      loadMore(preCategory.id)
      return true
    } else {
      setIsLoading(false)
    }
  }
  const getSideChange = (key: string) => {
    if (isLoading) return
    const hasEmptyCategory = categoryListParams.length === category.length;
    if (hasEmptyCategory) {
      document.getElementById(`anchor-${key}`)?.scrollIntoView()
      window.scrollTo({ top: window.scrollY - 90 })
      setactiveKey(key)
      setIsDisabled(true)
      return;
    }
    setactiveKey(key)
    if (!hasMore) setHasMore(true);
    const index = findActiveKeyIndex(key)
    const categoryItem = category[index];
    setactiveRequestKey(key)
    setcategoryListParams([{
      ...defalutParams,
      currentKeyIndex: index,
      ...categoryItem,
    }])
  }
  const defaultTop = 0;
  const headerHeight = 46;
  const [top,setTop] = useState<number>(defaultTop)
  const toggleVisible = ()=>{
    const position = window.scrollY<headerHeight ? headerHeight - window.scrollY : defaultTop
    setTop(position)
    setVisible(!visible)
  }
  if (!activeKey) return <Loading />

  return (
    <div className="container">
      <div className="top-bar">
        <div className="header">
          <NavBar backArrow={false}>Web3 Sites</NavBar>
        </div>
      </div>

      <div className="side" ref={sideElementRef}>
        <Tabs
          activeKey={activeKey}
          activeLineMode="fixed"
          style={{
            "--content-padding": "0",
            "--active-line-border-radius": "4px",
            "--active-line-height": "4px",
          }}
          onChange={getSideChange}>{
            category.map(item => (
              <Tabs.Tab key={`${item.id}`} title={item.shorter_name || item.name} />
            ))
          }</Tabs>
        <div className="show-menu"  onClick={toggleVisible}>
          <Image src="./images/open.png"
          lazy={false}
          width={12} height={12} />
        </div>
      </div>
      <div className="main" id="main" ref={mainElementRef}>

        <PullToRefresh
          onRefresh={onRefresh}
          disabled={activeKeyIndex === 0 || isDisabled}
          canReleaseText="Release to previous-category immediately"
          completeText=""
          refreshingText=""
          pullingText="">
          <List style={{ '--border-top': 'none', '--border-bottom': 'none' }}>
            {categoryListParams.map((item) => {
              return <div key={item.id} className="category-item">
                <h3 id={`anchor-${item.id}`} className="main-title">{item.name}</h3>
                <div className="website-container">
                  {
                    item.list?.map((val, index) => {
                      return <a key={index} className="list-item" href={val.url} target="_blank" rel="noreferrer">
                        <div className="list-item-logo">
                          <Image src={val.logo} alt={val.title} width={40} height={40} fit="contain" style={{ borderRadius: '50px' }} />
                        </div>
                        <div className="list-item-content">
                          <span>{val.title}</span>
                          {val.desc && <p className="desc">{val.desc}</p>}
                        </div>
                      </a>
                    })
                  }
                </div>
              </div>;
            })}
          </List>
          {hasMore && <InfiniteScroll loadMore={() => loadMore()} hasMore={hasMore} />}
        </PullToRefresh>
      </div>
      <Popup
        visible={visible}
        onMaskClick={() => {
          setVisible(false)
        }}
        position='top'
        maskStyle={{
          top: `${top}px`,
          background: 'rgba(0, 0, 0, 0.75)',
        }}
        bodyStyle={{
          borderBottomLeftRadius: '15px',
          borderBottomRightRadius: '15px',
          top: `${top}px`,
          paddingBottom:'25px',
          minHeight: '40px',
          boxSizing: 'border-box'
        }}>
        <div className="select-header">
          <span>Select</span>
          <Image src="./images/close.png"
            lazy={false} width={9} height={9} onClick={() => {
            setVisible(false)
          }} />
        </div>
        <div className="pop-category-box">
          {category.map(val => {
            return <div key={val.id} className={`pop-category-item ${activeKey === val.id ? 'active' : ''}`}
              onClick={() => {
                getSideChange(val.id);
                setVisible(false)
              }}>
              <span>{val.name}</span>
            </div>
          })}
        </div>
      </Popup>
    </div>
  );
};
export default Home;
