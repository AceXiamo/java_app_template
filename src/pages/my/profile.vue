<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ProfileHead from '@/components/page/my/profile/Head.vue'
import { uploadFileToOss } from '@/utils/alioss'
import { getUserProfile, updateUserProfile, uploadAvatarUrl } from '@/api/profile'
import type { ProfileData } from '@/api/profile'

// 本地状态管理
const profileData = ref<ProfileData | null>(null)
const loading = ref(false)
const saving = ref(false)

// 分离 userInfo 对象，避免 v-model 绑定 null 值（根据 wx_user 表结构）
const userInfo = ref({
  nickname: '',
  phone: '',
  email: '',
  sex: '0', // 0男 1女 2未知
  avatar: '',
  // 显示用的字段
  realName: '',
  idNumber: '',
  // 隐私设置
  allowFindByPhone: true,
  showOnlineStatus: false,
  // 通知设置
  notifications: true,
  allowRecommendation: true,
})

// 性别选项（根据wx_user表的sex字段：0男 1女 2未知）
const genderOptions = [
  { value: '0', label: '男' },
  { value: '1', label: '女' },
  { value: '2', label: '未知' },
]

// picker相关状态
const genderPickerRange = genderOptions.map(item => item.label)
const genderPickerIndex = ref(0)

// 上传头像
async function uploadAvatar() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: async (res) => {
      const tempFilePath = res.tempFilePaths[0]

      uni.showLoading({
        title: '上传中...',
      })

      try {
        // 生成文件路径
        const timestamp = Date.now()
        const fileName = `avatar_${timestamp}.jpg`
        const ossPath = `user/avatar/${fileName}`

        // 上传到阿里云OSS
        const avatarUrl = await uploadFileToOss(tempFilePath, ossPath)

        // 调用后端API更新头像
        await uploadAvatarUrl(avatarUrl)

        // 更新本地数据
        userInfo.value.avatar = avatarUrl
        if (profileData.value?.userInfo) {
          profileData.value.userInfo.avatar = avatarUrl
        }

        uni.hideLoading()
        toastRef.value?.success('头像更新成功')
      }
      catch (error) {
        console.error('头像上传失败:', error)
        uni.hideLoading()
        toastRef.value?.error('头像上传失败')
      }
    },
    fail: () => {
      toastRef.value?.error('选择图片失败')
    },
  })
}

// 性别picker变化事件
function onGenderPickerChange(e: any) {
  const index = e.detail.value
  const selectedGender = genderOptions[index]

  // 更新picker索引
  genderPickerIndex.value = index

  // 只更新本地数据，不调用API
  userInfo.value.sex = selectedGender.value
  if (profileData.value?.userInfo) {
    profileData.value.userInfo.sex = selectedGender.value
  }
}

// 切换设置
function togglePreference(key: 'notifications' | 'allowRecommendation' | 'allowFindByPhone' | 'showOnlineStatus') {
  const currentValue = userInfo.value[key]
  userInfo.value[key] = !currentValue

  toastRef.value?.success(userInfo.value[key] ? '已开启' : '已关闭')
}

// 获取性别显示文本
function getGenderText(sex: string) {
  const option = genderOptions.find(item => item.value === sex)
  return option ? option.label : '未设置'
}

// 同步性别值到picker索引
function syncGenderToPickerIndex() {
  const currentSex = userInfo.value.sex || '2'
  const index = genderOptions.findIndex(item => item.value === currentSex)
  genderPickerIndex.value = index >= 0 ? index : 2 // 默认为"未知"
}

// 保存资料
async function saveProfile() {
  if (saving.value)
    return

  // 验证必要字段
  if (userInfo.value.email) {
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    if (!emailRegex.test(userInfo.value.email)) {
      toastRef.value?.error('邮箱格式不正确')
      return
    }
  }

  saving.value = true
  uni.showLoading({
    title: '保存中...',
  })

  try {
    // 构建更新数据（根据wx_user表字段）
    const updateData: any = {
      nickname: userInfo.value.nickname,
      email: userInfo.value.email,
      sex: userInfo.value.sex,
      allowFindByPhone: userInfo.value.allowFindByPhone,
      showOnlineStatus: userInfo.value.showOnlineStatus,
      notifications: userInfo.value.notifications,
      allowRecommendation: userInfo.value.allowRecommendation,
    }

    await updateUserProfile(updateData)

    // 同步更新 profileData
    if (profileData.value?.userInfo) {
      Object.assign(profileData.value.userInfo, userInfo.value)
    }
    uni.hideLoading()
    toastRef.value?.success('保存成功')
  }
  catch (error) {
    console.error('保存失败:', error)
    uni.hideLoading()
    toastRef.value?.error('保存失败')
  }
  finally {
    saving.value = false
  }
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true
  try {
    const response = await getUserProfile()
    profileData.value = response.data

    // 同步更新 userInfo
    if (response.data?.userInfo) {
      Object.assign(userInfo.value, response.data.userInfo)
    }

    // 同步性别到picker索引
    syncGenderToPickerIndex()
  }
  catch (error) {
    console.error('加载个人资料失败:', error)
    toastRef.value?.error('加载个人资料失败')
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <ProfileHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 头像设置 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx] shadow-sm">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-material-symbols-account-circle text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              头像设置
            </text>
          </view>

          <view class="flex items-center space-x-[32rpx]">
            <view class="relative">
              <view class="h-[160rpx] w-[160rpx] overflow-hidden border-4 border-gray-200 rounded-full">
                <image
                  :src="profileData?.userInfo?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&h=300'"
                  class="h-full w-full object-cover"
                  mode="aspectFill"
                />
              </view>
              <view
                class="absolute h-[48rpx] w-[48rpx] flex items-center justify-center border-2 border-white rounded-full bg-purple-600 -bottom-[8rpx] -right-[8rpx]"
                @tap="uploadAvatar"
              >
                <text class="i-material-symbols-camera-alt text-[24rpx] text-white" />
              </view>
            </view>

            <view class="flex-1">
              <text class="mb-[8rpx] block text-[28rpx] text-black font-medium">
                更换头像
              </text>
              <text class="mb-[16rpx] block text-[24rpx] text-gray-500">
                支持jpg、png格式，大小不超过5MB
              </text>
              <view
                class="border border-purple-600 rounded-[16rpx] px-[24rpx] py-[12rpx] text-center text-[24rpx] text-purple-600"
                @tap="uploadAvatar"
              >
                选择图片
              </view>
            </view>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-person text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                基本信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 昵称 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  昵称
                </text>
                <text class="text-[24rpx] text-gray-500">
                  用于在应用中显示
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="userInfo.nickname"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  placeholder="请输入昵称"
                  maxlength="20"
                >
              </view>
            </view>

            <!-- 手机号 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  手机号
                </text>
                <text class="text-[24rpx] text-gray-500">
                  已验证的手机号
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <text class="text-[26rpx] text-gray-700">
                  {{ profileData?.userInfo?.phone || '未设置' }}
                </text>
                <text class="rounded-full bg-green-100 px-[12rpx] py-[4rpx] text-[20rpx] text-green-600">
                  已验证
                </text>
              </view>
            </view>

            <!-- 邮箱 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  邮箱
                </text>
                <text class="text-[24rpx] text-gray-500">
                  用于接收重要通知
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="userInfo.email"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  placeholder="请输入邮箱地址"
                  type="email"
                >
              </view>
            </view>

            <!-- 性别 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  性别
                </text>
                <text class="text-[24rpx] text-gray-500">
                  选择性别信息
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <picker
                  mode="selector"
                  :range="genderPickerRange"
                  :value="genderPickerIndex"
                  class="flex items-center space-x-[16rpx]"
                  @change="onGenderPickerChange"
                >
                  <view class="flex items-center space-x-[16rpx]">
                    <text class="text-[26rpx] text-gray-700">
                      {{ getGenderText(userInfo.sex || '2') }}
                    </text>
                    <text class="i-material-symbols-chevron-right text-[32rpx] text-gray-400" />
                  </view>
                </picker>
              </view>
            </view>
          </view>
        </view>

        <!-- 实名信息 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-verified text-[40rpx] text-green-600" />
              <text class="text-[32rpx] text-black font-semibold">
                实名信息
              </text>
              <text class="rounded-full bg-green-100 px-[12rpx] py-[4rpx] text-[20rpx] text-green-600">
                已认证
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-black font-medium">
                真实姓名
              </text>
              <text class="text-[26rpx] text-gray-700">
                {{ profileData?.userInfo?.realName || '未设置' }}
              </text>
            </view>

            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-black font-medium">
                身份证号
              </text>
              <text class="text-[26rpx] text-gray-700">
                {{ profileData?.userInfo?.idNumber || '未设置' }}
              </text>
            </view>
          </view>
        </view>

        <!-- 隐私设置 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-security text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                隐私设置
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 手机号查找 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  手机号查找
                </text>
                <text class="text-[24rpx] text-gray-500">
                  允许通过手机号查找我
                </text>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="userInfo.allowFindByPhone ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="togglePreference('allowFindByPhone')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="userInfo.allowFindByPhone ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 在线状态 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  在线状态
                </text>
                <text class="text-[24rpx] text-gray-500">
                  显示我的在线状态
                </text>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="userInfo.showOnlineStatus ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="togglePreference('showOnlineStatus')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="userInfo.showOnlineStatus ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 通知设置 -->
        <view class="rounded-[32rpx] bg-white shadow-sm">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols-notifications text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                通知设置
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 推送通知 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  推送通知
                </text>
                <text class="text-[24rpx] text-gray-500">
                  接收订单和活动通知
                </text>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="userInfo.notifications ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="togglePreference('notifications')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="userInfo.notifications ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>

            <!-- 个性化推荐 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  个性化推荐
                </text>
                <text class="text-[24rpx] text-gray-500">
                  根据偏好推荐车辆
                </text>
              </view>
              <view
                class="relative h-[40rpx] w-[64rpx] rounded-full transition-colors duration-200"
                :class="userInfo.allowRecommendation ? 'bg-purple-600' : 'bg-gray-300'"
                @tap="togglePreference('allowRecommendation')"
              >
                <view
                  class="absolute top-[8rpx] h-[24rpx] w-[24rpx] rounded-full bg-white transition-all duration-200"
                  :class="userInfo.allowRecommendation ? 'right-[8rpx]' : 'left-[8rpx]'"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 底部保存按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(32rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-[16rpx] bg-purple-600 py-[24rpx] text-center text-[28rpx] text-white font-semibold"
        @tap="saveProfile"
      >
        保存资料
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="absolute inset-0 z-50 flex items-center justify-center bg-white/80">
      <text class="text-[28rpx] text-gray-500">
        加载中...
      </text>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
