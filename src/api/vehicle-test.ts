import { host, request } from '@/utils/request'

// 车辆测试申请表单接口类型
export interface VehicleTestApplicationForm {
  contactName: string
  contactPhone: string
  contactEmail?: string
  testRequirements: string
}

// 提交车辆测试申请响应类型
export interface SubmitVehicleTestResponse {
  code: number
  msg?: string
  applicationNo: string
}

/**
 * 提交车辆测试申请
 */
export function submitVehicleTestApplication(
  data: VehicleTestApplicationForm,
): Promise<BaseRes<SubmitVehicleTestResponse>> {
  return request.post({
    url: `${host}/api/vehicle/test/submit`,
    data,
  })
}