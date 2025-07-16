import qs from 'qs'
import logger from '@/utils/logger'
import { useUserStore } from '@/store/user'

const mode = import.meta.env.MODE
// eslint-disable-next-line import/no-mutable-exports
let domain: string, host: string

if (mode === 'development') {
  domain = '127.0.0.1:8080'
  host = `http://${domain}`
  // domain = 'future.xiamoqwq.com'
  // host = `https://${domain}`
}
else {
  domain = 'car-dev.zeabur.app'
  host = `https://${domain}`
}

function setAuth(options: any) {
  const header: any = {}
  if (useUserStore().token)
    header.Authorization = `Bearer ${useUserStore().token}`

  header['Content-Type'] = 'application/json'
  options.header = header
}

interface RequestOptions { url: string, params?: any, data?: any, toast?: any }

const request = {
  qs,
  get: (_obj: RequestOptions): Promise<any> => {
    return requestHandle(_obj)
  },
  post: (_obj: RequestOptions): Promise<any> => {
    return requestHandle(_obj, 'POST')
  },
  put: (_obj: RequestOptions): Promise<any> => {
    return requestHandle(_obj, 'PUT')
  },
  delete: (_obj: RequestOptions): Promise<any> => {
    return requestHandle(_obj, 'DELETE')
  },
}

function requestHandle(_obj: RequestOptions, method: string = 'GET', _resolve?: (value: any) => void, _reject?: (value: any) => void) {
  return new Promise((resolve, reject) => {
    const options: any = {
      url: '',
      method,
      timeout: 30000,
      success: (res: any) => {
        callbackHandle({
          resolve: _resolve || resolve,
          reject: _reject || reject,
          _obj,
          method,
          res,
        })
      },
    }
    setAuth(options)
    optionsHandle(options, _obj, !!_resolve)
    uni.request(options)
  })
}

function optionsHandle(options: any, _obj: RequestOptions, re = false) {
  if (_obj.params && !re)
    _obj.url = `${_obj.url}?${request.qs.stringify(_obj.params)}`
  options.url = _obj.url
  if (_obj.data)
    options.data = _obj.data
}

function callbackHandle({
  resolve,
  reject,
  _obj,
  method,
  res,
}: {
  resolve: (value: any) => void
  reject: (reason: any) => void
  _obj: RequestOptions
  method: string
  res: any
}) {
  logger.info(`code: ${res.data.code}`)
  if (res.data.code === 401) {
    // 401 处理：自动重新登录
    handleUnauthorized(_obj, method, resolve, reject)
  }
  else {
    if (res.data.code === 500) {
      _obj.toast?.value.error(res.data.msg)
      reject(res.data.msg)
    }
    else { resolve(res.data) }
  }
}

/**
 * 处理 401 未授权错误
 * 自动重新登录并重试请求
 */
function handleUnauthorized(_obj: RequestOptions, method: string, resolve: (value: any) => void, reject: (reason: any) => void) {
  const userStore = useUserStore()
  logger.info('Token expired, attempting to re-login...')
  
  // 尝试重新登录
  userStore.wxLogin()
    .then(() => {
      logger.info('Re-login successful, retrying request...')
      // 重新发起请求
      requestHandle(_obj, method, resolve, reject)
    })
    .catch((error) => {
      logger.error('Re-login failed:', error)
      // 登录失败，清除用户信息并跳转到首页
      userStore.logout()
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
      })
      uni.reLaunch({
        url: '/pages/main/index',
      })
      reject(new Error('Authentication failed'))
    })
}

export { request, host }
