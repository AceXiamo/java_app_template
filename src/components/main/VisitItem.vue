<script lang="ts" setup>
const props = withDefaults(defineProps<{
  showAll: boolean
  hideButton: boolean
  showVisit: boolean
}>(), {
  showAll: false,
  hideButton: false,
  showVisit: true,
})

const instance = getCurrentInstance()
const open = ref(false)
const item = ref({
  name: '金',
  phone: '19272002355',
  address: '湖南省长沙市岳麓区枫林三路涉外经济学院',
  createTime: '2024-09-30 11:43:23',
  purpose: '了解客户需求',
  notes: '-',
  tags: ['商务', '售后'],
  height: 'auto',
  heightForSec: 'auto',
  visitResult: '-',
  visitResultNotes: '-',
})
const more = 17
const marginTop = 5

function toCommit() {
  uni.navigateTo({
    url: '/pages/main/visitResult',
  })
}

function toDetail() {
  uni.navigateTo({
    url: '/pages/main/visitDetail',
  })
}

onMounted(() => {
  const query = uni.createSelectorQuery().in(instance)
  if (props.showAll) {
    query.select('.container').boundingClientRect((data: any) => {
      item.value.height = `${(data.height) * 2}rpx`
      item.value.heightForSec = `${(data.height) * 2}rpx`
    }).exec()
    open.value = true
  }
  else {
    const promise = [
      new Promise((resolve) => {
        query.select('.container').boundingClientRect((data: any) => {
          item.value.height = `${(data.height + more + marginTop) * 2}rpx`
          resolve('')
        }).exec()
      }),
      new Promise((resolve) => {
        query.selectAll('.item').boundingClientRect((data: any) => {
          item.value.heightForSec = `${(data[0].height + data[1].height + marginTop * 2 + more) * 2}rpx`
          resolve('')
        }).exec()
      }),
    ]
    Promise.all(promise).then(() => {
    // console.log(item.value)
    })
  }
})
</script>

<template>
  <view flex flex-col rounded-[15rpx] bg-white p-[20rpx]>
    <view flex items-center gap-[10rpx]>
      <view flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
        <view i-heroicons:user-solid text-[22rpx] text-blue-500 />
        <text>客户姓名:</text>
      </view>
      <text text-[24rpx] text-[#333]>
        {{ item.name }}
      </text>
      <view ml-auto flex items-center gap-[10rpx]>
        <view
          v-for="tag in item.tags"
          :key="tag"
          rounded-[5rpx] p-[2rpx_10rpx] text-[24rpx]
          :style="{
            color: stringToColor(tag),
            backgroundColor: `${stringToColor(tag)}20`,
          }"
        >
          {{ tag }}
        </view>
      </view>
    </view>
    <view my-[20rpx] border-b border-gray-200 border-b-dashed />
    <view
      class="container" overflow="hidden" relative flex flex-col transition-all duration-200 :style="{
        height: open ? item.height : item.heightForSec,
      }"
    >
      <view class="item" flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:phone-solid text-[22rpx] text-gray-300 />
          <text>客户电话:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.phone }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-carbon:location-filled text-[22rpx] text-gray-300 />
          <text>客户地址:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.address }}
        </text>
      </view>
      <view
        class="item"
        mt-[10rpx] flex items-center gap-[10rpx] transition-all duration-200 :style="{
          opacity: open ? 1 : 0,
        }"
      >
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:clock-solid text-[22rpx] text-gray-300 />
          <text>创建时间:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.createTime }}
        </text>
      </view>
      <view
        class="item"
        mt-[10rpx] flex items-start gap-[10rpx] transition-all duration-200 :style="{
          opacity: open ? 1 : 0,
        }"
      >
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:paper-clip-20-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            拜访目的:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.purpose }}
        </text>
      </view>
      <view
        class="item"
        mt-[10rpx] flex items-start gap-[10rpx] transition-all duration-200 :style="{
          opacity: open ? 1 : 0,
        }"
      >
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:paper-clip-20-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            拜访备注:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.notes }}
        </text>
      </view>
      <view
        v-if="showVisit"
        class="item" mt-[10rpx] flex items-start gap-[10rpx] transition-all duration-200
        :style="{
          opacity: open ? 1 : 0,
        }"
      >
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:paper-clip-20-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            拜访结果:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.visitResult }}
        </text>
      </view>
      <view
        v-if="showVisit"
        class="item" mt-[10rpx] flex items-start gap-[10rpx] transition-all duration-200
        :style="{
          opacity: open ? 1 : 0,
        }"
      >
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:paper-clip-20-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            结果备注:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.visitResultNotes }}
        </text>
      </view>
      <view v-if="!showAll" absolute bottom-0 left-0 w-full flex items-center justify-center bg-white @click="open = !open">
        <template v-if="!open">
          <text text-[24rpx] text-gray-400>
            展开
          </text>
          <view i-heroicons:chevron-down-16-solid text-[24rpx] text-gray-400 />
        </template>
        <template v-else>
          <text text-[24rpx] text-gray-400>
            收起
          </text>
          <view i-heroicons:chevron-up-16-solid text-[24rpx] text-gray-400 />
        </template>
      </view>
    </view>
    <view v-if="!hideButton" my-[20rpx] border-b border-gray-200 border-b-dashed />
    <view v-if="!hideButton" flex items-center justify-end gap-[20rpx] text-[24rpx] text-gray-500>
      <ClickButton type="primary" size="medium" @click="toDetail">
        <view i-heroicons:information-circle mr-[10rpx] />
        <text>详情</text>
      </ClickButton>
      <ClickButton type="primary" size="medium" @click="toCommit">
        <view i-heroicons:pencil-square-solid mr-[10rpx] />
        <text>提交拜访信息</text>
      </ClickButton>
    </view>
  </view>
</template>
