import { host, request } from '@/utils/request'

export interface LoginResult extends WxUser {
  sessionKey?: string
  token?: string
}

export interface WxUser {
  userId: number
  username?: string
  phone?: string
  avatar?: string
  email?: string
  sex?: string // 0男 1女 2未知

  // 微信相关字段
  openId: string
  sessionKey?: string
  unionid?: string

  // 个人资料相关字段
  nickname?: string
  phoneVerified?: boolean
  registerTime?: string
  status?: string
  loginIp?: string
  loginDate?: string

  // 认证相关字段
  certificationStatus?: string
  certificationStatusText?: string
  isOwner?: boolean
  ownerStatus?: string
  idCardVerified?: boolean
  drivingLicenseVerified?: boolean
  realName?: string
  idCardNumber?: string
  idCardFrontUrl?: string
  idCardBackUrl?: string
  drivingLicenseNumber?: string
  drivingLicenseFrontUrl?: string
  drivingLicenseBackUrl?: string
  certificationSubmitTime?: string
  certificationApproveTime?: string
  certificationRejectReason?: string

  // 隐私设置
  allowFindByPhone?: boolean
  showOnlineStatus?: boolean

  // 通知设置
  notifications?: boolean
  allowRecommendation?: boolean

  // 系统字段
  createBy?: string
  createTime?: string
  updateBy?: string
  updateTime?: string
  remark?: string
  delFlag?: number

  // 兼容旧版本字段
  appId?: string

  // 用户角色
  userRole?: string
}

export function login(params: { code: string, appId?: string }): Promise<BaseRes<LoginResult>> {
  return request.post({
    url: `${host}/wechat/login`,
    params: {
      code: params.code,
      appId: params.appId || 'wx30d7fd774ea643d1',
    },
  })
}
