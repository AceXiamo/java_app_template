<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from "vue";
import { storeToRefs } from "pinia";
import HeadBar from "@/components/HeadBar.vue";
import { useOwnerStore } from "@/store/owner";
import {
  getOwnerRevenueRecords,
  type OwnerRevenueRecord,
  type OwnerRevenueQueryParams,
} from "@/api/owner-revenue";

// 使用 owner store
const ownerStore = useOwnerStore();
const { revenueData } = storeToRefs(ownerStore);

// 设置当前页面
ownerStore.setActive("revenue");

// 收益详情数据
const detailsData = reactive({
  revenueDetails: [] as OwnerRevenueRecord[],
});

// 加载状态
const loading = ref(false);

// 当前显示模式
const currentTab = ref("revenue"); // revenue | profitSharing

// 计算分账记录（从收益记录中筛选已分账的记录）
const profitSharingRecords = computed(() => {
  return detailsData.revenueDetails.filter(
    (item) =>
      item.profitSharingStatus && item.profitSharingStatus !== "not_required"
  );
});

// 导航方法
function goToProfitSharingRecords() {
  currentTab.value = "profitSharing";
}

function goToRevenueDetails() {
  currentTab.value = "revenue";
}

// 加载收益记录
async function loadRevenueRecords() {
  try {
    loading.value = true;
    const params: OwnerRevenueQueryParams = {
      pageNum: 1,
      pageSize: 100, // 获取最近100条记录
      status: "settled", // 只获取已结算的记录
    };

    const response = await getOwnerRevenueRecords(params);
    if (response.code === 200) {
      detailsData.revenueDetails = response.data.records || [];
    }
  } catch (error) {
    console.error("加载收益记录失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
  }
}

// 页面初始化
onMounted(() => {
  loadRevenueRecords();
});

// 状态样式映射
function getStatusStyle(status: string) {
  const statusMap = {
    settled: "text-green-600 bg-green-100",
    pending: "text-orange-600 bg-orange-100",
    failed: "text-red-600 bg-red-100",
  };
  return statusMap[status] || "text-gray-600 bg-gray-100";
}

function getProfitSharingStatusStyle(status: string) {
  const statusMap = {
    success: "text-green-600 bg-green-100",
    processing: "text-blue-600 bg-blue-100",
    failed: "text-red-600 bg-red-100",
    pending: "text-orange-600 bg-orange-100",
    not_required: "text-gray-600 bg-gray-100",
  };
  return statusMap[status] || "text-gray-600 bg-gray-100";
}

function getStatusText(status: string) {
  const statusMap = {
    settled: "已结算",
    pending: "待结算",
    failed: "结算失败",
  };
  return statusMap[status] || status;
}

function getProfitSharingStatusText(status: string) {
  const statusMap = {
    success: "已分账",
    processing: "分账中",
    failed: "分账失败",
    pending: "待分账",
    not_required: "无需分账",
  };
  return statusMap[status] || status;
}

function getProfitSharingModeText(mode: string) {
  const modeMap = {
    auto: "T+1自动分账",
    manual: "手动分账",
    immediate: "立即分账",
  };
  return modeMap[mode] || mode;
}

// 统计功能
function handleStatistics() {
  uni.showToast({
    title: "统计功能开发中",
    icon: "none",
  });
}
</script>

<template>
  <view
    class="relative h-full flex flex-col bg-gradient-to-br from-slate-50 via-green-50/30 to-emerald-50/20"
  >
    <!-- 头部导航栏 -->
    <HeadBar
      title="收益管理"
      :show-back="true"
      :show-right="true"
      right-icon="i-material-symbols-bar-chart"
      @right-click="handleStatistics"
    />

    <!-- 滚动内容区域 -->
    <scroll-view scroll-y class="flex-1">
      <!-- 累计收益 -->
      <view
        class="bg-gradient-to-r from-green-500 to-emerald-600 px-[40rpx] py-[48rpx]"
      >
        <view class="text-center">
          <text class="block text-[28rpx] text-white/80 mb-[16rpx]"
            >累计收益（自动分账到微信）</text
          >
          <text class="block text-[64rpx] font-bold text-white mb-[32rpx]">
            ¥{{ revenueData.balance.toFixed(2) }}
          </text>

          <view class="flex items-center justify-center space-x-[32rpx]">
            <view
              class="border-2 border-white/30 rounded-xl bg-white/20 px-[32rpx] py-[16rpx] backdrop-blur-sm"
              @tap="goToProfitSharingRecords"
            >
              <text class="text-[28rpx] text-white font-medium">分账记录</text>
            </view>
          </view>

          <view
            class="mt-[24rpx] bg-white/10 backdrop-blur-sm rounded-lg px-[24rpx] py-[16rpx]"
          >
            <text class="text-[22rpx] text-white/90"
              >💡 订单完成后，收益将在T+1自动分账至您的微信零钱</text
            >
          </view>
        </view>
      </view>

      <!-- 收益趋势 -->
      <view
        class="bg-white/70 backdrop-blur-sm shadow-md border-b border-white/20 px-[40rpx] py-[32rpx] -mt-[24rpx] mx-[40rpx] rounded-t-xl"
      >
        <view class="flex items-center justify-between mb-[24rpx]">
          <text class="text-[32rpx] font-bold text-gray-800">收益趋势</text>
          <text
            class="i-material-symbols-trending-up text-[32rpx] text-green-600"
          />
        </view>

        <view class="grid grid-cols-4 gap-[16rpx]">
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-purple-600"
              >¥{{ revenueData.revenue.today }}</text
            >
            <text class="text-[20rpx] text-gray-600">今日</text>
          </view>
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-blue-600"
              >¥{{ revenueData.revenue.thisWeek }}</text
            >
            <text class="text-[20rpx] text-gray-600">本周</text>
          </view>
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-green-600"
              >¥{{ revenueData.revenue.thisMonth.toLocaleString() }}</text
            >
            <text class="text-[20rpx] text-gray-600">本月</text>
          </view>
          <view class="text-center">
            <text class="block text-[32rpx] font-bold text-orange-600"
              >¥{{ revenueData.revenue.total.toLocaleString() }}</text
            >
            <text class="text-[20rpx] text-gray-600">总计</text>
          </view>
        </view>
      </view>

      <!-- 标签切换 -->
      <view class="bg-white/50 backdrop-blur-sm px-[40rpx] py-[24rpx]">
        <view class="flex items-center bg-gray-100 rounded-xl p-[8rpx]">
          <view
            class="flex-1 text-center py-[16rpx] rounded-lg transition-all duration-200"
            :class="currentTab === 'revenue' ? 'bg-white shadow-sm' : ''"
            @tap="goToRevenueDetails"
          >
            <text
              class="text-[28rpx] font-medium"
              :class="
                currentTab === 'revenue' ? 'text-purple-600' : 'text-gray-600'
              "
            >
              收益明细
            </text>
          </view>
          <view
            class="flex-1 text-center py-[16rpx] rounded-lg transition-all duration-200"
            :class="currentTab === 'profitSharing' ? 'bg-white shadow-sm' : ''"
            @tap="goToProfitSharingRecords"
          >
            <text
              class="text-[28rpx] font-medium"
              :class="
                currentTab === 'profitSharing'
                  ? 'text-purple-600'
                  : 'text-gray-600'
              "
            >
              分账记录
            </text>
          </view>
        </view>
      </view>

      <!-- 收益明细 -->
      <view
        v-if="currentTab === 'revenue'"
        class="px-[40rpx] space-y-[24rpx] pb-[48rpx]"
      >
        <!-- 加载状态 -->
        <view
          v-if="loading"
          class="flex items-center justify-center py-[80rpx]"
        >
          <text class="text-[28rpx] text-gray-500">加载中...</text>
        </view>

        <!-- 空状态 -->
        <view
          v-else-if="detailsData.revenueDetails.length === 0"
          class="flex flex-col items-center justify-center py-[80rpx]"
        >
          <text
            class="i-material-symbols-account-balance-wallet text-[80rpx] text-gray-300 mb-[24rpx]"
          />
          <text class="text-[28rpx] text-gray-500 mb-[16rpx]"
            >暂无收益记录</text
          >
          <text class="text-[24rpx] text-gray-400"
            >完成订单后会自动生成收益记录</text
          >
        </view>

        <!-- 收益记录列表 -->
        <view
          v-else
          v-for="item in detailsData.revenueDetails"
          :key="item.revenueId"
          class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20 overflow-hidden"
        >
          <!-- 日期和状态 -->
          <view
            class="bg-gradient-to-r from-gray-50/50 to-gray-50/50 px-[24rpx] py-[16rpx] border-b border-white/10"
          >
            <view class="flex items-center justify-between">
              <text class="text-[28rpx] font-medium text-gray-800">{{
                item.settlementDate
              }}</text>
              <text
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getStatusStyle(item.status)"
              >
                {{ getStatusText(item.status) }}
              </text>
            </view>
          </view>

          <!-- 详细信息 -->
          <view class="p-[24rpx] space-y-[16rpx]">
            <!-- 车辆信息 -->
            <view class="flex items-center space-x-[16rpx]">
              <text
                class="i-material-symbols-directions-car text-[24rpx] text-purple-600"
              />
              <text class="text-[26rpx] text-gray-800 font-medium">
                {{ item.vehicleName || "未知车辆" }}
                {{ item.licensePlate ? `(${item.licensePlate})` : "" }}
              </text>
            </view>

            <!-- 订单号 -->
            <view class="flex items-center space-x-[16rpx]">
              <text
                class="i-material-symbols-receipt text-[24rpx] text-blue-600"
              />
              <text class="text-[24rpx] text-gray-600">{{ item.orderNo }}</text>
            </view>

            <!-- 金额信息 -->
            <view class="bg-green-50/50 rounded-lg p-[16rpx]">
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">订单总额</text>
                <text class="text-[26rpx] font-medium text-gray-800"
                  >¥{{ item.orderTotalAmount?.toFixed(2) }}</text
                >
              </view>
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">平台抽成</text>
                <text class="text-[26rpx] font-medium text-blue-600">
                  {{ (item.platformCommissionRate * 100)?.toFixed(1) }}%
                </text>
              </view>
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">抽成金额</text>
                <text class="text-[26rpx] font-medium text-red-600"
                  >-¥{{ item.platformCommissionAmount?.toFixed(2) }}</text
                >
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">我的收益</text>
                <text class="text-[32rpx] font-bold text-green-600"
                  >¥{{ item.finalRevenueAmount?.toFixed(2) }}</text
                >
              </view>
            </view>

            <!-- 套餐类型 -->
            <view
              v-if="item.packageType"
              class="flex items-center justify-between"
            >
              <text class="text-[24rpx] text-gray-600">套餐类型</text>
              <text
                class="rounded-full bg-purple-100 px-[16rpx] py-[6rpx] text-[20rpx] text-purple-600"
              >
                {{ item.packageType }}
              </text>
            </view>

            <!-- 分账信息 -->
            <view
              v-if="
                item.profitSharingStatus &&
                item.profitSharingStatus !== 'not_required'
              "
              class="bg-blue-50/50 rounded-lg p-[16rpx] space-y-[8rpx]"
            >
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">分账状态</text>
                <text
                  class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                  :class="getProfitSharingStatusStyle(item.profitSharingStatus)"
                >
                  {{ getProfitSharingStatusText(item.profitSharingStatus) }}
                </text>
              </view>

              <view
                v-if="item.profitSharingMode"
                class="flex items-center justify-between"
              >
                <text class="text-[24rpx] text-gray-600">分账方式</text>
                <text class="text-[24rpx] text-gray-800">{{
                  getProfitSharingModeText(item.profitSharingMode)
                }}</text>
              </view>

              <view
                v-if="item.expectedSharingDate"
                class="flex items-center justify-between"
              >
                <text class="text-[24rpx] text-gray-600">预期分账日期</text>
                <text class="text-[24rpx] text-gray-800">{{
                  item.expectedSharingDate
                }}</text>
              </view>

              <view
                v-if="item.profitSharingTime"
                class="flex items-center justify-between"
              >
                <text class="text-[24rpx] text-gray-600">分账时间</text>
                <text class="text-[24rpx] text-gray-800">{{
                  item.profitSharingTime
                }}</text>
              </view>

              <view
                v-if="item.profitSharingAmount"
                class="flex items-center justify-between"
              >
                <text class="text-[24rpx] text-gray-600">分账金额</text>
                <text class="text-[28rpx] font-bold text-green-600"
                  >¥{{ item.profitSharingAmount?.toFixed(2) }}</text
                >
              </view>

              <view
                v-if="item.profitSharingFailureReason"
                class="bg-red-50 rounded-lg p-[12rpx]"
              >
                <text class="text-[22rpx] text-red-600"
                  >失败原因: {{ item.profitSharingFailureReason }}</text
                >
              </view>
            </view>

            <!-- 备注信息 -->
            <view
              v-if="item.remark"
              class="text-[22rpx] text-gray-500 bg-gray-50/50 rounded-lg p-[12rpx]"
            >
              {{ item.remark }}
            </view>
          </view>
        </view>
      </view>

      <!-- 分账记录 -->
      <view v-else class="px-[40rpx] space-y-[24rpx] pb-[48rpx]">
        <!-- 空状态 -->
        <view
          v-if="profitSharingRecords.length === 0"
          class="flex flex-col items-center justify-center py-[80rpx]"
        >
          <text
            class="i-material-symbols-account-balance-wallet text-[80rpx] text-gray-300 mb-[24rpx]"
          />
          <text class="text-[28rpx] text-gray-500 mb-[16rpx]"
            >暂无分账记录</text
          >
          <text class="text-[24rpx] text-gray-400"
            >订单收益将自动通过微信分账到账</text
          >
        </view>

        <!-- 分账记录列表 -->
        <view
          v-else
          v-for="record in profitSharingRecords"
          :key="record.revenueId"
          class="bg-white/70 backdrop-blur-sm rounded-xl shadow-md border border-white/20 overflow-hidden"
        >
          <!-- 分账单号和状态 -->
          <view
            class="bg-gradient-to-r from-gray-50/50 to-gray-50/50 px-[24rpx] py-[16rpx] border-b border-white/10"
          >
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">{{
                record.profitSharingOrderNo || record.orderNo
              }}</text>
              <text
                class="rounded-full px-[16rpx] py-[6rpx] text-[20rpx] font-medium"
                :class="getProfitSharingStatusStyle(record.profitSharingStatus)"
              >
                {{ getProfitSharingStatusText(record.profitSharingStatus) }}
              </text>
            </view>
          </view>

          <!-- 分账详情 -->
          <view class="p-[24rpx] space-y-[16rpx]">
            <!-- 车辆信息 -->
            <view class="flex items-center space-x-[16rpx]">
              <text
                class="i-material-symbols-directions-car text-[24rpx] text-purple-600"
              />
              <text class="text-[26rpx] text-gray-800 font-medium">
                {{ record.vehicleName || "未知车辆" }}
                {{ record.licensePlate ? `(${record.licensePlate})` : "" }}
              </text>
            </view>

            <!-- 金额信息 -->
            <view class="bg-green-50/50 rounded-lg p-[16rpx]">
              <view class="flex items-center justify-between mb-[8rpx]">
                <text class="text-[24rpx] text-gray-600">订单收益</text>
                <text class="text-[26rpx] font-medium text-gray-800"
                  >¥{{ record.finalRevenueAmount?.toFixed(2) }}</text
                >
              </view>
              <view class="flex items-center justify-between">
                <text class="text-[24rpx] text-gray-600">分账金额</text>
                <text class="text-[32rpx] font-bold text-green-600"
                  >¥{{ record.profitSharingAmount?.toFixed(2) }}</text
                >
              </view>
            </view>

            <!-- 分账方式 -->
            <view class="flex items-center justify-between">
              <text class="text-[24rpx] text-gray-600">分账方式</text>
              <text class="text-[26rpx] text-gray-800">{{
                getProfitSharingModeText(record.profitSharingMode)
              }}</text>
            </view>

            <!-- 时间信息 -->
            <view class="space-y-[8rpx]">
              <view
                v-if="record.expectedSharingDate"
                class="flex items-center justify-between"
              >
                <text class="text-[24rpx] text-gray-600">预期分账日期</text>
                <text class="text-[24rpx] text-gray-600">{{
                  record.expectedSharingDate
                }}</text>
              </view>
              <view
                v-if="record.profitSharingTime"
                class="flex items-center justify-between"
              >
                <text class="text-[24rpx] text-gray-600">分账时间</text>
                <text class="text-[24rpx] text-gray-600">{{
                  record.profitSharingTime
                }}</text>
              </view>
            </view>

            <!-- 失败原因 -->
            <view
              v-if="record.profitSharingFailureReason"
              class="bg-red-50 rounded-lg p-[12rpx]"
            >
              <text class="text-[22rpx] text-red-600"
                >失败原因: {{ record.profitSharingFailureReason }}</text
              >
            </view>

            <!-- 重试次数 -->
            <view
              v-if="record.profitSharingRetryCount > 0"
              class="flex items-center justify-between"
            >
              <text class="text-[24rpx] text-gray-600">重试次数</text>
              <text class="text-[24rpx] text-orange-600"
                >{{ record.profitSharingRetryCount }} 次</text
              >
            </view>
          </view>
        </view>
      </view>

      <!-- 底部TabBar占位 -->
      <view class="h-[120rpx]" />
    </scroll-view>
  </view>
</template>
