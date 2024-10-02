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
