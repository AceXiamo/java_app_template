import { host, request } from '@/utils/request'

export function loginByPwd(data: {
  username: string
  password: string
}): Promise<{ code: number, msg: string, token: string }> {
  return request.post({
    url: `${host}/anotherLogin`,
    data,
  })
}
