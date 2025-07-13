<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import BottomDrawer from '@/components/BottomDrawer.vue'

interface DateTimePickerProps {
  visible: boolean
  startDate?: string
  startTime?: string
}

interface DateTimePickerEmits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', data: {
    startDate: string
    startTime: string
  }): void
}

const props = withDefaults(defineProps<DateTimePickerProps>(), {
  startDate: '',
  startTime: '09:00',
})

const emit = defineEmits<DateTimePickerEmits>()

// 内部状态
const currentMonth = ref(dayjs())
const selectedDate = ref('')
const selectedTime = ref('09:00')

// 生成15分钟间隔的时间选项
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 6; hour < 24; hour++) { // 限制在6:00-23:45
    for (let minute = 0; minute < 60; minute += 15) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push({
        value: timeStr,
        label: timeStr,
        hour,
        minute,
      })
    }
  }
  return slots
})

// 生成日历网格数据
const calendarDays = computed(() => {
  const startOfMonth = currentMonth.value.startOf('month')
  const endOfMonth = currentMonth.value.endOf('month')
  const startOfCalendar = startOfMonth.startOf('week')
  const endOfCalendar = endOfMonth.endOf('week')

  const days = []
  let current = startOfCalendar

  while (current.isBefore(endOfCalendar) || current.isSame(endOfCalendar, 'day')) {
    const dayInfo = {
      date: current.format('YYYY-MM-DD'),
      day: current.date(),
      isCurrentMonth: current.isSame(currentMonth.value, 'month'),
      isToday: current.isSame(dayjs(), 'day'),
      isWeekend: current.day() === 0 || current.day() === 6,
      isPast: current.isBefore(dayjs(), 'day'),
      weekday: current.format('ddd'),
    }
    days.push(dayInfo)
    current = current.add(1, 'day')
  }

  return days
})

// 监听props变化，初始化本地状态
watch(() => props.visible, (visible) => {
  if (visible) {
    selectedDate.value = props.startDate || dayjs().format('YYYY-MM-DD')
    selectedTime.value = props.startTime || '09:00'

    // 设置当前月份为选择的日期所在月份
    if (props.startDate) {
      currentMonth.value = dayjs(props.startDate)
    }
  }
})

// 切换月份
function changeMonth(direction: 'prev' | 'next') {
  if (direction === 'prev') {
    currentMonth.value = currentMonth.value.subtract(1, 'month')
  }
  else {
    currentMonth.value = currentMonth.value.add(1, 'month')
  }
}

// 选择日期
function selectDate(date: string) {
  const dayInfo = calendarDays.value.find(d => d.date === date)

  // 过去的日期或非本月日期不可选择
  if (!dayInfo || dayInfo.isPast || !dayInfo.isCurrentMonth) {
    return
  }

  selectedDate.value = date
}

// 获取日期按钮的样式类
function getDateButtonClass(dayInfo: any) {
  // 非本月或过去的日期 - 置灰且禁用
  if (dayInfo.isPast) {
    return 'bg-transparent text-gray-300 cursor-not-allowed'
  }

  // 选中的日期 - 紫色背景
  if (dayInfo.date === selectedDate.value) {
    return 'bg-purple-600 text-white shadow-sm'
  }

  // 今天且未选中 - 白色背景紫色边框
  if (dayInfo.isToday) {
    return 'bg-white text-gray-900 shadow-sm ring-2 ring-purple-200'
  }

  // 普通可选日期 - 默认样式
  return 'text-gray-900 hover:bg-gray-50'
}

// 关闭抽屉
function handleClose() {
  emit('update:visible', false)
}

// 确认选择
function handleConfirm() {
  if (!selectedDate.value) {
    uni.showToast({
      title: '请选择取车日期',
      icon: 'none',
    })
    return
  }

  emit('confirm', {
    startDate: selectedDate.value,
    startTime: selectedTime.value,
  })

  handleClose()
}
</script>

<template>
  <BottomDrawer
    :visible="visible"
    title="选择取车时间"
    height="700rpx"
    @update:visible="handleClose"
  >
    <view class="h-full flex flex-col pt-[32rpx]">
      <!-- 日历部分 -->
      <view class="min-h-[450rpx] flex-1">
        <!-- 月份导航 -->
        <view class="mb-[24rpx] flex items-center justify-between">
          <view
            class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-full bg-white"
            @tap="changeMonth('prev')"
          >
            <text class="i-material-symbols-chevron-left text-[48rpx] text-gray-600" />
          </view>

          <text class="text-[32rpx] text-gray-900 font-medium">
            {{ currentMonth.format('YYYY年MM月') }}
          </text>

          <view
            class="h-[48rpx] w-[48rpx] flex items-center justify-center rounded-full bg-white"
            @tap="changeMonth('next')"
          >
            <text class="i-material-symbols-chevron-right text-[48rpx] text-gray-600" />
          </view>
        </view>

        <!-- 星期标题 -->
        <view class="grid grid-cols-7 mb-[16rpx] gap-[6rpx]">
          <view
            v-for="day in ['日', '一', '二', '三', '四', '五', '六']"
            :key="day"
            class="h-[48rpx] flex items-center justify-center text-[22rpx] text-gray-500 font-medium"
          >
            {{ day }}
          </view>
        </view>

        <!-- 日期网格 -->
        <view class="grid grid-cols-7 gap-[12rpx]">
          <view
            v-for="dayInfo in calendarDays"
            :key="dayInfo.date"
            class="mx-auto h-[56rpx] w-[56rpx] flex items-center justify-center rounded-[12rpx] text-[26rpx] font-medium transition-all"
            :class="getDateButtonClass(dayInfo)"
            @tap="selectDate(dayInfo.date)"
          >
            {{ dayInfo.day }}
          </view>
        </view>
      </view>

      <!-- 时间选择部分 -->
      <view class="border-t border-gray-100 pt-[24rpx]">
        <!-- 单列时间选择布局 -->
        <view class="mb-[32rpx] rounded-[16rpx] bg-gray-50 p-[16rpx]">
          <view class="rounded-[16rpx] bg-white p-[24rpx]">
            <text class="mb-[8rpx] block text-center text-[28rpx] text-gray-900 font-medium">
              取车时间
            </text>
            <text class="mb-[20rpx] block text-center text-[24rpx] text-gray-500">
              {{ dayjs(selectedDate).format('MM月DD日') }}
            </text>
            <picker
              mode="selector"
              :range="timeSlots"
              range-key="label"
              :value="timeSlots.findIndex(item => item.value === selectedTime)"
              @change="(e: any) => selectedTime = timeSlots[e.detail.value].value"
            >
              <view class="min-h-[64rpx] flex items-center justify-center rounded-[12rpx] bg-gray-50 py-[16rpx]">
                <text class="text-[36rpx] text-gray-900 font-semibold">
                  {{ selectedTime }}
                </text>
                <text class="i-material-symbols-keyboard-arrow-down ml-[12rpx] text-[24rpx] text-gray-400" />
              </view>
            </picker>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view
          class="w-full rounded-[16rpx] bg-purple-600 py-[20rpx] text-[32rpx] text-white font-medium shadow-sm text-center active:scale-[0.98] transition-transform"
          @tap="handleConfirm"
        >
          确认选择
        </view>
      </view>

      <view class="h-[50rpx]" />
    </view>
  </BottomDrawer>
</template>