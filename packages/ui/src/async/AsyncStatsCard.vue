<script setup lang="ts">
import { asyncStatsLargePayload } from './_fixtures/async-stats-large-payload';

defineProps<{
  title: string;
  note: string;
}>();

const payloadSize = asyncStatsLargePayload.length;
</script>

<template>
  <view class="async-stats-card">
    <view class="async-stats-card__eyebrow">Async stats UI</view>
    <view class="async-stats-card__title">{{ title }}</view>
    <view class="async-stats-card__note">{{ note }}</view>
    <view class="async-stats-card__payload">Payload size: {{ payloadSize }}</view>
  </view>
</template>

<style scoped>
.async-stats-card {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid #fecdd3;
  border-radius: 16rpx;
  background: #fff1f2;
}

.async-stats-card__eyebrow {
  color: #be123c;
  font-size: 24rpx;
  font-weight: 600;
}

.async-stats-card__title {
  margin-top: 12rpx;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.async-stats-card__note {
  margin-top: 12rpx;
  color: #475569;
  font-size: 26rpx;
  line-height: 1.45;
}

.async-stats-card__payload {
  margin-top: 16rpx;
  color: #be123c;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
