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
  withdrawalMethodId?: number
  withdrawalType: string
  amount: number
  fee: number
  processingFeeRate?: number
  actualAmount: number
  bankName?: string
  bankAccount?: string
  accountHolder?: string
  wechatAccount?: string
  alipayAccount?: string
  status: string
  applyTime: string
  processTime?: string
  completeTime?: string
  estimatedArrivalTime?: string
  actualArrivalTime?: string
  bankReferenceNo?: string
  failureReason?: string
  operatorId?: number
  remark?: string
  createTime: string
  updateTime: string
}

/**
 * 获取车主提现方式列表
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerWithdrawalMethods(): Promise<BaseRes<OwnerWithdrawalMethod[]>> {
  return request.get({
    url: `${host}/owner/withdrawal/methods`
  })
}

/**
 * 获取车主默认提现方式
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerDefaultWithdrawalMethod(): Promise<BaseRes<OwnerWithdrawalMethod>> {
  return request.get({
    url: `${host}/owner/withdrawal/default-method`
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
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function setDefaultWithdrawalMethod(methodId: number): Promise<BaseRes<string>> {
  return request.put({
    url: `${host}/owner/withdrawal/default-method`,
    params: { methodId }
  })
}

/**
 * 删除提现方式
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function deleteWithdrawalMethod(methodId: number): Promise<BaseRes<string>> {
  return request.delete({
    url: `${host}/owner/withdrawal/methods`,
    params: { methodId }
  })
}

/**
 * 提交提现申请
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function applyWithdrawal(data: {
  amount: number;
  methodId: number;
}): Promise<BaseRes<{
  withdrawalId: number;
  withdrawalNo: string;
  actualAmount: number;
  fee: number;
  estimatedArrivalTime: string;
}>> {
  return request.post({
    url: `${host}/owner/withdrawal/apply`,
    data
  })
}

/**
 * 获取车主提现记录列表
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getWithdrawalRecords(): Promise<BaseRes<OwnerWithdrawalRecord[]>> {
  return request.get({
    url: `${host}/owner/withdrawal/records`
  })
}

/**
 * 获取车主可提现余额
 * 后端通过 SecurityUtils 自动获取当前用户ID
 */
export function getOwnerBalance(): Promise<BaseRes<{ balance: number }>> {
  return request.get({
    url: `${host}/owner/withdrawal/balance`
  })
}

/**
 * 计算提现手续费
 */
export function calculateWithdrawalFee(amount: number): Promise<BaseRes<{
  fee: number;
  actualAmount: number;
}>> {
  return request.post({
    url: `${host}/owner/withdrawal/calculate-fee`,
    data: { amount }
  })
}