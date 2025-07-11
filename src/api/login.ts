import { host, request } from '@/utils/request'

export interface LoginResult extends WxUser {
  sessionKey?: string
  token?: string
}

export interface WxUser {
  openId: string
  nickname: string
  avatar: string
  userId: number
  delFlag: number
  createTime: string
  appId?: string
}

export function login(params: { code: string, appId?: string }): Promise<BaseRes<LoginResult>> {
  return request.post({
    url: `${host}/wechat/login`,
    params: {
      code: params.code,
      appId: params.appId || 'wx30d7fd774ea643d1',
    },
  })
}
