<script lang="ts" setup>
const props = withDefaults(defineProps<{
  label: string
  required?: boolean
  modelValue: MapModelValue
  disabled?: boolean
  placeholder?: string
}>(), {
  disabled: false,
})

const emits = defineEmits(['update:modelValue'])

const result = ref<MapModelValue>(props.modelValue)
const mapSearchVal = ref<string>('')
const showMapSearch = ref<boolean>(false)
const mapResult = ref<any[]>([])
const markers = ref<Marker[]>([])
const searchWithDebounce = debounce(handleMapSearch, 1000)

function handleMapSearch() {
  if (mapSearchVal.value) {
    uni.request({
      url: `https://restapi.amap.com/v3/assistant/inputtips?key=71e38cd17bc480d841eb195044145eb0&keywords=${mapSearchVal.value}`,
      success: (res: any) => {
        showMapSearch.value = true
        mapResult.value = res.data.tips
      },
    })
  }
}

watch(() => props.modelValue, (newValue) => {
  console.log(newValue)
  result.value = newValue
  mapSearchVal.value = result.value.location ?? ''
  if (result.value.latitude && result.value.longitude) {
    markers.value = [
      {
        id: 1,
        longitude: Number(result.value.longitude),
        latitude: Number(result.value.latitude),
        iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
        width: 30,
        height: 30,
      },
    ]
  }
}, { immediate: true })

function getLocation() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      result.value.latitude = res.latitude.toString()
      result.value.longitude = res.longitude.toString()
      markers.value = [
        {
          id: 1,
          longitude: res.longitude,
          latitude: res.latitude,
          iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
          width: 30,
          height: 30,
        },
      ]
    },
    fail: (err) => {
      logger.error(err)
    },
  })
}

function handleMapSearchResultClick(item: MapResult) {
  mapSearchVal.value = item.name
  showMapSearch.value = false
  const location = item.location.split(',')
  result.value.location = `${item.district}${item.address}`
  result.value.latitude = location[1]
  result.value.longitude = location[0]
  markers.value = [
    {
      id: 1,
      longitude: Number(location[0]),
      latitude: Number(location[1]),
      iconPath: 'https://file.qwq.link/icon/miniapp/location.png',
      width: 30,
      height: 30,
    },
  ]
  emits('update:modelValue', result.value)
}

onMounted(() => {
  if (!props.modelValue?.latitude || !props.modelValue?.longitude)
    getLocation()
})
</script>

<template>
  <view flex flex-col justify-center gap-[20rpx]>
    <view ml-[20rpx] flex items-center gap-[10rpx]>
      <view i-carbon:location-filled text-[26rpx] text-emerald-500 />
      <text text-[26rpx] text-[#333]>
        客户地址
      </text>
    </view>
    <view relative box-border w-full flex items-center border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
      <input
        v-model="mapSearchVal" type="text" placeholder="键入文字以搜索" class="w-full text-[26rpx]" :style="{
          pointerEvents: showMapSearch ? 'none' : 'auto',
        }"
        @input="searchWithDebounce"
      >
      <view
        absolute right-[20rpx] transition-all duration-200 :style="{
          opacity: showMapSearch ? 1 : 0,
          pointerEvents: showMapSearch ? 'auto' : 'none',
        }"
      >
        <ClickButton size="medium" type="primary" @click="showMapSearch = false">
          收起
        </ClickButton>
      </view>
      <view
        :style="{
          bottom: showMapSearch ? '-20rpx' : '0',
          opacity: showMapSearch ? 1 : 0,
          pointerEvents: showMapSearch ? 'auto' : 'none',
        }"
        absolute bottom-[-20rpx] left-0 right-0 z-1 box-border max-h-[300rpx] flex flex-col translate-y-full gap-[10rpx] overflow-y-auto border border-gray-300 rounded-[10rpx] border-solid bg-white p-[10rpx] transition-all duration-200
      >
        <view v-for="item in mapResult" :key="item.id" box-border w-full rounded-[10rpx] p-[5rpx] text-[26rpx] @click="handleMapSearchResultClick(item)">
          {{ item.name }}
        </view>
      </view>
    </view>
    <view h-[500rpx] w-full>
      <map class="h-full w-full" :latitude="result.latitude" :longitude="result.longitude" :markers="markers" />
    </view>
  </view>
</template>
