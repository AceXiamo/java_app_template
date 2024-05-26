import { host } from './request'
import { getToken, setOpenId, setSessionKey, setToken } from './user'
import logger from './logger'
import { login } from '@/api/user'

function saveLoginRes(res: User) {
  setOpenId(res.openId!)
  logger.setting('user', `openId: ${res.openId}`)
  setSessionKey(res.sessionKey!)
  logger.setting('user', `sessionKey: ${res.sessionKey}`)
  setToken(res.token!)
  logger.setting('user', `token: ${res.token}`)
}

function loginVerify() {
  return !!getToken()
}

function getLoginUser() {
  return uni.getStorageSync('user')
}

function fileUrlReplace(path: string) {
  return `${host}/file/view${path}`
}

function loginHandle() {
  return new Promise((resolve) => {
    uni.login({
      provider: 'weixin',
      success: async (result) => {
        login({ code: result.code }).then((res) => {
          saveLoginRes(res.data)
          resolve('')
        })
      },
    })
  })
}

function stringToColor(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash)

  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
  return `#${'00000'.substring(0, 6 - c.length)}${c}`
}

export { saveLoginRes, loginVerify, getLoginUser, fileUrlReplace, loginHandle, stringToColor }
