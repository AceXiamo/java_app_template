<script setup lang="ts">
const activeTab = ref('all')
const countdownTime = ref('23:45:32')

// 切换订单状态tab
function switchTab(tab: string) {
  activeTab.value = tab
}

// 订单操作
function contactOwner() {
  uni.showToast({ title: '联系车主', icon: 'none' })
}

function renewOrder() {
  uni.showToast({ title: '续租订单', icon: 'none' })
}

function rateOrder() {
  uni.showToast({ title: '评价订单', icon: 'none' })
}

function reOrder() {
  uni.showToast({ title: '再次预订', icon: 'none' })
}

function viewDetail() {
  uni.navigateTo({ url: '/pages/order/detail' })
}

// 倒计时更新
onMounted(() => {
  setInterval(() => {
    // 简单的倒计时逻辑
    const parts = countdownTime.value.split(':').map(Number)
    let hours = parts[0]
    let minutes = parts[1]
    let seconds = parts[2]

    if (seconds > 0) {
      seconds--
    }
    else if (minutes > 0) {
      minutes--
      seconds = 59
    }
    else if (hours > 0) {
      hours--
      minutes = 59
      seconds = 59
    }

    countdownTime.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }, 1000)
})
</script>

<template>
  <view relative h-full flex flex-col overflow-y-auto bg-gray-50>
    <!-- 顶部导航 -->
    <view class="flex flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 pb-4 pt-6">
      <view class="flex items-center space-x-3">
        <text class="text-lg text-black font-semibold">
          我的订单
        </text>
      </view>
      <view class="flex items-center space-x-4">
        <text class="i-material-symbols-search text-xl text-gray-700" />
        <text class="i-material-symbols-more-horiz text-xl text-gray-700" />
      </view>
    </view>

    <!-- 订单状态筛选 -->
    <view class="flex-shrink-0 border-b border-gray-100 bg-white px-5 py-4">
      <view class="flex rounded-xl bg-gray-100 p-1 space-x-1">
        <button
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" :class="[
            activeTab === 'all' ? 'bg-purple-600 text-white' : 'text-gray-600',
          ]"
          @tap="switchTab('all')"
        >
          全部订单
        </button>
        <button
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" :class="[
            activeTab === 'ongoing' ? 'bg-purple-600 text-white' : 'text-gray-600',
          ]"
          @tap="switchTab('ongoing')"
        >
          进行中
        </button>
        <button
          class="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200" :class="[
            activeTab === 'cancelled' ? 'bg-purple-600 text-white' : 'text-gray-600',
          ]"
          @tap="switchTab('cancelled')"
        >
          已取消
        </button>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto bg-gray-50">
      <!-- 全部订单内容 -->
      <view v-if="activeTab === 'all'" class="p-5 space-y-4">
        <!-- 进行中订单 -->
        <view class="border border-gray-100 rounded-2xl bg-white p-4 shadow-sm">
          <view class="mb-3 flex items-center justify-between">
            <view class="flex items-center space-x-2">
              <view class="h-2 w-2 rounded-full bg-green-500" />
              <text class="text-sm text-gray-900 font-medium">
                进行中
              </text>
            </view>
            <text class="text-xs text-gray-500">
              订单号：QQ202412150001
            </text>
          </view>

          <view class="mb-4 flex items-center space-x-3">
            <view class="h-12 w-16 overflow-hidden rounded-lg">
              <image
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=48&q=80"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>
            <view class="flex-1">
              <text class="block text-base text-black font-semibold">
                特斯拉 Model 3
              </text>
              <text class="text-sm text-gray-600">
                电动 · 轿车
              </text>
            </view>
            <view class="text-right">
              <text class="block text-base text-black font-semibold">
                ¥299
              </text>
              <text class="text-xs text-gray-600">
                1天
              </text>
            </view>
          </view>

          <view class="mb-4 rounded-xl bg-gray-50 p-3">
            <view class="mb-2 flex items-center justify-between">
              <text class="text-sm text-gray-600">
                用车时间
              </text>
              <text class="text-sm text-black">
                12月15日 14:00 - 12月16日 14:00
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取车地点
              </text>
              <text class="text-sm text-black">
                人民广场地铁站
              </text>
            </view>
          </view>

          <!-- 取车码区域 -->
          <view class="mb-3 flex items-center justify-between">
            <view class="flex items-center space-x-4">
              <view>
                <view class="mb-1 flex items-center text-xs text-gray-600 space-x-1">
                  <text class="i-material-symbols-qr-code-scanner text-xs text-gray-600" />
                  <text>取车码</text>
                </view>
                <text class="text-3xl text-black font-bold tracking-wider">
                  8426
                </text>
              </view>
            </view>
            <view class="text-right">
              <text class="mb-1 block text-xs text-gray-600">
                剩余时间
              </text>
              <text class="text-base text-red-500 font-bold font-mono">
                {{ countdownTime }}
              </text>
            </view>
          </view>

          <view class="flex space-x-3">
            <button
              class="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-600 font-medium"
              @tap="contactOwner"
            >
              联系车主
            </button>
            <button
              class="flex-1 rounded-lg bg-purple-600 py-2 text-sm text-white font-medium"
              @tap="renewOrder"
            >
              续租
            </button>
          </view>
        </view>

        <!-- 已完成订单 -->
        <view class="border border-gray-100 rounded-2xl bg-white p-4 shadow-sm">
          <view class="mb-3 flex items-center justify-between">
            <view class="flex items-center space-x-2">
              <view class="h-2 w-2 rounded-full bg-gray-400" />
              <text class="text-sm text-gray-900 font-medium">
                已完成
              </text>
            </view>
            <text class="text-xs text-gray-500">
              订单号：QQ202412100001
            </text>
          </view>

          <view class="mb-4 flex items-center space-x-3">
            <view class="h-12 w-16 overflow-hidden rounded-lg">
              <image
                src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=48&q=80"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>
            <view class="flex-1">
              <text class="block text-base text-black font-semibold">
                比亚迪海豹
              </text>
              <text class="text-sm text-gray-600">
                电动 · 轿车
              </text>
            </view>
            <view class="text-right">
              <text class="block text-base text-black font-semibold">
                ¥199
              </text>
              <text class="text-xs text-gray-600">
                1天
              </text>
            </view>
          </view>

          <view class="mb-4 rounded-xl bg-gray-50 p-3">
            <view class="mb-2 flex items-center justify-between">
              <text class="text-sm text-gray-600">
                用车时间
              </text>
              <text class="text-sm text-black">
                12月10日 10:00 - 12月11日 10:00
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取车地点
              </text>
              <text class="text-sm text-black">
                虹桥机场T2
              </text>
            </view>
          </view>

          <view class="flex space-x-3">
            <button
              class="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-600 font-medium"
              @tap="rateOrder"
            >
              评价订单
            </button>
            <button
              class="flex-1 rounded-lg bg-purple-50 py-2 text-sm text-purple-600 font-medium"
              @tap="reOrder"
            >
              再次预订
            </button>
          </view>
        </view>

        <!-- 已取消订单 -->
        <view class="border border-gray-100 rounded-2xl bg-white p-4 shadow-sm">
          <view class="mb-3 flex items-center justify-between">
            <view class="flex items-center space-x-2">
              <view class="h-2 w-2 rounded-full bg-red-400" />
              <text class="text-sm text-gray-900 font-medium">
                已取消
              </text>
            </view>
            <text class="text-xs text-gray-500">
              订单号：QQ202412050001
            </text>
          </view>

          <view class="mb-4 flex items-center space-x-3">
            <view class="h-12 w-16 overflow-hidden rounded-lg">
              <image
                src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=48&q=80"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>
            <view class="flex-1">
              <text class="block text-base text-black font-semibold">
                宝马 iX3
              </text>
              <text class="text-sm text-gray-600">
                电动 · SUV
              </text>
            </view>
            <view class="text-right">
              <text class="block text-base text-black font-semibold">
                ¥399
              </text>
              <text class="text-xs text-gray-600">
                2天
              </text>
            </view>
          </view>

          <view class="mb-4 rounded-xl bg-gray-50 p-3">
            <view class="mb-2 flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取消原因
              </text>
              <text class="text-sm text-red-600">
                行程变更
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取消时间
              </text>
              <text class="text-sm text-black">
                12月05日 15:30
              </text>
            </view>
          </view>

          <view class="flex space-x-3">
            <button
              class="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-600 font-medium"
              @tap="viewDetail"
            >
              查看详情
            </button>
            <button
              class="flex-1 rounded-lg bg-purple-50 py-2 text-sm text-purple-600 font-medium"
              @tap="reOrder"
            >
              重新预订
            </button>
          </view>
        </view>
      </view>

      <!-- 进行中订单内容 -->
      <view v-if="activeTab === 'ongoing'" class="p-5 space-y-4">
        <!-- 只显示进行中的订单 -->
        <view class="border border-gray-100 rounded-2xl bg-white p-4 shadow-sm">
          <!-- 与上面进行中订单相同的内容 -->
          <view class="mb-3 flex items-center justify-between">
            <view class="flex items-center space-x-2">
              <view class="h-2 w-2 rounded-full bg-green-500" />
              <text class="text-sm text-gray-900 font-medium">
                进行中
              </text>
            </view>
            <text class="text-xs text-gray-500">
              订单号：QQ202412150001
            </text>
          </view>

          <!-- 车辆信息等内容... -->
          <view class="mb-4 flex items-center space-x-3">
            <view class="h-12 w-16 overflow-hidden rounded-lg">
              <image
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=48&q=80"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>
            <view class="flex-1">
              <text class="block text-base text-black font-semibold">
                特斯拉 Model 3
              </text>
              <text class="text-sm text-gray-600">
                电动 · 轿车
              </text>
            </view>
            <view class="text-right">
              <text class="block text-base text-black font-semibold">
                ¥299
              </text>
              <text class="text-xs text-gray-600">
                1天
              </text>
            </view>
          </view>

          <view class="mb-4 rounded-xl bg-gray-50 p-3">
            <view class="mb-2 flex items-center justify-between">
              <text class="text-sm text-gray-600">
                用车时间
              </text>
              <text class="text-sm text-black">
                12月15日 14:00 - 12月16日 14:00
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取车地点
              </text>
              <text class="text-sm text-black">
                人民广场地铁站
              </text>
            </view>
          </view>

          <!-- 取车码区域 -->
          <view class="mb-3 flex items-center justify-between py-4">
            <view class="flex items-center space-x-4">
              <view>
                <text class="mb-1 block text-xs text-gray-600">
                  取车码
                </text>
                <text class="text-3xl text-black font-bold tracking-wider">
                  8426
                </text>
              </view>
            </view>
            <view class="text-right">
              <text class="mb-1 block text-xs text-gray-600">
                剩余时间
              </text>
              <text class="text-base text-red-500 font-bold font-mono">
                {{ countdownTime }}
              </text>
            </view>
          </view>

          <view class="flex space-x-3">
            <button
              class="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-600 font-medium"
              @tap="contactOwner"
            >
              联系车主
            </button>
            <button
              class="flex-1 rounded-lg bg-purple-600 py-2 text-sm text-white font-medium"
              @tap="renewOrder"
            >
              续租
            </button>
          </view>
        </view>
      </view>

      <!-- 已取消订单内容 -->
      <view v-if="activeTab === 'cancelled'" class="p-5 space-y-4">
        <view class="border border-gray-100 rounded-2xl bg-white p-4 shadow-sm">
          <view class="mb-3 flex items-center justify-between">
            <view class="flex items-center space-x-2">
              <view class="h-2 w-2 rounded-full bg-red-400" />
              <text class="text-sm text-gray-900 font-medium">
                已取消
              </text>
            </view>
            <text class="text-xs text-gray-500">
              订单号：QQ202412050001
            </text>
          </view>

          <view class="mb-4 flex items-center space-x-3">
            <view class="h-12 w-16 overflow-hidden rounded-lg">
              <image
                src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=48&q=80"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
            </view>
            <view class="flex-1">
              <text class="block text-base text-black font-semibold">
                宝马 iX3
              </text>
              <text class="text-sm text-gray-600">
                电动 · SUV
              </text>
            </view>
            <view class="text-right">
              <text class="block text-base text-black font-semibold">
                ¥399
              </text>
              <text class="text-xs text-gray-600">
                2天
              </text>
            </view>
          </view>

          <view class="mb-4 rounded-xl bg-gray-50 p-3">
            <view class="mb-2 flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取消原因
              </text>
              <text class="text-sm text-red-600">
                行程变更
              </text>
            </view>
            <view class="flex items-center justify-between">
              <text class="text-sm text-gray-600">
                取消时间
              </text>
              <text class="text-sm text-black">
                12月05日 15:30
              </text>
            </view>
          </view>

          <view class="flex space-x-3">
            <button
              class="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-600 font-medium"
              @tap="viewDetail"
            >
              查看详情
            </button>
            <button
              class="flex-1 rounded-lg bg-purple-50 py-2 text-sm text-purple-600 font-medium"
              @tap="reOrder"
            >
              重新预订
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
