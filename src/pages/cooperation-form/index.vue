<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HeadBar from '@/components/HeadBar.vue'
import { getCitiesByProvince, getDistrictsByCity, getProvinces } from '@/utils/region-data'
import { submitCooperationApplication } from '@/api/cooperation'
import type { CooperationApplicationForm } from '@/api/cooperation'

// 声明uni全局变量
declare const uni: any

const form = ref<CooperationApplicationForm>({
  cooperationType: '',
  companyName: '',
  contactPerson: '',
  contactPhone: '',
  contactEmail: '',
  regionProvince: '',
  regionCity: '',
  regionDistrict: '',
  detailedAddress: '',
  cooperationIntention: '',
})

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const applicationNo = ref('')

const cooperationTags = [
  '租车公司',
  '汽车租赁',
  '车队运营',
  '洗车美容',
  '汽车清洗',
  '车辆美容',
  '汽修服务',
  '维修保养',
  '4S店',
  '保险服务',
  '金融服务',
  '代驾服务',
  '充电桩',
  '加油站',
  '停车场',
]

const selectedTags = ref<string[]>([])

// 地区数据
const provinces = computed(() => getProvinces())
const availableCities = computed(() => {
  return form.value.regionProvince ? getCitiesByProvince(form.value.regionProvince) : []
})
const availableDistricts = computed(() => {
  return form.value.regionProvince && form.value.regionCity
    ? getDistrictsByCity(form.value.regionProvince, form.value.regionCity)
    : form.value.regionProvince
      ? getDistrictsByCity(form.value.regionProvince)
      : []
})

const canSelectDistrict = computed(() => {
  const directMunicipalities = ['北京市', '上海市', '天津市', '重庆市']
  if (form.value.regionProvince && directMunicipalities.includes(form.value.regionProvince)) {
    return true
  }
  return !!form.value.regionCity
})

function toggleTag(tag: string) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
    form.value.cooperationType = (form.value.cooperationType || '')
      .replace(new RegExp(`${tag}\\s*`, 'g'), '')
      .trim()
  }
  else {
    selectedTags.value.push(tag)
    if (form.value.cooperationType) {
      form.value.cooperationType += ` ${tag}`
    }
    else {
      form.value.cooperationType = tag
    }
  }
  if (errors.value.cooperationType) {
    delete errors.value.cooperationType
  }
}

function validateForm() {
  errors.value = {}

  if (!form.value.cooperationType.trim()) {
    errors.value.cooperationType = '请输入合作类型'
  }

  if (!form.value.contactPerson.trim()) {
    errors.value.contactPerson = '请输入联系人姓名'
  }

  if (!form.value.contactPhone.trim()) {
    errors.value.contactPhone = '请输入联系电话'
  }
  else if (!/^1[3-9]\d{9}$/.test(form.value.contactPhone)) {
    errors.value.contactPhone = '请输入正确的手机号码'
  }

  if (form.value.contactEmail && form.value.contactEmail.trim() && !/^[\w+.-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.value.contactEmail.trim())) {
    errors.value.contactEmail = '请输入正确的邮箱地址'
  }

  if (!form.value.cooperationIntention.trim()) {
    errors.value.cooperationIntention = '请输入合作意向'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  uni.showLoading({
    title: '提交中...',
  })

  try {
    const response = await submitCooperationApplication(form.value)
    if (response.code === 200 && response.data) {
      applicationNo.value = response.data.applicationNo
      showSuccessModal.value = true
    }
    else {
      throw new Error(response.msg || '提交失败')
    }
  }
  catch (error) {
    console.error('提交申请失败:', error)
    uni.showToast({
      title: '提交失败，请稍后重试',
      icon: 'none',
    })
  }
  finally {
    uni.hideLoading()
    isSubmitting.value = false
  }
}

function resetForm() {
  form.value = {
    cooperationType: '',
    companyName: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    regionProvince: '',
    regionCity: '',
    regionDistrict: '',
    detailedAddress: '',
    cooperationIntention: '',
  }
  errors.value = {}
  selectedTags.value = []
  showSuccessModal.value = false
  applicationNo.value = ''
}

watch(() => form.value.regionProvince, () => {
  form.value.regionCity = ''
  form.value.regionDistrict = ''
})

watch(() => form.value.regionCity, () => {
  form.value.regionDistrict = ''
})

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view class="relative h-full flex flex-col overflow-hidden bg-gray-50">
    <!-- 头部导航 -->
    <HeadBar bg-color="white">
      <view class="h-full flex items-center justify-between px-[32rpx]">
        <view class="flex items-center">
          <view
            class="h-[56rpx] w-[56rpx] flex items-center justify-center rounded-full bg-white/20"
            @tap="back"
          >
            <text class="i-material-symbols:arrow-back text-[28rpx] text-black" />
          </view>
          <text class="ml-[20rpx] text-[32rpx] text-black font-semibold">
            同行合作申请
          </text>
        </view>
      </view>
    </HeadBar>

    <!-- 主要内容区域 -->
    <view class="flex-1 overflow-y-auto">
      <view class="p-[32rpx] space-y-[32rpx]">
        <!-- 合作类型选择 -->
        <view class="rounded-[32rpx] bg-white p-[32rpx]">
          <view class="mb-[32rpx] flex items-center space-x-[16rpx]">
            <text class="i-lets-icons:user-add-alt-duotone text-[40rpx] text-purple-600" />
            <text class="text-[32rpx] text-black font-semibold">
              合作类型 <text class="text-red-500">*</text>
            </text>
          </view>

          <view class="space-y-[32rpx]">
            <!-- 快捷标签 -->
            <view>
              <view class="mb-[16rpx]">
                <text class="block text-[28rpx] text-black font-medium">
                  快捷选择
                </text>
                <text class="text-[24rpx] text-gray-500">
                  点击标签快速选择合作类型
                </text>
              </view>
              <view class="flex flex-wrap gap-[12rpx]">
                <view
                  v-for="tag in cooperationTags"
                  :key="tag"
                  class="border rounded-full px-[20rpx] py-[8rpx] text-[24rpx] transition-all"
                  :style="{
                    backgroundColor: selectedTags.includes(tag) ? '#9333ea' : '#00000010',
                    color: selectedTags.includes(tag) ? '#ffffff' : '#6b7280',
                    borderColor: selectedTags.includes(tag) ? '#9333ea' : '#e5e7eb',
                  }"
                  @tap="toggleTag(tag)"
                >
                  {{ tag }}
                </view>
              </view>
            </view>

            <!-- 详细描述 -->
            <view>
              <view class="mb-[16rpx]">
                <text class="block text-[28rpx] text-black font-medium">
                  详细描述
                </text>
                <text class="text-[24rpx] text-gray-500">
                  请详细描述您的服务类型
                </text>
              </view>
              <textarea
                v-model="form.cooperationType"
                class="w-full min-h-[120rpx] border border-gray-300 rounded bg-transparent text-[26rpx]"
                :class="{ 'border-red-500': errors.cooperationType }"
                placeholder="请描述您的服务类型，可点击上方标签快速选择..."
                :auto-height="true"
                :maxlength="200"
              />
              <view v-if="errors.cooperationType" class="mt-[8rpx] text-[24rpx] text-red-500">
                {{ errors.cooperationType }}
              </view>
            </view>
          </view>
        </view>

        <!-- 基本信息 -->
        <view class="rounded-[32rpx] bg-white">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-lets-icons:business-duotone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                基本信息
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 公司名称 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  公司/机构名称
                </text>
                <text class="text-[24rpx] text-gray-500">
                  可选填写
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="form.companyName"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.companyName }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.companyName" class="text-[24rpx] text-red-500">
              {{ errors.companyName }}
            </view>

            <!-- 联系人姓名 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系人姓名 <text class="text-red-500">*</text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  主要联系人
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="form.contactPerson"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.contactPerson }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.contactPerson" class="text-[24rpx] text-red-500">
              {{ errors.contactPerson }}
            </view>

            <!-- 联系电话 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系电话 <text class="text-red-500">*</text>
                </text>
                <text class="text-[24rpx] text-gray-500">
                  手机号码
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="form.contactPhone"
                  type="number"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.contactPhone }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.contactPhone" class="text-[24rpx] text-red-500">
              {{ errors.contactPhone }}
            </view>

            <!-- 联系邮箱 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  联系邮箱
                </text>
                <text class="text-[24rpx] text-gray-500">
                  可选填写
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="form.contactEmail"
                  type="email"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  :class="{ 'border-red-500': errors.contactEmail }"
                  placeholder="请输入"
                />
              </view>
            </view>
            <view v-if="errors.contactEmail" class="text-[24rpx] text-red-500">
              {{ errors.contactEmail }}
            </view>
          </view>
        </view>

        <!-- 服务区域 -->
        <view class="rounded-[32rpx] bg-white">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-material-symbols:location-on text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                服务区域
              </text>
            </view>
          </view>

          <view class="p-[32rpx] space-y-[32rpx]">
            <!-- 省份 -->
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-black font-medium">
                省份
              </text>
              <picker
                mode="selector"
                :range="provinces"
                @change="(e: any) => form.regionProvince = provinces[e.detail.value] || ''"
              >
                <view class="flex items-center space-x-[16rpx]">
                  <text class="text-[26rpx] text-gray-700">
                    {{ form.regionProvince || '请选择' }}
                  </text>
                  <text class="i-material-symbols:chevron-right text-[32rpx] text-gray-400" />
                </view>
              </picker>
            </view>

            <!-- 城市 -->
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-black font-medium">
                城市
              </text>
              <picker
                mode="selector"
                :range="availableCities"
                :disabled="!form.regionProvince"
                @change="(e: any) => form.regionCity = availableCities[e.detail.value] || ''"
              >
                <view class="flex items-center space-x-[16rpx]">
                  <text class="text-[26rpx] text-gray-700">
                    {{ form.regionCity || '请选择' }}
                  </text>
                  <text class="i-material-symbols:chevron-right text-[32rpx] text-gray-400" />
                </view>
              </picker>
            </view>

            <!-- 区县 -->
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] text-black font-medium">
                区县
              </text>
              <picker
                mode="selector"
                :range="availableDistricts"
                :disabled="!canSelectDistrict"
                @change="(e: any) => form.regionDistrict = availableDistricts[e.detail.value] || ''"
              >
                <view class="flex items-center space-x-[16rpx]">
                  <text class="text-[26rpx] text-gray-700">
                    {{ form.regionDistrict || '请选择' }}
                  </text>
                  <text class="i-material-symbols:chevron-right text-[32rpx] text-gray-400" />
                </view>
              </picker>
            </view>

            <!-- 详细地址 -->
            <view class="flex items-center justify-between">
              <view>
                <text class="block text-[28rpx] text-black font-medium">
                  详细地址
                </text>
                <text class="text-[24rpx] text-gray-500">
                  街道门牌号等
                </text>
              </view>
              <view class="flex items-center space-x-[16rpx]">
                <input
                  v-model="form.detailedAddress"
                  class="min-w-[200rpx] flex-1 border border-gray-300 rounded bg-transparent px-[16rpx] py-[8rpx] text-right text-[26rpx]"
                  placeholder="请输入"
                />
              </view>
            </view>
          </view>
        </view>

        <!-- 合作意向 -->
        <view class="rounded-[32rpx] bg-white">
          <view class="border-b border-gray-100 px-[32rpx] py-[24rpx]">
            <view class="flex items-center space-x-[16rpx]">
              <text class="i-lets-icons:bulb-duotone text-[40rpx] text-purple-600" />
              <text class="text-[32rpx] text-black font-semibold">
                合作意向 <text class="text-red-500">*</text>
              </text>
            </view>
          </view>

          <view class="p-[32rpx]">
            <textarea
              v-model="form.cooperationIntention"
              class="w-full min-h-[200rpx] border border-gray-300 rounded bg-transparent text-[26rpx]"
              :class="{ 'border-red-500': errors.cooperationIntention }"
              placeholder="请详细描述您的合作想法，例如：服务内容、合作方式、期望达成的目标等"
              :auto-height="true"
              :maxlength="500"
            />
            <view v-if="errors.cooperationIntention" class="mt-[8rpx] text-[24rpx] text-red-500">
              {{ errors.cooperationIntention }}
            </view>
          </view>
        </view>

        <!-- 底部安全间距 -->
        <view class="h-[32rpx]" />
      </view>
    </view>

    <!-- 底部提交按钮 -->
    <view class="flex-shrink-0 border-t border-gray-100 bg-white p-[32rpx] pb-[calc(10rpx+env(safe-area-inset-bottom))]">
      <view
        class="w-full rounded-[16rpx] bg-purple-600 py-[24rpx] text-center text-[28rpx] text-white font-semibold"
        :style="{ backgroundColor: isSubmitting ? '#9ca3af' : '#9333ea' }"
        @tap="handleSubmit"
      >
        <text v-if="isSubmitting">提交中...</text>
        <text v-else>提交申请</text>
      </view>
    </view>

    <!-- 成功提示弹框 -->
    <view
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-[40rpx]"
      @tap="showSuccessModal = false"
    >
      <view class="max-w-[600rpx] w-full rounded-[32rpx] bg-white p-[48rpx]" @tap.stop>
        <view class="text-center">
          <view class="mx-auto mb-[32rpx] h-[120rpx] w-[120rpx] flex items-center justify-center rounded-full bg-green-100">
            <text class="i-material-symbols:check-circle text-[64rpx] text-green-600" />
          </view>
          <view class="mb-[16rpx] text-[36rpx] text-gray-800 font-semibold">
            申请提交成功！
          </view>
          <view class="mb-[8rpx] text-[28rpx] text-gray-600">
            申请编号：{{ applicationNo }}
          </view>
          <view class="mb-[48rpx] text-[24rpx] text-gray-500">
            我们将在1-3个工作日内联系您，请保持电话畅通
          </view>
          <view
            class="w-full rounded-[16rpx] bg-purple-600 py-[24rpx] text-center text-[28rpx] text-white font-medium"
            @tap="resetForm"
          >
            继续提交申请
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="yaml">
layout: home
</route>
