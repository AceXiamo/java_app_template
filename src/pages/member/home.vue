<script lang="ts" setup></script>

<template>
  <view a-container>
    <PageMemberHomeHead />
    <view a-content>
      <view
        aspect-square w-full bg-cover bg-center
        :style="{ backgroundImage: `url(https://image.qwq.link/images/2025/01/25/265d992c18c57c862db14dce35f1e027.jpg)` }"
      />
      <view flex flex-col px-[30rpx] pb-[30rpx] pt-[50rpx]>
        <text text-[44rpx] text-[#3a3a3a]>
          Qianru Lin
        </text>
        <text mt-[20rpx] text-[38rpx] text-[#3A3A3A]>
          林倩如
        </text>
        <text mt-[20rpx] text-[30rpx] text-[#4D4D4D]>
          深圳市xxxx公司 总经理
        </text>
        <text mt-[20rpx] text-[30rpx] text-[#4D4D4D]>
          行业：xxxxxx
        </text>
        <text mt-[20rpx] text-[30rpx] text-[#4D4D4D]>
          公司/品牌名称：xxxxxx
        </text>
        <text mt-[20rpx] text-[30rpx] text-[#4D4D4D]>
          职位：xxxxxx
        </text>
        <text mt-[40rpx] text-[30rpx]>
          个人/企业介绍：
        </text>
        <text mt-[15rpx] text-[26rpx] text-[#4D4D4D] leading-[52rpx]>
          智领未来科技有限公司，是一家致力于创新技术研发的前沿企业。我们专注于人工智能、大数据分析及云计算解决方案，旨在通过尖端科技驱动产业升级，为企业数字化转型赋能。自成立以来，智领未来凭借强大的研发团队和深厚的技术积累，已成功为众多行业客户提供高效、定制化的技术服务与产品，赢得了广泛认可。公司秉承“科技引领，智慧生活”的理念，不断探索新技术边界，携手合作伙伴共创智慧未来，持续推动社会可持续发展。
        </text>
        <text mt-[80rpx] text-[30rpx]>
          所需要的资源/能耐提供的价值：
        </text>
        <text mt-[15rpx] text-[26rpx] text-[#4D4D4D] leading-[52rpx]>
          智领未来科技有限公司，专注于为企业提供全面而深入的科技解决方案。我们利用人工智能、大数据和云计算技术，帮助企业优化运营流程，提升业务效率，实现数据驱动的决策制定。通过定制化的软件开发和系统集成服务，我们助力企业打造智能、高效的信息系统，增强市场竞争力。此外，我们还提供持续的技术支持和培训，确保客户能够充分利用我们的技术，实现长期价值增长和业务创新。
        </text>
        <view mt-[80rpx] rounded-[8rpx] bg-gray-200 p-[30rpx]>
          <view flex items-center gap-[20rpx]>
            <AIcon icon="phone" :size="28" />
            <text text-[28rpx] text-[#3A3A3A]>
              电话:
            </text>
            <text text-[28rpx] text-[#3A3A3A]>
              13800138000
            </text>
          </view>
          <view mt-[20rpx] flex items-center gap-[20rpx]>
            <AIcon icon="wechat" :size="28" />
            <text text-[28rpx] text-[#3A3A3A]>
              微信号:
            </text>
            <text text-[28rpx] text-[#3A3A3A]>
              13800138000
            </text>
          </view>
        </view>
      </view>
      <view mx-[30rpx] mt-[50rpx] flex items-center>
        <text text-[30rpx] text-[#3a3a3a]>
          林倩如的俱乐部
        </text>
        <text ml-auto text-[22rpx] text-[#909090]>
          查看全部
        </text>
        <view i-heroicons-chevron-right-20-solid text-[#909090] />
      </view>
      <image src="https://image.qwq.link/images/2025/01/25/twitter_Gracilegracile_jp_20250122-142749_1882072683086815710_photo.jpg" mt-[30rpx] h-[400rpx] w-full mode="aspectFill" />
      <image src="https://image.qwq.link/images/2025/01/25/twitter_Gracilegracile_jp_20250122-142749_1882072683086815710_photo.jpg" mt-[20rpx] h-[400rpx] w-full mode="aspectFill" />
      <view mx-[30rpx] mt-[70rpx] flex items-center>
        <text text-[30rpx] text-[#3a3a3a]>
          林倩如的活动
        </text>
        <text ml-auto text-[22rpx] text-[#909090]>
          查看全部
        </text>
        <view i-heroicons-chevron-right-20-solid text-[#909090] />
      </view>
      <view mx-[30rpx] mt-[30rpx] flex gap-[20rpx] overflow-x-auto class="hide-scrollbar">
        <image v-for="i in 5" :key="i" src="https://image.qwq.link/images/2023/08/15/twitter_8528co28_20230814-110453_1691043206899888128_photo.jpg" h-[400rpx] w-[250rpx] flex-none rounded-[8rpx] mode="aspectFill" />
      </view>
      <view mx-[30rpx] mt-[70rpx] flex items-center>
        <text text-[28rpx] text-[#3a3a3a]>
          林倩如的商品
        </text>
        <text ml-auto text-[22rpx] text-[#909090]>
          查看全部
        </text>
        <view i-heroicons-chevron-right-20-solid text-[#909090] />
      </view>
      <view grid grid-cols-2 mt-[30rpx] gap-[20rpx] p-[30rpx]>
        <view v-for="i in 4" :key="i" w-full flex flex-col items-center>
          <view :style="{ backgroundImage: `url(https://axm.moe/avatar)` }" aspect-square w-full rounded-1 bg-cover bg-center />
          <text mt-[20rpx] text-[28rpx] text-[#3a3a3a]>
            商品名称
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<route lang="json">
  {
    "layout": "home"
  }
  </route>
