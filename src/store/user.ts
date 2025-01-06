import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResult } from '@/api/login'
import type { InfoRes } from '@/api/user'
import { getInfo } from '@/api/user'

const key = 'user'
const tokenKey = 'token'
export const useUserStore = defineStore('user', () => {
  const user = ref<User>(storage.get(key) || {})
  // 账号密码登录拿到的 Token
  const token = ref<string>(storage.get(tokenKey) || '')
  // 当前登录用户
  const currentUser = ref<Partial<InfoRes>>({})

  const saveLoginRes = (value: LoginResult) => {
    user.value = value
    storage.set({
      key,
      value: user.value,
      expires: 60 * 1000 * 60 * 24,
    })
  }

  const loadCurrentUser = () => {
    getInfo().then((res) => {
      currentUser.value = res
    })
  }

  const saveToken = (value: string) => {
    token.value = value
    storage.set({
      key: tokenKey,
      value: token.value,
      expires: 60 * 1000 * 60 * 12,
    })
    loadCurrentUser()
  }

  const clearToken = () => {
    token.value = ''
    storage.remove(tokenKey)
  }

  const clearAll = () => {
    storage.remove(key)
    storage.remove(tokenKey)
    user.value = {}
    token.value = ''
    currentUser.value = {}
  }

  return { user, token, currentUser, saveLoginRes, saveToken, clearToken, loadCurrentUser, clearAll }
})
