<script lang="ts" setup>
import { type SysUser, deleteUser, resetPwd } from '@/api/user'
import type { DeptUserRef } from '@/api/deptUserRef'

const props = defineProps<{
  item: SysUser
  deptRefList: DeptUserRef[]
}>()
const emit = defineEmits<{
  (e: 'reload'): void
}>()

type Item = SysUser & {
  userType?: 'tenant' | 'tenant_user'
}

const thisItem = ref<Item>({})

function toEdit(id: number) {
  setJumpData('user_dept', props.deptRefList)
  uni.navigateTo({
    url: `/pages/my/editUser?id=${id}`,
  })
}

function handleDelete(userId: number) {
  confirmRef.value?.show({
    type: 'warning',
    title: '删除用户',
    content: '确定删除该用户吗？',
    onConfirm: () => {
      deleteUser(userId).then(() => {
        toastRef.value?.success('删除成功')
        emit('reload')
      })
    },
  })
}

function changePassword(userId: number) {
  inputConfirmRef.value?.show({
    title: '修改密码',
    type: 'info',
    placeholder: '请输入新密码',
    onConfirm: (value) => {
      confirmRef.value?.show({
        type: 'info',
        title: '修改密码',
        content: `密码将重置为：${value}`,
        onConfirm: () => {
          resetPwd({ userId, password: value }).then(() => {
            toastRef.value?.success('修改成功')
          })
        },
      })
    },
  })
}

onMounted(() => {
  thisItem.value = {
    ...props.item,
    userType: props.item.roles?.some(role => role.roleKey === 'tenant') ? 'tenant' : 'tenant_user',
  }
})
</script>

<template>
  <view flex flex-col overflow-hidden rounded-[10rpx] bg-white>
    <view item-center flex p-[20rpx] shadow-md>
      <view i-heroicons:user-circle-16-solid mr-[10rpx] text-[30rpx] text-blue-500 />
      <text text-[28rpx] font-bold>
        {{ item.nickName }}
      </text>
      <view ml-[10rpx]>
        <template v-if="thisItem.userType === 'tenant'">
          <view w-max rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
            管理员
          </view>
        </template>
        <template v-else>
          <view w-max rounded-[10rpx] bg-blue-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
            员工
          </view>
        </template>
      </view>
      <view ml-auto flex items-center gap-[10rpx]>
        <ClickButton size="medium" type="warning" @click="changePassword(item.userId!)">
          重置密码
        </ClickButton>
        <ClickButton size="medium" type="primary" @click="toEdit(item.userId!)">
          编辑
        </ClickButton>
        <ClickButton size="medium" type="danger" @click="handleDelete(item.userId!)">
          删除
        </ClickButton>
      </view>
    </view>
    <view bg-gray-200 p-[20rpx]>
      <view class="item" flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:identification-16-solid text-[22rpx] text-gray-400 />
          <text>用户名:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.userName }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:phone-solid text-[22rpx] text-gray-400 />
          <text>联系电话:</text>
        </view>
        <text text-[24rpx] text-[#333]>
          {{ item.phonenumber }}
        </text>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
          <view i-heroicons:building-office-2-solid text-[22rpx] text-gray-400 />
          <text>部门:</text>
        </view>
        <view class="flex-warp flex gap-[10rpx]">
          <template v-for="item in deptRefList" :key="item.duId">
            <template v-if="item.hasManage === 1">
              <view w-max flex items-center gap-[10rpx] rounded-[10rpx] bg-emerald-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
                <view i-heroicons:wrench-screwdriver-solid text-[20rpx] text-white />
                <text>
                  {{ item.deptName }}
                </text>
              </view>
            </template>
            <template v-else>
              <view w-max flex items-center gap-[10rpx] rounded-[10rpx] bg-gray-500 px-[10rpx] py-[5rpx] text-[22rpx] text-white>
                <view i-heroicons:user text-[20rpx] text-white />
                <text>
                  {{ item.deptName }}
                </text>
              </view>
            </template>
          </template>
        </view>
      </view>
      <view class="item" mt-[10rpx] flex items-center gap-[10rpx]>
        <view w-[140rpx] flex items-center gap-[10rpx] text-[24rpx] text-gray-500>
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
