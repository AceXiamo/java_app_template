<script lang="ts" setup>
import { type TenantDept, del, save } from '@/api/dept'

const props = defineProps<{
  item: TenantDept
}>()
const emit = defineEmits<{
  (e: 'reload'): void
}>()

const thisItem = ref<TenantDept>({})

function toEdit() {
  inputConfirmRef.value?.show({
    title: '修改部门名称',
    type: 'info',
    value: props.item.deptName,
    placeholder: '请输入新部门名称',
    onConfirm: (value) => {
      save({ id: props.item.id, deptName: value }).then(() => {
        toastRef.value?.success('修改成功')
        emit('reload')
      })
    },
  })
}

function handleDelete(id: number) {
  confirmRef.value?.show({
    type: 'warning',
    title: '删除部门',
    content: '确定删除该部门吗？',
    onConfirm: () => {
      del({ id }).then(() => {
        toastRef.value?.success('删除成功')
        emit('reload')
      })
    },
  })
}

function memberManage() {
  uni.navigateTo({
    url: `/pages/my/deptMember?deptId=${props.item.id}`,
  })
}

onMounted(() => {
  thisItem.value = {
    ...props.item,
  }
})
</script>

<template>
  <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
    <view item-center flex p-[20rpx] shadow-md>
      <text text-[28rpx] font-bold>
        {{ item.deptName }}
      </text>
      <view ml-[10rpx] />
      <view ml-auto flex items-center gap-[10rpx]>
        <ClickButton size="medium" type="warning" @click="memberManage">
          成员管理
        </ClickButton>
        <ClickButton size="medium" type="primary" @click="toEdit">
          编辑
        </ClickButton>
        <ClickButton size="medium" type="danger" @click="handleDelete(item.id!)">
          删除
        </ClickButton>
      </view>
    </view>
    <view bg-gray-200 p-[20rpx]>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[170rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:link-16-solid text-[22rpx] text-gray-400 />
          <text>部门管理员:</text>
        </view>
        <view flex flex-wrap items-center text-[24rpx] text-[#333]>
          <view v-for="user in item.deptUserRefs?.filter(item => item.hasManage === 1)" :key="user.userId" mb-[10rpx] mr-[10rpx] rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[4rpx] text-white>
            {{ user.nickname }}
          </view>
        </view>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[170rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-carbon:location-filled text-[22rpx] text-gray-400 />
          <text>创建时间:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.createTime }}
        </text>
      </view>
    </view>
  </view>
</template>
