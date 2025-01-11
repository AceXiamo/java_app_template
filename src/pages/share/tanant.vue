<script lang="ts" setup>
import dayjs from 'dayjs'
import type { CustomerVisit } from '@/api/customerVisit'
import { banners } from '@/api/banner'
import { host } from '@/utils/alioss'
import { listDept, submitVisit } from '@/api/submitVisit'
import { useUserStore } from '@/store/user'
import type { TenantDept } from '@/api/dept'
import { login } from '@/api/login'

type FormData = CustomerVisit & {
  visitBeginTime?: Date
  visitEndTime?: Date
}

const user = useUserStore()
const today = dayjs()
const time = dayjs(`${today.format('YYYY-MM-DD')} 00:00`)

const formData = ref<FormData>({
  customerName: '',
  customerCompany: '',
  visitDesc: '',
  visitBegin: today.format('YYYY-MM-DD'),
  visitBeginTime: time.toDate(),
  visitEnd: today.format('YYYY-MM-DD'),
  visitEndTime: time.toDate(),
  visitPerson: undefined,
  cars: '',
  customerPhone: '',
  customerFiles: '',
  recordStatus: 0, // 初始状态为待审核
})

const carList = ref<string[]>([])
const deptList = ref<TenantDept[]>([])

function addCar() {
  if (carList.value.length >= 5)
    return toastRef.value?.error('最多添加5个车牌号')
  carList.value.push('')
  updateCars()
}

function updateCarItem(index: number, value: string) {
  carList.value[index] = value
  updateCars()
}

function updateCars() {
  formData.value.cars = carList.value.filter(car => car).join(',')
}

function removeCar(index: number) {
  carList.value.splice(index, 1)
  updateCars()
}

async function submit() {
  if (!formData.value.deptId)
    return toastRef.value?.error('请选择访问部门')
  if (!formData.value.customerName)
    return toastRef.value?.error('请输入访客姓名')
  if (!formData.value.visitDesc)
    return toastRef.value?.error('请输入到访事由')
  if (!formData.value.visitBegin || !formData.value.visitBeginTime)
    return toastRef.value?.error('请选择完整的计划到访时间')
  if (!formData.value.visitEnd || !formData.value.visitEndTime)
    return toastRef.value?.error('请选择完整的计划离开时间')
  if (!formData.value.visitPerson)
    return toastRef.value?.error('请输入随行人数')
  if (!formData.value.customerPhone)
    return toastRef.value?.error('请输入访客手机号')

  // 合并日期和时间
  const visitBegin = `${dayjs(formData.value.visitBegin).format('YYYY-MM-DD')} ${dayjs(formData.value.visitBeginTime).format('HH:mm')}:00`
  const visitEnd = `${dayjs(formData.value.visitEnd).format('YYYY-MM-DD')} ${dayjs(formData.value.visitEndTime).format('HH:mm')}:00`
  // 创建提交用的数据对象
  const submitData: CustomerVisit = {
    ...formData.value,
    visitBegin,
    visitEnd,
  }
  console.log(submitData)

  // 上传图片
  if (formData.value.customerFiles) {
    await handleImageUpload(formData.value.customerFiles, formData, 'customer', 'customerFiles')
    submitData.customerFiles = formData.value.customerFiles
  }

  submitVisit({
    ...submitData,
    openId: user.user.openId!,
  }).then(() => {
    toastRef.value?.success('提交成功')
  })
}

const bannerImages = ref<string[]>([])

function goToRecord() {
  uni.navigateTo({
    url: '/pages/share/record',
  })
}

onLoad(() => {
  if (!user.user || !user.user.openId) {
    uni.login({
      provider: 'weixin',
      success: async (res: { code: string }) => {
        const { data } = await login({ code: res.code })
        user.saveLoginRes(data)
      },
    })
  }

  banners({ tenantId: 1 }).then((res) => {
    bannerImages.value = res.data.map(item => host + item.url!)
  })

  listDept({ tenantId: 1 }).then((res) => {
    deptList.value = res.data
  })
})
</script>

<template>
  <view h-full flex flex-col bg-white>
    <HeadBar bg-color="white">
      <view relative h-full flex items-center justify-center>
        <view i-heroicons:chevron-left-20-solid absolute left-[20rpx] text-[40rpx] text-black />
        <text text-[30rpx] text-black>
          访客登记
        </text>
      </view>
    </HeadBar>

    <view class="h-0 flex-1 overflow-y-auto px-[30rpx] py-[20rpx]">
      <Banner :images="bannerImages" />
      <view mt-[50rpx]>
        <view flex flex-col gap-[30rpx]>
          <FormSelect
            v-model="formData.deptId"
            label="访问部门"
            required
            :options="deptList.map(item => ({ label: item.deptName!, value: item.id! }))"
          />
          <FormInput
            v-model="formData.customerName"
            label="访客姓名"
            required
            placeholder="请填写您的姓名"
          >
            <template #icon>
              <view i-heroicons:user-circle-16-solid text-[26rpx] text-emerald-500 />
            </template>
          </FormInput>

          <FormInput
            v-model="formData.customerCompany"
            label="访客单位"
            placeholder="请填写您的单位名称"
          >
            <template #icon>
              <view i-heroicons:building-office-16-solid text-[26rpx] text-emerald-500 />
            </template>
          </FormInput>

          <FormInput
            v-model="formData.visitDesc"
            label="到访事由"
            required
            type="textarea"
            placeholder="如参加会议、面试等"
          >
            <template #icon>
              <view i-heroicons:clipboard-document-16-solid text-[26rpx] text-emerald-500 />
            </template>
          </FormInput>

          <view flex items-center gap-[20rpx]>
            <FormDate
              v-model="formData.visitBegin"
              label="计划到访时间"
              required
              placeholder="请选择日期"
              mode="date"
              class="flex-1"
            />
            <FormDate
              v-model="formData.visitBeginTime"
              hide-icon
              placeholder="请选择时间"
              mode="time"
              class="flex-1"
            />
          </view>

          <view flex items-center gap-[20rpx]>
            <FormDate
              v-model="formData.visitEnd"
              label="计划离开时间"
              required
              placeholder="请选择日期"
              mode="date"
              class="flex-1"
            />
            <FormDate
              v-model="formData.visitEndTime"
              hide-icon
              placeholder="请选择时间"
              mode="time"
              class="flex-1"
            />
          </view>

          <FormInput
            v-model="formData.visitPerson"
            label="随行人数"
            type="number"
            required
            placeholder="请填写随行人数"
          >
            <template #icon>
              <view i-heroicons:users-16-solid text-[26rpx] text-emerald-500 />
            </template>
            <template #suffix>
              <text text-[24rpx] text-gray-400>
                人
              </text>
            </template>
          </FormInput>

          <view flex flex-col gap-[20rpx]>
            <view flex items-center gap-[10rpx]>
              <text text-[30rpx] font-bold>
                车辆信息
              </text>
              <text text-[24rpx] text-gray-400>
                (最多可添加5个车牌号)
              </text>
            </view>
            <view flex flex-col gap-[20rpx]>
              <view v-for="(car, index) in carList" :key="index" flex items-center gap-[20rpx]>
                <FormInput
                  :model-value="car"
                  label="车牌号"
                  placeholder="请输入车牌号"
                  @update:model-value="val => updateCarItem(index, val)"
                >
                  <template #icon>
                    <view i-heroicons:truck-16-solid text-[26rpx] text-emerald-500 />
                  </template>
                  <template #suffix>
                    <view i-heroicons:x-mark-16-solid text-[26rpx] text-red-500 @click="removeCar(index)" />
                  </template>
                </FormInput>
              </view>
              <ClickButton v-if="carList.length < 5" type="primary" @click="addCar">
                <view i-heroicons:plus-16-solid mr-[10rpx] />
                添加车辆
              </ClickButton>
            </view>
          </view>

          <FormInput
            v-model="formData.customerPhone"
            label="访客手机号"
            required
            placeholder="请填写您的手机号"
          >
            <template #icon>
              <view i-heroicons:phone-16-solid text-[26rpx] text-emerald-500 />
            </template>
          </FormInput>

          <FormImage
            v-model="formData.customerFiles"
            label="上传附件"
            :limit="5"
          />
        </view>
      </view>
      <view my-[50rpx] box-border w-full>
        <view
          h-[88rpx] w-full flex items-center justify-center rounded-[10rpx] bg-[#4080ff] text-[32rpx] text-white
          @click="submit"
        >
          提交
        </view>
        <view mt-[20rpx] flex items-center justify-end>
          <text border-b border-gray-400 border-b-solid pb-[4rpx] text-[26rpx] text-gray-400 @click="goToRecord">
            提交记录
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
