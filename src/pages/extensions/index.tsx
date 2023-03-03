/*
 * @Author: lmk
 * @Date: 2022-06-13 14:36:18
 * @LastEditTime: 2022-10-22 09:08:25
 * @LastEditors: lmk
 * @Description: extension site
 */
import { getCategory, getData } from "@/api/extensions";
import Loading from "@/components/pageLoading";
import { extensionCacheKey } from "@/utils";
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
  'subcategory': categoryParams;
  'subcategory_id': string;
  'list': Array<websiteParams>;

}
interface categoryParams {
  id: string;
  type_string: 'web3' | 'extension';
  name: string;
  shorter_name: string;
}
interface categoryListItem {
  id: string;
  title: string;
  list: websiteParams[]
}
interface categoryListType extends categoryParams {
  pageNum: number;
  hasMore: boolean;
  currentKeyIndex: number;
  list: Array<categoryListItem>;
}
const defaultCategory = {
  name:'Other',
  id:'-9999',
  type_string: 'extension', 
  shorter_name: ''
}
const defalutParams = {
  hasMore: true,
  pageNum: 1,
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
  const pageSize = 200;
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
      ...res[0],
      list: []
    }])
    setcategory(res)
  }
  useEffect(() => {
    const getCategoryCache = localStorage.getItem(extensionCacheKey)
    let localCategoryCache: categoryParams[] = []
    if(getCategoryCache){
      localCategoryCache = JSON.parse(getCategoryCache)
      setcategoryLayout(localCategoryCache)
    }
    getCategory().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        if(Array.isArray(res) && JSON.stringify(res) !== getCategoryCache){
          // update category cache
          localStorage.setItem(extensionCacheKey, JSON.stringify(res))
          if(localCategoryCache.length===0 || localCategoryCache[0]?.id!==res[0].id){
            setcategoryLayout(res)
          }
        }
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
  const getCurrentCategary = (id?: string) => {
    const website_category_id = id || activeRequestKey!
    const currentCategaryIndex = categoryListParams.findIndex(item => item.id === website_category_id)
    const currentCategary = categoryListParams[currentCategaryIndex];
    return {
      currentCategary,
      website_category_id,
      currentCategaryIndex
    };
  }
  const setNextCategoryItem = (index: number) =>{
    const nextCategoryItem = category[index];
    setactiveRequestKey(nextCategoryItem.id);
    const hasActiveCategory = categoryListParams.some(val => val.id === nextCategoryItem.id)
    if (!hasActiveCategory) {
      categoryListParams.push({
        ...nextCategoryItem,
        ...defalutParams,
        currentKeyIndex: index,
        list: []
      })
    }
  }
  const loadMore = async (id?: string) => {
    if (isLoading) return;
    setIsLoading(true)
    const {currentCategary,website_category_id,currentCategaryIndex} = getCurrentCategary(id);
    return getData({
      page_size: pageSize,
      page_num: currentCategary.pageNum,
      website_category_id
    }).then((res: any) => {
      const hasMore = Array.isArray(res) ? !(res?.length < pageSize) : false;
      currentCategary.hasMore = hasMore;
      if (hasMore) currentCategary.pageNum = currentCategary.pageNum + 1;
      if (!hasMore && !id) {
        // get next category
        const index = currentCategary.currentKeyIndex + 1;
        const nextCategoryItem = category[index];
        !nextCategoryItem ? setHasMore(false) : setNextCategoryItem(index)
      }
      renderList(res, currentCategaryIndex)
      setIsLoading(false)
    }).catch(() => {
      setIsLoading(false)
      throw new Error('mock request failed')
    })
  }

  const renderList = (list: Array<websiteParams>, currentCategaryIndex: number) => {
    list.forEach((val: websiteParams) => {
      const item = categoryListParams[currentCategaryIndex];
      if (item) {
        if(!Array.isArray(item.list)) item.list = [];
        const getFormatItem = returnCategoryList(item.list,{ ...val, subcategory:val.subcategory || defaultCategory })
        const hasCategoryIndex = item.list.findIndex(c=>c.id===getFormatItem.id);
        hasCategoryIndex>-1 ? item.list[hasCategoryIndex] = getFormatItem : item.list.push(getFormatItem);
      }
      // console.log(item)
    })
    setcategoryListParams([...categoryListParams])
  }
  const returnCategoryList = (itemList:categoryListItem[],val:websiteParams) => {
    const findItem = itemList?.find(item => item.id === val.subcategory.id);
    if(findItem){
      findItem.list.push(val);
      return findItem
    }
    return {
      id: val.subcategory.id,
      title: val.subcategory.name,
      list:[val]
    }
  }
  const onRefresh = async () => {
    const preCategory = category[activeKeyIndex - 1]
    if (preCategory) {
      setactiveKey(preCategory.id)
      setactiveRequestKey(preCategory.id)
      findActiveKeyIndex(preCategory.id)
      categoryListParams.unshift({
        ...defalutParams,
        currentKeyIndex: activeKeyIndex - 1,
        ...preCategory,
        list:[]
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
      list: []
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

  const Footer = ()=>{
    return <div className="text-center m-25">
      <p className="footer-title">To load more extensions</p>
      <p className="flex items-center justify-center">
        <a 
          href="https://chrome.google.com/webstore/category/extensions" 
          target="_blank" 
          rel="noreferrer" className="go-to-chrome">Go to Chrome Web Store</a>
        <Image src="/images/more@2x.png" width={6} height={10}/>
      </p>
    </div>
  }

  const SubTitle = (props:{item: categoryListType,val: categoryListItem})=>{
    const {item,val} = props;
    return item.list?.length===1 && val.id===defaultCategory.id ? null : <span className="sub-category-title">{val.title}</span>
  }

  if (!activeKey) return <Loading />

  return (
    <div className="container">
      <div className="top-bar">
        <div className="header">
          <NavBar backArrow={false}>Extensions</NavBar>
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
          <Image 
            src="./images/open.png"
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
                {
                  item.list?.map((val, index) => {
                    return <div className="sub-category" key={index}>
                      <SubTitle item={item} val={val}/>
                      <div className="website-container">
                        {
                          val.list.map((c,i)=>(<a key={i} className="list-item" href={c.url} target="_blank" rel="noreferrer">
                          <div className="list-item-logo">
                            <Image src={c.logo} alt={val.title} width={40} height={40} fit="contain" style={{ borderRadius: '50px' }} />
                          </div>
                          <div className="list-item-content">
                            <span className="block truncate">{c.title}</span>
                            {c.desc && <p className="desc">{c.desc}</p>}
                          </div>
                        </a>))
                        }
                      </div>
                    </div>;
                  })
                }
              </div>;
            })}
          </List>
          {hasMore && <InfiniteScroll loadMore={() => loadMore()} hasMore={hasMore} />}
          {!hasMore && <Footer />}
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
