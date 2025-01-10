<script lang="ts" setup>
import { delBanner, listBanner, saveBanner } from '@/api/banner'
import type { TenantBanner } from '@/api/banner'
import { getVisitQrcode } from '@/api/customerVisit'
import FormImage from '@/components/form/Image.vue'
import { host } from '@/utils/alioss'

type BannerItem = TenantBanner & { x?: number, y?: number }

const bannerList = ref<BannerItem[]>([])
const showAddForm = ref(false)
const formData = ref<BannerItem>({
  url: '',
  sort: 0,
})
const dragId = ref<number | null>(null)
const dragIndex = ref(-1)
const dragItemHeight = ref(80)
const moveToIndex = ref(-1)
const oldIndex = ref(-1)
const lastY = ref(0)
const containerHeight = computed(() => {
  const gap = 10
  return bannerList.value.length * (dragItemHeight.value + gap) - gap
})

function handleDragStart(index: number, id: number) {
  dragIndex.value = index
  dragId.value = id
  oldIndex.value = index
}

function handleDragEnd() {
  let isChanged = false
  if (dragIndex.value !== moveToIndex.value && dragIndex.value !== -1 && moveToIndex.value !== -1) {
    const newList = [...bannerList.value]
    newList.splice(moveToIndex.value, 0, ...newList.splice(dragIndex.value, 1))
    isChanged = newList.some((item, index) => item.id !== bannerList.value[index].id)
    bannerList.value = newList
  }

  bannerList.value.forEach((item, index) => {
    if (moveToIndex.value === -1 || dragIndex.value === moveToIndex.value) {
      item.y = 1
      setTimeout(() => {
        item.y = index * (dragItemHeight.value + 10)
      })
    }
    else {
      item.y = index * (dragItemHeight.value + 10)
    }
  })

  dragId.value = null
  dragIndex.value = -1
  moveToIndex.value = -1
  oldIndex.value = -1

  if (isChanged) {
    // 更新所有 banner 的排序
    const updatePromises = bannerList.value.map((item, index) => {
      return saveBanner({
        ...item,
        sort: index, // 使用当前索引作为排序值
      })
    })

    // 等待所有更新完成
    Promise.all(updatePromises).then(() => {
      toastRef.value?.success('更新排序成功')
    }).catch((error) => {
      console.error('更新排序失败:', error)
      toastRef.value?.error('更新排序失败')
    })
  }
}

function handleMove(e: any) {
  if (e.detail.source !== 'touch')
    return
  const { _, y } = e.detail as any
  const currentY = Math.floor((y + dragItemHeight.value / 2) / dragItemHeight.value)
  moveToIndex.value = Math.min(currentY, bannerList.value.length - 1)

  if (oldIndex.value !== moveToIndex.value && oldIndex.value !== -1 && moveToIndex.value !== -1) {
    const newList = [...bannerList.value]
    newList.splice(moveToIndex.value, 0, ...newList.splice(dragIndex.value, 1))

    bannerList.value.forEach((item) => {
      if (item.id !== dragId.value) {
        const newIndex = newList.findIndex(val => val.id === item.id)
        item.y = newIndex * (dragItemHeight.value + 10)
      }
    })
    oldIndex.value = moveToIndex.value
    lastY.value = y
  }
}

async function loadBanners() {
  const res = await listBanner()
  bannerList.value = res.data.map((item, index) => ({
    ...item,
    x: 0,
    y: index * (dragItemHeight.value + 10),
  }))
}

function handleDelete(id: number) {
  uni.vibrateShort()
  confirmRef.value?.show({
    type: 'warning',
    title: '提示',
    content: '确定删除该轮播图吗？',
    onConfirm: () => {
      delBanner({ id }).then(() => {
        toastRef.value?.success('删除成功')
        loadBanners()
      })
    },
  })
}

function previewImage(url: string) {
  uni.previewImage({
    current: host + url,
    urls: bannerList.value.map(item => host + item.url!),
  })
}

// 保存Banner
async function handleSave() {
  if (!formData.value.url)
    return toastRef.value?.error('请上传图片')

  uploadImageToOSS(formData.value.url, 'banner').then(async (res) => {
    await saveBanner({
      ...formData.value,
      url: res.replace(host, ''),
    })
    toastRef.value?.success('保存成功')
    showAddForm.value = false
    formData.value = {
      url: '',
      sort: bannerList.value.length,
    }
    loadBanners()
  })
}

const showQrCodeViewer = ref(false)
const qrCodeBase64 = ref('')

function showQrCode() {
  if (qrCodeBase64.value) {
    showQrCodeViewer.value = true
    return
  }
  uni.showLoading({
    title: '加载中',
  })
  getVisitQrcode().then((res) => {
    qrCodeBase64.value = res.msg
    showQrCodeViewer.value = true
  }).finally(() => {
    uni.hideLoading()
  })
}

onMounted(() => {
  loadBanners()
})
</script>

<template>
  <view h-full flex flex-col>
    <ShareEditHead />
    <view class="h-0 flex-1 overflow-y-auto p-[20rpx]">
      <view

        mb-[20rpx] h-[200rpx] w-full flex cursor-pointer items-center justify-center border-1 border-gray-300 rounded-[16rpx] border-dashed bg-gray-50 transition-all duration-300 active:scale-[0.98] hover:bg-gray-100
        @click="showAddForm = true"
      >
        <view flex flex-col items-center gap-[16rpx]>
          <view
            text-primary i-heroicons:plus-circle-solid text-[36rpx] opacity-80
          />
          <text
            text-[26rpx]
            text-gray-500
            font-medium
          >
            添加 Banner
          </text>
        </view>
      </view>
      <view pb-[20rpx] text-[24rpx] text-gray-400>
        提示: 拖动图片可以调整顺序，长按图片可删除
      </view>
      <view class="flex pb-[20rpx]">
        <ClickButton label="分享页二维码" type="primary" @click="showQrCode" />
      </view>
      <movable-area class="w-full flex flex-auto" :style="{ height: `${containerHeight * 2}rpx` }">
        <movable-view
          v-for="(item, index) in bannerList"
          :key="item.id"
          :x="0"
          :y="item.y"
          class="aspect-square w-full"
          :style="{ height: `${dragItemHeight * 2}rpx` }"
          direction="all"
          @change="handleMove"
          @touchstart="handleDragStart(index, item.id!)"
          @touchend="handleDragEnd"
        >
          <view class="h-full w-full border border-gray-200 rounded-[10rpx] border-dashed bg-white">
            <image
              :src="host + item.url" class="h-full w-full rounded-[10rpx]" mode="aspectFill" @click="previewImage(item.url!)"
              @longpress="handleDelete(item.id!)"
            />
          </view>
        </movable-view>
      </movable-area>
    </view>

    <BottomDrawer
      :visible="showAddForm"
      height="600rpx"
      title="添加轮播图"
      @update:visible="showAddForm = $event"
      @close="showAddForm = false"
    >
      <view class="box-border h-full flex flex-col py-[40rpx]">
        <FormImage
          v-model="formData.url"
          :limit="1"
          required
        />
        <view mt-auto flex justify-end gap-[20rpx]>
          <ClickButton type="default" @click="showAddForm = false">
            取消
          </ClickButton>
          <ClickButton type="primary" @click="handleSave">
            确定
          </ClickButton>
        </view>
      </view>
    </BottomDrawer>

    <CenterDialog :visible="showQrCodeViewer" title="分享页二维码" width="550rpx" @update:visible="showQrCodeViewer = $event">
      <view flex flex-col items-center justify-center gap-[20rpx]>
        <image :src="qrCodeBase64" mode="aspectFill" class="h-[400rpx] w-[400rpx]" />
        <view flex justify-center>
          <text text-[24rpx] text-gray-400 font-medium>
            提示: 长按图片保存到相册
          </text>
        </view>
      </view>
    </CenterDialog>
  </view>
</template>

<route lang="json">
{
  "layout": "home"
}
</route>
