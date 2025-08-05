import { request } from '@/utils/request'

// 合作申请表单接口类型
export interface CooperationApplicationForm {
  cooperationType: string
  companyName: string
  contactPerson: string
  contactPhone: string
  contactEmail?: string
  regionProvince?: string
  regionCity?: string
  regionDistrict?: string
  detailedAddress?: string
  cooperationIntention: string
}

// 提交合作申请响应类型
export interface SubmitApplicationResponse {
  success: boolean
  message: string
  applicationNo: string
}

/**
 * 提交合作申请
 */
export const submitCooperationApplication = async (
  form: CooperationApplicationForm
): Promise<SubmitApplicationResponse> => {
  return request({
    url: '/cooperation/apply',
    method: 'POST',
    data: form
  })
}

/**
 * 获取合作类型配置（如果需要的话）
 */
export const getCooperationTypes = async () => {
  return request({
    url: '/cooperation/types',
    method: 'GET'
  })
}

/**
 * 获取地区数据（如果需要的话）
 */
export const getRegionData = async () => {
  return request({
    url: '/cooperation/regions',
    method: 'GET'
  })
}