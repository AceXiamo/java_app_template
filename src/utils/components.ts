import { ref } from 'vue'
import type Toast from '@/components/Toast.vue'
import type Confirm from '@/components/Confirm.vue'
import type InputConfirm from '@/components/InputConfirm.vue'

export const toastRef = ref<InstanceType<typeof Toast>>()
export const confirmRef = ref<InstanceType<typeof Confirm>>()
export const inputConfirmRef = ref<InstanceType<typeof InputConfirm>>()
