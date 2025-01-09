<script lang="ts" setup>
import { VisitsStatus, deleteVisits } from '@/api/visits'
import type { Visits } from '@/api/visits'
import ClickButton from '@/components/ClickButton.vue'
import { useUserStore } from '@/store/user'

const props = withDefaults(defineProps<{
  showAll?: boolean
  hideButton?: boolean
  showVisit?: boolean
  item: Visits
}>(), {
  showAll: false,
  hideButton: false,
  showVisit: true,
})
const emits = defineEmits(['reload'])
const { currentUser } = toRefs(useUserStore())
const user = computed(() => {
  return {
    ...currentUser.value.user,
    userType: currentUser.value.roles?.some(role => role === 'tenant') ? 'tenant' : 'tenant_user',
  }
})

const height = ref('auto')
const heightForSec = ref('auto')

const instance = getCurrentInstance()
const open = ref(false)
const more = 17
const marginTop = 5

function toCommit() {
  setJumpData('visits', props.item)
  uni.navigateTo({
    url: '/pages/main/visitResult',
  })
}

function toDetail() {
  setJumpData('visits', props.item)
  uni.navigateTo({
    url: '/pages/main/visitDetail',
  })
}

function handleDelete() {
  confirmRef.value?.show({
    type: 'warning',
    title: '提示',
    content: '确定删除吗？',
    onConfirm: () => {
      deleteVisits({ id: props.item.id! }).then(() => {
        toastRef.value?.success('删除成功')
        emits('reload')
      })
    },
  })
}

function toEdit() {
  setJumpData('visits', props.item)
  uni.navigateTo({
    url: '/pages/my/editVisits',
  })
}

onMounted(() => {
  const query = uni.createSelectorQuery().in(instance)
  if (props.showAll) {
    open.value = true
  }
  else {
    const promise = [
      new Promise((resolve) => {
        query.select('.container').boundingClientRect((data: any) => {
          height.value = `${(data.height + more + marginTop) * 2}rpx`
          resolve('')
        }).exec()
      }),
      new Promise((resolve) => {
        query.selectAll('.item').boundingClientRect((data: any) => {
          heightForSec.value = `${(data[0].height + data[1].height + marginTop * 2 + more) * 2}rpx`
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
        {{ item.customerName }}
      </text>
      <view ml-auto flex items-center gap-[10rpx]>
        <view
          rounded-[5rpx] p-[2rpx_10rpx] text-[24rpx]
          :style="{
            color: stringToColor(VisitsStatus[item.status || 0]),
            backgroundColor: `${stringToColor(VisitsStatus[item.status || 0])}20`,
          }"
        >
          {{ VisitsStatus[item.status || 0] }}
        </view>
      </view>
    </view>
    <view my-[20rpx] border-b border-gray-200 border-b-dashed />
    <view
      class="container" overflow="hidden" relative flex flex-col transition-all duration-200 :style="{
        height: open ? height : heightForSec,
      }"
    >
      <view class="item" flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:phone-solid text-[22rpx] text-gray-300 />
          <text>客户电话:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.customerPhone }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-start gap-[10rpx]>
        <view w-[140rpx] flex flex-none items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-carbon:location-filled text-[22rpx] text-gray-300 />
          <text>客户地址:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.location }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-start gap-[10rpx]>
        <view w-[140rpx] flex flex-none items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:clock-16-solid text-[22rpx] text-gray-300 />
          <text>计划时间:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.visitDate }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-start gap-[10rpx]>
        <view w-[140rpx] flex flex-none items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:user-circle-20-solid text-[22rpx] text-gray-300 />
          <text>负责人:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.userName }}
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
          {{ item.purpose ?? '-' }}
        </text>
      </view>
      <view
        class="item"
        mt-[10rpx] flex items-start gap-[10rpx] transition-all duration-200 :style="{
          opacity: open ? 1 : 0,
        }"
      >
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:chat-bubble-left-ellipsis-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            拜访备注:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.notes ?? '-' }}
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
          <view i-heroicons:light-bulb-16-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            拜访结果:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.outcomes?.outcomeTypeName ?? '-' }}
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
          <view i-heroicons:chart-bar-square-solid text-[22rpx] text-gray-300 />
          <text whitespace-nowrap>
            结果备注:
          </text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.outcomes?.description ?? '-' }}
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
      <ClickButton v-if="user.userType === 'tenant' || user.userId === item.userId" type="danger" size="medium" @click="handleDelete">
        <view i-heroicons:trash-solid mr-[10rpx] />
        <text>删除</text>
      </ClickButton>
      <ClickButton v-if="user.userType === 'tenant' || user.userId === item.userId" type="primary" size="medium" @click="toEdit">
        <view i-heroicons:pencil-square-solid mr-[10rpx] />
        <text>编辑</text>
      </ClickButton>
      <ClickButton type="primary" size="medium" @click="toDetail">
        <view i-heroicons:information-circle mr-[10rpx] />
        <text>详情</text>
      </ClickButton>
      <ClickButton type="primary" size="medium" @click="toCommit">
        <view i-heroicons:pencil-square-solid mr-[10rpx] />
        <text>{{ item.status === 0 ? '提交拜访信息' : '修改拜访结果' }}</text>
      </ClickButton>
    </view>
  </view>
</template>
