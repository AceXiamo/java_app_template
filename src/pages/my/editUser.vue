<script lang="ts" setup>
import { addUser, getRoleList, getUserById, updateUser } from '@/api/user'
import type { SysRole, SysUser } from '@/api/user'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const selectValue = ref<string>('tenant_user')
const user = ref<SysUser>({})
const id = ref(0)
const currentUser = ref<SysUser>({})
const roles = ref<SysRole[]>([])

onLoad((options: any) => {
  if (options.id) {
    id.value = options.id
    loadUser()
  }
  else {
    getRoleList({ pageNum: 1, pageSize: 10, roleKey: 'tenant' }).then((res) => {
      roles.value = res.rows || []
    })
  }
  currentUser.value = userStore.currentUser.user || {}
})

function loadUser() {
  getUserById(id.value).then((res) => {
    user.value = res.data
    const roleId = res.roleIds?.[0]
    roles.value = res.roles
    selectValue.value = roles.value.find(role => role.roleId === roleId)?.roleKey || 'tenant_user'
  })
}

function submit() {
  const role = roles.value.find(role => role.roleKey === selectValue.value)
  if (user.value && user.value.userId) {
    updateUser({
      ...user.value,
      roleIds: [role!.roleId!],
      roles: [role!],
    }).then(() => {
      toastRef.value?.success('更新用户成功')
      setTimeout(back, 1000)
    })
  }
  else {
    addUser({
      ...user.value,
      roleIds: [role!.roleId!],
      roles: [role!],
    }).then(() => {
      toastRef.value?.success('添加用户成功')
      setTimeout(back, 1000)
    })
  }
}

function back() {
  uni.navigateBack()
}
</script>

<template>
  <view h-full flex flex-col>
    <EditUserHead />
    <view h-0 flex flex-auto flex-col gap-[20rpx] overflow-y-auto px-[20rpx] pb-[20rpx]>
      <view mt-[20rpx] flex flex-col gap-[30rpx] rounded-[10rpx] bg-white p-[20rpx]>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:phone-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              姓名
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="user.nickName" type="text" placeholder="请输入姓名" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:user-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              电话
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view relative box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="user.phonenumber" type="text" placeholder="请输入联系电话" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:user-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              账号
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view relative box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="user.userName" type="text" placeholder="请输入用户名" class="text-[26rpx]" :disabled="!!user.userId">
            <view v-if="user.userId" absolute inset-0 bg="black/05" rounded-[10rpx] />
          </view>
        </view>
        <view v-if="!user.userId" flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:lock-closed-16-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              密码
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view relative box-border w-full border border-gray-300 rounded-[10rpx] border-solid p-[15rpx]>
            <input v-model="user.password" type="text" placeholder="请输入密码" class="text-[26rpx]">
          </view>
        </view>
        <view flex flex-col justify-center gap-[20rpx]>
          <view ml-[20rpx]>
            <view i-heroicons:adjustments-vertical-20-solid text-[26rpx] text-emerald-500 />
            <text text-[26rpx] text-[#333]>
              角色
            </text>
            <text text-[30rpx] text-red-500>
              *
            </text>
          </view>
          <view relative h-[76.78rpx]>
            <SelectBar v-model="selectValue" :options="[{ value: 'tenant', label: '管理员' }, { value: 'tenant_user', label: '员工' }]" h-[76.78rpx] />
            <view v-if="currentUser.userId === user.userId" absolute inset-0 bg="black/05" rounded-[10rpx] />
          </view>
        </view>
      </view>
      <view flex flex-col gap-[10rpx]>
        <text text-[24rpx] text-gray-500>
          提示：管理员拥有所有权限，员工不可管理用户且拜访记录仅能产看到由自己产生的记录
        </text>
      </view>
      <view flex justify-end gap-[20rpx]>
        <ClickButton type="primary" drop-shadow-lg @click="submit">
          提交
        </ClickButton>
        <ClickButton type="default" drop-shadow-lg @click="back">
          返回
        </ClickButton>
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
</route>
