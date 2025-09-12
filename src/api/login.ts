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

  // 平台相关字段
  userPlatform?: string // 用户平台 (wx/alipay)
  alipayUserId?: string // 支付宝用户ID

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

// 登录参数接口
export interface LoginParams {
  code: string
  appId?: string
  platform?: string // 平台标识 (wx/alipay)
}

// 双平台登录接口
export function login(params: LoginParams): Promise<BaseRes<LoginResult>> {
  return request.post({
    url: `${host}/wechat/login`,
    params: {
      code: params.code,
      appId: params.appId || 'wx4c0815d1a360d938',
      platform: params.platform || 'wx',
    },
  })
}

// 兼容旧版本的登录接口
export function wxLogin(params: { code: string, appId?: string }): Promise<BaseRes<LoginResult>> {
  return login({
    code: params.code,
    appId: params.appId,
    platform: 'wx',
  })
}

// 支付宝登录接口
export function alipayLogin(params: { code: string, appId?: string }): Promise<BaseRes<LoginResult>> {
  return login({
    code: params.code,
    appId: params.appId,
    platform: 'alipay',
  })
}
