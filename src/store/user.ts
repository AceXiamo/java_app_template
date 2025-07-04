import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { LoginResult } from '@/api/login'

// const key = 'user'
// const tokenKey = 'token'
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<LoginResult | null>(null)
  const token = ref<string>('')
  const isLoggedIn = computed(() => !!token.value)

  // 微信登录
  async function wxLogin() {
    // try {
    //   // 获取微信登录凭证
    //   const loginRes = await uni.login({
    //     provider: 'weixin',
    //   })

    //   if (loginRes[1].code) {
    //     // 调用后端登录接口
    //     const { data } = await login({ code: loginRes[1].code })

    //     if (data) {
    //       userInfo.value = data
    //       token.value = data.token || ''

    //       // 存储到本地
    //       uni.setStorageSync('userInfo', data)
    //       uni.setStorageSync('token', data.token)

    //       return data
    //     }
    //   }
    // }
    // catch (error) {
    //   console.error('微信登录失败:', error)
    //   throw error
    // }
  }

  // 从本地存储恢复用户信息
  function restoreUserInfo() {
    const storedUserInfo = uni.getStorageSync('userInfo')
    const storedToken = uni.getStorageSync('token')

    if (storedUserInfo && storedToken) {
      userInfo.value = storedUserInfo
      token.value = storedToken
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

  return {
    userInfo: readonly(userInfo),
    token: readonly(token),
    isLoggedIn,
    wxLogin,
    logout,
    updateUserInfo,
    restoreUserInfo,
  }
})
