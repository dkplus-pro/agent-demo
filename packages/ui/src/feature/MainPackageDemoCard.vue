<script setup lang="ts">
defineProps<{
  title: string;
  note: string;
}>();
</script>

<template>
  <view class="main-package-demo-card">
    <view class="main-package-demo-card__eyebrow">Main package UI</view>
    <view class="main-package-demo-card__title">{{ title }}</view>
    <view class="main-package-demo-card__note">{{ note }}</view>
  </view>
</template>

<style scoped>
.main-package-demo-card {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid #bbf7d0;
  border-radius: 16rpx;
  background: #f0fdf4;
}

.main-package-demo-card__eyebrow {
  color: #15803d;
  font-size: 24rpx;
  font-weight: 600;
}

.main-package-demo-card__title {
  margin-top: 12rpx;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.main-package-demo-card__note {
  margin-top: 12rpx;
  color: #475569;
  font-size: 26rpx;
  line-height: 1.45;
}
</style>
