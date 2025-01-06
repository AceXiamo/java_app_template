import { host, request } from '@/utils/request'

export interface VisitType {
  id?: number
  tenantId?: number
  name?: string
  createTime?: Date
  type?: number
}

export function getVisitTypeList(): Promise<BaseRes<VisitType[]>> {
  return request.get({
    url: `${host}/admin/visit-type/list`,
  })
}

export function saveVisitType(data: VisitType): Promise<BaseRes<VisitType>> {
  return request.post({
    url: `${host}/admin/visit-type/save`,
    data,
  })
}

export function deleteVisitType(id: number): Promise<BaseRes<VisitType>> {
  return request.delete({
    url: `${host}/admin/visit-type/delete/${id}`,
  })
}
