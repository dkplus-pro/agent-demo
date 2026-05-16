<script setup lang="ts">
import { ref } from 'vue';
import { request } from '@ai-mind-clone/request';
import AppButton from '@ai-mind-clone/ui/base/AppButton.vue';
import BasePayloadCard from '@ai-mind-clone/ui/base/BasePayloadCard.vue';
import DemoPanel from '@ai-mind-clone/ui/base/DemoPanel.vue';
import MainPackageDemoCard from '@ai-mind-clone/ui/feature/MainPackageDemoCard.vue';
import SubpackageDemoCard from '@ai-mind-clone/ui/feature/SubpackageDemoCard.vue';
import { formatDate, getTestStr } from '@ai-mind-clone/utils';
import { getUtilsBasePayloadMarker, getUtilsBasePayloadSize } from '@ai-mind-clone/utils/base/heavy';

const today = formatDate(new Date());
const utilsBasePayloadSize = getUtilsBasePayloadSize();
const utilsBasePayloadMarker = getUtilsBasePayloadMarker();
const inputValue = ref('');

function handleTap() {
  void request('/health').catch(() => {
    uni.showToast({
      title: 'Request demo is not configured',
      icon: 'none',
    });
  });
}

function openDemoSubpackage() {
  uni.navigateTo({
    url: '/subpackages/demo/pages/index/index',
  });
}

function openDemo2Subpackage() {
  uni.navigateTo({
    url: '/subpackages/demo2/pages/index/index',
  });
}
</script>

<template>
  <view class="page">
    <view class="title">Main miniapp</view>
    <view class="subtitle">Today: {{ today }}</view>
    <view class="subtitle">Test: {{ getTestStr() }}</view>
    <view class="subtitle">Utils base payload: {{ utilsBasePayloadSize }}</view>
    <view class="subtitle">Utils base marker: {{ utilsBasePayloadMarker }}</view>
    <input
      v-model="inputValue"
      class="text-input"
      placeholder="请输入内容"
      placeholder-class="text-input__placeholder"
    />
    <DemoPanel title="UI Demo" description="Shared UI component imported by the main package." />
    <BasePayloadCard
      title="Base payload card"
      note="Base placement should compile once in the main package."
    />
    <MainPackageDemoCard
      title="Main package demo card"
      note="Expected to compile with the main package."
    />
    <SubpackageDemoCard
      title="Subpackage demo card"
      note="Expected to compile with the subpackage."
    />
    <async-demo-card
      title="Async UI demo card"
      note="Expected to compile once in the async-ui subpackage."
    />
    <async-stats-card
      title="Async stats card"
      note="Second async component shared from async-ui."
    />
    <view class="actions">
      <AppButton text="Test request layer" @tap="handleTap" />
      <AppButton text="Open subpackage demo" @tap="openDemoSubpackage" />
      <AppButton text="Open subpackage demo2" @tap="openDemo2Subpackage" />
    </view>
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

.text-input {
  box-sizing: border-box;
  width: 100%;
  height: 88rpx;
  margin-bottom: 32rpx;
  padding: 0 24rpx;
  border: 2rpx solid #dbe4ee;
  border-radius: 16rpx;
  background: #ffffff;
  color: #0f172a;
  font-size: 28rpx;
}

.text-input__placeholder {
  color: #94a3b8;
}

.actions {
  display: grid;
  gap: 24rpx;
  margin-top: 32rpx;
}
</style>
