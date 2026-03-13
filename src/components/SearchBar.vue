<template>
  <div class="search-bar">
    <q-select
      v-model="inputText"
      :options="suggestions"
      option-label="displayName"
      use-input
      hide-selected
      fill-input
      input-debounce="400"
      clearable
      outlined
      dense
      bg-color="white"
      label="Search for a city or location…"
      class="search-select"
      @filter="onFilter"
      @update:model-value="onSelect"
      @keyup.enter="onEnterKey"
    >
      <template #prepend>
        <q-icon name="search" color="primary" />
      </template>

      <template #append>
        <q-spinner v-if="store.loading && !store.hasWeatherData" color="primary" size="xs" />
      </template>

      <template #option="{ itemProps, opt }: { itemProps: Record<string, unknown>, opt: LocationSuggestion }">
        <q-item v-bind="itemProps">
          <q-item-section avatar>
            <q-icon name="location_on" color="primary" size="sm" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ opt.name }}</q-item-label>
            <q-item-label caption>
              {{ [opt.state, opt.country].filter(Boolean).join(', ') }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template #no-option>
        <q-item>
          <q-item-section class="text-grey">
            {{ inputText ? 'No locations found' : 'Start typing to search…' }}
          </q-item-section>
        </q-item>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWeatherStore } from 'src/stores/WeatherStore'
import type { GeocodingResult } from 'src/types/Weather'

const store = useWeatherStore()
const inputText = ref<string | null>(null)

interface LocationSuggestion extends GeocodingResult {
  displayName: string
}

const suggestions = computed<LocationSuggestion[]>(() =>
  store.locationSuggestions.map(loc => ({
    ...loc,
    displayName: [loc.name, loc.state, loc.country].filter(Boolean).join(', '),
  }))
)

async function onFilter(val: string, doneFn: (cb: () => void) => void) {
  await store.searchLocations(val)
  doneFn(() => {})
}

function onSelect(value: LocationSuggestion | null) {
  if (!value) return
  void store.selectLocation(value)
  inputText.value = null
}

function onEnterKey() {
  if (store.locationSuggestions.length === 0) return
  void store.selectLocation(store.locationSuggestions[0]!)
  inputText.value = null
}
</script>

<style scoped lang="scss">
.search-bar {
  width: 100%;
  max-width: 520px;

  .search-select {
    border-radius: 12px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  }
}
</style>
