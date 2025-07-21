/**
 * 车辆出租需求申请 API
 */

import { host, request } from '@/utils/request'

// 运营套餐配置
export interface OperationPackageConfig {
  packageId: number
  packageCode: string
  packageName: string
  packageDescription: string
  revenueShareRate: number
  revenueShareRateText: string
  platformServiceRate: number
  platformServiceRateText: string
  includedServices: string[]
  minDailyPrice?: number
  maxDailyPrice?: number
  priceRangeText?: string
  sortOrder: number
  status: string
  statusText: string
}

// 申请提交数据
export interface VehicleRentalRequestSubmitData {
  operationMode: string
  contactPhone: string
  contactAddress?: string
  contactLongitude?: number
  contactLatitude?: number
  vehicleDescription?: string
  rentalIntention?: string
  registrationCertFrontUrl: string
  registrationCertBackUrl: string
  insurancePolicyUrls: string[]
  inspectionCertUrl: string
  agreementVersion: string
  agreementAgreed: boolean
}

// 申请记录信息
export interface VehicleRentalRequest {
  applicationId: number
  applicationNo: string
  status: string
  statusText: string
  operationMode: string
  packageInfo?: {
    packageCode: string
    packageName: string
    packageDescription: string
    revenueShareRate: number
    includedServices: string[]
  }
  contactInfo: {
    contactPhone: string
    contactAddress?: string
    contactLongitude?: number
    contactLatitude?: number
  }
  vehicleInfo: {
    vehicleDescription?: string
    rentalIntention?: string
    assignedVehicleId?: number
    assignedVehicleName?: string
  }
  documentInfo: {
    registrationCertFrontUrl: string
    registrationCertBackUrl: string
    insurancePolicyUrls: string[]
    inspectionCertUrl: string
  }
  agreementInfo: {
    agreementVersion: string
    agreementSignTime?: string
    agreementIp?: string
  }
  processInfo?: {
    processorId?: number
    processorName?: string
    processNotes?: string
    rejectReason?: string
  }
  timeInfo: {
    submitTime: string
    firstContactTime?: string
    processStartTime?: string
    processCompleteTime?: string
    createTime: string
    updateTime: string
  }
  processLogs?: ProcessLog[]
}

// 处理记录
export interface ProcessLog {
  logId: number
  applicationId: number
  actionType: string
  actionTypeText: string
  processorId: number
  processorName?: string
  actionTime: string
  contactMethod?: string
  contactMethodText?: string
  actionContent: string
  attachments?: string[]
  followUpRequired: boolean
  followUpTime?: string
  isOverdue: boolean
  createTime: string
}

// 提交响应
export interface SubmitResponse {
  applicationId: number
  applicationNo: string
  submitTime: string
  status: string
  expectedProcessDays: number
  message: string
}

/**
 * 获取运营套餐配置列表
 */
export function getOperationPackages(): Promise<BaseRes<OperationPackageConfig[]>> {
  return request.get({
    url: `${host}/api/vehicle/rental-request/packages`,
  })
}

/**
 * 根据套餐代码获取套餐详情
 */
export function getPackageDetail(packageCode: string): Promise<BaseRes<OperationPackageConfig>> {
  return request.get({
    url: `${host}/api/vehicle/rental-request/packages/${packageCode}`,
  })
}

/**
 * 提交车辆出租需求申请
 */
export function submitRentalRequest(data: VehicleRentalRequestSubmitData): Promise<BaseRes<SubmitResponse>> {
  return request.post({
    url: `${host}/api/vehicle/rental-request/submit`,
    data,
  })
}

/**
 * 获取用户的申请记录
 */
export function getMyRequests(): Promise<BaseRes<VehicleRentalRequest[]>> {
  return request.get({
    url: `${host}/api/vehicle/rental-request/my-requests`,
  })
}

/**
 * 获取申请历史记录（别名）
 */
export function getApplicationHistory(): Promise<BaseRes<VehicleRentalRequest[]>> {
  return getMyRequests()
}

/**
 * 根据申请单号获取申请详情
 */
export function getRequestDetail(applicationNo: string): Promise<BaseRes<VehicleRentalRequest>> {
  return request.get({
    url: `${host}/api/vehicle/rental-request/detail/${applicationNo}`,
  })
}

/**
 * 获取当前用户最新的申请状态
 */
export function getCurrentStatus(): Promise<BaseRes<VehicleRentalRequest | null>> {
  return request.get({
    url: `${host}/api/vehicle/rental-request/status`,
  })
}

/**
 * 协议信息（继续使用原有的协议API）
 */
export interface AgreementInfo {
  version: string
  title: string
  content: string
  effectiveDate: string
  keyPoints: string[]
}

/**
 * 获取协议内容
 */
export function getAgreement(): Promise<BaseRes<AgreementInfo>> {
  return request.get({
    url: `${host}/api/vehicle-affiliation/agreement`,
  })
}
