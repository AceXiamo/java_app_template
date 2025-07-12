import { host, request } from '@/utils/request'

// 认证状态枚举
export type CertificationStatus = 'pending' | 'approved' | 'rejected' | 'not_submitted'

// 用户证件信息接口
export interface UserDocuments {
  // 认证状态
  certificationStatus: CertificationStatus
  certificationStatusText: string
  certificationSubmitTime?: string
  certificationApproveTime?: string
  certificationRejectReason?: string

  // 身份证信息
  idCardVerified: boolean
  idCardNumber?: string
  idCardFrontUrl?: string
  idCardBackUrl?: string

  // 驾驶证信息
  drivingLicenseVerified: boolean
  drivingLicenseNumber?: string
  drivingLicenseFrontUrl?: string
  drivingLicenseBackUrl?: string

  // 用户基本信息
  realName?: string
  phone?: string
  phoneVerified: boolean
}

// 认证提交参数
export interface CertificationSubmitParams {
  // 身份证信息
  idCardFrontUrl: string
  idCardBackUrl: string

  // 驾驶证信息
  drivingLicenseFrontUrl: string
  drivingLicenseBackUrl: string

  // 个人信息
  realName: string
}

// API 响应结构
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 认证帮助信息
export interface CertificationHelp {
  uploadRequirements: string[]
  reviewProcess: string[]
  privacyPolicy: string[]
  commonQuestions: Array<{
    question: string
    answer: string
  }>
}

/**
 * 获取用户证件信息
 */
export function getUserDocuments(): Promise<ApiResponse<UserDocuments>> {
  return request.get({
    url: `${host}/api/user/documents`,
  })
}

/**
 * 提交认证申请
 */
export function submitCertification(params: CertificationSubmitParams): Promise<ApiResponse<{
  submitTime: string
  status: string
}>> {
  return request.post({
    url: `${host}/api/user/documents/submit`,
    data: params,
  })
}

/**
 * 获取认证帮助信息
 */
export function getCertificationHelp(): Promise<ApiResponse<CertificationHelp>> {
  return request.get({
    url: `${host}/api/user/documents/help`,
  })
}

/**
 * 重新提交认证（被拒绝后）
 */
export function resubmitCertification(params: CertificationSubmitParams): Promise<ApiResponse<{
  submitTime: string
  status: string
}>> {
  return request.post({
    url: `${host}/api/user/documents/resubmit`,
    data: params,
  })
}
