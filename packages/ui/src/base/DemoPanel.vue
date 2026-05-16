<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <view class="demo-panel">
    <view class="demo-panel__title">{{ title }}</view>
    <view v-if="description" class="demo-panel__desc">{{ description }}</view>
  </view>
</template>

<style scoped>
.demo-panel {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e2e8f0;
  background: #f8fafc;
}

.demo-panel__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.demo-panel__desc {
  margin-top: 12rpx;
  font-size: 26rpx;
  line-height: 1.45;
  color: #64748b;
}
</style>
