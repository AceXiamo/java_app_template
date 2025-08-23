<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import dayjs from 'dayjs'
import { getCurrentLocation, getHomeBanners } from '@/api/home'
import type { Banner } from '@/api/home'
import type { AddressInfoWithValidation, ServiceAreaValidation } from '@/api/map'
import DateRangePicker from '@/components/DateRangePicker.vue'
import MapAddressPicker from '@/components/MapAddressPicker.vue'
import CityDisplayDrawer from '@/components/CityDisplayDrawer.vue'
import { useLocationStore } from '@/store/location'

// 数据状态
const banners = ref<Banner[]>([])
const locationStore = useLocationStore()
const loading = ref(false)
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

// 获取轮播图数据
async function loadBanners() {
  try {
    loading.value = true
    const response = await getHomeBanners()
    console.log('轮播图API响应:', response)

    if (response.code === 200 && response.data && response.data.banners) {
      banners.value = response.data.banners
    }
    else {
      throw new Error(`API返回错误: ${response.msg || '未知错误'}`)
    }
  }
  catch (error) {
    console.error('获取轮播图失败:', error)

    // 显示用户友好的错误提示
    uni.showToast({
      title: '轮播图加载失败，已使用默认数据',
      icon: 'none',
      duration: 2000,
    })

    // 设置默认轮播图
    banners.value = [
      {
        id: 1,
        title: '新用户首单5折',
        subtitle: '驾驭未来，选择电动',
        imageUrl:
          'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        linkType: 'page',
        linkUrl: '/pages/activity/newUser',
        isActive: true,
      },
      {
        id: 2,
        title: '月租8折优惠',
        subtitle: '长期租赁，更多优惠',
        imageUrl:
          'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        linkType: 'page',
        linkUrl: '/pages/monthly-rental',
        isActive: true,
      },
      {
        id: 3,
        title: '盲盒惊喜价',
        subtitle: '¥99起，神秘车型等你解锁',
        imageUrl:
          'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        linkType: 'page',
        linkUrl: '/pages/mystery-box',
        isActive: true,
      },
    ]
  }
  finally {
    loading.value = false
  }
}

// 获取位置信息
async function getLocation() {
  try {
    const location = await uni.getLocation({
      type: 'wgs84',
    })

    console.log('获取到设备位置:', location)

    const response = await getCurrentLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    })

    console.log('位置API响应:', response)

    if (response.code === 200 && response.data) {
      const addressData = response.data.address
      const validationData = response.data.serviceAreaValidation

      if (addressData) {
        // 构造完整的地址信息对象
        const fullAddressInfo = {
          ...addressData,
          serviceAreaValidation: validationData,
        }

        // 更新位置存储
        locationStore.updateLocation(fullAddressInfo)

        searchForm.value.city = addressData.city
        searchForm.value.address = addressData.formattedAddress || addressData.city
        searchForm.value.latitude = addressData.latitude
        searchForm.value.longitude = addressData.longitude
      }
    }
    else {
      throw new Error(`位置API返回错误: ${response.msg || '未知错误'}`)
    }
  }
  catch (error) {
    console.error('获取位置失败:', error)

    // 显示用户友好的错误提示
    uni.showToast({
      title: '定位失败，已使用默认位置',
      icon: 'none',
      duration: 2000,
    })

    searchForm.value.city = '上海'
    searchForm.value.address = '上海'
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
        message = `${validation.cityName}服务暂时关闭，请稍后再试或选择其他城市。`
      }
      else {
        message = `暂时无法在${validation.cityName}提供服务，请选择已开通服务的城市。`
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

  showMapPicker.value = false
}

// 处理显示城市抽屉
function handleShowCityDrawer() {
  showCityDrawer.value = true
}

onMounted(() => {
  loadBanners()
  getLocation()

  // 监听头部组件发送的城市点击事件
  uni.$on('showCityDrawer', handleShowCityDrawer)
})

// 组件销毁时移除事件监听
onUnmounted(() => {
  uni.$off('showCityDrawer', handleShowCityDrawer)
})
</script>

<template>
  <view relative h-full flex flex-col overflow-hidden bg-gray-50>
    <!-- 头部组件 -->
    <PageMainHead />

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <!-- 轮播图 - 扩展高度以便卡片覆盖 -->
      <view class="h-[640rpx]">
        <view
          class="relative h-full overflow-hidden from-purple-500 to-purple-600 bg-gradient-to-r"
        >
          <!-- 轮播图片 -->
          <swiper
            class="h-full w-full"
            :autoplay="true"
            :circular="true"
            :interval="4000"
            :indicator-dots="false"
          >
            <swiper-item v-for="banner in banners" :key="banner.id">
              <image
                :src="banner.imageUrl"
                class="h-full w-full object-cover"
                mode="aspectFill"
              />
              <view
                class="absolute inset-0 from-black/40 to-transparent bg-gradient-to-r"
              />
              <view
                class="absolute left-[48rpx] top-1/2 transform text-white -translate-y-1/2"
              >
                <text class="mb-[16rpx] block text-[40rpx] font-bold">
                  {{ banner.title }}
                </text>
                <text class="text-[28rpx] opacity-90">
                  {{ banner.subtitle }}
                </text>
              </view>
            </swiper-item>
          </swiper>
        </view>
      </view>

      <!-- 自助找车卡片 - 负边距实现覆盖效果 -->
      <view class="relative z-10 px-[40rpx] pb-[48rpx] -mt-[160rpx]">
        <view
          class="rounded-[32rpx] p-[40rpx] shadow-lg"
          style="background: linear-gradient(to bottom,rgba(255, 255, 255, 0.6) 0%,rgba(255, 255, 255, 1) 20%);"
        >
          <!-- 地点选择 -->
          <view class="mb-[48rpx] gap-[20rpx] flex items-center justify-between" @tap="showAddressPicker">
            <view class="min-w-0 flex flex-1 items-center">
              <view i-material-symbols:location-on class="text-[36rpx] text-purple-600 flex-none" />
              <text class="ml-[16rpx] truncate text-[36rpx] text-black font-medium">
                {{ searchForm.address }}
              </text>
            </view>
            <view class="flex items-center text-[24rpx] text-gray-500">
              <text class="mr-[8rpx]">
                选择地址
              </text>
              <view i-material-symbols:chevron-right class="text-[20rpx]" />
            </view>
          </view>

          <!-- 时间选择区域 -->
          <view class="mb-[32rpx]" @tap="showTimePicker">
            <view class="flex items-center justify-between">
              <view class="flex-1">
                <view class="mb-[8rpx] text-[24rpx] text-gray-500">
                  取车时间
                </view>
                <view class="text-[28rpx] text-black">
                  {{ displayStartTime }}
                </view>
              </view>
              <view class="mx-[32rpx] text-gray-400">
                —
              </view>
              <view class="flex-1 text-right">
                <view class="mb-[8rpx] text-[24rpx] text-gray-500">
                  还车时间
                </view>
                <view class="text-[28rpx] text-black">
                  {{ displayEndTime }}
                </view>
              </view>
            </view>
          </view>

          <!-- 搜索框 -->
          <view class="mb-[32rpx]">
            <view class="relative flex">
              <view
                i-lucide:search
                class="absolute left-[24rpx] top-1/2 transform text-[26rpx] text-gray-400 -translate-y-1/2"
              />
              <input
                v-model="searchForm.keywords"
                type="text"
                placeholder="品牌/车系"
                class="w-full border-0 rounded-[32rpx] bg-gray-50 py-[32rpx] pl-[72rpx] pr-[32rpx] text-[26rpx] text-black placeholder-gray-500"
              >
            </view>
          </view>

          <!-- 马上找车按钮 -->
          <view
            class="w-full rounded-full py-[24rpx] text-center text-[28rpx] font-medium transition-colors"
            :class="locationStore.serviceAreaValidation && !locationStore.getServiceStatus().isActive
              ? 'bg-gray-400 text-gray-200'
              : 'bg-purple-600 text-white'"
            @tap="searchVehicles"
          >
            <view v-if="locationStore.serviceAreaValidation && !locationStore.getServiceStatus().isActive"
                  class="flex items-center justify-center">
              <view class="i-material-symbols:info mr-[8rpx] text-[24rpx]" />
              <text>{{ locationStore.getServiceStatus().text === '即将开通' ? '即将开通' : '服务未开通' }}</text>
            </view>
            <text v-else>马上找车</text>
          </view>
        </view>
      </view>

      <view class="px-[40rpx] pb-[32rpx]">
        <view
          class="relative h-[280rpx] overflow-hidden rounded-[24rpx]"
          style="background-image: url(https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/home_3.jpg); background-size: auto 100%; background-position: right center; background-repeat: no-repeat;"
        >
          <!-- 渐变遮罩层 - 只在左侧40%区域 -->
          <view class="absolute left-0 top-0 z-[1] h-full w-[50%] from-white/90 via-white/70 to-transparent bg-gradient-to-r" />

          <!-- 文字内容层 - 限制在左侧40%区域 -->
          <view class="absolute left-0 top-0 z-10 h-full w-[50%] flex flex-col justify-between p-[25rpx] pr-0 box-border">
            <!-- 顶部标题区域 -->
            <view>
              <view class="mb-[16rpx] flex items-center">
                <text class="text-[28rpx] text-[#333] font-bold leading-tight">
                  一站式出行服务
                </text>
              </view>
              <text class="mb-[10rpx] text-[22rpx] text-[#666] leading-relaxed">
                更快 · 更便捷 · 更安心
              </text>
            </view>

            <!-- 底部服务特色区域 -->
            <view>
              <!-- 服务特色标签 - 垂直排列以适应宽度限制 -->
              <view class="grid grid-cols-2 mb-[10rpx] gap-[12rpx]">
                <view class="flex items-center">
                  <view i-material-symbols:schedule class="mr-[8rpx] text-[18rpx] text-purple-600" />
                  <text class="text-[18rpx] text-[#666]">
                    即租即走
                  </text>
                </view>
                <view class="flex items-center">
                  <view i-material-symbols:verified-user class="mr-[8rpx] text-[18rpx] text-purple-600" />
                  <text class="text-[18rpx] text-[#666]">
                    安全保障
                  </text>
                </view>
                <view class="flex items-center">
                  <view i-material-symbols:support-agent class="mr-[8rpx] text-[18rpx] text-purple-600" />
                  <text class="text-[18rpx] text-[#666]">
                    24小时服务
                  </text>
                </view>
              </view>

              <!-- 底部引导文字 -->
              <view>
                <text class="block text-[18rpx] text-purple-600 font-medium">
                  为您提供更好的出行体验
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 特色功能栏 -->
      <view class="px-[40rpx] pb-[48rpx]">
        <view class="grid grid-cols-2 gap-[32rpx]">
          <!-- 超值月租 -->
          <view
            class="relative overflow-hidden rounded-[32rpx] shadow-sm"
            @tap="goToMonthlyRental"
          >
            <!-- 背景图片 -->
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/home_1.png"
              class="absolute inset-0 h-full w-full object-cover"
              mode="aspectFill"
            />

            <!-- 内容层 -->
            <view class="relative z-10 p-[32rpx]">
              <view class="mb-[16rpx] flex items-center justify-between">
                <view
                  i-lets-icons:calendar-duotone
                  class="text-[48rpx] text-white drop-shadow-sm"
                />
                <text
                  class="rounded-full bg-white/90 px-[16rpx] py-[8rpx] text-[24rpx] text-orange-600 font-medium"
                >
                  HOT
                </text>
              </view>
              <text class="mb-[8rpx] block text-[28rpx] text-white font-semibold drop-shadow-sm">
                超值月租
              </text>
              <text class="text-[24rpx] text-white/90 drop-shadow-sm">
                低至8折优惠
              </text>
            </view>
          </view>

          <!-- 神秘盲盒 -->
          <view
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToMysteryBox"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view
                i-lets-icons:box-duotone
                class="text-[48rpx] text-purple-600"
              />
              <text
                class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[24rpx] text-purple-600"
              >
                NEW
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              神秘盲盒
            </text>
            <text class="text-[24rpx] text-gray-600">
              惊喜车型等你解锁
            </text>
          </view>

          <!-- 用车榜单 -->
          <view
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToRanking"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view i-lets-icons:chart-duotone class="text-[48rpx] text-green-600" />
              <text
                class="rounded-full bg-green-100 px-[16rpx] py-[8rpx] text-[24rpx] text-green-600"
              >
                热门
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              用车榜单
            </text>
            <text class="text-[24rpx] text-gray-600">
              热门车型推荐
            </text>
          </view>

          <!-- 车主认证 -->
          <view
            class="relative overflow-hidden rounded-[32rpx] shadow-sm"
            @tap="goToOwnerCertification"
          >
            <!-- 背景图片 -->
            <image
              src="https://xiamo-server.oss-cn-chengdu.aliyuncs.com/car_app/home_2.png"
              class="absolute inset-0 h-full w-full object-cover"
              mode="aspectFill"
            />

            <!-- 内容层 -->
            <view class="relative z-10 p-[32rpx]">
              <view class="mb-[16rpx] flex items-center justify-between">
                <view
                  i-lets-icons:user-duotone
                  class="text-[48rpx] text-white drop-shadow-sm"
                />
                <text
                  class="rounded-full bg-white/90 px-[16rpx] py-[8rpx] text-[24rpx] text-purple-600 font-medium"
                >
                  认证
                </text>
              </view>
              <text class="mb-[8rpx] block text-[28rpx] text-white font-semibold drop-shadow-sm">
                车主认证
              </text>
              <text class="text-[24rpx] text-white/90 drop-shadow-sm">
                成为车主赚收益
              </text>
            </view>
          </view>

          <!-- 同行合作 -->
          <view
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToCooperationForm"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view i-lets-icons:user-add-alt-duotone class="text-[48rpx] text-blue-600" />
              <text
                class="rounded-full bg-blue-100 px-[16rpx] py-[8rpx] text-[24rpx] text-blue-600"
              >
                合作
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              同行合作
            </text>
            <text class="text-[24rpx] text-gray-600">
              携手共建汽车生态
            </text>
          </view>

          <!-- 竞品车测试 -->
          <view
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToVehicleTestForm"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view i-lets-icons:send-hor-duotone class="text-[48rpx] text-purple-600" />
              <text
                class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[24rpx] text-purple-600"
              >
                测试
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              竞品车测试
            </text>
            <text class="text-[24rpx] text-gray-600">
              专业车辆测试服务
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间范围选择器 -->
    <DateRangePicker
      v-model:visible="showDatePicker"
      :start-date="searchForm.startDate"
      :end-date="searchForm.endDate"
      :start-time="searchForm.startTime"
      :end-time="searchForm.endTime"
      @confirm="handleDateRangeConfirm"
    />

    <!-- 地址选择器 -->
    <MapAddressPicker
      v-model:visible="showMapPicker"
      :latitude="searchForm.latitude"
      :longitude="searchForm.longitude"
      @confirm="handleAddressConfirm"
    />

    <!-- 城市展示抽屉 -->
    <CityDisplayDrawer v-model:visible="showCityDrawer" />
  </view>
</template>
