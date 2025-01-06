<script lang="ts" setup>
import { type VisitOutcomes, type Visits, saveVisitOutcomes, saveVisits } from '@/api/visits'
import { type OutcomeType, getOutcomeTypeList } from '@/api/outcomeType'

const visits = ref<Visits>({})
const options = ref<OutcomeType[]>([])
const form = ref<VisitOutcomes>({})

async function submit() {
  if (!form.value.outcomeType) {
    toastRef.value?.error('请选择拜访结果')
    return
  }
  form.value.visitId = visits.value.id
  form.value.outcomeTypeName = options.value.find(item => item.id === form.value.outcomeType)?.name
  uni.showLoading()
  if (form.value.images)
    await handleImageUpload(form.value.images, form, 'visit')

  visits.value.status = 2
  const promiseArr = [
    saveVisitOutcomes(form.value),
    saveVisits(visits.value),
  ]
  Promise.all(promiseArr).then(() => {
    toastRef.value?.success('提交成功')
    setTimeout(() => {
      back()
    }, 1000)
  }).finally(() => {
    uni.hideLoading()
  })
}

function back() {
  uni.navigateBack()
}

function loadOptions() {
  getOutcomeTypeList().then((res) => {
    options.value = res.data
  })
}

onMounted(() => {
  visits.value = getJumpData('visits') as Visits
  loadOptions()
  if (visits.value.outcomes)
    form.value = visits.value.outcomes
})
</script>

<template>
  <view h-full flex flex-col>
    <VisitResultHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] overflow-auto p-[20rpx] pb-[200rpx]>
      <MainVisitItem :show-all="true" :hide-button="true" :show-visit="false" :item="visits" />
      <view flex flex-col gap-[30rpx] rounded-[10rpx] bg-white p-[20rpx]>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:paper-clip-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              拜访结果
            </text>
          </view>
          <SelectBar v-model="form.outcomeType" :options="options.map((item: OutcomeType) => ({ label: item.name, value: item.id }))" h-[60rpx] />
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:chat-bubble-left-ellipsis-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              详细描述
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <textarea v-model="form.description" placeholder="请输入详细描述" class="text-[26rpx]" />
          </view>
        </view>
        <FormImage v-model="form.images" label="图片" />
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
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
