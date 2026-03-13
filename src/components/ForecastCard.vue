<template>
  <q-card flat class="forecast-card">

    <q-card-section class="q-pb-sm">
      <div class="text-subtitle2 text-grey-7 text-uppercase letter-spacing">
        <q-icon name="calendar_today" size="xs" class="q-mr-xs" />
        5-Day Forecast
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="forecast-grid">

        <div
          v-for="day in store.dailyForecasts"
          :key="day.date"
          class="forecast-day column items-center"
        >
          <div class="day-label text-caption text-weight-bold text-grey-8">
            {{ day.dayLabel }}
          </div>

          <img :src="owmIconUrl(day.icon)" :alt="day.description" class="forecast-icon" />

          <div class="temp-max text-body2 text-weight-bold text-blue-9">
            {{ Math.round(day.temp_max) }}{{ store.temperatureUnit }}
          </div>
          <div class="temp-min text-caption text-grey-6">
            {{ Math.round(day.temp_min) }}{{ store.temperatureUnit }}
          </div>

          <div v-if="day.pop > 5" class="pop row items-center q-mt-xs">
            <q-icon name="water_drop" size="10px" color="blue-5" />
            <span class="text-caption text-blue-6 q-ml-xs">{{ Math.round(day.pop) }}%</span>
          </div>
        </div>

      </div>
    </q-card-section>

  </q-card>
</template>

<script setup lang="ts">
import { useWeatherStore } from 'src/stores/WeatherStore'
import { owmIconUrl } from 'src/composables/UseWeatherIcon'

const store = useWeatherStore()
</script>

<style scoped lang="scss">
.forecast-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #f3e5f5 0%, #ffffff 60%);
  box-shadow: 0 8px 32px rgba(156, 39, 176, 0.08);

  .forecast-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }

  .forecast-day {
    padding: 8px 4px;
    border-radius: 12px;
    transition: background 0.2s ease;

    &:hover { background: rgba(156, 39, 176, 0.06); }

    .day-label   { font-size: 0.7rem; letter-spacing: 0.05em; text-transform: uppercase; }
    .forecast-icon { width: 48px; height: 48px; }
    .temp-max    { font-size: 0.85rem; }
    .temp-min    { font-size: 0.75rem; }
  }
}
</style>
