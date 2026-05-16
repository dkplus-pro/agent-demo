<script setup lang="ts">
import { asyncLargePayload } from './_fixtures/async-large-payload';

defineProps<{
  title: string;
  note: string;
}>();

const payloadSize = asyncLargePayload.length;
</script>

<template>
  <view class="async-demo-card">
    <view class="async-demo-card__eyebrow">Async UI subpackage1</view>
    <view class="async-demo-card__title">{{ title }}</view>
    <view class="async-demo-card__note">{{ note }}</view>
    <view class="async-demo-card__payload">Payload size: {{ payloadSize }}</view>
  </view>
</template>

<style scoped>
.async-demo-card {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid #fed7aa;
  border-radius: 16rpx;
  background: #fff7ed;
}

.async-demo-card__eyebrow {
  color: #c2410c;
  font-size: 24rpx;
  font-weight: 600;
}

.async-demo-card__title {
  margin-top: 12rpx;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.async-demo-card__note {
  margin-top: 12rpx;
  color: #475569;
  font-size: 26rpx;
  line-height: 1.45;
}

.async-demo-card__payload {
  margin-top: 16rpx;
  color: #c2410c;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
