import { host, request } from '@/utils/request'

export function login(params: LoginReqData): Promise<ResponseData<User>> {
  return request.post({
    url: `${host}/wx/login`,
    params,
  })
}
