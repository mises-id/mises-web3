/*
 * @Author: lmk
 * @Date: 2022-05-26 12:28:24
 * @LastEditTime: 2022-09-07 15:13:41
 * @LastEditors: lmk
 * @Description: 
 */
import React from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import { Home } from '@/pages'
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
    element: SuspenseWrapper(Home),
  },
  { path: '*', element: <Navigate to="/discover" replace /> }
  ])
  return RouterList
}
export default Routes