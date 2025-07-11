import { host, request } from '@/utils/request'

// 车主认证状态枚举
export type OwnerStatus = 'not_started' | 'pending' | 'approved' | 'rejected'

// 认证步骤状态枚举
export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'rejected'

// 认证步骤信息
export interface CertificationStep {
  step: number
  title: string
  description: string
  status: StepStatus
}

// 车主权益信息
export interface OwnerBenefit {
  title: string
  description: string
  icon: string
}

// 认证进度信息
export interface CertificationProgress {
  phone_verified: boolean
  id_card_verified: boolean
  driving_license_verified: boolean
}

// 证件提取信息
export interface ExtractedIDInfo {
  name: string
  id_number: string
  valid_until: string
}

export interface ExtractedLicenseInfo {
  license_number: string
  driver_name: string
  valid_until: string
  issue_date: string
}

// 获取车主认证状态响应
export interface OwnerCertificationStatus {
  owner_status: OwnerStatus
  certification_progress: CertificationProgress
  steps: CertificationStep[]
  benefits: OwnerBenefit[]
  certificationTips: string[]
}

// 上传身份证响应
export interface UploadIDCardResponse {
  front_url: string
  back_url: string
  id_card_verified: boolean
  extracted_info: ExtractedIDInfo
}

// 上传驾驶证响应
export interface UploadDrivingLicenseResponse {
  front_url: string
  back_url: string
  driving_license_verified: boolean
  extracted_info: ExtractedLicenseInfo
}

// 提交认证申请响应
export interface SubmitCertificationResponse {
  submitTime: string
  expectedReviewDays: number
  ownerStatus: OwnerStatus
  reviewMessage: string
}

// 重新上传证件响应
export interface ReuploadDocumentResponse {
  document_type: string
  new_url: string
  upload_time: string
}

/**
 * 获取车主认证状态
 */
export function getOwnerCertificationStatus() {
  return request.get({
    url: `${host}/api/owner/certification/status`,
  }).then((res: any) => {
    if (res.code === 200) {
      return res.data as OwnerCertificationStatus
    }
    else {
      throw new Error(res.message || '获取认证状态失败')
    }
  })
}

/**
 * 上传身份证照片 - 使用阿里云 OSS 直传
 */
export async function uploadIDCard(
  frontImagePath: string,
  backImagePath: string,
  onProgress?: ({ progress, current, total }: { progress: number, current: number, total: number }) => void,
) {
  const { uploadIdCard } = await import('@/utils/upload')

  try {
    // 并行上传正反面照片
    const uploadPromises = [
      uploadIdCard(frontImagePath, 'front'),
      uploadIdCard(backImagePath, 'back'),
    ]

    let completed = 0
    const total = 2

    // 监听每个上传任务的进度
    const results = await Promise.all(
      uploadPromises.map(async (promise, index) => {
        const result = await promise
        completed++
        const progress = Math.round((completed / total) * 100)
        onProgress?.({ progress, current: completed, total })
        return result
      }),
    )

    const [frontUrl, backUrl] = results

    // 调用后端 API 提交证件 URL
    const res = await request.post({
      url: `${host}/api/owner/certification/upload-id-card`,
      data: {
        front_url: frontUrl,
        back_url: backUrl,
      },
    })

    if (res.code === 200) {
      return res.data as UploadIDCardResponse
    }
    else {
      throw new Error(res.message || '身份证上传失败')
    }
  }
  catch (error) {
    throw new Error(`身份证上传失败: ${error}`)
  }
}

/**
 * 上传驾驶证照片 - 使用阿里云 OSS 直传
 */
export async function uploadDrivingLicense(
  frontImagePath: string,
  backImagePath: string,
  onProgress?: ({ progress, current, total }: { progress: number, current: number, total: number }) => void,
) {
  const { uploadDrivingLicense: uploadDrivingLicenseFile } = await import('@/utils/upload')

  try {
    // 并行上传正反面照片
    const uploadPromises = [
      uploadDrivingLicenseFile(frontImagePath, 'front'),
      uploadDrivingLicenseFile(backImagePath, 'back'),
    ]

    let completed = 0
    const total = 2

    // 监听每个上传任务的进度
    const results = await Promise.all(
      uploadPromises.map(async (promise, index) => {
        const result = await promise
        completed++
        const progress = Math.round((completed / total) * 100)
        onProgress?.({ progress, current: completed, total })
        return result
      }),
    )

    const [frontUrl, backUrl] = results

    // 调用后端 API 提交证件 URL
    const res = await request.post({
      url: `${host}/api/owner/certification/upload-driving-license`,
      data: {
        front_url: frontUrl,
        back_url: backUrl,
      },
    })

    if (res.code === 200) {
      return res.data as UploadDrivingLicenseResponse
    }
    else {
      throw new Error(res.message || '驾驶证上传失败')
    }
  }
  catch (error) {
    throw new Error(`驾驶证上传失败: ${error}`)
  }
}

/**
 * 提交车主认证申请
 */
export function submitOwnerCertification(submitData: {
  idCardFrontUrl: string
  idCardBackUrl: string
  drivingLicenseFrontUrl: string
  drivingLicenseBackUrl: string
  confirmInfo: boolean
}) {
  return request.post({
    url: `${host}/api/owner/certification/submit`,
    data: submitData,
  }).then((res: any) => {
    if (res.code === 200) {
      return res.data as SubmitCertificationResponse
    }
    else {
      throw new Error(res.message || '提交认证申请失败')
    }
  })
}

/**
 * 重新上传证件 - 使用阿里云 OSS 直传
 */
export async function reuploadDocument(
  documentType: 'id_card_front' | 'id_card_back' | 'license_front' | 'license_back',
  imagePath: string,
  onProgress?: ({ progress }: { progress: number }) => void,
) {
  const { uploadIdCard, uploadDrivingLicense } = await import('@/utils/upload')

  try {
    let fileUrl: string

    // 根据证件类型选择上传函数
    if (documentType.startsWith('id_card')) {
      const side = documentType.includes('front') ? 'front' : 'back'
      fileUrl = await uploadIdCard(imagePath, side, onProgress)
    }
    else {
      const side = documentType.includes('front') ? 'front' : 'back'
      fileUrl = await uploadDrivingLicense(imagePath, side, onProgress)
    }

    // 调用后端 API 提交证件 URL
    const res = await request.post({
      url: `${host}/api/owner/certification/reupload`,
      data: {
        document_type: documentType,
        file_url: fileUrl,
      },
    })

    if (res.code === 200) {
      return res.data as ReuploadDocumentResponse
    }
    else {
      throw new Error(res.message || '证件重新上传失败')
    }
  }
  catch (error) {
    throw new Error(`证件重新上传失败: ${error}`)
  }
}
