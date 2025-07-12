import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { LoginResult } from '@/api/login'
import { login } from '@/api/login'

// const key = 'user'
// const tokenKey = 'token'
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<LoginResult | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value)

  // 便捷访问器
  const user = computed(() => userInfo.value)
  const openId = computed(() => userInfo.value?.openId || '')

  // 微信登录
  async function wxLogin(appId?: string) {
    try {
      // 获取微信登录凭证
      const loginRes: any = await uni.login({
        provider: 'weixin',
      })

      if (loginRes.code) {
        // 调用后端登录接口
        const { data } = await login({ code: loginRes.code, appId })

        if (data) {
          userInfo.value = data
          token.value = data.token || ''

          // 存储到本地
          uni.setStorageSync('userInfo', data)
          uni.setStorageSync('token', data.token)

          return data
        }
      }
    }
    catch (error) {
      console.error('微信登录失败:', error)
      throw error
    }
  }

  // 从本地存储恢复用户信息
  async function restoreUserInfo() {
    const storedUserInfo = uni.getStorageSync('userInfo')
    const storedToken = uni.getStorageSync('token')

    if (storedUserInfo && storedToken) {
      userInfo.value = storedUserInfo
      token.value = storedToken
    }
    else {
      // 如果没有存储的用户信息，尝试微信登录
      try {
        await wxLogin()
      }
      catch (error) {
        console.error('自动登录失败:', error)
      }
    }
  }

  // 退出登录
  function logout() {
    userInfo.value = null
    token.value = ''
    uni.removeStorageSync('userInfo')
    uni.removeStorageSync('token')
  }

  // 更新用户信息
  function updateUserInfo(newUserInfo: Partial<LoginResult>) {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...newUserInfo }
      uni.setStorageSync('userInfo', userInfo.value)
    }
  }

  function getUserOpenId() {
    return userInfo.value?.openId || ''
  }

  return {
    userInfo: readonly(userInfo),
    user: readonly(user),
    token: readonly(token),
    openId: readonly(openId),
    isLoggedIn,
    wxLogin,
    logout,
    updateUserInfo,
    restoreUserInfo,
    getUserOpenId,
  }
})
