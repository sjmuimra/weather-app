<template>
  <q-card flat class="current-weather-card">

    <q-card-section class="row items-center justify-between q-pb-none">
      <div>
        <div class="location-name text-h5 text-weight-bold">
          {{ weather.name }}
          <span v-if="countryCode" class="text-grey-6 text-body2 q-ml-xs">({{ countryCode }})</span>
        </div>
        <div class="text-caption text-grey-6">{{ formattedDate }}</div>
      </div>
      <q-btn
        flat round icon="refresh"
        :loading="store.loading"
        :disable="store.loading"
        color="primary"
        aria-label="Refresh weather"
        @click="store.refreshWeather()"
      >
        <q-tooltip>Refresh</q-tooltip>
      </q-btn>
    </q-card-section>

    <q-card-section class="row items-center q-pt-sm">
      <img
        :src="owmIconUrl(condition.icon)"
        :alt="condition.description"
        class="weather-icon q-mr-md"
      />
      <div>
        <div class="temp text-h2 text-weight-bold">
          {{ Math.round(weather.main.temp) }}{{ store.temperatureUnit }}
        </div>
        <div class="text-body1 text-capitalize text-grey-7">
          {{ condition.description }}
        </div>
        <div class="text-caption text-grey-6">
          Feels like {{ Math.round(weather.main.feels_like) }}{{ store.temperatureUnit }}
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="stats-row row q-gutter-sm">
        <StatChip icon="water_drop" :value="`${weather.main.humidity}%`" label="Humidity" color="blue-5" />
        <StatChip icon="air" :value="`${Math.round(weather.wind.speed)} ${store.windUnit}`" label="Wind" color="teal-5" />
        <StatChip icon="visibility" :value="`${(weather.visibility / 1000).toFixed(1)} km`" label="Visibility" color="purple-5" />
        <StatChip icon="compress" :value="`${weather.main.pressure} hPa`" label="Pressure"   color="orange-7" />
        <StatChip icon="wb_sunny" :value="formatTime(weather.sys.sunrise, weather.timezone)" label="Sunrise"    color="amber-7" />
        <StatChip icon="nights_stay" :value="formatTime(weather.sys.sunset,  weather.timezone)" label="Sunset" color="deep-orange-5" />
      </div>
    </q-card-section>

    <q-card-section v-if="store.lastUpdated" class="q-pt-none">
      <div class="text-caption text-grey-5">
        Last updated: {{ lastUpdatedTime }}
      </div>
    </q-card-section>

  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWeatherStore } from 'src/stores/WeatherStore'
import { owmIconUrl, formatTime } from 'src/composables/UseWeatherIcon'
import StatChip from './StatChip.vue'
import type { CurrentWeather, GeocodingResult, WeatherCondition } from 'src/types/Weather'

interface Props {
  weather: CurrentWeather
}

const props = defineProps<Props>()
const store = useWeatherStore()
const condition = computed<WeatherCondition>(() => props.weather.weather[0]!)
const selectedLocation = computed<GeocodingResult | null>(
  () => store.selectedLocation
)
const countryCode = computed<string>(() => {
  return (
    props.weather.sys.country ||
    selectedLocation.value?.country ||
    ''
  )
})

const lastUpdatedTime = computed<string>(() => {
  const date: Date | null = store.lastUpdated
  if (!date) return ''
  return date.toLocaleTimeString()
})

const formattedDate = computed(() =>
  new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })
)
</script>

<style scoped lang="scss">
.current-weather-card {
  border-radius: 20px;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 60%);
  box-shadow: 0 8px 32px rgba(33, 150, 243, 0.1);

  .location-name {
    line-height: 1.2;

    .country-flag {
      font-size: 1.4rem;
      vertical-align: middle;
      margin-left: 6px;
    }
  }

  .weather-icon  { width: 96px; height: 96px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.15)); }
  .temp   { line-height: 1; color: #1565c0; }
  .stats-row     { flex-wrap: wrap; }
}
</style>
