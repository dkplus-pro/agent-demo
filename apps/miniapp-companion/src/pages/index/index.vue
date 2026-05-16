<script setup lang="ts">
import AppButton from '@ai-mind-clone/ui/base/AppButton.vue';
import { formatDate } from '@ai-mind-clone/utils';

const today = formatDate(new Date());

function handleTap() {
  uni.showToast({
    title: 'Companion ready',
    icon: 'none',
  });
}
</script>

<template>
  <view class="page">
    <view class="title">陪伴小程序</view>
    <view class="subtitle">Today: {{ today }}</view>
    <AppButton text="检查状态" @tap="handleTap" />
  </view>
</template>

<style scoped>
.page {
  padding: 48rpx 32rpx;
}

.title {
  font-size: 44rpx;
  font-weight: 700;
}

.subtitle {
  margin: 16rpx 0 32rpx;
  color: #64748b;
  font-size: 28rpx;
}
</style>
