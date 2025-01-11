<script lang="ts" setup>
import { host } from '@/utils/alioss'
import { type CustomerVisit, saveCustomerVisit } from '@/api/customerVisit'

const visit = ref<CustomerVisit>({})

const statusMap: any = {
  0: { text: '待审核', color: 'bg-yellow-500' },
  1: { text: '已通过', color: 'bg-green-500' },
  2: { text: '已完成', color: 'bg-blue-500' },
  3: { text: '已驳回', color: 'bg-red-500' },
}
const images = computed(() => {
  return visit.value.customerFiles?.split(',').map(item => `${host}${item}`)
})

onMounted(() => {
  visit.value = getJumpData('customerVisit') as CustomerVisit
})

function back() {
  uni.navigateBack()
}

function previewImage(file: string) {
  uni.previewImage({
    urls: images.value!,
    current: file,
  })
}

async function handleSubmit() {
  if (visit.value.recordFiles) {
    await handleImageUpload(visit.value.recordFiles, visit, 'visit', 'recordFiles')
  }
  saveCustomerVisit({
    ...visit.value,
    recordStatus: 2,
  }).then(() => {
    toastRef.value?.success('保存成功')
    setTimeout(() => {
      back()
    }, 1000)
  })
}
</script>

<template>
  <view h-full flex flex-col>
    <HeadBar bg-color="white">
      <view relative h-full flex items-center justify-center>
        <view i-heroicons:chevron-left-20-solid absolute left-[20rpx] text-[40rpx] text-black @click="back" />
        <text text-[30rpx] text-black>
          访客记录详情
        </text>
      </view>
    </HeadBar>
    <view h-0 flex flex-auto flex-col gap-[20rpx] overflow-auto px-[20rpx] pb-[20rpx] pt-[20rpx]>
      <view flex flex-col rounded-[15rpx] bg-white p-[20rpx]>
        <view flex items-center gap-[10rpx]>
          <text text-[28rpx] font-bold>
            {{ visit.customerName }}
          </text>
          <view
            :class="statusMap[visit.recordStatus ?? 0].color"
            ml-[10rpx] w-max rounded-[10rpx] px-[10rpx] py-[5rpx] text-[22rpx] text-white
          >
            {{ statusMap[visit.recordStatus ?? 0].text }}
          </view>
        </view>
        <view my-[20rpx] border-b border-gray-200 border-b-dashed />
        <view flex flex-col gap-[20rpx]>
          <view flex items-center gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:building-office-2-solid text-[22rpx] text-gray-400 />
              <text>公司:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visit.customerCompany }}
            </text>
          </view>
          <view flex items-center gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:phone-solid text-[22rpx] text-gray-400 />
              <text>联系电话:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visit.customerPhone }}
            </text>
          </view>
          <view flex items-center gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:calendar-solid text-[22rpx] text-gray-400 />
              <text>访问时间:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visit.visitBegin }} - {{ visit.visitEnd }}
            </text>
          </view>
          <view flex items-start gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:document-text-solid text-[22rpx] text-gray-400 />
              <text>访问描述:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visit.visitDesc }}
            </text>
          </view>
          <view flex items-start gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:user-circle-solid text-[22rpx] text-gray-400 />
              <text>负责人:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visit.nickname || '-' }}
            </text>
          </view>
          <view flex items-start gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:chat-bubble-left-ellipsis-solid text-[22rpx] text-gray-400 />
              <text>备注:</text>
            </view>
            <text text-[24rpx] text-[#333]>
              {{ visit.customerRemark || '-' }}
            </text>
          </view>
          <view flex items-start gap-[10rpx]>
            <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
              <view i-heroicons:paper-clip-solid text-[22rpx] text-gray-400 />
              <text>附件:</text>
            </view>
            <view v-if="visit.customerFiles" flex flex-wrap gap-[10rpx]>
              <image
                v-for="(file, index) in images"
                :key="index"
                :src="file"
                mode="aspectFill"
                class="h-[150rpx] w-[150rpx] rounded-[10rpx]"
                @click="previewImage(file)"
              />
            </view>
            <text v-else text-[24rpx] text-[#333]>
              -
            </text>
          </view>
        </view>
      </view>
      <view v-if="visit.recordStatus !== 3" flex flex-col rounded-[15rpx] bg-white p-[20rpx]>
        <view flex flex-col gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:paper-clip-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              备注拜访结果
            </text>
          </view>

          <FormInput
            v-model="visit.recordRemark"
            label="备注"
            type="textarea"
            required
            placeholder="请输入备注"
          >
            <template #icon>
              <view i-heroicons:document-text-16-solid text-[26rpx] text-emerald-500 />
            </template>
          </FormInput>

          <FormImage
            v-model="visit.recordFiles"
            label="附件"
            :limit="3"
          />

          <view mt-[20rpx] flex justify-end>
            <ClickButton type="primary" @click="handleSubmit">
              保存
            </ClickButton>
          </view>
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
