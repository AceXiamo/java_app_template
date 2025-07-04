<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { getCurrentLocation, getHomeBanners } from '@/api/home'
import type { Banner, LocationInfo } from '@/api/home'
import DateRangePicker from '@/components/DateRangePicker.vue'

// 数据状态
const banners = ref<Banner[]>([])
const currentLocation = ref<LocationInfo | null>(null)
const loading = ref(false)
const showDatePicker = ref(false)
const searchForm = ref({
  city: '上海',
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
        imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        linkType: 'page',
        linkUrl: '/pages/activity/newUser',
        isActive: true,
      },
      {
        id: 2,
        title: '月租8折优惠',
        subtitle: '长期租赁，更多优惠',
        imageUrl: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        linkType: 'page',
        linkUrl: '/pages/monthly-rental',
        isActive: true,
      },
      {
        id: 3,
        title: '盲盒惊喜价',
        subtitle: '¥99起，神秘车型等你解锁',
        imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
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
      currentLocation.value = response.data
      searchForm.value.city = response.data.city
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
  }
}

// 搜索车辆
function searchVehicles() {
  uni.navigateTo({
    url: `/pages/search/index?city=${searchForm.value.city}&keywords=${searchForm.value.keywords}`,
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
  uni.navigateTo({ url: '/pages/owner/certification' })
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

onMounted(() => {
  loadBanners()
  getLocation()
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
        <view class="relative h-full overflow-hidden from-purple-500 to-purple-600 bg-gradient-to-r">
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
              <view class="absolute inset-0 from-black/40 to-transparent bg-gradient-to-r" />
              <view class="absolute left-[48rpx] top-1/2 transform text-white -translate-y-1/2">
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
        <view class="rounded-[32rpx] p-[40rpx] shadow-lg" style="background: linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,1) 20%)">
          <!-- 地点选择 -->
          <view class="mb-[48rpx] flex items-center justify-between">
            <view class="flex items-center">
              <view
                i-material-symbols:location-on
                class="text-[36rpx] text-purple-600"
              />
              <text class="ml-[16rpx] text-[36rpx] text-black font-medium">
                {{ searchForm.city }}
              </text>
            </view>
            <text class="text-[24rpx] text-gray-500">
              请点击获取您的地理位置
            </text>
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
          <button
            class="w-full rounded-full bg-purple-600 py-[24rpx] text-[28rpx] text-white font-medium"
            @tap="searchVehicles"
          >
            马上找车
          </button>
        </view>
      </view>

      <!-- 特色功能栏 -->
      <view class="px-[40rpx] pb-[48rpx]">
        <view class="grid grid-cols-2 gap-[32rpx]">
          <!-- 超值月租 -->
          <view
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToMonthlyRental"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view
                i-material-symbols:calendar-month
                class="text-[48rpx] text-orange-600"
              />
              <text class="rounded-full bg-orange-100 px-[16rpx] py-[8rpx] text-[24rpx] text-orange-600">
                HOT
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              超值月租
            </text>
            <text class="text-[24rpx] text-gray-600">
              低至8折优惠
            </text>
          </view>

          <!-- 百元盲盒 -->
          <view
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToMysteryBox"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view
                i-material-symbols:card-giftcard
                class="text-[48rpx] text-purple-600"
              />
              <text class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[24rpx] text-purple-600">
                NEW
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              百元盲盒
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
              <view
                i-material-symbols:trending-up
                class="text-[48rpx] text-green-600"
              />
              <text class="rounded-full bg-green-100 px-[16rpx] py-[8rpx] text-[24rpx] text-green-600">
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
            class="border border-gray-100 rounded-[32rpx] bg-white p-[32rpx] shadow-sm"
            @tap="goToOwnerCertification"
          >
            <view class="mb-[16rpx] flex items-center justify-between">
              <view
                i-material-symbols:verified-user
                class="text-[48rpx] text-purple-600"
              />
              <text class="rounded-full bg-purple-100 px-[16rpx] py-[8rpx] text-[24rpx] text-purple-600">
                认证
              </text>
            </view>
            <text class="mb-[8rpx] block text-[28rpx] text-black font-semibold">
              车主认证
            </text>
            <text class="text-[24rpx] text-gray-600">
              成为车主赚收益
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
  </view>
</template>
