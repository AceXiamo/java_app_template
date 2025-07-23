import { host, request } from '@/utils/request'

// 提现方式数据接口
export interface OwnerWithdrawalMethod {
  methodId: number
  ownerId: number
  methodType: string
  methodName: string
  accountInfo: string
  holderName: string
  holderPhone: string
  bankName?: string
  bankAccount?: string
  wechatAccount?: string
  alipayAccount?: string
  qrCodeImageUrl?: string
  isDefault: boolean
  status: string
  createTime: string
  updateTime: string
}

// 提现记录数据接口
export interface OwnerWithdrawalRecord {
  withdrawalId: number
  ownerId: number
  withdrawalNo: string
  amount: number
  fee: number
  actualAmount: number
  bankName: string
  bankAccount: string
  accountHolder: string
  status: string
  applyTime: string
  processTime?: string
  completeTime?: string
  failureReason?: string
  operatorId?: number
  remark?: string
}

/**
 * 获取车主提现方式列表
 */
export function getOwnerWithdrawalMethods(ownerId: number): Promise<BaseRes<OwnerWithdrawalMethod[]>> {
  return request.get({
    url: `${host}/owner/withdrawal/methods`,
    params: { ownerId }
  })
}

/**
 * 获取车主默认提现方式
 */
export function getOwnerDefaultWithdrawalMethod(ownerId: number): Promise<BaseRes<OwnerWithdrawalMethod>> {
  return request.get({
    url: `${host}/owner/withdrawal/default-method`,
    params: { ownerId }
  })
}

/**
 * 添加提现方式
 */
export function addOwnerWithdrawalMethod(method: Partial<OwnerWithdrawalMethod>): Promise<BaseRes<string>> {
  return request.post({
    url: `${host}/owner/withdrawal/methods`,
    data: method
  })
}

/**
 * 设置默认提现方式
 */
export function setDefaultWithdrawalMethod(ownerId: number, methodId: number): Promise<BaseRes<string>> {
  return request.put({
    url: `${host}/owner/withdrawal/default-method`,
    params: { ownerId, methodId }
  })
}

/**
 * 删除提现方式
 */
export function deleteWithdrawalMethod(ownerId: number, methodId: number): Promise<BaseRes<string>> {
  return request.delete({
    url: `${host}/owner/withdrawal/methods`,
    params: { ownerId, methodId }
  })
}