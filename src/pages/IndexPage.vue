<template>
  <q-page class="weather-page">

    <div class="bg-gradient" />

    <div class="content-wrapper q-pa-md">

      <header class="app-header row items-center justify-between q-mb-lg">
        <div class="row items-center q-gutter-sm">
          <q-icon name="wb_cloudy" size="32px" color="white" />
          <span class="app-title text-h5 text-white text-weight-bold">WeatherNow</span>
        </div>
        <UnitToggle />
      </header>

      <div class="row justify-center q-mb-lg">
        <SearchBar />
      </div>

      <ErrorBanner />

      <template v-if="store.loading && !store.hasWeatherData">
        <q-card flat class="skeleton-card q-mb-md">
          <q-card-section>
            <q-skeleton type="text" width="40%" />
            <q-skeleton type="text" width="25%" class="q-mt-sm" />
          </q-card-section>
          <q-card-section class="row items-center">
            <q-skeleton type="circle" size="96px" class="q-mr-md" />
            <div>
              <q-skeleton type="text" width="120px" height="60px" />
              <q-skeleton type="text" width="150px" class="q-mt-sm" />
            </div>
          </q-card-section>
        </q-card>
      </template>

      <template v-else-if="store.hasWeatherData">
        <transition appear enter-active-class="animated fadeIn">
          <div>
            <CurrentWeatherCard :weather="store.currentWeather!" class="q-mb-md" />
            <ForecastCard v-if="store.dailyForecasts.length > 0" />
          </div>
        </transition>
      </template>

      <template v-else>
        <EmptyState />
      </template>

    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useWeatherStore } from 'src/stores/WeatherStore'
import SearchBar          from 'src/components/SearchBar.vue'
import UnitToggle         from 'src/components/UnitToggle.vue'
import CurrentWeatherCard from 'src/components/CurrentWeatherCard.vue'
import ForecastCard       from 'src/components/ForecastCard.vue'
import EmptyState         from 'src/components/EmptyState.vue'
import ErrorBanner        from 'src/components/ErrorBanner.vue'

const store = useWeatherStore()
</script>

<style scoped lang="scss">
.weather-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  .bg-gradient {
    position: fixed;
    inset: 0;
    background: linear-gradient(160deg, #1565c0 0%, #42a5f5 45%, #e3f2fd 100%);
    z-index: 0;
  }

  .content-wrapper {
    position: relative;
    z-index: 1;
    max-width: 720px;
    margin: 0 auto;
  }

  .skeleton-card {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.9);
  }
}
</style>
