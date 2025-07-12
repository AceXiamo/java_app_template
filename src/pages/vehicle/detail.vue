<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import PageVehicleDetailHead from '@/components/page/vehicle/Head.vue'
import BottomDrawer from '@/components/BottomDrawer.vue'

// 页面参数
const vehicleId = ref('')

// 车辆详情数据
const vehicleDetail = ref({
  vehicleId: 0,
  name: '',
  brand: '',
  model: '',
  licensePlate: '',
  year: '',
  transmission: '',
  carType: '',
  energyType: '',
  seats: 5,
  dailyPrice: 0,
  monthlyPrice: 0,
  imageUrl: '',
  images: [] as string[],
  rangeKm: 0,
  rating: 0,
  ratingCount: 0,
  status: 'available',
  isMonthlyRental: false,
  tags: [] as any[],
  location: {
    address: '',
    latitude: 0,
    longitude: 0,
    distance: 0,
  },
  deliveryEnabled: true,
  deliveryBaseFee: 0,
  deliveryFreeDistance: 5,
  deliveryPricePerKm: 2,
  maxDeliveryDistance: 20,
  owner: {
    ownerId: 0,
    nickname: '',
    avatar: '',
    rating: 0,
    vehicleCount: 0,
  },
})

// 页面状态
const loading = ref(false)
const currentImageIndex = ref(0)
const showImageViewer = ref(false)
const showBookingPanel = ref(false)

// 预订参数
const bookingParams = ref({
  startTime: '',
  endTime: '',
  rentalDays: 1,
})

// 评价列表
const reviews = ref([])
const showAllReviews = ref(false)

// 相似车辆
const similarVehicles = ref([])

// 页面加载
onLoad((options: any) => {
  vehicleId.value = options.id || ''
  loadVehicleDetail()
  loadSimilarVehicles()
  loadReviews()
})

// 加载车辆详情
async function loadVehicleDetail() {
  try {
    loading.value = true
    // TODO: 调用车辆详情API
    // const response = await getVehicleDetail(vehicleId.value)
    // vehicleDetail.value = response.data
    
    // 模拟数据
    vehicleDetail.value = {
      vehicleId: 1,
      name: '特斯拉 Model 3',
      brand: '特斯拉',
      model: 'Model 3',
      licensePlate: '沪A·123***',
      year: '2023款',
      transmission: '自动挡',
      carType: '轿车',
      energyType: '纯电动',
      seats: 5,
      dailyPrice: 380,
      monthlyPrice: 9120,
      imageUrl: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
      images: [
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89',
        'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2',
        'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2',
        'https://images.unsplash.com/photo-1583121274602-3e2820c69888',
      ],
      rangeKm: 556,
      rating: 4.9,
      ratingCount: 312,
      status: 'available',
      isMonthlyRental: true,
      tags: [
        { tagName: '热门', tagType: 'hot', tagColor: '#FF6B35' },
        { tagName: '新车', tagType: 'new', tagColor: '#28A745' },
      ],
      location: {
        address: '上海市徐汇区肇嘉浜路101号',
        latitude: 31.208847,
        longitude: 121.445773,
        distance: 2.3,
      },
      deliveryEnabled: true,
      deliveryBaseFee: 20,
      deliveryFreeDistance: 5,
      deliveryPricePerKm: 3,
      maxDeliveryDistance: 20,
      owner: {
        ownerId: 1,
        nickname: '李车主',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
        rating: 4.8,
        vehicleCount: 3,
      },
    }
  } catch (error) {
    console.error('加载车辆详情失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'error',
    })
  } finally {
    loading.value = false
  }
}

// 加载相似车辆
async function loadSimilarVehicles() {
  try {
    // TODO: 调用相似车辆API
    // const response = await getSimilarVehicles(vehicleId.value)
    // similarVehicles.value = response.data
    
    // 模拟数据
    similarVehicles.value = [
      {
        vehicleId: 2,
        name: '特斯拉 Model Y',
        imageUrl: 'https://images.unsplash.com/photo-1561580125-028ee3bd62eb',
        dailyPrice: 450,
        rating: 4.8,
        distance: 1.5,
      },
      {
        vehicleId: 3,
        name: '蔚来 ES6',
        imageUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a',
        dailyPrice: 420,
        rating: 4.7,
        distance: 3.2,
      },
    ]
  } catch (error) {
    console.error('加载相似车辆失败:', error)
  }
}

// 加载评价
async function loadReviews() {
  try {
    // TODO: 调用评价API
    // const response = await getVehicleReviews(vehicleId.value)
    // reviews.value = response.data
    
    // 模拟数据
    reviews.value = [
      {
        reviewId: 1,
        userName: '张**',
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde',
        rating: 5,
        content: '车况很好，车主很好沟通，推荐！',
        createTime: '2024-07-01',
        images: [],
      },
      {
        reviewId: 2,
        userName: '王**',
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        rating: 4,
        content: '电车很安静，续航也够用，就是充电有点麻烦。',
        createTime: '2024-06-28',
        images: [],
      },
    ]
  } catch (error) {
    console.error('加载评价失败:', error)
  }
}

// 计算月租折扣
const monthlyDiscount = computed(() => {
  if (!vehicleDetail.value.monthlyPrice || vehicleDetail.value.monthlyPrice <= 0) {
    return null
  }
  
  const monthlyByDaily = vehicleDetail.value.dailyPrice * 30
  const discount = vehicleDetail.value.monthlyPrice / monthlyByDaily
  
  if (discount >= 0.95) {
    return null
  }
  
  const discountPercent = Math.round(discount * 10)
  const savings = monthlyByDaily - vehicleDetail.value.monthlyPrice
  
  return {
    discountPercent,
    savings,
    originalPrice: monthlyByDaily,
    monthlyPrice: vehicleDetail.value.monthlyPrice,
  }
})

// 获取标签样式
function getTagStyle(tagType: string) {
  const styles: Record<string, string> = {
    hot: 'bg-red-500',
    new: 'bg-green-500',
    luxury: 'bg-purple-500',
    discount: 'bg-orange-500',
    featured: 'bg-blue-500',
  }
  return styles[tagType] || 'bg-gray-500'
}

// 格式化距离
function formatDistance(distance: number) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

// 查看大图
function viewImage(index: number) {
  currentImageIndex.value = index
  showImageViewer.value = true
}

// 联系车主
function contactOwner() {
  uni.showModal({
    title: '联系车主',
    content: '是否要拨打车主电话？',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '13800138000',
        })
      }
    },
  })
}

// 收藏车辆
function toggleFavorite() {
  // TODO: 实现收藏功能
  uni.showToast({
    title: '收藏成功',
    icon: 'success',
  })
}

// 分享车辆
function shareVehicle() {
  uni.share({
    provider: 'weixin',
    scene: 'WXSceneSession',
    type: 0,
    href: '',
    title: vehicleDetail.value.name,
    summary: `日租¥${vehicleDetail.value.dailyPrice}起`,
    imageUrl: vehicleDetail.value.imageUrl,
  })
}

// 立即预订
function bookNow() {
  if (!bookingParams.value.startTime || !bookingParams.value.endTime) {
    showBookingPanel.value = true
    return
  }
  
  // 跳转到预订页面
  const query = new URLSearchParams({
    vehicleId: vehicleId.value,
    startTime: bookingParams.value.startTime,
    endTime: bookingParams.value.endTime,
  }).toString()
  
  uni.navigateTo({
    url: `/pages/booking/index?${query}`,
  })
}

// 查看相似车辆详情
function viewSimilarVehicle(vehicle: any) {
  uni.navigateTo({
    url: `/pages/vehicle/detail?id=${vehicle.vehicleId}`,
  })
}

// 设置预订时间
function setBookingTime() {
  // TODO: 实现时间选择器
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  
  bookingParams.value.startTime = tomorrow.toISOString()
  bookingParams.value.endTime = dayAfter.toISOString()
  bookingParams.value.rentalDays = 1
  
  showBookingPanel.value = false
  bookNow()
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <PageVehicleDetailHead 
      @favorite="toggleFavorite"
      @share="shareVehicle"
    />

    <!-- 主要内容区域 -->
    <scroll-view scroll-y class="flex-1">
      <!-- 车辆图片轮播 -->
      <view class="relative">
        <swiper 
          class="h-[400rpx]" 
          indicator-dots 
          indicator-color="rgba(255,255,255,0.5)"
          indicator-active-color="#fff"
          @change="(e: any) => currentImageIndex = e.detail.current"
        >
          <swiper-item v-for="(image, index) in vehicleDetail.images" :key="index">
            <image 
              :src="image" 
              mode="aspectFill" 
              class="h-full w-full"
              @tap="viewImage(index)"
            />
          </swiper-item>
        </swiper>
        
        <!-- 图片指示器 -->
        <view class="absolute bottom-[24rpx] right-[24rpx] rounded-[20rpx] bg-black bg-opacity-50 px-[16rpx] py-[8rpx]">
          <text class="text-[24rpx] text-white">
            {{ currentImageIndex + 1 }}/{{ vehicleDetail.images.length }}
          </text>
        </view>

        <!-- 标签 -->
        <view class="absolute left-[24rpx] top-[24rpx] flex flex-col space-y-[8rpx]">
          <view
            v-for="tag in vehicleDetail.tags.slice(0, 2)"
            :key="tag.tagName"
            class="w-max rounded-[12rpx] px-[12rpx] py-[6rpx] text-[20rpx] text-white font-medium"
            :class="getTagStyle(tag.tagType)"
          >
            {{ tag.tagName }}
          </view>
        </view>
      </view>

      <view class="p-[24rpx] space-y-[24rpx]">
        <!-- 基本信息 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx]">
            <text class="block text-[36rpx] text-black font-bold leading-[48rpx]">
              {{ vehicleDetail.name }}
            </text>
            <view class="mt-[8rpx] flex items-center space-x-[16rpx] text-[24rpx] text-gray-600">
              <text>{{ vehicleDetail.licensePlate }}</text>
              <text>{{ vehicleDetail.year }}</text>
              <text>{{ vehicleDetail.transmission }}</text>
            </view>
          </view>

          <!-- 价格信息 -->
          <view class="mb-[24rpx]">
            <view class="flex items-baseline">
              <text class="text-[40rpx] text-purple-600 font-bold">
                ¥{{ vehicleDetail.dailyPrice }}
              </text>
              <text class="ml-[8rpx] text-[24rpx] text-gray-500">/天</text>
            </view>
            
            <view v-if="monthlyDiscount" class="mt-[8rpx] flex items-center">
              <text class="mr-[12rpx] text-[24rpx] text-gray-400 line-through">
                ¥{{ (vehicleDetail.dailyPrice * 30).toFixed(0) }}
              </text>
              <text class="rounded-full bg-red-50 px-[12rpx] py-[4rpx] text-[22rpx] text-red-500 font-medium">
                月租{{ monthlyDiscount.discountPercent }}折
              </text>
              <text class="ml-[12rpx] text-[20rpx] text-green-600">
                省{{ monthlyDiscount.savings.toFixed(0) }}元
              </text>
            </view>
          </view>

          <!-- 车辆特性 -->
          <view class="grid grid-cols-4 gap-[24rpx]">
            <view class="text-center">
              <text class="i-material-symbols-airline-seat-recline-normal block text-[32rpx] text-purple-600" />
              <text class="mt-[8rpx] block text-[22rpx] text-gray-600">{{ vehicleDetail.seats }}座</text>
            </view>
            <view class="text-center">
              <text class="i-material-symbols-local-gas-station block text-[32rpx] text-purple-600" />
              <text class="mt-[8rpx] block text-[22rpx] text-gray-600">{{ vehicleDetail.energyType }}</text>
            </view>
            <view v-if="vehicleDetail.rangeKm" class="text-center">
              <text class="i-material-symbols-battery-charging-full block text-[32rpx] text-purple-600" />
              <text class="mt-[8rpx] block text-[22rpx] text-gray-600">{{ vehicleDetail.rangeKm }}km</text>
            </view>
            <view class="text-center">
              <text class="i-material-symbols-star block text-[32rpx] text-purple-600" />
              <text class="mt-[8rpx] block text-[22rpx] text-gray-600">{{ vehicleDetail.rating }}分</text>
            </view>
          </view>
        </view>

        <!-- 车主信息 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-person mr-[12rpx] text-[28rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">车主信息</text>
          </view>
          
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <image 
                :src="vehicleDetail.owner.avatar" 
                class="h-[80rpx] w-[80rpx] rounded-full"
              />
              <view class="ml-[24rpx]">
                <text class="block text-[26rpx] text-black font-medium">
                  {{ vehicleDetail.owner.nickname }}
                </text>
                <view class="mt-[4rpx] flex items-center">
                  <text class="i-material-symbols-star mr-[4rpx] text-[20rpx] text-yellow-500" />
                  <text class="mr-[16rpx] text-[22rpx] text-gray-600">
                    {{ vehicleDetail.owner.rating }}分
                  </text>
                  <text class="text-[22rpx] text-gray-600">
                    {{ vehicleDetail.owner.vehicleCount }}辆车
                  </text>
                </view>
              </view>
            </view>
            <button 
              class="rounded-[20rpx] border border-purple-600 px-[24rpx] py-[12rpx] text-[24rpx] text-purple-600"
              @tap="contactOwner"
            >
              联系车主
            </button>
          </view>
        </view>

        <!-- 车辆位置 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-location-on mr-[12rpx] text-[28rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">车辆位置</text>
          </view>
          
          <view class="flex items-center justify-between">
            <view class="flex-1">
              <text class="block text-[26rpx] text-black">
                {{ vehicleDetail.location.address }}
              </text>
              <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
                距离您 {{ formatDistance(vehicleDetail.location.distance) }}
              </text>
            </view>
            <text class="i-material-symbols-chevron-right text-[28rpx] text-gray-400" />
          </view>
        </view>

        <!-- 送车服务 -->
        <view v-if="vehicleDetail.deliveryEnabled" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-local-shipping mr-[12rpx] text-[28rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">送车服务</text>
          </view>
          
          <view>
            <text class="block text-[26rpx] text-black">支持送车上门</text>
            <text class="mt-[4rpx] block text-[22rpx] text-gray-600">
              {{ vehicleDetail.deliveryFreeDistance }}公里内¥{{ vehicleDetail.deliveryBaseFee }}，超出¥{{ vehicleDetail.deliveryPricePerKm }}/公里
            </text>
            <text class="mt-[4rpx] block text-[22rpx] text-gray-500">
              最远送车距离：{{ vehicleDetail.maxDeliveryDistance }}公里
            </text>
          </view>
        </view>

        <!-- 用户评价 -->
        <view class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center justify-between">
            <view class="flex items-center">
              <text class="i-material-symbols-reviews mr-[12rpx] text-[28rpx] text-purple-600" />
              <text class="text-[28rpx] text-black font-semibold">用户评价</text>
              <text class="ml-[12rpx] text-[24rpx] text-gray-600">
                ({{ vehicleDetail.ratingCount }})
              </text>
            </view>
            <text 
              v-if="reviews.length > 2" 
              class="text-[24rpx] text-purple-600"
              @tap="showAllReviews = true"
            >
              查看全部
            </text>
          </view>
          
          <view class="space-y-[24rpx]">
            <view 
              v-for="review in reviews.slice(0, 2)" 
              :key="review.reviewId"
              class="border-b border-gray-100 pb-[24rpx] last:border-b-0 last:pb-0"
            >
              <view class="mb-[12rpx] flex items-center">
                <image 
                  :src="review.userAvatar" 
                  class="h-[60rpx] w-[60rpx] rounded-full"
                />
                <view class="ml-[16rpx] flex-1">
                  <text class="block text-[24rpx] text-black font-medium">
                    {{ review.userName }}
                  </text>
                  <view class="mt-[4rpx] flex items-center">
                    <view class="mr-[12rpx] flex">
                      <text 
                        v-for="i in 5" 
                        :key="i"
                        class="i-material-symbols-star text-[20rpx]"
                        :class="i <= review.rating ? 'text-yellow-500' : 'text-gray-300'"
                      />
                    </view>
                    <text class="text-[20rpx] text-gray-500">
                      {{ review.createTime }}
                    </text>
                  </view>
                </view>
              </view>
              <text class="text-[24rpx] text-gray-700 leading-[36rpx]">
                {{ review.content }}
              </text>
            </view>
          </view>
        </view>

        <!-- 相似车辆推荐 -->
        <view v-if="similarVehicles.length > 0" class="overflow-hidden rounded-[24rpx] bg-white p-[32rpx]">
          <view class="mb-[24rpx] flex items-center">
            <text class="i-material-symbols-recommend mr-[12rpx] text-[28rpx] text-purple-600" />
            <text class="text-[28rpx] text-black font-semibold">相似推荐</text>
          </view>
          
          <view class="space-y-[16rpx]">
            <view 
              v-for="vehicle in similarVehicles" 
              :key="vehicle.vehicleId"
              class="flex items-center rounded-[16rpx] bg-gray-50 p-[16rpx]"
              @tap="viewSimilarVehicle(vehicle)"
            >
              <image 
                :src="vehicle.imageUrl" 
                mode="aspectFill"
                class="h-[80rpx] w-[120rpx] flex-shrink-0 rounded-[8rpx]"
              />
              <view class="ml-[16rpx] flex-1">
                <text class="block text-[24rpx] text-black font-medium">
                  {{ vehicle.name }}
                </text>
                <view class="mt-[4rpx] flex items-center justify-between">
                  <text class="text-[22rpx] text-purple-600 font-medium">
                    ¥{{ vehicle.dailyPrice }}/天
                  </text>
                  <text class="text-[20rpx] text-gray-500">
                    {{ formatDistance(vehicle.distance) }}
                  </text>
                </view>
              </view>
              <text class="i-material-symbols-chevron-right ml-[12rpx] text-[24rpx] text-gray-400" />
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部预订按钮 -->
    <view class="border-t border-gray-100 bg-white p-[24rpx]">
      <view class="flex items-center">
        <view class="flex-1">
          <text class="text-[24rpx] text-gray-500">日租价格</text>
          <view class="flex items-baseline">
            <text class="text-[32rpx] text-purple-600 font-bold">
              ¥{{ vehicleDetail.dailyPrice }}
            </text>
            <text class="ml-[4rpx] text-[22rpx] text-gray-500">/天起</text>
          </view>
        </view>
        <button 
          class="rounded-[20rpx] bg-purple-600 px-[48rpx] py-[24rpx] text-[28rpx] text-white font-medium"
          @tap="bookNow"
        >
          立即预订
        </button>
      </view>
    </view>

    <!-- 预订时间选择弹窗 -->
    <BottomDrawer v-model:visible="showBookingPanel" title="选择租赁时间">
      <view class="mt-[32rpx] p-[24rpx]">
        <text class="mb-[24rpx] block text-[28rpx] text-black font-semibold">
          请先设置租赁时间
        </text>
        <text class="mb-[32rpx] block text-[24rpx] text-gray-600">
          您需要先选择租赁开始和结束时间才能进行预订
        </text>
        <button 
          class="w-full rounded-[20rpx] bg-purple-600 py-[24rpx] text-[28rpx] text-white font-medium"
          @tap="setBookingTime"
        >
          设置时间并预订
        </button>
      </view>
    </BottomDrawer>

    <!-- 图片查看器 -->
    <view 
      v-if="showImageViewer" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black"
      @tap="showImageViewer = false"
    >
      <swiper 
        :current="currentImageIndex"
        class="h-full w-full"
        @change="(e: any) => currentImageIndex = e.detail.current"
      >
        <swiper-item v-for="(image, index) in vehicleDetail.images" :key="index">
          <view class="flex h-full w-full items-center justify-center">
            <image 
              :src="image" 
              mode="aspectFit" 
              class="max-h-full max-w-full"
            />
          </view>
        </swiper-item>
      </swiper>
      
      <!-- 关闭按钮 -->
      <view class="absolute right-[32rpx] top-[60rpx] z-10">
        <text 
          class="i-material-symbols-close text-[48rpx] text-white"
          @tap.stop="showImageViewer = false"
        />
      </view>
      
      <!-- 图片指示器 -->
      <view class="absolute bottom-[60rpx] left-0 right-0 text-center">
        <text class="text-[28rpx] text-white">
          {{ currentImageIndex + 1 }} / {{ vehicleDetail.images.length }}
        </text>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>