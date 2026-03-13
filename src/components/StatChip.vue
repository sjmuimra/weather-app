<template>
  <q-chip :icon="icon" :color="color" text-color="white" size="sm" class="stat-chip">
    <div class="chip-content column items-center">
      <span class="chip-value text-weight-bold">{{ value }}</span>
      <span class="chip-label">{{ label }}</span>
    </div>
  </q-chip>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  value: string
  label: string
  color: string
}

defineProps<Props>()
</script>

<style scoped lang="scss">
.stat-chip {
  height: auto !important;
  padding: 4px 10px;

  .chip-content {
    line-height: 1.2;
    margin-left: 4px;
  }

  .chip-value {
    font-size: 0.78rem;
  }

  .chip-label {
    font-size: 0.65rem;
    opacity: 0.85;
  }
}
</style>
