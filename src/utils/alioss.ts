import crypto from 'crypto-js'
import { Base64 } from 'js-base64'
import logger from './logger'
import Storage from './storage'
import type { OSSSTSCredential } from '@/api/alioss'
import { getStsToken } from '@/api/alioss'
import { useUserStore } from '@/store/user'

const user = useUserStore()
const bucket = import.meta.env.VITE_OSS_BUCKET_NAME
const region = import.meta.env.VITE_OSS_REGION
const host = `https://${bucket}.oss-${region}.aliyuncs.com/`

function computeSignature(accessKeySecret: string, canonicalString: string) {
  return crypto.enc.Base64.stringify(
    crypto.HmacSHA1(canonicalString, accessKeySecret),
  )
}

function getPolicy(expires: string): string {
  const policy = {
    expiration: expires,
    conditions: [['content-length-range', 0, 1024 * 1024 * 1024]],
  }
  return Base64.encode(JSON.stringify(policy))
}

interface UploadConfig {
  host: string
  formData: {
    'OSSAccessKeyId': string
    'signature': string
    'policy': string
    'x-oss-security-token': string
  }
}

/**
 * Retrieves the upload configuration for Aliyun OSS.
 * If the credentials are not found in the local storage, it will fetch them from the server.
 * @returns A promise that resolves to an object containing the host and formData for the upload.
 */
async function getUploadConfig(): Promise<UploadConfig> {
  let credentials: OSSSTSCredential = Storage.get('credentials')
  if (!credentials) {
    const res = await getStsToken({ openId: user.user.openId! })
    if (res.code === 200) {
      Storage.set({
        key: 'credentials',
        value: res.data,
        expires: 1000 * 60 * 60,
      })
      credentials = res.data
    }
    else {
      logger.error('get sts token error!')
    }
  }

  const policy = getPolicy(credentials.expiration)
  const signature = computeSignature(credentials.accessKeySecret, policy)
  const formData = {
    'OSSAccessKeyId': credentials.accessKeyId,
    signature,
    policy,
    'x-oss-security-token': credentials.securityToken,
  }
  return {
    host: credentials.host,
    formData,
  }
}

/**
 * Uploads a file to Aliyun OSS.
 * @param filePath - The local file path of the file to upload.
 * @param path - The path to store the file in OSS.
 * @param onProgress - An optional callback function to track the upload progress.
 * @returns A Promise that resolves with the upload response or rejects with an error.
 */
function uploadFileToOss(filePath: string, path: string, onProgress?: ({ progress }: { progress: number }) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    getUploadConfig().then(({ formData }) => {
      const uploadTask = uni.uploadFile({
        url: host,
        filePath,
        name: 'file',
        formData: {
          ...formData,
          key: path,
        },
        success: (_) => {
          resolve(`${host}${path}`)
        },
        fail: (err) => {
          reject(err)
        },
      })

      uploadTask.onProgressUpdate(({ progress }) => {
        onProgress?.({ progress })
      })
    })
  })
}

export { getUploadConfig, uploadFileToOss, host }
