import { host, request } from '@/utils/request'
import { createPaymentParams, getCurrentPayType, getUserPaymentId } from '@/utils/payment'
import type { PayPlatformType } from '@/utils/platform'

// 押金账户信息
export interface UserDepositAccount {
  accountId: number
  userId: number
  totalAmount: number
  frozenAmount: number
  availableAmount: number
  status: string
  createTime: string
  updateTime: string
}

// 押金交易记录
export interface DepositTransaction {
  transactionId: number
  userId: number
  orderId?: number
  transactionType: string
  amount: number
  beforeBalance: number
  afterBalance: number
  paymentMethod?: string
  wechatTransactionId?: string
  remark?: string
  createTime: string
}

// 押金计算结果
export interface DepositCalculation {
  vehicleDeposit: number // 车辆押金
  creditDeduction: number // 信用抵扣金额
  actualDeposit: number // 实际需要押金
  userBalance: number // 用户当前余额
  needRecharge: number // 需要充值金额
  canBook: boolean // 是否可以下单
  creditInfo?: {
    wechatScore?: number
    sesameScore?: number
    usedCreditType?: 'wechat' | 'sesame'
    deductionAmount?: number
  }
}

// 押金充值参数
export interface DepositRechargeParams {
  amount: number
  paymentMethod?: PayPlatformType // 可选，默认根据平台自动选择
  payType?: PayPlatformType // 兼容后端接口
  returnUrl?: string
}

// 押金提现参数
export interface DepositWithdrawParams {
  amount: number
  paymentMethod?: PayPlatformType // 可选，默认根据平台自动选择
  payType?: PayPlatformType // 兼容后端接口
  remark?: string
}

// 用户信用信息
export interface UserCreditInfo {
  userId: number
  wechatScore: number
  sesameScore: number
  creditSyncTime: string
}

// ================================
// 押金账户相关API
// ================================

/**
 * 获取用户押金账户信息
 */
export function getUserDepositAccount(): Promise<BaseRes<UserDepositAccount>> {
  return request.get({
    url: `${host}/app/deposit/account`,
  })
}

/**
 * 获取用户押金交易记录
 */
export function getDepositTransactions(params?: {
  current?: number
  size?: number
  transactionType?: string
}): Promise<BaseRes<{ records: DepositTransaction[] }>> {
  return request.get({
    url: `${host}/app/deposit/transactions`,
    params,
  })
}

/**
 * 押金充值 - 支持双平台支付
 */
export function rechargeDeposit(data: DepositRechargeParams): Promise<BaseRes<any>> {
  // 自动添加支付参数
  const paymentParams = createPaymentParams({
    amount: data.amount,
    paymentMethod: data.paymentMethod || getCurrentPayType(),
    payType: data.payType || getCurrentPayType(),
    returnUrl: data.returnUrl,
  })
  
  return request.post({
    url: `${host}/app/deposit/recharge`,
    data: paymentParams,
    params: {
      openId: getUserPaymentId(), // 自动获取用户支付ID
    },
  })
}

/**
 * 押金充值 - 兼容旧版本接口
 */
export function rechargeDepositLegacy(data: { 
  amount: number
  paymentMethod: 'wechat' | 'alipay'
  returnUrl?: string
}): Promise<BaseRes<any>> {
  const payType = data.paymentMethod === 'alipay' ? 'alipay' : 'wx'
  return rechargeDeposit({
    ...data,
    paymentMethod: payType,
    payType,
  })
}

/**
 * 押金提现
 */
export function withdrawDeposit(data: DepositWithdrawParams): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/app/deposit/withdraw`,
    data,
  })
}

// ================================
// 订单押金计算相关API
// ================================

/**
 * 计算订单所需押金
 */
export function calculateOrderDeposit(params: {
  vehicleId: number
  startTime: string
  endTime: string
}): Promise<BaseRes<DepositCalculation>> {
  return request.post({
    url: `${host}/app/deposit/calculate`,
    data: params,
  })
}

/**
 * 验证押金是否充足
 */
export function verifyDepositBalance(params: {
  vehicleId: number
  startTime: string
  endTime: string
}): Promise<BaseRes<boolean>> {
  return request.post({
    url: `${host}/app/deposit/verify`,
    data: params,
  })
}

/**
 * 冻结订单押金
 */
export function freezeOrderDeposit(params: {
  orderId: number
  amount: number
}): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/app/deposit/freeze`,
    data: params,
  })
}

/**
 * 解冻订单押金
 */
export function unfreezeOrderDeposit(params: {
  orderId: number
  amount: number
}): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/app/deposit/unfreeze`,
    data: params,
  })
}

// ================================
// 信用管理相关API
// ================================

/**
 * 获取用户信用信息
 */
export function getUserCreditInfo(): Promise<BaseRes<UserCreditInfo>> {
  return request.get({
    url: `${host}/app/credit/info`,
  })
}

/**
 * 同步第三方信用信息
 */
export function syncCreditInfo(creditType: 'wechat' | 'sesame'): Promise<BaseRes<any>> {
  return request.post({
    url: `${host}/app/credit/sync`,
    data: { creditType },
  })
}

/**
 * 获取信用抵扣规则
 */
export function getCreditDeductionRules(): Promise<BaseRes<any>> {
  return request.get({
    url: `${host}/app/credit/rules`,
  })
}

// ================================
// 常量定义
// ================================

// 交易类型
export const TRANSACTION_TYPES = {
  recharge: '充值',
  freeze: '冻结',
  unfreeze: '解冻',
  withdraw: '提现',
  deduct: '扣款',
} as const

// 支付方式
export const PAYMENT_METHODS = {
  wechat: '微信支付',
  alipay: '支付宝',
} as const

// 账户状态
export const ACCOUNT_STATUS = {
  normal: '正常',
  frozen: '冻结',
  disabled: '禁用',
} as const

// 信用类型
export const CREDIT_TYPES = {
  wechat: '微信支付分',
  sesame: '芝麻信用分',
} as const

// ================================
// 工具函数
// ================================

/**
 * 格式化金额显示
 */
export function formatAmount(amount: number): string {
  return amount?.toFixed(2) || '0.00'
}

/**
 * 获取交易类型显示文本
 */
export function getTransactionTypeText(type: string): string {
  return TRANSACTION_TYPES[type as keyof typeof TRANSACTION_TYPES] || type
}

/**
 * 获取支付方式显示文本
 */
export function getPaymentMethodText(method: string): string {
  return PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS] || method
}

/**
 * 获取账户状态显示文本
 */
export function getAccountStatusText(status: string): string {
  return ACCOUNT_STATUS[status as keyof typeof ACCOUNT_STATUS] || status
}

/**
 * 获取信用类型显示文本
 */
export function getCreditTypeText(type: string): string {
  return CREDIT_TYPES[type as keyof typeof CREDIT_TYPES] || type
}

/**
 * 判断是否需要充值
 */
export function needRecharge(calculation: DepositCalculation): boolean {
  return calculation.needRecharge > 0
}

/**
 * 获取充值建议金额
 */
export function getRecommendedRechargeAmount(calculation: DepositCalculation): number {
  const needAmount = calculation.needRecharge

  // 建议充值金额的档位
  const amounts = [50, 100, 200, 500, 1000, 2000]

  // 找到第一个大于等于所需金额的档位
  for (const amount of amounts) {
    if (amount >= needAmount) {
      return amount
    }
  }

  // 如果所需金额超过所有档位，则返回向上取整到百位的金额
  return Math.ceil(needAmount / 100) * 100
}
