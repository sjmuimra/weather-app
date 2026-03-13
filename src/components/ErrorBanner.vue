<template>
<q-banner v-if="store.error" class="error-banner text-white q-mb-md" rounded dense>
    <template #avatar>
      <q-icon name="error_outline" color="white" />
    </template>

    {{ store.error }}

    <template #action>
      <q-btn flat color="white" label="Dismiss" @click="store.error = null" />
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { useWeatherStore } from 'src/stores/WeatherStore'

const store = useWeatherStore()
</script>

<style scoped lang="scss">
.error-banner {
  background: linear-gradient(135deg, #ef5350, #b71c1c);
  border-radius: 12px;
}
</style>
