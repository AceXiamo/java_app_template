/**
 * 车辆挂靠申请 API
 */

import { host, request } from '@/utils/request'

// 收益配置信息
export interface RevenueConfig {
  operationMode: string
  operationModeText: string
  revenueShareRate: number
  platformServiceRate: number
  minDailyPrice: number
  maxDailyPrice: number
  description: string
  benefits: string[]
}

// 申请记录信息
export interface ApplicationRecord {
  applicationId: number
  applicationNo: string
  status: string
  statusText: string
  submitTime: string
  reviewTime?: string
  vehicleInfo: {
    brand: string
    model: string
    year: number
    licensePlate: string
    energyType: string
    carType: string
    operationMode: string
  }
  reviewSteps?: {
    step: string
    stepName: string
    status: string
    description: string
    reviewTime?: string
  }[]
  rejectReason?: string
}

// 申请状态信息
export interface ApplicationStatus {
  userCertificationStatus: string
  canSubmitNewApplication: boolean
  pendingApplication?: {
    applicationId: number
    applicationNo: string
    status: string
    statusText: string
    submitTime: string
    licensePlate: string
  }
  applicationTips: string[]
}

// 协议信息
export interface AgreementInfo {
  version: string
  title: string
  content: string
  effectiveDate: string
  keyPoints: string[]
}

// 申请提交数据
export interface VehicleAffiliationApplicationData {
  vehicleInfo: {
    brand: string
    model: string
    year: number
    licensePlate: string
    vinCode: string
    engineNumber: string
    color: string
    energyType: string
    carType: string
    seats: number
    mileage: number
    condition: string
  }
  operationInfo: {
    mode: string
    expectedDailyPrice?: number
    expectedMonthlyPrice?: number
    availableStartDate?: string
    operationAreas?: {
      city: string
      districts: string[]
    }[]
  }
  documents: {
    registrationCertFrontUrl: string
    registrationCertBackUrl: string
    vehicleFrontPhotoUrl: string
    vehicleBackPhotoUrl: string
    vehicleSidePhotoUrl?: string
    vehicleInteriorPhotoUrl?: string
    insurancePolicyUrl?: string
    maintenanceRecordUrl?: string
  }
  agreement: {
    version: string
    agreed: boolean
    signIp?: string
  }
}

/**
 * 获取收益配置信息
 */
export function getRevenueConfig(): Promise<BaseRes<{ configs: RevenueConfig[] }>> {
  return request.get({
    url: `${host}/api/vehicle-affiliation/revenue-config`,
  })
}

/**
 * 获取申请状态和进度
 */
export function getApplicationStatus(): Promise<BaseRes<ApplicationStatus>> {
  return request.get({
    url: `${host}/api/vehicle-affiliation/application-status`,
  })
}

/**
 * 获取申请记录列表
 */
export function getApplicationRecords(): Promise<BaseRes<{
  records: ApplicationRecord[]
  total: number
}>> {
  return request.get({
    url: `${host}/api/vehicle-affiliation/application-records`,
  })
}

/**
 * 获取申请详情
 */
export function getApplicationDetail(applicationId: number): Promise<BaseRes<ApplicationRecord>> {
  return request.get({
    url: `${host}/api/vehicle-affiliation/application-detail/${applicationId}`,
  })
}

/**
 * 提交车辆挂靠申请
 */
export function submitApplication(data: VehicleAffiliationApplicationData): Promise<BaseRes<{
  applicationId: number
  applicationNo: string
  estimatedReviewTime: string
  nextSteps: string[]
}>> {
  return request.post({
    url: `${host}/api/vehicle-affiliation/submit-application`,
    data,
  })
}

/**
 * 获取协议内容
 */
export function getAgreement(): Promise<BaseRes<AgreementInfo>> {
  return request.get({
    url: `${host}/api/vehicle-affiliation/agreement`,
  })
}

/**
 * 重新提交申请
 */
export function resubmitApplication(applicationId: number, data: VehicleAffiliationApplicationData): Promise<BaseRes<{
  applicationId: number
  applicationNo: string
  status: string
  message: string
}>> {
  return request.put({
    url: `${host}/api/vehicle-affiliation/resubmit-application`,
    params: { applicationId },
    data,
  })
}