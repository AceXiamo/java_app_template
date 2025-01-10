import { host, request } from '@/utils/request'

export interface TenantBanner {
  id?: number
  url?: string
  sort?: number
  tenantId?: number
}

export function listBanner(): Promise<BaseRes<TenantBanner[]>> {
  return request.get({
    url: `${host}/admin/tenant/banner/list`,
  })
}

export function saveBanner(data: TenantBanner): Promise<BaseRes<TenantBanner>> {
  return request.post({
    url: `${host}/admin/tenant/banner/save`,
    data,
  })
}

export function delBanner(params: { id: number }): Promise<BaseRes<TenantBanner>> {
  return request.delete({
    url: `${host}/admin/tenant/banner/delete/${params.id}`,
    params,
  })
}

export function banners(params: { tenantId: number }): Promise<BaseRes<TenantBanner[]>> {
  return request.get({
    url: `${host}/app/banner/list`,
    params,
  })
}
