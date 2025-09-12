import logger from '@/utils/logger'

/**
 * 平台检测和配置工具类
 * 支持微信小程序和支付宝小程序的平台识别和适配
 */

// 支持的平台类型
export type PlatformType = 'wechat' | 'alipay' | 'h5' | 'app'

// 支付平台类型
export type PayPlatformType = 'wx' | 'alipay'

// 平台配置信息
export interface PlatformConfig {
  platform: PlatformType
  payPlatform: PayPlatformType
  appId: string
  loginProvider: string
  paymentProvider: string
  systemInfo: any
}

// 微信小程序配置
const WECHAT_CONFIG = {
  appId: 'wx4c0815d1a360d938',
  loginProvider: 'weixin',
  paymentProvider: 'wxpay',
}

// 支付宝小程序配置
const ALIPAY_CONFIG = {
  appId: '2021005187614465', // 需要替换为实际的支付宝小程序AppId
  loginProvider: 'alipay',
  paymentProvider: 'alipay',
}

/**
 * 获取当前运行平台
 */
export function getCurrentPlatform(): PlatformType {
  let res = 'wechat'
  try {
    // #ifdef MP-WEIXIN
    res = 'wechat'
    // #endif

    // #ifdef MP-ALIPAY
    res = 'alipay'
    // #endif

    // #ifdef H5
    res = 'h5'
    // #endif

    // #ifdef APP-PLUS
    res = 'app'
    // #endif
  }
  catch (error) {
    console.warn('获取平台信息失败，默认使用微信平台:', error)
    res = 'wechat'
  }
  logger.info(`platform: ${res}`)
  return res as PlatformType
}

/**
 * 获取支付平台类型
 */
export function getPayPlatform(): PayPlatformType {
  const platform = getCurrentPlatform()

  switch (platform) {
    case 'alipay':
      return 'alipay'
    case 'wechat':
    case 'h5':
    case 'app':
    default:
      return 'wx'
  }
}

/**
 * 获取平台配置
 */
export function getPlatformConfig(): PlatformConfig {
  const platform = getCurrentPlatform()
  const payPlatform = getPayPlatform()
  const systemInfo = uni.getSystemInfoSync()

  let config
  switch (platform) {
    case 'alipay':
      config = ALIPAY_CONFIG
      break
    case 'wechat':
    default:
      config = WECHAT_CONFIG
      break
  }

  return {
    platform,
    payPlatform,
    appId: config.appId,
    loginProvider: config.loginProvider,
    paymentProvider: config.paymentProvider,
    systemInfo,
  }
}

/**
 * 检查是否为微信平台
 */
export function isWechatPlatform(): boolean {
  return getCurrentPlatform() === 'wechat'
}

/**
 * 检查是否为支付宝平台
 */
export function isAlipayPlatform(): boolean {
  return getCurrentPlatform() === 'alipay'
}

/**
 * 检查是否为小程序环境
 */
export function isMiniProgram(): boolean {
  const platform = getCurrentPlatform()
  return platform === 'wechat' || platform === 'alipay'
}

/**
 * 获取登录参数
 */
export function getLoginParams(code: string) {
  const config = getPlatformConfig()
  return {
    code,
    appId: config.appId,
    platform: config.payPlatform, // 传递给后端的平台标识
  }
}

/**
 * 获取支付参数基础配置
 */
export function getPaymentParams(additionalParams: Record<string, any> = {}) {
  const payPlatform = getPayPlatform()
  return {
    payType: payPlatform,
    ...additionalParams,
  }
}

/**
 * 调用登录接口
 */
export async function platformLogin(): Promise<any> {
  const config = getPlatformConfig()

  return new Promise((resolve, reject) => {
    uni.login({
      success: (loginRes) => {
        if (loginRes.code) {
          resolve(loginRes)
        }
        else {
          reject(new Error(`${config.platform}登录失败: 未获取到授权码`))
        }
      },
      fail: (error) => {
        reject(
          new Error(
            `${config.platform}登录失败: ${error.errMsg || '未知错误'}`,
          ),
        )
      },
    })
  })
}

/**
 * 调用支付接口
 */
export async function platformPay(paymentData: any): Promise<void> {
  const platform = getCurrentPlatform()

  if (platform === 'alipay') {
    // 支付宝支付
    return new Promise((resolve, reject) => {
      // #ifdef MP-ALIPAY
      uni.requestPayment({
        tradeNO: paymentData.tradeNo,
        success: () => resolve(),
        fail: (error: any) => reject(error),
      })
      // #endif

      // #ifndef MP-ALIPAY
      reject(new Error('当前环境不支持支付宝支付'))
      // #endif
    })
  }
  else {
    // 微信支付
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        appId: paymentData.appId,
        timeStamp: paymentData.timeStamp,
        nonceStr: paymentData.nonceStr,
        package: paymentData.package,
        signType: paymentData.signType,
        paySign: paymentData.paySign,
        success: () => resolve(),
        fail: (error: any) => reject(error),
      })
    })
  }
}

/**
 * 平台名称显示
 */
export function getPlatformDisplayName(platform?: PlatformType): string {
  const currentPlatform = platform || getCurrentPlatform()
  switch (currentPlatform) {
    case 'wechat':
      return '微信'
    case 'alipay':
      return '支付宝'
    case 'h5':
      return 'H5'
    case 'app':
      return 'APP'
    default:
      return '未知平台'
  }
}

/**
 * 获取平台特定的用户标识字段名
 */
export function getUserIdField(): string {
  return isAlipayPlatform() ? 'alipayUserId' : 'openId'
}

/**
 * 日志记录平台信息
 */
export function logPlatformInfo() {
  const config = getPlatformConfig()
  console.log('=== 平台信息 ===')
  console.log('当前平台:', getPlatformDisplayName(config.platform))
  console.log('支付平台:', config.payPlatform)
  console.log('App ID:', config.appId)
  console.log('登录提供商:', config.loginProvider)
  console.log('支付提供商:', config.paymentProvider)
  console.log('系统信息:', config.systemInfo)
  console.log('===============')
}
