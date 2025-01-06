<script lang="ts" setup>
import { type Visits, saveVisits } from '@/api/visits'
import type { Customer } from '@/api/customer'
import ClickButton from '@/components/ClickButton.vue'
import CustomerSelector from '@/components/CustomerSelector.vue'
import MemberSelector from '@/components/MemberSelector.vue'
import type { SysUser } from '@/api/user'

const customerSelector = ref<InstanceType<typeof CustomerSelector>>()
const memberSelector = ref<InstanceType<typeof MemberSelector>>()
const form = ref<Visits>({})
const mapValue = ref<MapModelValue>({})

function showCustomerSelector() {
  customerSelector.value?.show()
}

function handleCustomerConfirm(data: Customer) {
  form.value.customerName = data.customerName
  form.value.customerPhone = data.customerPhone
  form.value.latitude = data.latitude
  form.value.longitude = data.longitude
  form.value.location = data.customerAddress
  form.value.locationDesc = data.locationDesc
  mapValue.value = {
    latitude: data.latitude,
    longitude: data.longitude,
    location: data.customerAddress,
  }
}

function showMemberSelector() {
  memberSelector.value?.show()
}

function handleMemberConfirm(data: SysUser) {
  form.value.userId = data.userId
  form.value.userName = data.nickName
}

async function submit() {
  uni.showLoading()
  if (form.value.images)
    await handleImageUpload(form.value.images, form)
  saveVisits(form.value).then(() => {
    uni.hideLoading()
    toastRef.value?.success('保存成功')
    setTimeout(() => {
      back()
    }, 1000)
  })
}

function back() {
  uni.navigateBack()
}

function handleMapUpdate(data: MapModelValue) {
  form.value.location = data.location
  form.value.latitude = data.latitude
  form.value.longitude = data.longitude
}

onMounted(() => {
  const visits = getJumpData('visits') as Visits
  if (visits) {
    form.value = visits
    mapValue.value = {
      latitude: visits.latitude,
      longitude: visits.longitude,
      location: visits.location,
    }
  }
})
</script>

<template>
  <view h-full flex flex-col>
    <EditVisitsHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] overflow-y-auto px-[20rpx] pb-[200rpx]>
      <view mt-[20rpx] flex flex-col gap-[30rpx] rounded-[10rpx] bg-white p-[20rpx]>
        <FormInput v-model="form.userName" label="负责人" required>
          <template #suffix>
            <ClickButton size="small" type="primary" label="从成员列表选择" @click="showMemberSelector" />
          </template>
        </FormInput>
        <FormInput v-model="form.customerName" label="客户姓名" required>
          <template #suffix>
            <ClickButton size="small" type="primary" label="从客户列表选择" @click="showCustomerSelector" />
          </template>
        </FormInput>
        <FormInput v-model="form.customerPhone" label="联系电话" required />
        <FormMap v-model="mapValue" label="拜访地点" @update:model-value="handleMapUpdate" />
        <FormInput v-model="form.locationDesc" label="地址备注" type="textarea" />
        <FormDate v-model="form.visitDate" label="拜访日期" required />
        <FormInput v-model="form.purpose" label="拜访目的" type="textarea" />
        <FormImage v-model="form.images" label="图片备注" />
        <FormInput v-model="form.notes" label="拜访备注" type="textarea" />
      </view>
      <view flex justify-end gap-[20rpx]>
        <ClickButton type="primary" drop-shadow-lg @click="submit">
          提交
        </ClickButton>
        <ClickButton type="default" drop-shadow-lg @click="back">
          返回
        </ClickButton>
      </view>
    </view>
  </view>
  <CustomerSelector ref="customerSelector" @confirm="handleCustomerConfirm" />
  <MemberSelector ref="memberSelector" @confirm="handleMemberConfirm" />
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
