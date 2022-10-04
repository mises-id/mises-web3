/*
 * @Author: lmk
 * @Date: 2022-05-26 12:28:24
 * @LastEditTime: 2022-09-26 15:01:41
 * @LastEditors: lmk
 * @Description: 
 */
import React from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { Web3site,Extensions } from '@/pages'
import Loading from '@/components/pageLoading'
type CutonFallBackT =
  | boolean
  | React.ReactChild
  | React.ReactFragment
  | React.ReactPortal
  | null
type ChildT = React.LazyExoticComponent<() => JSX.Element> | React.FC

// 加载异步组件的loading
const SuspenseWrapper = (Child: ChildT, cutonFallBack?: CutonFallBackT): any => {
  return (
    <React.Suspense fallback={cutonFallBack || <Loading />}>
      <Child />
    </React.Suspense>
  )
}
const Routes = () => {
  const RouterList = useRoutes([
  {
    path: '/',
    element: SuspenseWrapper(Web3site),
  },
  {
    path: '/extensions',
    element: SuspenseWrapper(Extensions),
  },
  { path: '*', element: <Navigate to="/" replace /> }
  ])
  return RouterList
}
export default Routes