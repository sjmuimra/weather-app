<template>
  <div class="unit-toggle row items-center q-gutter-xs">
    <span :class="['unit-label', store.units === 'metric' ? 'active' : 'inactive']">°C</span>

    <q-toggle
      :model-value="store.units === 'imperial'"
      color="white"
      size="sm"
      :disable="store.loading"
      aria-label="Toggle between metric and imperial units"
      @update:model-value="store.toggleUnits()"
    />

    <span :class="['unit-label', store.units === 'imperial' ? 'active' : 'inactive']">°F</span>
  </div>
</template>

<script setup lang="ts">
import { useWeatherStore } from 'src/stores/WeatherStore'

const store = useWeatherStore()
</script>

<style scoped lang="scss">
.unit-toggle {
  .unit-label {
    font-size: 0.9rem;
    font-weight: 700;
    transition: color 0.2s ease, opacity 0.2s ease;
    color: white;

    &.active  { opacity: 1; }
    &.inactive { opacity: 0.45; }
  }
}
</style>
