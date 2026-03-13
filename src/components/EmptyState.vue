<template>
<div class="empty-state column items-center justify-center q-pa-xl">
    <q-icon name="cloud_queue" size="80px" color="blue-2" />
    <div class="text-h6 text-grey-6 q-mt-md text-center">
      Search for a location to see the weather forecast
    </div>
    <div class="text-body2 text-grey-5 q-mt-sm text-center">
      Try searching for a city, e.g. "Berlin" or "Tokyo"
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
.empty-state { min-height: 300px; }
</style>
