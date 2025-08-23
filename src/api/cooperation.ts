import { host, request } from '@/utils/request'

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
export function submitCooperationApplication(
  data: CooperationApplicationForm,
): Promise<BaseRes<SubmitApplicationResponse>> {
  return request.post({
    url: `${host}/api/cooperation/apply`,
    data,
  })
}

/**
 * 获取合作类型配置
 */
export function getCooperationTypes(): Promise<BaseRes<string[]>> {
  return request.get({
    url: `${host}/api/cooperation/types`,
  })
}

/**
 * 获取地区数据
 */
export function getRegionData(): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/api/cooperation/regions`,
  })
}