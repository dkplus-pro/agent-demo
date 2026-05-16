<script setup lang="ts">
import BasePayloadCard from '@ai-mind-clone/ui/base/BasePayloadCard.vue';
import SubpackageDemoCard from '@ai-mind-clone/ui/feature/SubpackageDemoCard.vue';
import { formatDate, getTestStr } from '@ai-mind-clone/utils';
import { getUtilsBasePayloadMarker, getUtilsBasePayloadSize } from '@ai-mind-clone/utils/base/heavy';
import { getUtilsFeaturePayloadMarker, getUtilsFeaturePayloadSize } from '@ai-mind-clone/utils/feature/heavy';

const loadedAt = formatDate(new Date());
const sharedValue = getTestStr();
const utilsBasePayloadSize = getUtilsBasePayloadSize();
const utilsBasePayloadMarker = getUtilsBasePayloadMarker();
const utilsFeaturePayloadSize = getUtilsFeaturePayloadSize();
const utilsFeaturePayloadMarker = getUtilsFeaturePayloadMarker();

function goBack() {
  uni.navigateBack();
}

function openSecondPage() {
  uni.navigateTo({
    url: '/subpackages/demo/pages/second/index',
  });
}
</script>

<template>
  <view class="page">
    <view class="title">Subpackage demo</view>
    <view class="subtitle">Loaded at: {{ loadedAt }}</view>
    <view class="subtitle">Utils base payload: {{ utilsBasePayloadSize }}</view>
    <view class="subtitle">Utils base marker: {{ utilsBasePayloadMarker }}</view>
    <view class="subtitle">Utils feature payload: {{ utilsFeaturePayloadSize }}</view>
    <view class="subtitle">Utils feature marker: {{ utilsFeaturePayloadMarker }}</view>
    <BasePayloadCard title="Base payload from demo" note="This should point to the main package copy." />
    <SubpackageDemoCard title="Subpackage demo card" :note="`Expected in subpackage. Utils: ${sharedValue}`" />
    <async-demo-card title="Async UI from demo" note="Shared through the async-ui subpackage." />
    <async-stats-card title="Async stats from demo" note="Second async component from async-ui." />
    <view class="actions">
      <button class="nav-button nav-button--primary" @tap="openSecondPage">Open second page</button>
      <button class="nav-button" @tap="goBack">Back to main package</button>
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

.actions {
  display: grid;
  gap: 24rpx;
  margin-top: 32rpx;
}

.nav-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 12rpx;
  background: #0f172a;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1;
}

.nav-button--primary {
  background: #2563eb;
}
</style>
