<script setup lang="ts">
defineProps<{
  text: string;
}>();

defineEmits<{
  tap: [];
}>();
</script>

<template>
  <button class="app-button" @tap="$emit('tap')">
    {{ text }}
  </button>
</template>

<style scoped>
.app-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 88rpx;
  border-radius: 12rpx;
  background: #2563eb;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  line-height: 1;
}
</style>
