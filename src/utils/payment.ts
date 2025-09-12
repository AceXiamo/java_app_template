/**
 * 支付工具类 - 处理双平台支付差异
 */

import { getPayPlatform, getPlatformDisplayName, isAlipayPlatform, platformPay } from '@/utils/platform'
import { useUserStore } from '@/store/user'
import type { PayPlatformType } from '@/utils/platform'

// 微信支付参数接口
export interface WxPayParams {
  appId: string
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
}

// 支付宝支付参数接口  
export interface AlipayParams {
  tradeNo: string
  [key: string]: any
}

// 统一支付参数接口
export interface UnifiedPayParams {
  // 微信支付参数
  appId?: string
  timeStamp?: string
  nonceStr?: string
  package?: string
  signType?: string
  paySign?: string
  
  // 支付宝支付参数
  tradeNo?: string
  
  // 通用参数
  amount?: number
  outTradeNo?: string
  payType?: PayPlatformType
}

// 支付结果接口
export interface PaymentResult {
  success: boolean
  message: string
  platform: PayPlatformType
  data?: any
}

/**
 * 获取当前平台的支付类型
 */
export function getCurrentPayType(): PayPlatformType {
  return getPayPlatform()
}

/**
 * 生成支付参数 - 根据平台自动添加payType
 */
export function createPaymentParams(baseParams: Record<string, any>): Record<string, any> {
  const payType = getCurrentPayType()
  return {
    ...baseParams,
    payType,
  }
}

/**
 * 统一支付接口 - 根据平台自动调用对应的支付方法
 */
export async function requestPlatformPayment(paymentData: UnifiedPayParams): Promise<PaymentResult> {
  const payType = paymentData.payType || getCurrentPayType()
  const platformName = getPlatformDisplayName()
  
  try {
    console.log(`开始${platformName}支付:`, paymentData)
    
    if (payType === 'alipay') {
      return await requestAlipayPayment(paymentData)
    } else {
      return await requestWechatPayment(paymentData)
    }
  } catch (error: any) {
    console.error(`${platformName}支付失败:`, error)
    return {
      success: false,
      message: error.message || `${platformName}支付失败`,
      platform: payType,
      data: error,
    }
  }
}

/**
 * 微信支付
 */
export async function requestWechatPayment(paymentData: UnifiedPayParams): Promise<PaymentResult> {
  if (!paymentData.appId || !paymentData.timeStamp) {
    throw new Error('微信支付参数不完整')
  }

  const wxPayData = {
    appId: paymentData.appId,
    timeStamp: paymentData.timeStamp,
    nonceStr: paymentData.nonceStr!,
    package: paymentData.package!,
    signType: paymentData.signType!,
    paySign: paymentData.paySign!,
  }

  try {
    await platformPay(wxPayData)
    return {
      success: true,
      message: '微信支付成功',
      platform: 'wx',
      data: wxPayData,
    }
  } catch (error: any) {
    throw new Error(`微信支付失败: ${error.errMsg || error.message || '未知错误'}`)
  }
}

/**
 * 支付宝支付
 */
export async function requestAlipayPayment(paymentData: UnifiedPayParams): Promise<PaymentResult> {
  if (!paymentData.tradeNo) {
    throw new Error('支付宝支付参数不完整')
  }

  const alipayData = {
    tradeNo: paymentData.tradeNo,
  }

  try {
    await platformPay(alipayData)
    return {
      success: true,
      message: '支付宝支付成功',
      platform: 'alipay',
      data: alipayData,
    }
  } catch (error: any) {
    throw new Error(`支付宝支付失败: ${error.errMsg || error.message || '未知错误'}`)
  }
}

/**
 * 处理支付响应数据 - 兼容旧版本的微信支付接口
 */
export function processPaymentResponse(response: any): UnifiedPayParams {
  // 如果是后端返回的支付数据，进行统一处理
  if (response.data) {
    const payData = response.data
    
    // 检查是否为微信支付格式
    if (payData.appId && payData.timeStamp) {
      return {
        appId: payData.appId,
        timeStamp: payData.timeStamp,
        nonceStr: payData.nonceStr,
        package: payData.package,
        signType: payData.signType,
        paySign: payData.paySign,
        payType: 'wx',
      }
    }
    
    // 检查是否为支付宝支付格式
    if (payData.tradeNo) {
      return {
        tradeNo: payData.tradeNo,
        payType: 'alipay',
      }
    }
    
    // 如果数据中包含payType，则使用
    if (payData.payType) {
      return {
        ...payData,
        payType: payData.payType,
      }
    }
  }
  
  // 默认处理为当前平台类型
  return {
    ...response.data,
    payType: getCurrentPayType(),
  }
}

/**
 * 显示支付成功提示
 */
export function showPaymentSuccessToast(platform?: PayPlatformType) {
  const payType = platform || getCurrentPayType()
  const platformName = payType === 'alipay' ? '支付宝' : '微信'
  
  uni.showToast({
    title: `${platformName}支付成功`,
    icon: 'success',
    duration: 2000,
  })
}

/**
 * 显示支付失败提示
 */
export function showPaymentFailedToast(message?: string, platform?: PayPlatformType) {
  const payType = platform || getCurrentPayType()
  const platformName = payType === 'alipay' ? '支付宝' : '微信'
  
  uni.showToast({
    title: message || `${platformName}支付失败`,
    icon: 'error',
    duration: 2000,
  })
}

/**
 * 获取用户支付相关的ID（openId或alipayUserId）
 */
export function getUserPaymentId(): string {
  const userStore = useUserStore()
  
  if (isAlipayPlatform()) {
    return userStore.getUserPlatformId() // 返回支付宝用户ID或openId
  } else {
    return userStore.getUserOpenId() // 返回微信openId
  }
}

/**
 * 检查支付参数完整性
 */
export function validatePaymentParams(paymentData: UnifiedPayParams): { valid: boolean; message: string } {
  const payType = paymentData.payType || getCurrentPayType()
  
  if (payType === 'alipay') {
    if (!paymentData.tradeNo) {
      return { valid: false, message: '支付宝交易号不能为空' }
    }
  } else {
    if (!paymentData.appId || !paymentData.timeStamp || !paymentData.paySign) {
      return { valid: false, message: '微信支付参数不完整' }
    }
  }
  
  return { valid: true, message: '参数验证通过' }
}

/**
 * 兼容旧版本的微信支付方法
 */
export async function requestWxPayment(payData: WxPayParams): Promise<void> {
  const result = await requestWechatPayment(payData)
  if (!result.success) {
    throw new Error(result.message)
  }
}