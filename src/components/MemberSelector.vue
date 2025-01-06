<script lang="ts" setup>
import { ref, watch, watchEffect } from 'vue'
import { useSettingStore } from '@/store/setting'
import { type SysUser, getUserList } from '@/api/user'

const props = defineProps<{
  value: SysUser
  ignore?: SysUser[]
}>()
const emits = defineEmits(['confirm'])
const settingStore = useSettingStore()
const toast = ref()

const originalData = ref<SysUser[]>([])
const inputValue = ref<string>('')
const selectValue = ref<SysUser>({})
const showItems = ref<SysUser[]>([])
const className = ref<'show' | 'hide' | ''>('')

function handleCheck(data: SysUser) {
  if (props.ignore?.find(item => item.userId === data.userId))
    return

  selectValue.value = data
}

watch(inputValue, (value) => {
  showItems.value = originalData.value.filter(item => item.nickName!.includes(value) || item.userName!.includes(value) || item.phonenumber!.includes(value))
})

watchEffect(() => {
  showItems.value = originalData.value
  selectValue.value = props.value
})

function show() {
  if (props.ignore)
    selectValue.value = {}

  className.value = 'show'
}

function confirm() {
  if (!selectValue.value.userId) {
    toast.value.error('请选择负责人')
    return
  }
  emits('confirm', selectValue.value)
  className.value = 'hide'
}

function loadData() {
  getUserList({ pageNum: 1, pageSize: 1000 }).then((res) => {
    originalData.value = res.rows || []
    showItems.value = originalData.value
  })
}

onMounted(() => {
  loadData()
})

defineExpose({
  show,
})
</script>

<template>
  <view
    v-if="className === 'show'"
    class="fixed bottom-0 left-0 right-0 top-0 z-[999] flex flex-col justify-end bg-black bg-opacity-20 transition-all duration-100"
    :style="{
      opacity: className === 'show' ? 1 : 0,
      pointerEvents: className === 'show' ? 'auto' : 'none',
    }" @click="className = 'hide'"
  >
    <view class="min-h-[650rpx] flex flex-col rounded-t-md bg-white p-[30rpx]" :class="[`${className}`]" @click.stop>
      <view class="flex items-center">
        <text class="text-[30rpx] text-[#333]">
          负责人选择
        </text>
        <view class="ml-auto" @click="className = 'hide'">
          <u-icon name="close-circle-fill" size="20" color="#ef4444" />
        </view>
      </view>

      <view class="mt-[20rpx] w-max flex-none rounded-1 bg-gray-100 p-[5rpx_10rpx]">
        <input
          v-model="inputValue" type="text" class="w-[380rpx] text-[26rpx] text-gray-500"
          placeholder="输入内容以筛选"
        >
      </view>

      <view
        class="mt-[20rpx] h-0 flex flex-auto flex-col gap-[6rpx] overflow-auto" :style="{
          paddingBottom: settingStore.isAppleAndHasLine
            ? `30rpx`
            : `calc(env(safe-area-inset-bottom) + 30rpx)`,
        }"
      >
        <view class="h-0 flex flex-auto flex-col snap-y gap-[6rpx] overflow-y-auto">
          <view
            v-for="(data, index) in showItems" :key="index"
            class="flex snap-start items-center gap-[20rpx] rounded-1 bg-gray-100 p-[20rpx] text-[24rpx] active:opacity-60"
            :class="[
              $props.ignore?.find((item: SysUser) => item.userId === data.userId) && 'opacity-50',
            ]" @click="handleCheck(data)"
          >
            <view class="w-full flex items-center gap-[10rpx]">
              <view
                i-heroicons:check-circle-20-solid text-[22rpx] :style="{
                  color: selectValue?.userId === data.userId ? '#22c55e' : '#e5e7eb',
                }"
              />
              <view class="w-max flex-none">
                <text class="text-gray-400">
                  {{ data.userName }}
                </text>
              </view>
              <view class="w-0 flex-auto truncate">
                <text class="text-[#333]">
                  {{ data.nickName }}
                </text>
              </view>
            </view>
          </view>
        </view>

        <view class="mt-auto flex items-center gap-[50rpx]">
          <view class="w-0 flex flex-auto gap-[10rpx] text-[24rpx]">
            <text class="w-max text-gray-400">
              当前已选
            </text>
            <text class="w-0 flex-auto truncate text-[#333]">
              {{ selectValue?.nickName }}
            </text>
          </view>
          <view
            class="ml-auto w-max flex flex-none items-center rounded-1 p-[10rpx_30rpx] active:opacity-60" :class="[
              selectValue?.nickName && `bg-blue-500`,
              !selectValue?.nickName && `bg-blue-300`,
            ]" @click="confirm"
          >
            <text class="text-[24rpx] text-white">
              确定
            </text>
          </view>
        </view>
      </view>
    </view>
    <Toast ref="toast" />
  </view>
</template>

<style scoped>
.show {
  animation: selectorAni 0.2s linear forwards;
}

.hide {
  animation: selectorAni2 0.2s linear forwards;
}

@keyframes selectorAni {
  0% {
    transform: translateY(50rpx);
    opacity: 0;
  }

  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes selectorAni2 {
  0% {
    transform: translateY(0);
    opacity: 1;
  }

  100% {
    transform: translateY(50rpx);
    opacity: 0;
  }
}
</style>
