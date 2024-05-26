import { host, request } from '@/utils/request'

export interface DataMaLoginRes {
  code: 'SUCCESS' | 'PWD_ERROR' | 'PHONE_BIND'
  openId: string
  sessionKey: string
  token: string
}

export function codeHandle(params: { code: string }): Promise<BaseRes<DataMaLoginRes>> {
  return request.post({
    url: `${host}/data/ma/codeHandle`,
    params,
  })
}

export interface DataMaPhoneBindAndLoginParams {
  openId: string
  encryptedData?: string
  iv?: string
  sessionKey?: string
}

export function loginByPhone(params: DataMaPhoneBindAndLoginParams, toast?: any): Promise<BaseRes<DataMaLoginRes>> {
  return request.post({
    url: `${host}/data/ma/loginByPhone`,
    params,
    toast,
  })
}

export interface PwdLoginParams {
  username: string
  password: string
}

export function loginByAccount(params: PwdLoginParams, toast?: any): Promise<BaseRes<DataMaLoginRes>> {
  return request.post({
    url: `${host}/data/ma/loginByAccount`,
    params,
    toast,
  })
}
