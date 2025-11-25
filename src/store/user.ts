import { defineStore } from 'pinia'
import { computed, readonly, ref } from 'vue'
import type { LoginResult } from '@/api/login'
import { login } from '@/api/login'
import {
  getCurrentPlatform,
  getLoginParams,
  getPlatformConfig,
  getPlatformDisplayName,
  isAlipayPlatform,
  platformLogin,
} from '@/utils/platform'

// const key = 'user'
// const tokenKey = 'token'
export const useUserStore = defineStore('user', () => {
  const userInfo = ref<LoginResult | null>(null)
  const token = ref<string>('')
  const currentPlatform = ref(getCurrentPlatform())
  const isLoggedIn = computed(() => !!token.value)

  // 便捷访问器
  const user = computed(() => userInfo.value)
  const openId = computed(() => userInfo.value?.openId || '')
  const platform = computed(() => currentPlatform.value)
  const platformName = computed(() =>
    getPlatformDisplayName(currentPlatform.value),
  )

  // 双平台登录（保留微信登录方法的向下兼容）
  async function wxLogin(appId?: string) {
    return platformAutoLogin(appId)
  }

  // 平台自动登录
  async function platformAutoLogin(appId?: string) {
    try {
      currentPlatform.value = getCurrentPlatform()
      const platformDisplayName = getPlatformDisplayName(currentPlatform.value)

      console.log(`开始${platformDisplayName}登录...`)

      // 调用平台登录接口
      const loginRes: any = await platformLogin()

      if (loginRes.code) {
        // 获取登录参数
        const loginParams = getLoginParams(loginRes.code)
        if (appId) {
          loginParams.appId = appId
        }

        // 调用后端登录接口
        const { data } = await login(loginParams)

        if (data) {
          userInfo.value = data
          token.value = data.token || ''

          // 存储到本地
          uni.setStorageSync('userInfo', data)
          uni.setStorageSync('token', data.token)
          uni.setStorageSync('platform', currentPlatform.value)

          console.log(`${platformDisplayName}登录成功:`, data)
          return data
        }
      }
    }
    catch (error) {
      const platformDisplayName = getPlatformDisplayName(currentPlatform.value)
      console.error(`${platformDisplayName}登录失败:`, error)
      throw error
    }
  }

  // 支付宝登录
  async function alipayLogin(appId?: string) {
    if (!isAlipayPlatform()) {
      throw new Error('当前环境不支持支付宝登录')
    }
    return platformAutoLogin(appId)
  }

  // 从本地存储恢复用户信息
  async function restoreUserInfo() {
    const storedUserInfo = uni.getStorageSync('userInfo')
    const storedToken = uni.getStorageSync('token')
    const storedPlatform = uni.getStorageSync('platform')

    // 恢复平台信息
    if (storedPlatform) {
      currentPlatform.value = storedPlatform
    }
    else {
      currentPlatform.value = getCurrentPlatform()
    }

    if (storedUserInfo && storedToken) {
      userInfo.value = storedUserInfo
      token.value = storedToken
      console.log(
        `从本地存储恢复${getPlatformDisplayName(currentPlatform.value)}用户信息:`,
        storedUserInfo,
      )
    }
    else {
      // 如果没有存储的用户信息，尝试平台自动登录
      try {
        await platformAutoLogin()
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
    uni.removeStorageSync('platform')
    console.log(
      `${getPlatformDisplayName(currentPlatform.value)}用户已退出登录`,
    )
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

  // 获取用户平台相关的ID
  function getUserPlatformId() {
    if (isAlipayPlatform() && userInfo.value?.alipayUserId) {
      return userInfo.value.alipayUserId
    }
    return userInfo.value?.openId || ''
  }

  // 检查用户状态（登录、手机号、实名认证）
  function checkUserStatus(): boolean {
    if (!isLoggedIn.value) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000,
      })
      return false
    }

    // 检查手机号
    if (!userInfo.value?.phoneVerified) {
      uni.showModal({
        title: '提示',
        content: '为了您的用车安全，请先绑定手机号',
        confirmText: '去绑定',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({ url: '/pages/my/profile' })
          }
        },
      })
      return false
    }

    // 检查实名认证
    // if (userInfo.value?.certificationStatus !== 'certified') {
    //   uni.showModal({
    //     title: '提示',
    //     content: '您尚未完成实名认证，请先认证',
    //     confirmText: '去认证',
    //     success: (res) => {
    //       if (res.confirm) {
    //         uni.navigateTo({ url: '/pages/my/documents' })
    //       }
    //     },
    //   })
    //   return false
    // }

    return true
  }

  return {
    userInfo: readonly(userInfo),
    user: readonly(user),
    token: readonly(token),
    openId: readonly(openId),
    platform: readonly(platform),
    platformName: readonly(platformName),
    isLoggedIn,
    wxLogin,
    platformAutoLogin,
    alipayLogin,
    logout,
    updateUserInfo,
    restoreUserInfo,
    getUserOpenId,
    getUserPlatformId,
    checkUserStatus,
  }
})
