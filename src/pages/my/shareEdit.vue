<script lang="ts" setup>
import { listBanner, saveBanner } from '@/api/banner'
import type { TenantBanner } from '@/api/banner'
import FormImage from '@/components/form/Image.vue'

type BannerItem = TenantBanner & { x?: number, y?: number }

const bannerList = ref<BannerItem[]>([])
const showAddForm = ref(false)
const formData = ref<BannerItem>({
  url: '',
  sort: 0,
  tenantId: 0,
})

// 加载Banner列表
async function loadBanners() {
  const res = await listBanner()
  bannerList.value = res.data
}

// // 删除Banner
// async function handleDelete(id: number) {
//   confirmRef.value?.show({
//     type: 'warning',
//     title: '提示',
//     content: '确定删除该Banner吗？',
//     onConfirm: async () => {
//       await delBanner({ id })
//       toastRef.value?.success('删除成功')
//       loadBanners()
//     },
//   })
// }

// 保存Banner
async function handleSave() {
  if (!formData.value.url)
    return toastRef.value?.error('请上传图片')

  await saveBanner(formData.value)
  toastRef.value?.success('保存成功')
  showAddForm.value = false
  formData.value = {
    url: '',
    sort: 0,
    tenantId: 0,
  }
  loadBanners()
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
        mb-[20rpx] h-[200rpx] w-full flex items-center justify-center border border-gray-200 rounded-[10rpx] border-dashed bg-white
        @click="showAddForm = true"
      >
        <view flex flex-col items-center gap-[20rpx]>
          <view i-heroicons:plus-circle text-[80rpx] text-gray-300 />
          <text text-[28rpx] text-gray-400>
            添加Banner
          </text>
        </view>
      </view>
      <view grid grid-cols-3 gap-[20rpx]>
        <view v-for="item in bannerList" :key="item.id" class="aspect-square w-full flex border border-gray-200 rounded-[10rpx] border-dashed bg-white">
          <image :src="item.url" class="h-full w-full rounded-[10rpx]" mode="aspectFill" />
        </view>
      </view>
    </view>

    <BottomDrawer
      :visible="showAddForm"
      height="600rpx"
      title="Banner编辑"
      @update:visible="showAddForm = $event"
      @close="showAddForm = false"
    >
      <view class="p-[20rpx]">
        <FormImage
          v-model="formData.url"
          label="Banner图片"
          :limit="1"
          required
        />
        <view mt-[30rpx] flex justify-end gap-[20rpx]>
          <ClickButton type="default" @click="showAddForm = false">
            取消
          </ClickButton>
          <ClickButton type="primary" @click="handleSave">
            确定
          </ClickButton>
        </view>
      </view>
    </BottomDrawer>
  </view>
</template>

<route type="home" lang="json">
{
  "layout": "home"
}
</route>
