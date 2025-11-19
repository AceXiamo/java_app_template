<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import BottomDrawer from '@/components/BottomDrawer.vue'

interface DateRangePickerProps {
  visible: boolean
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
}

interface DateRangePickerEmits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm', data: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    startDateTime: string
    endDateTime: string
  }): void
}

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  startDate: '',
  endDate: '',
  startTime: '09:00',
  endTime: '18:00',
})

const emit = defineEmits<DateRangePickerEmits>()

// 内部状态
const currentMonth = ref(dayjs())
const selectedStartDate = ref('')
const selectedEndDate = ref('')
const selectedStartTime = ref('09:00')
const selectedEndTime = ref('18:00')
const selectionMode = ref<'start' | 'end'>('start')

// 生成15分钟间隔的时间选项
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
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
    selectedStartDate.value = props.startDate || dayjs().format('YYYY-MM-DD')
    selectedEndDate.value = props.endDate || dayjs().add(1, 'day').format('YYYY-MM-DD')
    selectedStartTime.value = props.startTime || '09:00'
    selectedEndTime.value = props.endTime || '18:00'
    selectionMode.value = 'start'

    // 设置当前月份为选择的开始日期所在月份
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

  // 只有过去的日期不可选择
  if (!dayInfo || dayInfo.isPast) {
    return
  }

  // 如果没有选择任何日期，设为开始日期
  if (!selectedStartDate.value && !selectedEndDate.value) {
    selectedStartDate.value = date
    return
  }

  // 如果只选择了开始日期
  if (selectedStartDate.value && !selectedEndDate.value) {
    const clickedDate = dayjs(date)
    const startDate = dayjs(selectedStartDate.value)

    if (clickedDate.isBefore(startDate)) {
      // 点击的日期更早，将其设为开始日期，原开始日期变为结束日期
      selectedEndDate.value = selectedStartDate.value
      selectedStartDate.value = date
    }
    else {
      // 点击的日期更晚，设为结束日期
      selectedEndDate.value = date
    }
    return
  }

  // 如果两个日期都已选择，重置并开始新的选择
  if (selectedStartDate.value && selectedEndDate.value) {
    selectedStartDate.value = date
    selectedEndDate.value = ''
    return
  }
}

// 获取日期的显示状态
function getDateStatus(date: string) {
  const isSelected = date === selectedStartDate.value || date === selectedEndDate.value
  const isInRange = dayjs(date).isAfter(dayjs(selectedStartDate.value))
    && dayjs(date).isBefore(dayjs(selectedEndDate.value))
  const isStart = date === selectedStartDate.value
  const isEnd = date === selectedEndDate.value

  return { isSelected, isInRange, isStart, isEnd }
}

// 获取日期按钮的样式类
function getDateButtonClass(dayInfo: any) {
  const status = getDateStatus(dayInfo.date)

  // 过去的日期 - 置灰且禁用
  if (dayInfo.isPast) {
    return 'bg-transparent text-gray-300 cursor-not-allowed'
  }

  // 选中的开始或结束日期 - 紫色背景
  if (status.isStart || status.isEnd) {
    return 'bg-purple-600 text-white shadow-sm'
  }

  // 范围内的日期 - 浅紫色背景
  if (status.isInRange) {
    return 'bg-purple-50 text-purple-600'
  }

  // 非当前月份的日期 - 浅灰色文字
  if (!dayInfo.isCurrentMonth) {
    return 'text-gray-400 hover:bg-gray-50'
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
  // 验证是否选择了完整的日期
  if (!selectedStartDate.value || !selectedEndDate.value) {
    uni.showToast({
      title: '请选择完整的时间段',
      icon: 'none',
    })
    return
  }

  const startDateTime = `${selectedStartDate.value} ${selectedStartTime.value}`
  const endDateTime = `${selectedEndDate.value} ${selectedEndTime.value}`

  // 验证时间范围
  if (dayjs(endDateTime).isBefore(dayjs(startDateTime))) {
    uni.showToast({
      title: '还车时间不能早于取车时间',
      icon: 'none',
    })
    return
  }

  emit('confirm', {
    startDate: selectedStartDate.value,
    endDate: selectedEndDate.value,
    startTime: selectedStartTime.value,
    endTime: selectedEndTime.value,
    startDateTime,
    endDateTime,
  })

  handleClose()
}
</script>

<template>
  <BottomDrawer
    :visible="visible"
    title="选择用车时间"
    height="800rpx"
    @update:visible="handleClose"
  >
    <view class="h-full flex flex-col pt-[32rpx]">
      <!-- 日历部分 -->
      <view class="min-h-[550rpx] flex-1">
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
      <view class="border-t border-gray-100">
        <!-- 两列时间选择布局 -->
        <view class="grid grid-cols-2 mb-[32rpx] gap-[16rpx] rounded-[16rpx] bg-gray-50 p-[16rpx]">
          <!-- 取车时间 -->
          <view class="rounded-[16rpx] bg-white p-[20rpx]">
            <text class="mb-[4rpx] block text-center text-[24rpx] text-gray-900 font-medium">
              取车时间
            </text>
            <text v-if="selectedStartDate" class="mb-[16rpx] block text-center text-[20rpx] text-gray-500">
              {{ dayjs(selectedStartDate).format('MM月DD日') }}
            </text>
            <text v-else class="mb-[16rpx] block text-center text-[20rpx] text-gray-400">
              请选择日期
            </text>
            <picker
              mode="selector"
              :range="timeSlots"
              range-key="label"
              :value="timeSlots.findIndex(item => item.value === selectedStartTime)"
              @change="(e: any) => selectedStartTime = timeSlots[e.detail.value].value"
            >
              <view class="min-h-[56rpx] flex items-center justify-center rounded-[12rpx] bg-gray-50 py-[12rpx]">
                <text class="text-[30rpx] text-gray-900 font-semibold">
                  {{ selectedStartTime }}
                </text>
                <text class="i-material-symbols-keyboard-arrow-down ml-[8rpx] text-[18rpx] text-gray-400" />
              </view>
            </picker>
          </view>

          <!-- 还车时间 -->
          <view class="rounded-[16rpx] bg-white p-[20rpx]">
            <text class="mb-[4rpx] block text-center text-[24rpx] text-gray-900 font-medium">
              还车时间
            </text>
            <text v-if="selectedEndDate" class="mb-[16rpx] block text-center text-[20rpx] text-gray-500">
              {{ dayjs(selectedEndDate).format('MM月DD日') }}
            </text>
            <text v-else class="mb-[16rpx] block text-center text-[20rpx] text-gray-400">
              请选择日期
            </text>
            <picker
              mode="selector"
              :range="timeSlots"
              range-key="label"
              :value="timeSlots.findIndex(item => item.value === selectedEndTime)"
              @change="(e: any) => selectedEndTime = timeSlots[e.detail.value].value"
            >
              <view class="min-h-[56rpx] flex items-center justify-center rounded-[12rpx] bg-gray-50 py-[12rpx]">
                <text class="text-[30rpx] text-gray-900 font-semibold">
                  {{ selectedEndTime }}
                </text>
                <text class="i-material-symbols-keyboard-arrow-down ml-[8rpx] text-[18rpx] text-gray-400" />
              </view>
            </picker>
          </view>
        </view>

        <!-- 确认按钮 -->
        <button
          class="w-full rounded-[16rpx] bg-purple-600 py-[15rpx] text-[26rpx] text-white font-medium shadow-sm"
          @tap="handleConfirm"
        >
          确认选择
        </button>
      </view>

      <view class="h-[50rpx]" />
    </view>
  </BottomDrawer>
</template>
