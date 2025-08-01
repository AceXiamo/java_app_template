<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import HeadBar from '@/components/HeadBar.vue'
import { type VehicleCategory, getAllChildCategories, getChildCategories, getParentCategories } from '@/api/vehicle'

// 搜索参数 - 从首页传递过来
const searchParams = ref({
  city: '上海',
  address: '上海',
  latitude: undefined as number | undefined,
  longitude: undefined as number | undefined,
  startTime: '',
  endTime: '',
  keywords: '',
})

// 数据状态
const loading = ref(false)
const brandCategories = ref<VehicleCategory[]>([])
const modelCategories = ref<VehicleCategory[]>([])
const filteredModels = ref<VehicleCategory[]>([])
const selectedBrandId = ref<number | null>(null)
const searchKeyword = ref('')

// 初始化显示列表
function initializeFilteredModels() {
  filteredModels.value = modelCategories.value
}

// 页面加载时获取参数
onLoad(() => {
  // 获取从首页传递的搜索参数
  const jumpData = getJumpData('searchParams')

  if (jumpData) {
    searchParams.value = {
      city: jumpData.city || '上海',
      address: jumpData.address || '上海',
      latitude: jumpData.latitude,
      longitude: jumpData.longitude,
      startTime: jumpData.startTime || '',
      endTime: jumpData.endTime || '',
      keywords: jumpData.keywords || '',
    }
  }

  loadBrandCategories()
  loadAllModelCategories() // 默认加载所有车型
})

// 加载品牌分类
async function loadBrandCategories() {
  try {
    const response = await getParentCategories()
    if (response.code === 200 && response.data) {
      brandCategories.value = response.data
    }
  }
  catch (error) {
    console.error('获取品牌分类失败:', error)
  }
}

// 加载所有车型分类
async function loadAllModelCategories() {
  if (loading.value)
    return

  try {
    loading.value = true

    // 直接获取所有二级分类，避免遍历查询
    const response = await getAllChildCategories()
    if (response.code === 200 && response.data) {
      modelCategories.value = response.data
      initializeFilteredModels()
    }
    else {
      modelCategories.value = []
      filteredModels.value = []
    }
  }
  catch (error) {
    console.error('获取车型分类失败:', error)
    modelCategories.value = []
    filteredModels.value = []
  }
  finally {
    loading.value = false
  }
}

// 加载指定品牌的车型分类
async function loadModelCategories(brandId: number) {
  if (loading.value)
    return

  try {
    loading.value = true
    const response = await getChildCategories(brandId)
    if (response.code === 200 && response.data) {
      modelCategories.value = response.data
      initializeFilteredModels()
    }
    else {
      modelCategories.value = []
      filteredModels.value = []
    }
  }
  catch (error) {
    console.error('获取车型分类失败:', error)
    modelCategories.value = []
    filteredModels.value = []
  }
  finally {
    loading.value = false
  }
}

// 选择品牌
function selectBrand(brandId: number | null) {
  selectedBrandId.value = brandId

  if (brandId === null) {
    // 选择"全部"，加载所有车型
    loadAllModelCategories()
  }
  else {
    // 选择特定品牌，加载该品牌的车型
    loadModelCategories(brandId)
  }
}

// 选择车型，跳转到搜索页面
function selectModel(model: VehicleCategory) {
  // 将搜索参数和选中的车型ID传递给搜索页面
  const searchData = {
    ...searchParams.value,
    categoryId: model.categoryId,
    categoryName: model.categoryName,
  }

  setJumpData('searchParams', searchData)

  uni.navigateTo({
    url: '/pages/search/index',
  })
}

// 搜索车型功能
function searchModels() {
  const keyword = searchKeyword.value.trim()

  if (!keyword) {
    // 如果搜索词为空，显示所有车型
    filteredModels.value = modelCategories.value
    return
  }

  // 执行搜索过滤
  const lowerKeyword = keyword.toLowerCase()
  filteredModels.value = modelCategories.value.filter(model =>
    model.categoryName.toLowerCase().includes(lowerKeyword)
    || model.categoryCode.toLowerCase().includes(lowerKeyword),
  )
}

// 清空搜索
function clearSearch() {
  searchKeyword.value = ''
  filteredModels.value = modelCategories.value
}

// 跳过选择，直接搜索（不选择车型）
function skipToSearch() {
  // 传递搜索参数但不包含categoryId
  setJumpData('searchParams', searchParams.value)

  uni.navigateTo({
    url: '/pages/search/index',
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="relative h-full flex items-center">
        <!-- 返回按钮 -->
        <view class="absolute left-0 z-10 h-full w-[80rpx] flex items-center justify-center" @tap="goBack">
          <text class="i-material-symbols-arrow-back text-[36rpx] text-black" />
        </view>

        <!-- 页面标题 -->
        <text class="absolute left-0 right-0 z-0 text-center text-[32rpx] text-black font-semibold">
          选择车型
        </text>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex flex-1 flex-col overflow-hidden">
      <!-- 搜索条件栏 -->
      <view class="border-b border-gray-100 bg-white px-[32rpx] py-[24rpx]">
        <!-- 搜索框区域 -->
        <view class="mb-[24rpx]">
          <view class="relative flex items-center gap-[16rpx]">
            <!-- 搜索输入框 -->
            <view class="relative flex-1">
              <text class="i-material-symbols-search absolute left-[24rpx] text-[28rpx] text-gray-400" style="top: 50%; transform: translateY(-50%);" />
              <input
                v-model="searchKeyword"
                type="text"
                placeholder="搜索车型"
                :class="[
                  'w-full box-border h-[80rpx] border-0 rounded-[24rpx] bg-gray-50 pl-[72rpx] text-[28rpx] text-black placeholder-gray-500',
                  searchKeyword.trim() ? 'pr-[72rpx]' : 'pr-[32rpx]'
                ]"
                style="line-height: 80rpx; padding-top: 0; padding-bottom: 0;"
                @confirm="searchModels"
              >
              <!-- 清空按钮（仅在有搜索内容时显示） -->
              <view
                v-if="searchKeyword.trim()"
                class="absolute right-[24rpx] h-[32rpx] w-[32rpx] flex items-center justify-center rounded-full bg-gray-300"
                style="top: 50%; transform: translateY(-50%);"
                @tap="clearSearch"
              >
                <text class="i-material-symbols-close text-[20rpx] text-gray-600" />
              </view>
            </view>

            <!-- 搜索按钮 -->
            <view
              class="h-[80rpx] w-[80rpx] flex items-center justify-center rounded-[24rpx] bg-purple-600"
              @tap="searchModels"
            >
              <text class="i-material-symbols-search text-[32rpx] text-white" />
            </view>
          </view>
        </view>

        <!-- 跳过选择按钮 -->
        <!-- <view
          class="mb-[24rpx] w-full rounded-[20rpx] border-2 border-purple-600 py-[20rpx] text-center"
          @tap="skipToSearch"
        >
          <text class="text-[28rpx] text-purple-600 font-medium">
            跳过选择，搜索全部车辆
          </text>
        </view> -->

        <!-- 品牌标签栏（支持横向滚动） -->
        <scroll-view
          scroll-x
          show-scrollbar="false"
          class="whitespace-nowrap"
        >
          <view class="flex px-[2rpx] space-x-[16rpx]">
            <!-- 全部标签 -->
            <view
              class="flex-shrink-0 whitespace-nowrap rounded-full px-[24rpx] py-[8rpx] text-[24rpx] transition-all"
              :class="selectedBrandId === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'"
              @tap="selectBrand(null)"
            >
              全部
            </view>

            <!-- 品牌标签 -->
            <view
              v-for="brand in brandCategories"
              :key="brand.categoryId"
              class="flex-shrink-0 whitespace-nowrap rounded-full px-[24rpx] py-[8rpx] text-[24rpx] transition-all"
              :class="selectedBrandId === brand.categoryId
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600'"
              @tap="selectBrand(brand.categoryId)"
            >
              {{ brand.categoryName }}
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 车型列表 -->
      <scroll-view scroll-y class="flex-1 overflow-y-auto">
        <view class="p-[24rpx] space-y-[16rpx]">
          <!-- 加载状态 -->
          <view v-if="loading" class="space-y-[16rpx]">
            <view v-for="i in 6" :key="i" class="animate-pulse rounded-[28rpx] bg-white p-[32rpx] shadow-[0_8rpx_24rpx_rgba(139,92,246,0.08)]">
              <view class="flex items-center space-x-[24rpx]">
                <view class="h-[80rpx] w-[120rpx] flex-shrink-0 rounded-[16rpx] bg-gray-200" />
                <view class="flex-1 space-y-[16rpx]">
                  <view class="h-[32rpx] w-3/4 rounded bg-gray-200" />
                  <view class="h-[24rpx] w-1/2 rounded bg-gray-200" />
                </view>
                <view class="h-[32rpx] w-[32rpx] flex-shrink-0 rounded bg-gray-200" />
              </view>
            </view>
          </view>

          <!-- 空状态 -->
          <view v-else-if="filteredModels.length === 0" class="py-[48rpx] text-center text-[28rpx] text-gray-500">
            <text class="i-material-symbols-directions-car mx-auto mb-[24rpx] block h-[128rpx] w-[128rpx] text-gray-300" />
            <text>
              {{ searchKeyword ? '没有找到相关车型' : '暂无车型数据' }}
            </text>
          </view>

          <!-- 车型列表 -->
          <view v-else class="space-y-[16rpx]">
            <view
              v-for="model in filteredModels"
              :key="model.categoryId"
              class="mb-[24rpx] flex flex-col overflow-hidden rounded-[28rpx] bg-white shadow-[0_8rpx_24rpx_rgba(139,92,246,0.08)] transition-colors active:bg-gray-50"
              @tap="selectModel(model)"
            >
              <view class="flex items-center justify-between p-[32rpx]">
                <view class="min-w-0 flex flex-1 items-center space-x-[24rpx]">
                  <!-- 车型图标 -->
                  <view class="h-[80rpx] w-[120rpx] flex flex-shrink-0 items-center justify-center rounded-[16rpx] bg-gray-100">
                    <image
                      v-if="model.iconUrl"
                      :src="model.iconUrl"
                      :alt="model.categoryName"
                      class="h-full w-full rounded-[16rpx] object-cover"
                    />
                    <text v-else class="i-material-symbols-directions-car text-[48rpx] text-gray-400" />
                  </view>

                  <!-- 车型信息 -->
                  <view class="min-w-0 flex-1">
                    <text class="mb-[8rpx] block truncate text-[30rpx] text-black font-bold">
                      {{ model.categoryName }}
                    </text>
                    <text v-if="model.minPrice" class="block text-[24rpx] text-purple-600 font-medium">
                      ¥{{ model.minPrice }}元/天起
                    </text>
                  </view>
                </view>

                <!-- 箭头 -->
                <text class="i-material-symbols-chevron-right flex-shrink-0 text-[32rpx] text-gray-400" />
              </view>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
