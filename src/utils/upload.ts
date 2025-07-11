import { uploadFileToOss } from './alioss'
import logger from './logger'

/**
 * 文件上传类型枚举
 */
export enum UploadType {
  AVATAR = 'avatars',
  ID_CARD = 'documents/id-cards',
  DRIVING_LICENSE = 'documents/driving-licenses',
  VEHICLE_IMAGE = 'vehicles/images',
  OTHER = 'others'
}

/**
 * 通用文件上传函数
 * @param filePath 本地文件路径
 * @param type 上传类型
 * @param customFileName 自定义文件名（可选）
 * @param onProgress 上传进度回调
 * @returns Promise<string> 返回文件URL
 */
export async function uploadFile(
  filePath: string,
  type: UploadType,
  customFileName?: string,
  onProgress?: ({ progress }: { progress: number }) => void
): Promise<string> {
  try {
    // 生成文件名
    const timestamp = Date.now()
    const ext = filePath.split('.').pop() || 'jpg'
    const fileName = customFileName || `file_${timestamp}.${ext}`
    const fullPath = `${type}/${fileName}`

    logger.info(`Uploading file: ${fullPath}`)

    // 上传到阿里云 OSS
    const fileUrl = await uploadFileToOss(filePath, fullPath, onProgress)
    
    logger.info(`File uploaded successfully: ${fileUrl}`)
    return fileUrl
  } catch (error) {
    logger.error('File upload failed:', error)
    throw new Error(`文件上传失败: ${error}`)
  }
}

/**
 * 上传头像
 * @param filePath 本地文件路径
 * @param onProgress 上传进度回调
 * @returns Promise<string> 返回头像URL
 */
export function uploadAvatar(
  filePath: string,
  onProgress?: ({ progress }: { progress: number }) => void
): Promise<string> {
  return uploadFile(filePath, UploadType.AVATAR, undefined, onProgress)
}

/**
 * 上传身份证
 * @param filePath 本地文件路径
 * @param side 正面或反面 ('front' | 'back')
 * @param onProgress 上传进度回调
 * @returns Promise<string> 返回文件URL
 */
export function uploadIdCard(
  filePath: string,
  side: 'front' | 'back',
  onProgress?: ({ progress }: { progress: number }) => void
): Promise<string> {
  const timestamp = Date.now()
  const ext = filePath.split('.').pop() || 'jpg'
  const fileName = `id_card_${side}_${timestamp}.${ext}`
  return uploadFile(filePath, UploadType.ID_CARD, fileName, onProgress)
}

/**
 * 上传驾驶证
 * @param filePath 本地文件路径
 * @param side 正面或反面 ('front' | 'back')
 * @param onProgress 上传进度回调
 * @returns Promise<string> 返回文件URL
 */
export function uploadDrivingLicense(
  filePath: string,
  side: 'front' | 'back',
  onProgress?: ({ progress }: { progress: number }) => void
): Promise<string> {
  const timestamp = Date.now()
  const ext = filePath.split('.').pop() || 'jpg'
  const fileName = `driving_license_${side}_${timestamp}.${ext}`
  return uploadFile(filePath, UploadType.DRIVING_LICENSE, fileName, onProgress)
}

/**
 * 上传车辆图片
 * @param filePath 本地文件路径
 * @param vehicleId 车辆ID（可选）
 * @param onProgress 上传进度回调
 * @returns Promise<string> 返回文件URL
 */
export function uploadVehicleImage(
  filePath: string,
  vehicleId?: string | number,
  onProgress?: ({ progress }: { progress: number }) => void
): Promise<string> {
  const timestamp = Date.now()
  const ext = filePath.split('.').pop() || 'jpg'
  const fileName = vehicleId 
    ? `vehicle_${vehicleId}_${timestamp}.${ext}`
    : `vehicle_${timestamp}.${ext}`
  return uploadFile(filePath, UploadType.VEHICLE_IMAGE, fileName, onProgress)
}

/**
 * 批量上传文件
 * @param files 文件列表，包含filePath和type
 * @param onProgress 总体进度回调
 * @returns Promise<string[]> 返回文件URL列表
 */
export async function uploadMultipleFiles(
  files: Array<{ filePath: string; type: UploadType; customFileName?: string }>,
  onProgress?: ({ progress, current, total }: { progress: number; current: number; total: number }) => void
): Promise<string[]> {
  const results: string[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      const url = await uploadFile(file.filePath, file.type, file.customFileName)
      results.push(url)
      
      const progress = Math.round(((i + 1) / total) * 100)
      onProgress?.({ progress, current: i + 1, total })
    } catch (error) {
      logger.error(`Failed to upload file ${file.filePath}:`, error)
      throw error
    }
  }

  return results
}