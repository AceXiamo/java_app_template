import { host, request } from '@/utils/request'

/**
 * 创建押金支付订单
 */
export function createDepositPayOrder(orderNo: string, openId: string): Promise<BaseRes<{
  timeStamp: string
  nonceStr: string
  package: string
  signType: string
  paySign: string
  depositOrderNo: string
  amount: number
  orderId: string
}>> {
  return request.post({
    url: `${host}/api/wx/pay/deposit/create`,
    data: {
      orderNo,
      openId,
    },
  })
}

/**
 * 查询押金支付状态
 */
export function queryDepositPayStatus(depositOrderNo: string): Promise<BaseRes<{
  status: string
  transactionId?: string
  paymentTime?: string
}>> {
  return request.get({
    url: `${host}/api/wx/pay/query/${depositOrderNo}`,
  })
}
