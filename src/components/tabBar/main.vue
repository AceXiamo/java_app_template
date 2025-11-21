<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import type { ServiceAreaValidation } from '@/api/map'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import CityDisplayDrawer from '@/components/CityDisplayDrawer.vue'
import { useLocationStore } from '@/store/location'
import { useHomeStore } from '@/store/home'

// 数据状态
const locationStore = useLocationStore()
const homeStore = useHomeStore()
const showDatePicker = ref(false)
const showMapPicker = ref(false)
const showCityDrawer = ref(false)
const searchForm = ref({
  city: '上海',
  address: '上海', // 显示的地址
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
  startTime: '09:00',
  endTime: '18:00',
  keywords: '',
})

// 计算显示的时间文本
const displayStartTime = computed(() => {
  const date = dayjs(searchForm.value.startDate)
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

  let dateText = ''
  if (searchForm.value.startDate === today) {
    dateText = '今天'
  }
  else if (searchForm.value.startDate === tomorrow) {
    dateText = '明天'
  }
  else {
    dateText = date.format('MM月DD日')
  }

  return `${dateText} ${searchForm.value.startTime}`
})

const displayEndTime = computed(() => {
  const date = dayjs(searchForm.value.endDate)
  const today = dayjs().format('YYYY-MM-DD')
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD')

  let dateText = ''
  if (searchForm.value.endDate === today) {
    dateText = '今天'
  }
  else if (searchForm.value.endDate === tomorrow) {
    dateText = '明天'
  }
  else {
    dateText = date.format('MM月DD日')
  }

  return `${dateText} ${searchForm.value.endTime}`
})

// 初始化搜索表单地址信息
function initSearchFormAddress() {
  if (locationStore.currentLocation) {
    const location = locationStore.currentLocation
    searchForm.value.city = location.city
    searchForm.value.address = location.formattedAddress || location.city
    searchForm.value.latitude = location.latitude
    searchForm.value.longitude = location.longitude
  }
  else {
    searchForm.value.city = locationStore.displayCity
    searchForm.value.address = locationStore.displayAddress
  }
}

// 搜索车辆
function searchVehicles() {
  // 检查服务状态
  if (locationStore.serviceAreaValidation) {
    const validation = locationStore.serviceAreaValidation

    // 如果服务未开通，给出提示
    if (!validation.isSupported || validation.status !== 'active') {
      let message = ''

      if (validation.status === 'coming_soon') {
        message = `${validation.cityName}服务即将开通，敬请期待！`
      }
      else if (validation.status === 'closed') {
        message = `${validation.cityName}服务暂时关闭，请稍后再试。`
      }
      else {
        message = '所选位置不在服务范围内'
      }

      uni.showModal({
        title: '服务提示',
        content: message,
        showCancel: true,
        cancelText: '重新选择',
        confirmText: '我知道了',
        success: (res) => {
          if (res.cancel) {
            showAddressPicker()
          }
        },
      })
      return
    }
  }

  const startDateTime = `${searchForm.value.startDate} ${searchForm.value.startTime}`
  const endDateTime = `${searchForm.value.endDate} ${searchForm.value.endTime}`

  // 使用 setJumpData 传递搜索参数
  const searchData = {
    city: searchForm.value.city,
    address: searchForm.value.address,
    latitude: searchForm.value.latitude,
    longitude: searchForm.value.longitude,
    keywords: searchForm.value.keywords || '',
    startTime: startDateTime,
    endTime: endDateTime,
    serviceAreaValidation: locationStore.serviceAreaValidation,
  }

  setJumpData('searchParams', searchData)

  uni.navigateTo({
    url: '/pages/vehicle/index',
  })
}

// 功能跳转
function goToMonthlyRental() {
  uni.navigateTo({ url: '/pages/monthly-rental/index' })
}

function goToMysteryBox() {
  uni.navigateTo({ url: '/pages/mystery-box/index' })
}

function goToRanking() {
  uni.navigateTo({ url: '/pages/ranking/index' })
}

function goToOwnerCertification() {
  uni.navigateTo({ url: '/pages/owner-certification/index' })
}

function goToCooperationForm() {
  uni.navigateTo({ url: '/pages/cooperation-form/index' })
}

function goToVehicleTestForm() {
  uni.navigateTo({ url: '/pages/vehicle-test-form/index' })
}

// 显示时间选择器
function showTimePicker() {
  showDatePicker.value = true
}

// 处理时间选择确认
function handleDateRangeConfirm(data: {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  startDateTime: string
  endDateTime: string
}) {
  searchForm.value.startDate = data.startDate
  searchForm.value.endDate = data.endDate
  searchForm.value.startTime = data.startTime
  searchForm.value.endTime = data.endTime
}

// 显示地址选择器
function showAddressPicker() {
  showMapPicker.value = true
}

// 处理地址选择确认
function handleAddressConfirm(data: {
  latitude: number
  longitude: number
  address: string
  formattedAddress: string
  poiName?: string
  serviceAreaValidation?: ServiceAreaValidation
}) {
  searchForm.value.latitude = data.latitude
  searchForm.value.longitude = data.longitude
  searchForm.value.address = data.formattedAddress || data.address

  // 更新服务区域验证信息
  if (data.serviceAreaValidation) {
    locationStore.updateServiceAreaValidation(data.serviceAreaValidation)
    searchForm.value.city = data.serviceAreaValidation.cityName || searchForm.value.city
  }

  // 更新显示地址
  locationStore.updateDisplayAddress(data.formattedAddress || data.address)

  // 同时更新位置存储，标记定位已完成
  homeStore.locationLoaded = true

  showMapPicker.value = false
}

// 处理显示城市抽屉
function handleShowCityDrawer() {
  showCityDrawer.value = true
}

// 监听 currentLocation 变化，自动更新 searchForm
watch(
  () => locationStore.currentLocation,
  (newLocation) => {
    if (newLocation) {
      searchForm.value.city = newLocation.city
      searchForm.value.address = newLocation.formattedAddress || newLocation.city
      searchForm.value.latitude = newLocation.latitude
      searchForm.value.longitude = newLocation.longitude
    }
  },
  { immediate: true },
)

// 监听 displayAddress 变化（兜底逻辑）
watch(
  () => locationStore.displayAddress,
  (newAddress) => {
    // 只有在没有 currentLocation 时才使用 displayAddress
    if (!locationStore.currentLocation && newAddress) {
      searchForm.value.address = newAddress
      searchForm.value.city = locationStore.displayCity
    }
  },
)

onMounted(() => {
  // 初始化搜索表单地址信息
  initSearchFormAddress()

  // 监听头部组件发送的城市点击事件
  uni.$on('showCityDrawer', handleShowCityDrawer)
})

// 组件销毁时移除事件监听
onUnmounted(() => {
  uni.$off('showCityDrawer', handleShowCityDrawer)
})
</script>

<template>
  <view class="relative h-full flex flex-col bg-[#f6f7fb]">
    <PageMainHead />

    <view class="flex-1 overflow-y-auto">
      <!-- 顶部 Hero 与轮播 -->
      <view class="relative h-[540rpx]">
        <view class="relative h-full overflow-hidden bg-gradient-to-br from-[#2e1a4f] via-[#3b1f6a] to-[#8b5cf6]">
          <swiper
            class="h-full w-full"
            :autoplay="true"
            :circular="true"
            :interval="4200"
            :indicator-dots="false"
          >
            <swiper-item v-for="banner in homeStore.banners" :key="banner.id">
              <image
                :src="banner.imageUrl"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
              <!-- Subtle gradient overlay for better text readability -->
              <view class="absolute inset-0 from-transparent via-black/10 to-black/40 bg-gradient-to-b" />
              <view class="absolute left-[40rpx] bottom-[64rpx] right-[40rpx] text-white">
                <text class="mb-[12rpx] block text-[38rpx] font-bold tracking-tight drop-shadow-lg">
                  {{ banner.title }}
                </text>
                <text class="text-[26rpx] text-white/90 drop-shadow-md">
                  {{ banner.subtitle }}
                </text>
              </view>
            </swiper-item>
          </swiper>
        </view>
      </view>

      <!-- 取还车信息卡 -->
      <view class="relative z-10 px-[32rpx] pb-[40rpx] -mt-[180rpx]">
        <view class="rounded-[28rpx] border border-[#e5e7eb] bg-white p-[32rpx] shadow-[0_20rpx_60rpx_-32rpx_rgba(15,23,42,0.25)] space-y-[26rpx]">
          <view class="flex items-start justify-between">
            <view>
              <text class="text-[30rpx] text-[#0f172a] font-bold">行程信息</text>
              <text class="mt-[6rpx] block text-[22rpx] text-[#6b7280]">
                选择地点与时间，立即查看可用车辆
              </text>
            </view>
            <view
              v-if="locationStore.serviceAreaValidation"
              class="rounded-full bg-[#f4eefe] px-[16rpx] py-[8rpx] text-[20rpx] text-[#8b5cf6] font-medium"
            >
              {{ locationStore.getServiceStatus().text || '服务状态' }}
            </view>
          </view>

          <view class="space-y-[16rpx]">
            <view class="flex items-center gap-2 rounded-[20rpx] border border-[#e5e7eb] bg-[#f8fafc] px-[20rpx] py-[18rpx]" @tap="showAddressPicker">
              <view class="flex flex-1 min-w-0 items-center">
                <view i-material-symbols:location-on class="text-[32rpx] flex-none text-[#8b5cf6]" />
                <view class="ml-[12rpx] min-w-0">
                  <text class="block text-[24rpx] text-[#6b7280]">取还车地点</text>
                  <text class="block truncate text-[30rpx] text-[#111827] font-semibold">{{ searchForm.address }}</text>
                </view>
              </view>
              <view class="flex items-center text-[22rpx] text-[#6b7280]">
                <text class="mr-[6rpx]">更改</text>
                <view i-material-symbols:chevron-right class="text-[20rpx]" />
              </view>
            </view>

            <view class="flex items-center rounded-[20rpx] border border-[#e5e7eb] bg-[#f8fafc] px-[20rpx] py-[18rpx]" @tap="showTimePicker">
              <view class="flex-1">
                <view class="text-[24rpx] text-[#6b7280]">取车时间</view>
                <view class="mt-[6rpx] text-[28rpx] text-[#0f172a] font-semibold">
                  {{ displayStartTime }}
                </view>
              </view>
              <view class="mx-[24rpx] h-[60rpx] w-[1rpx] bg-[#e5e7eb]" />
              <view class="flex-1 text-right">
                <view class="text-[24rpx] text-[#6b7280]">还车时间</view>
                <view class="mt-[6rpx] text-[28rpx] text-[#0f172a] font-semibold">
                  {{ displayEndTime }}
                </view>
              </view>
            </view>

            <view class="relative flex items-center rounded-[20rpx] border border-solid border-[#e5e7eb] bg-white">
              <view i-lucide:search class="absolute left-[24rpx] text-[26rpx] text-[#94a3b8]" />
              <input
                v-model="searchForm.keywords"
                type="text"
                placeholder="输入品牌/车系，快速定位车型"
                class="w-full rounded-[20rpx] py-[20rpx] pl-[72rpx] pr-[24rpx] text-[26rpx] text-[#111827] placeholder:text-[#94a3b8]"
              >
            </view>

            <view
              v-if="locationStore.serviceAreaValidation && !locationStore.getServiceStatus().isActive"
              class="flex items-center rounded-[16rpx] bg-[#fff4ec] px-[16rpx] py-[12rpx] text-[22rpx] text-[#c2410c]"
            >
              <view class="i-material-symbols:info mr-[8rpx] text-[22rpx]" />
              <text>{{ locationStore.getServiceStatus().text === '即将开通' ? '当前城市即将开通，敬请期待' : '所选位置不在服务范围内' }}</text>
            </view>
          </view>

          <view
            class="w-full rounded-full bg-[#8b5cf6] py-[26rpx] text-center text-[28rpx] font-semibold text-white shadow-md transition-all active:opacity-90"
            :class="locationStore.serviceAreaValidation && !locationStore.getServiceStatus().isActive ? 'opacity-60' : ''"
            @tap="searchVehicles"
          >
            <text>{{ locationStore.serviceAreaValidation && !locationStore.getServiceStatus().isActive ? '服务准备中' : '立即找车' }}</text>
          </view>
        </view>
      </view>

      <!-- 价值主张横幅 -->
      <view class="px-[32rpx] pb-[28rpx]">
        <view
          class="relative overflow-hidden rounded-[24rpx] border border-[#e5e7eb] bg-white shadow-sm"
        >
          <image
            src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/home_3.jpg"
            class="absolute right-0 top-0 h-full w-[55%] object-cover"
            mode="aspectFill"
          />
          <view class="absolute inset-y-0 right-0 w-[55%] from-white via-white/60 to-transparent bg-gradient-to-l" />
          <view class="relative z-10 w-[60%] px-[28rpx] py-[24rpx] space-y-[12rpx]">
            <text class="block text-[30rpx] text-[#0f172a] font-bold">一站式出行服务</text>
            <text class="block text-[24rpx] text-[#6b7280] leading-relaxed">
              到店/送车、押金保障、7x24 服务并行，企业与个人均可开通
            </text>
            <view class="grid grid-cols-3 gap-[10rpx] pt-[4rpx]">
              <view class="flex items-center text-[20rpx] text-[#475569]">
                <view i-material-symbols:schedule class="mr-[6rpx] text-[18rpx] text-[#8b5cf6]" />
                即租即走
              </view>
              <view class="flex items-center text-[20rpx] text-[#475569]">
                <view i-material-symbols:verified-user class="mr-[6rpx] text-[18rpx] text-[#8b5cf6]" />
                押金安全
              </view>
              <view class="flex items-center text-[20rpx] text-[#475569]">
                <view i-material-symbols:support-agent class="mr-[6rpx] text-[18rpx] text-[#8b5cf6]" />
                7x24客服
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 特色功能栏 -->
      <view class="px-[32rpx] pb-[48rpx]">
        <view class="grid grid-cols-2 gap-[28rpx]">
          <view
            class="relative overflow-hidden rounded-[28rpx] border border-[#dfe4ee] bg-[#2e1a4f] shadow-[0_20rpx_60rpx_-28rpx_rgba(46,26,79,0.45)]"
            @tap="goToMonthlyRental"
          >
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/home_1.png"
              class="absolute inset-0 h-full w-full object-cover opacity-70"
              mode="aspectFill"
            />
            <view class="absolute inset-0 from-[#2e1a4f]/92 via-[#3b1f6a]/80 to-transparent bg-gradient-to-r" />
            <view class="relative z-10 p-[28rpx] space-y-[10rpx] flex flex-col">
              <view class="flex items-center justify-between">
                <view i-lets-icons:calendar-duotone class="text-[48rpx] text-white drop-shadow-sm" />
                <text class="rounded-full bg-white/90 px-[14rpx] py-[6rpx] text-[22rpx] text-[#ff7a1a] font-medium">
                  HOT
                </text>
              </view>
              <text class="block text-[30rpx] text-white font-semibold">超值月租</text>
              <text class="text-[24rpx] text-white/80">企业/长租低至 8 折，含基础保障</text>
            </view>
          </view>

          <view
            class="rounded-[28rpx] border border-[#e5e7eb] bg-white p-[28rpx] shadow-[0_10rpx_40rpx_-24rpx_rgba(15,23,42,0.3)] space-y-[12rpx] flex flex-col"
            @tap="goToMysteryBox"
          >
            <view class="flex items-center justify-between">
              <view i-duo-icons:box-2 class="text-[48rpx] text-[#8b5cf6]" />
              <text class="rounded-full bg-[#f4eefe] px-[14rpx] py-[6rpx] text-[22rpx] text-[#8b5cf6]">
                NEW
              </text>
            </view>
            <text class="text-[30rpx] text-[#0f172a] font-semibold">神秘盲盒</text>
            <text class="text-[24rpx] text-[#6b7280]">限量车型随机送达，惊喜优价</text>
          </view>

          <view
            class="rounded-[28rpx] border border-[#e5e7eb] bg-white p-[28rpx] shadow-[0_10rpx_40rpx_-24rpx_rgba(15,23,42,0.3)] space-y-[12rpx] flex flex-col"
            @tap="goToRanking"
          >
            <view class="flex items-center justify-between">
              <view i-lets-icons:chart-duotone class="text-[48rpx] text-[#10b981]" />
              <text class="rounded-full bg-[#dcfce7] px-[14rpx] py-[6rpx] text-[22rpx] text-[#15803d]">
                热门
              </text>
            </view>
            <text class="text-[30rpx] text-[#0f172a] font-semibold">用车榜单</text>
            <text class="text-[24rpx] text-[#6b7280]">高分车型、近场好评即时推荐</text>
          </view>

          <view
            class="relative overflow-hidden rounded-[28rpx] border border-[#dfe4ee] bg-[#2e1a4f] shadow-[0_20rpx_60rpx_-28rpx_rgba(46,26,79,0.45)]"
            @tap="goToOwnerCertification"
          >
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/home_2.png"
              class="absolute inset-0 h-full w-full object-cover opacity-70"
              mode="aspectFill"
            />
            <view class="absolute inset-0 from-[#2e1a4f]/92 via-[#3b1f6a]/80 to-transparent bg-gradient-to-r" />
            <view class="relative z-10 p-[28rpx] space-y-[10rpx] flex flex-col">
              <view class="flex items-center justify-between">
                <view i-lets-icons:user-duotone class="text-[48rpx] text-white drop-shadow-sm" />
                <text class="rounded-full bg-white/90 px-[14rpx] py-[6rpx] text-[22rpx] text-[#8b5cf6] font-medium">
                  认证
                </text>
              </view>
              <text class="text-[30rpx] text-white font-semibold">车主认证</text>
              <text class="text-[24rpx] text-white/80">上架车辆、收益结算、专属客服</text>
            </view>
          </view>

          <view
            class="rounded-[28rpx] border border-[#e5e7eb] bg-white p-[28rpx] shadow-[0_10rpx_40rpx_-24rpx_rgba(15,23,42,0.3)] space-y-[12rpx] flex flex-col"
            @tap="goToCooperationForm"
          >
            <view class="flex items-center justify-between">
              <view i-lets-icons:user-add-alt-duotone class="text-[48rpx] text-[#2e1a4f]" />
              <text class="rounded-full bg-[#efe9fe] px-[14rpx] py-[6rpx] text-[22rpx] text-[#2e1a4f]">
                合作
              </text>
            </view>
            <text class="text-[30rpx] text-[#0f172a] font-semibold">同行合作</text>
            <text class="text-[24rpx] text-[#6b7280]">渠道/企业合作，专人支持</text>
          </view>

          <view
            class="rounded-[28rpx] border border-[#e5e7eb] bg-white p-[28rpx] shadow-[0_10rpx_40rpx_-24rpx_rgba(15,23,42,0.3)] space-y-[12rpx] flex flex-col"
            @tap="goToVehicleTestForm"
          >
            <view class="flex items-center justify-between">
              <view i-lets-icons:send-hor-duotone class="text-[48rpx] text-[#8b5cf6]" />
              <text class="rounded-full bg-[#f4eefe] px-[14rpx] py-[6rpx] text-[22rpx] text-[#8b5cf6]">
                测试
              </text>
            </view>
            <text class="text-[30rpx] text-[#0f172a] font-semibold">竞品车测试</text>
            <text class="text-[24rpx] text-[#6b7280]">试驾/评测预约，一键提交</text>
          </view>
        </view>
      </view>
    </view>

    <DateRangePicker
      v-model:visible="showDatePicker"
      :start-date="searchForm.startDate"
      :end-date="searchForm.endDate"
      :start-time="searchForm.startTime"
      :end-time="searchForm.endTime"
      @confirm="handleDateRangeConfirm"
    />

    <MapAddressPicker
      v-model:visible="showMapPicker"
      :latitude="searchForm.latitude"
      :longitude="searchForm.longitude"
      @confirm="handleAddressConfirm"
    />

    <CityDisplayDrawer v-model:visible="showCityDrawer" />
  </view>
</template>
