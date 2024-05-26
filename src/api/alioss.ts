import { host, request } from '@/utils/request'

export interface OSSSTSCredential {
  host: string
  accessKeyId: string
  accessKeySecret: string
  securityToken: string
  expiration: string
}

export function getStsToken(): Promise<ResponseData<OSSSTSCredential>> {
  return request.post({
    url: `${host}/ali/oss/getStsToken`,
  })
}
