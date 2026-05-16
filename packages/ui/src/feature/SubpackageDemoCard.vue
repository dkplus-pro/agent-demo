<script setup lang="ts">
import { featureLargePayload } from './_fixtures/feature-large-payload';

defineProps<{
  title: string;
  note: string;
}>();

const payloadSize = featureLargePayload.length;
</script>

<template>
  <view class="subpackage-demo-card">
    <view class="subpackage-demo-card__eyebrow">Subpackage UI</view>
    <view class="subpackage-demo-card__title">{{ title }}</view>
    <view class="subpackage-demo-card__note">{{ note }}</view>
    <view class="subpackage-demo-card__payload">Payload size: {{ payloadSize }}</view>
  </view>
</template>

<style scoped>
.subpackage-demo-card {
  margin-top: 24rpx;
  padding: 28rpx 24rpx;
  border: 1rpx solid #dbeafe;
  border-radius: 16rpx;
  background: #eff6ff;
}

.subpackage-demo-card__eyebrow {
  color: #2563eb;
  font-size: 24rpx;
  font-weight: 600;
}

.subpackage-demo-card__title {
  margin-top: 12rpx;
  color: #0f172a;
  font-size: 32rpx;
  font-weight: 700;
}

.subpackage-demo-card__note {
  margin-top: 12rpx;
  color: #475569;
  font-size: 26rpx;
  line-height: 1.45;
}

.subpackage-demo-card__payload {
  margin-top: 16rpx;
  color: #1d4ed8;
  font-size: 24rpx;
  font-weight: 600;
}
</style>
