import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LoginResult } from '@/api/login'

const key = 'user'
const tokenKey = 'token'
export const useUserStore = defineStore('user', () => {
  const user = ref<User>(storage.get(key) || {})
  // 账号密码登录拿到的 Token
  const token = ref<string>(storage.get(tokenKey) || '')

  const saveLoginRes = (value: LoginResult) => {
    user.value = value
    storage.set({
      key,
      value: user.value,
      expires: 60 * 1000 * 60 * 24,
    })
  }

  const saveToken = (value: string) => {
    token.value = value
    storage.set({
      key: tokenKey,
      value: token.value,
      expires: 60 * 1000 * 60 * 12,
    })
  }

  return { user, token, saveLoginRes, saveToken }
})
