type ShowMode = 'view' | 'edit'

interface LoginReqData {
  code: string
}

type UploadStatus = 'wait' | 'run' | 'finish'

interface ResponseData<T> {
  code: number
  msg: string
  data: T
}

interface ResponsePageData<T> {
  code: number
  msg: string
  data: PageData<T>
}

interface PageData<T> {
  countId: any
  current: number
  maxLimit: number
  optimizeCountSql: boolean
  orders: any[]
  pages: number
  records: T[]
  searchCount: boolean
  size: number
  total: number
}

interface User {
  openId?: string
  nickname?: string
  avatar?: string
  isBan?: string
  createTime?: string
  updateTime?: string
  banEndTime?: string
  descOfBan?: string
  token?: string
  sessionKey?: string
}

interface Marker {
  id: number
  latitude: number
  longitude: number
  iconPath?: string
  width?: number
  height?: number
}

interface BaseRes<T> {
  code: number
  msg: string
  data: T
}

interface BaseEntity {
  searchValue?: string
  createBy?: string
  createTime?: Date
  updateBy?: string
  updateTime?: Date
  remark?: string
  params?: Record<string, any>
}

interface BaseRowRes<T> {
  code: number
  msg: string
  rows: T[]
  total: number
}

type LoadPageDataStatus = 'loading' | 'nomore' | 'hide'

interface PageQuery {
  pageNum?: number
  pageSize?: number
}

interface MapResult {
  adcode: string
  address: string
  city: string[]
  district: string
  id: string
  location: string
  name: string
  typecode: string
}

interface MapModelValue {
  latitude?: string
  longitude?: string
  location?: string
}
