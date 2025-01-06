import { host, request } from '@/utils/request'

export interface OutcomeType {
  id?: number
  tenantId?: number
  name?: string
  createTime?: Date
  type?: number
}

export function getOutcomeTypeList(): Promise<BaseRes<OutcomeType[]>> {
  return request.get({
    url: `${host}/admin/outcome-type/list`,
  })
}

export function saveOutcomeType(data: OutcomeType): Promise<BaseRes<OutcomeType>> {
  return request.post({
    url: `${host}/admin/outcome-type/save`,
    data,
  })
}

export function deleteOutcomeType(id: number): Promise<BaseRes<OutcomeType>> {
  return request.delete({
    url: `${host}/admin/outcome-type/delete/${id}`,
  })
}
