import type { WxUser } from './login'
import { host, request } from '@/utils/request'


// 用户基本信息（根据 wx_user 表结构）
export interface UserInfo extends WxUser {
  userId: number
  username?: string
  phone?: string
  avatar?: string
  email?: string
  sex?: string // 0男 1女 2未知
  nickname?: string
  phoneVerified?: boolean
  realName?: string
  idNumber?: string
  // 隐私设置
  allowFindByPhone?: boolean
  showOnlineStatus?: boolean
  // 通知设置
  notifications?: boolean
  allowRecommendation?: boolean
  // 认证状态
  certificationStatus?: string
  isOwner?: boolean
  idCardVerified?: boolean
  drivingLicenseVerified?: boolean
  registerTime?: string
  status?: string
}

// 用户统计数据
export interface UserStatistics {
  totalOrders: number
  totalSpent: number
  availableCoupons: number
}

// 证件认证状态
export interface CertificationInfo {
  status: 'verified' | 'pending' | 'not_started' | 'rejected'
  statusText: string
  statusColor: string
  description: string
}

// 服务信息
export interface ServicesInfo {
  certification: {
    drivingLicense: CertificationInfo
    ownerCertification: CertificationInfo
  }
  wallet: {
    availableCoupons: number
    statusText: string
    statusColor: string
    description: string
  }
  notifications: {
    enabled: boolean
    description: string
  }
}


// 个人中心完整信息
export interface ProfileData {
  userInfo: UserInfo
  statistics: UserStatistics
  services: ServicesInfo
}

// 获取个人中心信息
export function getUserProfile(): Promise<BaseRes<ProfileData>> {
  return request.get({
    url: `${host}/api/profile`,
  })
}

// 更新用户信息（根据 wx_user 表字段）
export interface UpdateUserProfileRequest {
  nickname?: string
  avatar?: string
  email?: string
  sex?: string // 0男 1女 2未知
  // 隐私设置
  allowFindByPhone?: boolean
  showOnlineStatus?: boolean
  // 通知设置
  notifications?: boolean
  allowRecommendation?: boolean
}

export function updateUserProfile(data: UpdateUserProfileRequest): Promise<BaseRes<UserInfo>> {
  return request.put({
    url: `${host}/api/profile`,
    data,
  })
}


// 上传头像 - 使用阿里云 OSS 直传
export async function uploadAvatar(
  filePath: string,
  onProgress?: ({ progress }: { progress: number }) => void,
): Promise<BaseRes<{ avatarUrl: string, uploadTime: string }>> {
  const { uploadAvatar: uploadAvatarFile } = await import('@/utils/upload')

  try {
    // 上传到阿里云 OSS
    const avatarUrl = await uploadAvatarFile(filePath, onProgress)

    // 调用后端 API 更新头像 URL
    const result = await request.post({
      url: `${host}/api/profile/avatar/upload`,
      data: { avatarUrl },
    })

    return result
  }
  catch (error) {
    throw new Error(`头像上传失败: ${error}`)
  }
}

// 更新头像URL（OSS直传后调用）
export function uploadAvatarUrl(avatarUrl: string): Promise<BaseRes<{ avatarUrl: string, updateTime: string }>> {
  return request.post({
    url: `${host}/api/profile/avatar/upload`,
    data: { avatarUrl },
  })
}

// 联系客服选项
export interface ServiceOption {
  type: 'wechat' | 'phone' | 'online'
  title: string
  description: string
  action: string
  phoneNumber?: string
  isRecommended?: boolean
  isAvailable?: boolean
}

// 联系客服
export function contactService(data: {
  issueType?: string
  description?: string
}): Promise<BaseRes<{ serviceOptions: ServiceOption[], ticketId: string }>> {
  return request.post({
    url: `${host}/api/profile/contact-service`,
    data,
  })
}

// 退出登录
export function logout(data: {
  deviceId?: string
  logoutReason?: string
}): Promise<BaseRes<{ logoutTime: string, redirectUrl: string }>> {
  return request.post({
    url: `${host}/api/profile/logout`,
    data,
  })
}
