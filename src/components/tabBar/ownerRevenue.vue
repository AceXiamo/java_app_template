<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import HeadBar from '@/components/HeadBar.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'
import { useOwnerStore } from '@/store/owner'

// 使用 owner store
const ownerStore = useOwnerStore()
const { revenueData } = storeToRefs(ownerStore)

// 设置当前页面
ownerStore.setActive('revenue')

// 滚动状态
const isTabSticky = ref(false)

// 收益详情数据
const detailsData = reactive({
  revenueDetails: [
    {
      id: 1,
      date: '2025-07-20',
      orderNo: 'RO20250720001',
      totalAmount: 299,
      commission: 254,
      commissionRate: 85,
      packageType: '基础托管套餐',
      status: 'settled',
      vehicle: {
        name: '特斯拉 Model 3',
        license_plate: '沪A·12345',
        brand: '特斯拉',
        model: 'Model 3',
        image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/tesla_model3.jpg',
      },
      user: {
        name: '张三',
        phone: '139****5678',
      },
    },
    {
      id: 2,
      date: '2025-07-19',
      orderNo: 'RO20250719001',
      totalAmount: 199,
      commission: 149,
      commissionRate: 75,
      packageType: '标准托管套餐',
      status: 'settled',
      vehicle: {
        name: '比亚迪汉 EV',
        license_plate: '沪A·67890',
        brand: '比亚迪',
        model: '汉 EV',
        image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/byd_han.jpg',
      },
      user: {
        name: '李四',
        phone: '138****1234',
      },
    },
    {
      id: 3,
      date: '2025-07-18',
      orderNo: 'RO20250718001',
      totalAmount: 359,
      commission: 305,
      commissionRate: 85,
      packageType: '基础托管套餐',
      status: 'pending',
      vehicle: {
        name: '理想 L7',
        license_plate: '沪A·11111',
        brand: '理想',
        model: 'L7',
        image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/lixiang_l7.jpg',
      },
      user: {
        name: '王五',
        phone: '137****9999',
      },
    },
    {
      id: 4,
      date: '2025-07-17',
      orderNo: 'RO20250717001',
      totalAmount: 429,
      commission: 365,
      commissionRate: 85,
      packageType: '基础托管套餐',
      status: 'settled',
      vehicle: {
        name: '蔚来ES6',
        license_plate: '沪A·88888',
        brand: '蔚来',
        model: 'ES6',
        image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/nio_es6.jpg',
      },
      user: {
        name: '赵六',
        phone: '136****7777',
      },
    },
    {
      id: 5,
      date: '2025-07-16',
      orderNo: 'RO20250716001',
      totalAmount: 269,
      commission: 175,
      commissionRate: 65,
      packageType: '全托管套餐',
      status: 'settled',
      vehicle: {
        name: '小鹏P7',
        license_plate: '沪A·99999',
        brand: '小鹏',
        model: 'P7',
        image_url: 'https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/xpeng_p7.jpg',
      },
      user: {
        name: '孙七',
        phone: '135****2222',
      },
    },
  ],
  withdrawalRecords: [
    {
      id: 1,
      withdrawalNo: 'WD20250715001',
      amount: 1500.00,
      fee: 5.00,
      actualAmount: 1495.00,
      bankName: '招商银行',
      bankAccount: '****1234',
      status: 'completed',
      applyTime: '2025-07-15 10:30',
      completeTime: '2025-07-15 16:45',
    },
    {
      id: 2,
      withdrawalNo: 'WD20250710001',
      amount: 800.00,
      fee: 3.00,
      actualAmount: 797.00,
      bankName: '工商银行',
      bankAccount: '****5678',
      status: 'processing',
      applyTime: '2025-07-10 14:20',
      completeTime: null,
    },
    {
      id: 3,
      withdrawalNo: 'WD20250705001',
      amount: 1200.00,
      fee: 4.00,
      actualAmount: 1196.00,
      bankName: '建设银行',
      bankAccount: '****9876',
      status: 'completed',
      applyTime: '2025-07-05 09:15',
      completeTime: '2025-07-05 15:30',
    },
    {
      id: 4,
      withdrawalNo: 'WD20250701001',
      amount: 650.00,
      fee: 2.50,
      actualAmount: 647.50,
      bankName: '农业银行',
      bankAccount: '****5432',
      status: 'failed',
      applyTime: '2025-07-01 11:45',
      completeTime: null,
    },
  ],
})

// 当前显示模式
const currentTab = ref('revenue') // revenue | withdrawal

// 提现弹窗相关
const withdrawalDrawerVisible = ref(false)
const withdrawalAmount = ref('')
const selectedWithdrawalMethod = ref<any>(null)

// 模拟提现方式数据
const withdrawalMethods = reactive([
  {
    id: 1,
    type: 'bank',
    name: '招商银行',
    account: '****1234',
    icon: 'i-material-symbols-account-balance',
    isDefault: true,
  },
  {
    id: 2,
    type: 'wechat',
    name: '微信收款码',
    account: '微信号: wx****8888',
    iconUrl: 'https://img.icons8.com/color/48/wechat.png',
    isDefault: false,
  },
  {
    id: 3,
    type: 'alipay',
    name: '支付宝收款码',
    account: '支付宝: ali****6666',
    iconUrl: 'https://img.icons8.com/color/48/alipay.png',
    isDefault: false,
  },
])

// 导航方法
function goToWithdraw() {
  withdrawalDrawerVisible.value = true
}

function goToWithdrawalMethods() {
  uni.navigateTo({ url: '/pages/owner/withdrawal-methods' })
}

function goToWithdrawalRecords() {
  currentTab.value = 'withdrawal'
}

function goToRevenueDetails() {
  currentTab.value = 'revenue'
}

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap: Record<string, string> = {
    settled: 'text-green-600 bg-green-100',
    pending: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100',
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getWithdrawalStatusStyle(status: string) {
  const statusMap: Record<string, string> = {
    completed: 'text-green-600 bg-green-100',
    processing: 'text-orange-600 bg-orange-100',
    failed: 'text-red-600 bg-red-100',
    pending: 'text-blue-600 bg-blue-100',
  }
  return statusMap[status] || 'text-gray-600 bg-gray-100'
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    settled: '已结算',
    pending: '待结算',
    failed: '结算失败',
  }
  return statusMap[status] || status
}

function getWithdrawalStatusText(status: string) {
  const statusMap: Record<string, string> = {
    completed: '已完成',
    processing: '处理中',
    failed: '失败',
    pending: '待处理',
  }
  return statusMap[status] || status
}

// 提现相关功能
function selectWithdrawalMethod(method: any) {
  selectedWithdrawalMethod.value = method
}

function submitWithdrawal() {
  if (!withdrawalAmount.value) {
    uni.showToast({ title: '请输入提现金额', icon: 'none' })
    return
  }

  const amount = Number.parseFloat(withdrawalAmount.value)
  if (amount <= 0) {
    uni.showToast({ title: '请输入正确的金额', icon: 'none' })
    return
  }

  if (amount > revenueData.value.balance) {
    uni.showToast({ title: '提现金额不能超过可用余额', icon: 'none' })
    return
  }

  if (!selectedWithdrawalMethod.value) {
    uni.showToast({ title: '请选择提现方式', icon: 'none' })
    return
  }

  // TODO: 调用提现API
  uni.showLoading({ title: '提交中...' })

  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({ title: '提现申请已提交', icon: 'success' })
    withdrawalDrawerVisible.value = false
    withdrawalAmount.value = ''
    selectedWithdrawalMethod.value = null
  }, 2000)
}

// 滚动监听
function onScroll(e: any) {
  const scrollTop = e.detail.scrollTop
  // 当滚动超过 300rpx 时（大概是卡片区域的高度），Tab 开始置顶显示背景
  isTabSticky.value = scrollTop > 300
}
</script>

<template>
  <view class="relative h-full flex flex-col bg-gray-50">
    <!-- 头部导航栏 -->
    <HeadBar
      bg-color="transparent"
    >
      <view class="relative h-full flex items-center">
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          收益管理
        </text>
      </view>
    </HeadBar>

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="h-full w-full" @scroll="onScroll">
      <view class="px-[32rpx] pt-[32rpx]">
        <!-- 可提现余额卡片 -->
        <view class="relative mb-[32rpx]">
          <!-- AI生成的背景图 -->
          <image
            src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/revenue_card_bg.png"
            class="absolute left-0 top-0 h-full w-full rounded-xl"
            mode="aspectFill"
            style="z-index: 0;"
          />

          <!-- 卡片内容 -->
          <view class="relative z-10 min-h-[160rpx] border border-white/30 rounded-xl bg-white/20 p-[32rpx] shadow-lg">
            <text class="mb-[8rpx] block text-[24rpx] text-white/90">
              可提现余额
            </text>
            <text class="mb-[24rpx] block text-[48rpx] text-white font-bold">
              ¥{{ revenueData.balance.toFixed(2) }}
            </text>

            <view class="space-y-[16rpx]">
              <!-- 提现方式设置 -->
              <view class="flex items-center justify-between">
                <text class="text-[20rpx] text-white/80">
                  提现方式
                </text>
                <view
                  class="flex items-center border border-white/40 rounded-full bg-white/20 px-[16rpx] py-[8rpx] backdrop-blur-sm transition-all duration-200 active:scale-95 space-x-[8rpx]"
                  @tap="goToWithdrawalMethods"
                >
                  <text class="i-material-symbols-settings text-[20rpx] text-white" />
                  <text class="text-[20rpx] text-white">
                    设置
                  </text>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view class="flex items-center justify-end space-x-[16rpx]">
                <view
                  class="border border-white/40 rounded-full bg-white/20 px-[24rpx] py-[12rpx] backdrop-blur-sm transition-all duration-200 active:scale-95"
                  @tap="goToWithdrawalRecords"
                >
                  <text class="text-[24rpx] text-white font-medium">
                    提现记录
                  </text>
                </view>
                <view
                  class="rounded-full bg-white px-[24rpx] py-[12rpx] transition-all duration-200 active:scale-95"
                  @tap="goToWithdraw"
                >
                  <text class="text-[24rpx] text-purple-600 font-medium">
                    立即提现
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 收益趋势卡片 -->
        <view class="mb-[32rpx] border border-white/20 rounded-xl bg-white/90 p-[32rpx] shadow-sm">
          <view class="mb-[24rpx] flex items-center justify-between">
            <text class="text-[28rpx] text-gray-800 font-semibold">
              收益趋势
            </text>
            <text class="i-material-symbols-trending-up text-[28rpx] text-green-600" />
          </view>

          <view class="grid grid-cols-4 gap-[16rpx]">
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-purple-600 font-bold">
                ¥{{ revenueData.revenue.today }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                今日
              </text>
            </view>
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-blue-600 font-bold">
                ¥{{ revenueData.revenue.thisWeek }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                本周
              </text>
            </view>
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-green-600 font-bold">
                ¥{{ revenueData.revenue.thisMonth.toLocaleString() }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                本月
              </text>
            </view>
            <view
              class="text-center"
            >
              <text class="block text-[28rpx] text-orange-600 font-bold">
                ¥{{ revenueData.revenue.total.toLocaleString() }}
              </text>
              <text class="text-[20rpx] text-gray-600">
                总计
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 标签切换 - sticky固定 -->
      <view
        class="sticky z-10 px-[32rpx] py-[16rpx] transition-all duration-300 -top-[1rpx]"
        :class="isTabSticky ? 'bg-gray-50 backdrop-blur-sm border-b border-gray-100 shadow-sm' : 'bg-transparent'"
      >
        <view class="flex items-center rounded-[10rpx] bg-gray-50 p-[8rpx]">
          <view
            class="flex-1 rounded-[16rpx] py-[16rpx] text-center transition-all duration-300"
            :class="currentTab === 'revenue' ? 'bg-white shadow-sm' : ''"
            @tap="goToRevenueDetails"
          >
            <text
              class="text-[26rpx] font-medium"
              :class="currentTab === 'revenue' ? 'text-purple-600' : 'text-gray-400'"
            >
              收益明细
            </text>
          </view>
          <view
            class="flex-1 rounded-[16rpx] py-[16rpx] text-center transition-all duration-300"
            :class="currentTab === 'withdrawal' ? 'bg-white shadow-sm' : ''"
            @tap="goToWithdrawalRecords"
          >
            <text
              class="text-[26rpx] font-medium"
              :class="currentTab === 'withdrawal' ? 'text-purple-600' : 'text-gray-400'"
            >
              提现记录
            </text>
          </view>
        </view>
      </view>

      <!-- 收益明细 -->
      <view v-if="currentTab === 'revenue'" class="px-[32rpx] pb-[48rpx] pt-[24rpx] space-y-[24rpx]">
        <view
          v-for="item in detailsData.revenueDetails"
          :key="item.id"
          class="overflow-hidden rounded-[20rpx] bg-white shadow-sm"
        >
          <!-- 头部：日期和状态 -->
          <view class="border-b border-white/10 from-green-50/50 to-emerald-50/50 bg-gradient-to-r px-[24rpx] py-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-gray-800 font-medium">
                {{ item.date }}
              </text>
              <text
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getStatusStyle(item.status)"
              >
                {{ getStatusText(item.status) }}
              </text>
            </view>
          </view>

          <!-- 主体：车辆和收益信息 -->
          <view class="p-[24rpx]">
            <!-- 车辆信息区域 -->
            <view class="mb-[20rpx] flex">
              <view class="h-[100rpx] w-[140rpx] flex-shrink-0">
                <image
                  :src="item.vehicle.image_url"
                  mode="aspectFill"
                  class="h-full w-full rounded-[12rpx]"
                />
              </view>
              <view class="ml-[20rpx] min-w-0 flex flex-1 flex-col justify-center">
                <text class="truncate text-[26rpx] text-black font-bold">
                  {{ item.vehicle.name }}
                </text>
                <view class="mt-[8rpx] flex items-center gap-x-[12rpx]">
                  <text class="rounded-[6rpx] bg-blue-50 px-[8rpx] py-[2rpx] text-[20rpx] text-blue-700 font-medium">
                    {{ item.vehicle.license_plate }}
                  </text>
                </view>
                <view class="mt-[6rpx] flex items-center">
                  <text class="i-material-symbols-person mr-[4rpx] text-[18rpx] text-gray-500" />
                  <text class="text-[22rpx] text-gray-600">
                    {{ item.user.name }}
                  </text>
                </view>
              </view>
              <!-- 收益金额 -->
              <view class="ml-[16rpx] min-w-[80rpx] flex flex-col items-end justify-between text-right">
                <text class="text-[32rpx] text-green-600 font-bold">
                  ¥{{ item.commission }}
                </text>
                <text class="mt-[4rpx] block text-[20rpx] text-gray-400">
                  {{ item.commissionRate }}% 分成
                </text>
              </view>
            </view>

            <!-- 订单详情 -->
            <view class="mb-[16rpx] rounded-[14rpx] bg-gray-50 p-[16rpx]">
              <view class="mb-[8rpx] flex items-center">
                <text class="i-material-symbols-receipt mr-[8rpx] text-[20rpx] text-green-600" />
                <text class="text-[22rpx] text-gray-600">
                  订单号：{{ item.orderNo }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[22rpx] text-gray-600">
                  订单总额：¥{{ item.totalAmount }}
                </text>
                <text class="rounded-full bg-purple-100 px-[12rpx] py-[4rpx] text-[18rpx] text-purple-600">
                  {{ item.packageType }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 提现记录 -->
      <view v-else class="px-[32rpx] pb-[48rpx] pt-[24rpx] space-y-[24rpx]">
        <view
          v-for="record in detailsData.withdrawalRecords"
          :key="record.id"
          class="overflow-hidden rounded-[20rpx] bg-white shadow-sm"
        >
          <!-- 提现单号和状态 -->
          <view class="border-b border-gray-100 bg-gray-50/50 px-[24rpx] py-[16rpx]">
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                {{ record.withdrawalNo }}
              </text>
              <text
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getWithdrawalStatusStyle(record.status)"
              >
                {{ getWithdrawalStatusText(record.status) }}
              </text>
            </view>
          </view>

          <!-- 提现详情 -->
          <view class="p-[24rpx] space-y-[16rpx]">
            <!-- 金额信息 -->
            <view class="rounded-lg bg-blue-50/50 p-[16rpx]">
              <view class="mb-[8rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  提现金额
                </text>
                <text class="text-[28rpx] text-blue-600 font-semibold">
                  ¥{{ record.amount.toFixed(2) }}
                </text>
              </view>
              <view class="mb-[8rpx] flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  手续费
                </text>
                <text class="text-[24rpx] text-orange-600">
                  -¥{{ record.fee.toFixed(2) }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  实际到账
                </text>
                <text class="text-[32rpx] text-green-600 font-bold">
                  ¥{{ record.actualAmount.toFixed(2) }}
                </text>
              </view>
            </view>

            <!-- 银行信息 -->
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">
                到账银行
              </text>
              <text class="text-[26rpx] text-gray-800">
                {{ record.bankName }} {{ record.bankAccount }}
              </text>
            </view>

            <!-- 时间信息 -->
            <view class="space-y-[8rpx]">
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  申请时间
                </text>
                <text class="text-[24rpx] text-gray-600">
                  {{ record.applyTime }}
                </text>
              </view>
              <view v-if="record.completeTime" class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">
                  完成时间
                </text>
                <text class="text-[24rpx] text-gray-600">
                  {{ record.completeTime }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 提现弹窗 -->
    <BottomDrawer
      v-model:visible="withdrawalDrawerVisible"
      title="立即提现"
      height="700rpx"
    >
      <view class="pt-[30rpx] space-y-[32rpx]">
        <!-- 可提现金额显示 -->
        <view class="rounded-[16rpx] from-purple-50 to-blue-50 bg-gradient-to-r p-[24rpx]">
          <view class="mb-[8rpx] flex items-center justify-between">
            <text class="text-[24rpx] text-gray-600">
              可提现余额
            </text>
            <text class="text-[32rpx] text-purple-600 font-bold">
              ¥{{ revenueData.balance.toFixed(2) }}
            </text>
          </view>
          <text class="text-[20rpx] text-gray-500">
            提现金额将扣除相应手续费
          </text>
        </view>

        <!-- 提现金额输入 -->
        <view>
          <text class="mb-[16rpx] block text-[26rpx] font-semibold">
            提现金额
          </text>
          <view class="relative">
            <input
              v-model="withdrawalAmount"
              class="w-full border border-gray-300 rounded-[12rpx] bg-gray-50 px-[24rpx] py-[20rpx] text-[28rpx] placeholder:text-gray-400"
              placeholder="请输入提现金额"
              type="digit"
            >
            <view
              class="absolute right-[16rpx] top-1/2 transform border border-purple-600 rounded-[8rpx] bg-purple-50 px-[16rpx] py-[8rpx] text-[20rpx] text-purple-600 -translate-y-1/2"
              @tap="withdrawalAmount = revenueData.balance.toString()"
            >
              全部
            </view>
          </view>
        </view>

        <!-- 提现方式选择 -->
        <view>
          <view class="mb-[16rpx] flex items-center justify-between">
            <text class="text-[26rpx] font-semibold">
              提现方式
            </text>
            <view
              class="flex items-center border border-purple-600 rounded-[8rpx] bg-purple-50 px-[12rpx] py-[6rpx] text-[20rpx] text-purple-600 space-x-[8rpx]"
              @tap="goToWithdrawalMethods"
            >
              <text class="i-material-symbols-add text-[16rpx]" />
              <text>添加</text>
            </view>
          </view>

          <view class="space-y-[12rpx]">
            <view
              v-for="method in withdrawalMethods"
              :key="method.id"
              class="border rounded-[12rpx] bg-white p-[20rpx] transition-all duration-200"
              :class="selectedWithdrawalMethod?.id === method.id ? 'border-purple-600 bg-purple-50' : 'border-gray-200'"
              @tap="selectWithdrawalMethod(method)"
            >
              <view class="flex items-center justify-between">
                <view class="flex items-center space-x-[16rpx]">
                  <image
                    v-if="method.iconUrl"
                    :src="method.iconUrl"
                    class="h-[32rpx] w-[32rpx]"
                    mode="aspectFit"
                  />
                  <text
                    v-else
                    class="text-[32rpx]"
                    :class="method.icon"
                    :style="{ color: method.type === 'bank' ? '#1976d2' : method.type === 'wechat' ? '#4caf50' : '#ff9800' }"
                  />
                  <view>
                    <text class="block text-[24rpx] font-medium">
                      {{ method.name }}
                    </text>
                    <text class="text-[20rpx] text-gray-500">
                      {{ method.account }}
                    </text>
                  </view>
                </view>
                <view class="flex items-center space-x-[8rpx]">
                  <text v-if="method.isDefault" class="rounded-full bg-orange-100 px-[8rpx] py-[2rpx] text-[18rpx] text-orange-600">
                    默认
                  </text>
                  <view
                    class="h-[20rpx] w-[20rpx] border-2 rounded-full"
                    :class="selectedWithdrawalMethod?.id === method.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'"
                  >
                    <view
                      v-if="selectedWithdrawalMethod?.id === method.id"
                      class="h-full w-full scale-50 rounded-full bg-white"
                    />
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 提现说明 -->
        <view class="rounded-[12rpx] bg-yellow-50 p-[16rpx]">
          <view class="mb-[8rpx] flex items-center space-x-[8rpx]">
            <text class="i-material-symbols-info text-[20rpx] text-yellow-600" />
            <text class="text-[22rpx] text-yellow-800 font-medium">
              提现说明
            </text>
          </view>
          <view class="text-[20rpx] text-yellow-700 space-y-[4rpx]">
            <text class="block">
              • 提现手续费：每笔2-5元
            </text>
            <text class="block">
              • 到账时间：工作日1-3小时，节假日顺延
            </text>
            <text class="block">
              • 单笔限额：最低10元，最高50,000元
            </text>
          </view>
        </view>

        <!-- 提交按钮 -->
        <view class="flex space-x-[16rpx]">
          <view
            class="flex-1 border border-gray-300 rounded-full bg-white py-[24rpx] text-center text-[26rpx] text-gray-600 font-medium"
            @tap="withdrawalDrawerVisible = false"
          >
            取消
          </view>
          <view
            class="flex-1 rounded-full py-[24rpx] text-center text-[26rpx] text-white font-medium"
            :class="withdrawalAmount && selectedWithdrawalMethod ? 'bg-purple-600' : 'bg-gray-300'"
            @tap="submitWithdrawal"
          >
            确认提现
          </view>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>
