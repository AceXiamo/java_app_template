import { defineStore } from 'pinia'
import type { ProfileData } from '@/api/profile'
import { contactService, getUserProfile, logout, updateUserProfile } from '@/api/profile'

export const useProfileStore = defineStore('profile', () => {
  // 个人中心数据
  const profileData = ref<ProfileData | null>(null)
  const loading = ref(false)

  // 加载个人中心数据
  const loadProfileData = async (reload = false) => {
    if (loading.value && !reload)
      return

    try {
      loading.value = true
      const response = await getUserProfile()
      profileData.value = response.data
    }
    catch (error) {
      console.error('获取个人中心数据失败:', error)
      throw error
    }
    finally {
      loading.value = false
    }
  }

  // 重新加载个人中心数据
  const reloadProfileData = () => {
    loadProfileData(true)
  }

  // 联系客服
  const handleContactService = async () => {
    try {
      const response = await contactService({
        issueType: 'general',
        description: '用户主动联系客服',
      })
      return response.data
    }
    catch (error) {
      console.error('获取客服信息失败:', error)
      throw error
    }
  }

  // 退出登录
  const handleLogout = async () => {
    try {
      await logout({
        deviceId: 'device_12345',
        logoutReason: 'user_action',
      })
      profileData.value = null
    }
    catch (error) {
      console.error('退出登录失败:', error)
      throw error
    }
  }

  // 更新头像
  const updateAvatar = async (avatarUrl: string) => {
    try {
      const response = await updateUserProfile({
        avatar: avatarUrl,
      })
      if (profileData.value?.userInfo) {
        profileData.value.userInfo.avatar = avatarUrl
      }
      return response.data
    }
    catch (error) {
      console.error('更新头像失败:', error)
      throw error
    }
  }

  // 更新昵称
  const updateNickname = async (nickname: string) => {
    try {
      const response = await updateUserProfile({
        nickname,
      })
      if (profileData.value?.userInfo) {
        profileData.value.userInfo.nickname = nickname
      }
      return response.data
    }
    catch (error) {
      console.error('更新昵称失败:', error)
      throw error
    }
  }

  // 更新邮箱
  const updateEmail = async (email: string) => {
    try {
      const response = await updateUserProfile({
        email,
      })
      if (profileData.value?.userInfo) {
        profileData.value.userInfo.email = email
      }
      return response.data
    }
    catch (error) {
      console.error('更新邮箱失败:', error)
      throw error
    }
  }

  // 更新性别
  const updateGender = async (gender: string) => {
    try {
      const response = await updateUserProfile({
        gender,
      })
      if (profileData.value?.userInfo) {
        profileData.value.userInfo.gender = gender
      }
      return response.data
    }
    catch (error) {
      console.error('更新性别失败:', error)
      throw error
    }
  }

  // 保存完整个人资料
  const saveProfile = async () => {
    try {
      if (!profileData.value?.userInfo) {
        throw new Error('没有个人资料数据')
      }

      const response = await updateUserProfile({
        nickname: profileData.value.userInfo.nickname,
        email: profileData.value.userInfo.email,
        gender: profileData.value.userInfo.gender,
        avatar: profileData.value.userInfo.avatar,
      })
      return response.data
    }
    catch (error) {
      console.error('保存个人资料失败:', error)
      throw error
    }
  }

  return {
    profileData,
    loading,
    loadProfileData,
    reloadProfileData,
    handleContactService,
    handleLogout,
    updateAvatar,
    updateNickname,
    updateEmail,
    updateGender,
    saveProfile,
  }
})
