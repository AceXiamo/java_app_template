import { ref } from 'vue'
import type Toast from '@/components/Toast.vue'
import type Confirm from '@/components/Confirm.vue'

export const toastRef = ref<InstanceType<typeof Toast>>()
export const confirmRef = ref<InstanceType<typeof Confirm>>()
