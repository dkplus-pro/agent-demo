<script setup lang="ts">
import BasePayloadCard from '@ai-mind-clone/ui/base/BasePayloadCard.vue';
import SubpackageDemoCard from '@ai-mind-clone/ui/feature/SubpackageDemoCard.vue';
import { formatDate, getTestStr } from '@ai-mind-clone/utils';

const loadedAt = formatDate(new Date());
const sharedValue = getTestStr();

function goBack() {
  uni.navigateBack();
}
</script>

<template>
  <view class="page">
    <view class="title">Subpackage demo2</view>
    <view class="subtitle">Loaded at: {{ loadedAt }}</view>
    <BasePayloadCard
      title="Base payload from demo2"
      note="This should point to the main package copy."
    />
    <SubpackageDemoCard
      title="Demo2 subpackage card"
      :note="`Demo2 owns this copy. Utils: ${sharedValue}`"
    />
    <async-demo-card title="Async UI from demo2" note="Shared through the async-ui subpackage." />
    <async-stats-card title="Async stats from demo2" note="Second async component from async-ui." />
    <button class="back-button" @tap="goBack">Back to main package</button>
  </view>
</template>

<style scoped>
.page {
  padding: 48rpx 32rpx;
}

.title {
  color: #0f172a;
  font-size: 44rpx;
  font-weight: 700;
}

.subtitle {
  margin: 16rpx 0 32rpx;
  color: #64748b;
  font-size: 28rpx;
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  margin-top: 32rpx;
  border-radius: 12rpx;
  background: #0f172a;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1;
}
</style>
