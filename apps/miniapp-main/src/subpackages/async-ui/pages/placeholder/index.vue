<script setup lang="ts">
import AsyncDemoCard from '@ai-mind-clone/ui/async/AsyncDemoCard.vue';
import AsyncStatsCard from '@ai-mind-clone/ui/async/AsyncStatsCard.vue';
import { getUtilsAsyncPayloadMarker, getUtilsAsyncPayloadSize } from '@ai-mind-clone/utils/async/heavy';

const utilsAsyncPayloadSize = getUtilsAsyncPayloadSize();
const utilsAsyncPayloadMarker = getUtilsAsyncPayloadMarker();
</script>

<template>
  <view class="page">
    <view class="title">Async UI</view>
    <view class="subtitle">Utils async payload: {{ utilsAsyncPayloadSize }}</view>
    <view class="subtitle">Utils async marker: {{ utilsAsyncPayloadMarker }}</view>
    <view class="preview">
      <AsyncDemoCard
        title="Async UI preview"
        note="This page anchors async UI components for compilation."
      />
      <AsyncStatsCard
        title="Async stats preview"
        note="This page anchors the second async UI component."
      />
    </view>
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

.preview {
  margin-top: 32rpx;
}
</style>
