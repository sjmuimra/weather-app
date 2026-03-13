import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { weatherService, isAxiosError } from 'src/services/WeatherService'
import type {
  CurrentWeather,
  DailyForecast,
  ForecastItem,
  ForecastResponse,
  GeocodingResult,
  UnitSystem,
} from 'src/types/Weather'

export const useWeatherStore = defineStore('weather', () => {

  const units = ref<UnitSystem>('metric')
  const locationSuggestions = ref<GeocodingResult[]>([])
  const selectedLocation = ref<GeocodingResult | null>(null)
  const currentWeather = ref<CurrentWeather | null>(null)
  const dailyForecasts = ref<DailyForecast[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)

  const temperatureUnit = computed(() => units.value === 'metric' ? '°C' : '°F')
  const windUnit = computed(() => units.value === 'metric' ? 'm/s' : 'mph')
  const hasWeatherData = computed(() => currentWeather.value !== null)

  async function searchLocations(query: string): Promise<void> {
    if (!query.trim()) {
      locationSuggestions.value = []
      return
    }
    try {
      locationSuggestions.value = await weatherService.searchLocations(query)
    } catch (err) {
      console.error('[WeatherStore] searchLocations failed', err)
      locationSuggestions.value = []
    }
  }

  async function selectLocation(location: GeocodingResult): Promise<void> {
    selectedLocation.value = location
    locationSuggestions.value = []
    await fetchWeatherData()
  }

  async function refreshWeather(): Promise<void> {
    if (!selectedLocation.value) return
    await fetchWeatherData()
  }

  async function toggleUnits(): Promise<void> {
    units.value = units.value === 'metric' ? 'imperial' : 'metric'
    if (selectedLocation.value) {
      await fetchWeatherData()
    }
  }

  async function fetchWeatherData(): Promise<void> {
    if (!selectedLocation.value) return

    loading.value = true
    error.value   = null

    const { lat, lon } = selectedLocation.value

    try {
      const weatherPromise:  Promise<CurrentWeather>  = weatherService.getCurrentWeather(lat, lon, units.value)
      const forecastPromise: Promise<ForecastResponse> = weatherService.getForecast(lat, lon, units.value)

      const [weatherData, forecastData] = await Promise.all([weatherPromise, forecastPromise])

      currentWeather.value  = weatherData
      dailyForecasts.value  = aggregateDailyForecasts(forecastData.list)
      lastUpdated.value     = new Date()

    } catch (err) {
      error.value = buildErrorMessage(err)
      console.error('[WeatherStore] fetchWeatherData failed', err)
    } finally {
      loading.value = false
    }
  }
  function aggregateDailyForecasts(items: ForecastItem[]): DailyForecast[] {
    const byDay = new Map<string, ForecastItem[]>()

    for (const item of items) {
      const day    = item.dt_txt.slice(0, 10)
      const bucket = byDay.get(day) ?? []
      bucket.push(item)
      byDay.set(day, bucket)
    }

    const days: DailyForecast[] = []

    byDay.forEach((entries, dateStr) => {
      const representative = entries.find(e => e.dt_txt.includes('12:00:00')) ?? entries[0]
      if (!representative) return

      const condition = representative.weather[0]
      if (!condition) return

      const date     = new Date(dateStr + 'T12:00:00')
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })

      days.push({
        date: dateStr,
        dayLabel,
        icon: condition.icon,
        description: condition.description,
        temp_min: Math.min(...entries.map(e => e.main.temp_min)),
        temp_max: Math.max(...entries.map(e => e.main.temp_max)),
        humidity: representative.main.humidity,
        windSpeed: representative.wind.speed,
        pop: Math.max(...entries.map(e => e.pop)) * 100,
      })
    })

    return days.slice(0, 5)
  }

  function buildErrorMessage(err: unknown): string {
    if (isAxiosError(err)) {
      if (err.response?.status === 401) return 'Invalid API key. Check VITE_OWM_API_KEY in .env.'
      if (err.response?.status === 404) return 'Location not found. Try a different search.'
      if (err.code === 'ECONNABORTED')  return 'Request timed out. Check your connection.'
    }
    if (err instanceof Error) return err.message
    return 'An unexpected error occurred. Please try again.'
  }

  return {
    units,
    locationSuggestions,
    selectedLocation,
    currentWeather,
    dailyForecasts,
    loading,
    error,
    lastUpdated,
    temperatureUnit,
    windUnit,
    hasWeatherData,
    searchLocations,
    selectLocation,
    refreshWeather,
    toggleUnits,
  }
})
