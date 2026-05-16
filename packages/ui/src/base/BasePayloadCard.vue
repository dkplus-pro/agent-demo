<script setup lang="ts">
import { baseLargePayload } from './_fixtures/base-large-payload';

defineProps<{
  title: string;
  note: string;
}>();

const payloadSize = baseLargePayload.length;
</script>

<template>
  <view class="base-payload-card">
    <view class="base-payload-card__eyebrow">Base UI</view>
    <view class="base-payload-card__title">{{ title }}</view>
    <view class="base-payload-card__note">{{ note }}</view>
    <view class="base-payload-card__payload">Payload size: {{ payloadSize }}</view>
  </view>
</template>

<style scoped>
.base-payload-card {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid #c7d2fe;
  border-radius: 16rpx;
  background: #eef2ff;
}

.base-payload-card__eyebrow {
  color: #4f46e5;
  font-size: 24rpx;
  font-weight: 600;
}

.base-payload-card__title {
  margin-top: 12rpx;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.base-payload-card__note {
  margin-top: 12rpx;
  color: #475569;
  font-size: 26rpx;
  line-height: 1.45;
}

.base-payload-card__payload {
  margin-top: 16rpx;
  color: #4f46e5;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
