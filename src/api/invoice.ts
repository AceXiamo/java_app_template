import { host, request } from '@/utils/request'

// 发票申请接口类型定义
export interface InvoiceApplication {
  applicationId?: number
  applicationNo?: string
  userId: number
  orderId: number
  orderNo?: string

  // 发票基本信息
  invoiceType: 'personal' | 'enterprise'
  invoiceTitle: string
  invoiceAmount: number

  // 个人发票信息
  personalName?: string
  personalIdCard?: string

  // 企业发票信息
  companyName?: string
  taxNumber?: string
  companyAddress?: string
  companyPhone?: string
  companyBank?: string
  bankAccount?: string

  // 邮寄信息
  recipientName: string
  recipientPhone: string
  recipientAddress: string

  // 申请状态
  status?: 'pending' | 'processing' | 'completed' | 'rejected'
  rejectReason?: string

  // 发票信息
  invoiceNo?: string
  invoiceCode?: string
  invoicePdfUrl?: string
  issueDate?: string

  // 快递信息
  expressCompany?: string
  expressNo?: string

  // 时间信息
  createTime?: string
  updateTime?: string
}

// 订单信息接口
export interface AvailableOrder {
  orderId: number
  orderNo: string
  finalAmount: number
  vehicleName?: string
  licensePlate?: string
  startTime: string
  endTime: string
  status: string
}

/**
 * 获取可申请发票的订单列表
 */
export function getAvailableOrders(params: { userId: number }): Promise<BaseRes<AvailableOrder[]>> {
  return request.get({
    url: `${host}/invoice/orders/available`,
    params,
  })
}

/**
 * 提交发票申请
 */
export function submitInvoiceApplication(data: InvoiceApplication): Promise<BaseRes<InvoiceApplication>> {
  return request.post({
    url: `${host}/invoice/application`,
    data,
  })
}

/**
 * 获取用户的发票申请记录
 */
export function getUserInvoiceApplications(params: { userId: number }): Promise<BaseRes<InvoiceApplication[]>> {
  return request.get({
    url: `${host}/invoice/applications`,
    params,
  })
}

/**
 * 获取发票申请详情
 */
export function getInvoiceApplicationDetail(applicationId: number, params: { userId: number }): Promise<BaseRes<InvoiceApplication>> {
  return request.get({
    url: `${host}/invoice/application/${applicationId}`,
    params,
  })
}

/**
 * 获取发票下载链接
 */
export function getInvoiceDownloadUrl(applicationId: number, params: { userId: number }): Promise<BaseRes<string>> {
  return request.get({
    url: `${host}/invoice/download/${applicationId}`,
    params,
  })
}

/**
 * 检查订单是否可以申请发票
 */
export function checkCanApplyInvoice(orderId: number, params: { userId: number }): Promise<BaseRes<boolean>> {
  return request.get({
    url: `${host}/invoice/check/${orderId}`,
    params,
  })
}

// 发票状态文本映射
export const InvoiceStatusText = {
  pending: '待处理',
  processing: '处理中',
  completed: '已完成',
  rejected: '已拒绝',
}

// 发票类型文本映射
export const InvoiceTypeText = {
  personal: '个人发票',
  enterprise: '企业发票',
}