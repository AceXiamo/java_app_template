import Storage from './storage'

let openId: string = ''
let sessionKey: string = ''
let token: string = ''

function setOpenId(value: string) {
  openId = value
  Storage.set({ key: 'openId', value, expires: 1000 * 60 * 60 * 12 })
}

function setSessionKey(value: string) {
  sessionKey = value
  Storage.set({ key: 'sessionKey', value, expires: 1000 * 60 * 60 * 12 })
}

function setToken(value: string) {
  token = value
  Storage.set({ key: 'token', value, expires: 1000 * 60 * 60 * 12 })
}

function getOpenId() {
  if (!openId)
    openId = Storage.get('openId')

  return openId
}

function getSessionKey() {
  if (!sessionKey)
    sessionKey = Storage.get('sessionKey')

  return sessionKey
}

function getToken() {
  if (!token)
    token = Storage.get('token')

  return token
}

function clearAll() {
  openId = ''
  sessionKey = ''
  token = ''
  Storage.remove('openId')
  Storage.remove('sessionKey')
  Storage.remove('token')
}

function clearToken() {
  token = ''
  Storage.remove('token')
}

export {
  setOpenId,
  setSessionKey,
  setToken,
  getOpenId,
  getSessionKey,
  getToken,
  clearAll,
  clearToken,
}
