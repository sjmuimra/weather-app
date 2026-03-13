import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from 'src/stores/WeatherStore'
import { weatherService } from 'src/services/WeatherService'
import type { CurrentWeather, ForecastResponse, GeocodingResult } from 'src/types/Weather'

vi.mock('src/services/WeatherService', () => ({
  weatherService: {
    searchLocations:   vi.fn(),
    getCurrentWeather: vi.fn(),
    getForecast:       vi.fn(),
  },
  isAxiosError: vi.fn((err: unknown) =>
    typeof err === 'object' && err !== null && 'isAxiosError' in err
  ),
}))


const mockLocation: GeocodingResult = {
  name: 'Berlin', lat: 52.52, lon: 13.405, country: 'DE', state: 'Berlin',
}

const mockCurrentWeather: CurrentWeather = {
  coord: { lon: 13.405, lat: 52.52 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  base: 'stations',
  main: { temp: 18, feels_like: 17, temp_min: 15, temp_max: 20, pressure: 1013, humidity: 60 },
  visibility: 10000,
  wind: { speed: 3.5, deg: 200 },
  clouds: { all: 0 },
  dt: 1704067200,
  sys: { country: 'DE', sunrise: 1704063600, sunset: 1704096000 },
  timezone: 3600,
  id: 2950159,
  name: 'Berlin',
  cod: 200,
}

const mockForecastResponse: ForecastResponse = {
  cod: '200', message: 0, cnt: 2,
  list: [
    {
      dt: 1704096000, dt_txt: '2024-01-01 12:00:00',
      main: { temp: 18, feels_like: 17, temp_min: 15, temp_max: 20, pressure: 1013, humidity: 60 },
      weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
      clouds: { all: 0 }, wind: { speed: 3.5, deg: 200 },
      visibility: 10000, pop: 0.1, sys: { pod: 'd' },
    },
    {
      dt: 1704182400, dt_txt: '2024-01-02 12:00:00',
      main: { temp: 15, feels_like: 14, temp_min: 12, temp_max: 17, pressure: 1010, humidity: 70 },
      weather: [{ id: 801, main: 'Clouds', description: 'few clouds', icon: '02d' }],
      clouds: { all: 20 }, wind: { speed: 4.0, deg: 180 },
      visibility: 9000, pop: 0.2, sys: { pod: 'd' },
    },
  ],
  city: {
    id: 2950159, name: 'Berlin', coord: { lat: 52.52, lon: 13.405 },
    country: 'DE', population: 3426354, timezone: 3600,
    sunrise: 1704063600, sunset: 1704096000,
  },
}

function mockSuccessfulFetch () {
  vi.mocked(weatherService.getCurrentWeather).mockResolvedValue(mockCurrentWeather)
  vi.mocked(weatherService.getForecast).mockResolvedValue(mockForecastResponse)
}

describe('Store: WeatherStore', () => {
  let store: ReturnType<typeof useWeatherStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    store = useWeatherStore()
  })

  describe('Method: initial computed state', () => {

    it('temperatureUnit is °C in metric mode by default', () => {
      expect(store.temperatureUnit).toBe('°C')
    })

    it('windUnit is m/s in metric mode by default', () => {
      expect(store.windUnit).toBe('m/s')
    })

    it('hasWeatherData is false before any fetch', () => {
      expect(store.hasWeatherData).toBe(false)
    })

    it('loading is false initially', () => {
      expect(store.loading).toBe(false)
    })

    it('error is null initially', () => {
      expect(store.error).toBeNull()
    })

    it('locationSuggestions is an empty array initially', () => {
      expect(store.locationSuggestions).toEqual([])
    })

    it('selectedLocation is null initially', () => {
      expect(store.selectedLocation).toBeNull()
    })

    it('dailyForecasts is an empty array initially', () => {
      expect(store.dailyForecasts).toEqual([])
    })
  })

  describe('Method: searchLocations', () => {

    describe('when query is empty or whitespace', () => {
      it('clears suggestions for an empty string', async () => {
        store.locationSuggestions = [mockLocation]
        await store.searchLocations('')
        expect(store.locationSuggestions).toEqual([])
      })

      it('clears suggestions for whitespace-only input', async () => {
        await store.searchLocations('   ')
        expect(store.locationSuggestions).toEqual([])
      })

      it('does not call the service', async () => {
        await store.searchLocations('')
        expect(weatherService.searchLocations).not.toHaveBeenCalled()
      })
    })

    describe('when query has content', () => {
      beforeEach(() => {
        vi.mocked(weatherService.searchLocations).mockResolvedValue([mockLocation])
      })

      it('calls weatherService.searchLocations with the query', async () => {
        await store.searchLocations('Berlin')
        expect(weatherService.searchLocations).toHaveBeenCalledWith('Berlin')
      })

      it('populates locationSuggestions on success', async () => {
        await store.searchLocations('Berlin')
        expect(store.locationSuggestions).toEqual([mockLocation])
      })
    })

    describe('when service throws', () => {
      beforeEach(() => {
        vi.mocked(weatherService.searchLocations).mockRejectedValue(new Error('Network'))
      })

      it('clears suggestions silently', async () => {
        await store.searchLocations('Berlin')
        expect(store.locationSuggestions).toEqual([])
      })

      it('does not set store.error', async () => {
        await store.searchLocations('Berlin')
        expect(store.error).toBeNull()
      })
    })
  })

  describe('Method: selectLocation', () => {

    beforeEach(() => {
      mockSuccessfulFetch()
    })

    it('sets selectedLocation to the chosen location', async () => {
      await store.selectLocation(mockLocation)
      expect(store.selectedLocation).toEqual(mockLocation)
    })

    it('clears locationSuggestions after selection', async () => {
      store.locationSuggestions = [mockLocation]
      await store.selectLocation(mockLocation)
      expect(store.locationSuggestions).toEqual([])
    })

    it('sets hasWeatherData to true after a successful fetch', async () => {
      await store.selectLocation(mockLocation)
      expect(store.hasWeatherData).toBe(true)
    })

    it('stores the API response in currentWeather', async () => {
      await store.selectLocation(mockLocation)
      expect(store.currentWeather).toEqual(mockCurrentWeather)
    })

    it('sets lastUpdated to a Date instance', async () => {
      await store.selectLocation(mockLocation)
      expect(store.lastUpdated).toBeInstanceOf(Date)
    })

    it('resets loading to false after fetch completes', async () => {
      await store.selectLocation(mockLocation)
      expect(store.loading).toBe(false)
    })

    it('populates dailyForecasts with aggregated entries', async () => {
      await store.selectLocation(mockLocation)
      expect(store.dailyForecasts.length).toBeGreaterThan(0)
    })

    it('each dailyForecast entry has all required fields', async () => {
      await store.selectLocation(mockLocation)
      const day = store.dailyForecasts[0]!
      expect(day).toHaveProperty('date')
      expect(day).toHaveProperty('dayLabel')
      expect(day).toHaveProperty('icon')
      expect(day).toHaveProperty('description')
      expect(day).toHaveProperty('temp_min')
      expect(day).toHaveProperty('temp_max')
      expect(day).toHaveProperty('humidity')
      expect(day).toHaveProperty('windSpeed')
      expect(day).toHaveProperty('pop')
    })

    it('fetches with correct lat, lon and current units', async () => {
      await store.selectLocation(mockLocation)
      expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(
        mockLocation.lat, mockLocation.lon, 'metric'
      )
    })

    it('dailyForecasts shape matches snapshot', async () => {
      await store.selectLocation(mockLocation)
      expect(store.dailyForecasts).toMatchSnapshot()
    })
  })

  describe('Method: refreshWeather', () => {

    describe('when no location is selected', () => {
      it('does nothing', async () => {
        await store.refreshWeather()
        expect(weatherService.getCurrentWeather).not.toHaveBeenCalled()
      })
    })

    describe('when a location is already selected', () => {
      beforeEach(() => {
        mockSuccessfulFetch()
        store.selectedLocation = mockLocation
      })

      it('re-fetches weather for the current location', async () => {
        await store.refreshWeather()
        expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(
          mockLocation.lat, mockLocation.lon, 'metric'
        )
      })

      it('updates lastUpdated after re-fetch', async () => {
        await store.refreshWeather()
        expect(store.lastUpdated).toBeInstanceOf(Date)
      })
    })
  })

  describe('Method: toggleUnits', () => {

    describe('switching metric → imperial', () => {
      beforeEach(async () => {
        await store.toggleUnits()
      })

      it('sets units to imperial', () => {
        expect(store.units).toBe('imperial')
      })

      it('temperatureUnit becomes °F', () => {
        expect(store.temperatureUnit).toBe('°F')
      })

      it('windUnit becomes mph', () => {
        expect(store.windUnit).toBe('mph')
      })
    })

    describe('switching imperial → metric (double toggle)', () => {
      beforeEach(async () => {
        await store.toggleUnits()
        await store.toggleUnits()
      })

      it('units returns to metric', () => {
        expect(store.units).toBe('metric')
      })

      it('temperatureUnit returns to °C', () => {
        expect(store.temperatureUnit).toBe('°C')
      })

      it('windUnit returns to m/s', () => {
        expect(store.windUnit).toBe('m/s')
      })
    })

    describe('when a location is selected', () => {
      beforeEach(() => {
        mockSuccessfulFetch()
        store.selectedLocation = mockLocation
      })

      it('re-fetches with imperial units', async () => {
        await store.toggleUnits()
        expect(weatherService.getCurrentWeather).toHaveBeenCalledWith(
          mockLocation.lat, mockLocation.lon, 'imperial'
        )
      })
    })

    describe('when no location is selected', () => {
      it('does not fetch', async () => {
        await store.toggleUnits()
        expect(weatherService.getCurrentWeather).not.toHaveBeenCalled()
      })
    })
  })

  describe('Method: error handling in fetch', () => {

    async function fetchWithError (err: unknown): Promise<string | null> {
      vi.mocked(weatherService.getCurrentWeather).mockRejectedValue(err)
      vi.mocked(weatherService.getForecast).mockResolvedValue(mockForecastResponse)
      store.selectedLocation = mockLocation
      await store.refreshWeather()
      return store.error
    }

    describe('HTTP 401 Unauthorized', () => {
      it('sets an error message containing "API key"', async () => {
        const error = await fetchWithError(
          { isAxiosError: true, response: { status: 401 }, code: undefined }
        )
        expect(error).toContain('API key')
      })
    })

    describe('HTTP 404 Not Found', () => {
      it('sets an error message containing "not found"', async () => {
        const error = await fetchWithError(
          { isAxiosError: true, response: { status: 404 }, code: undefined }
        )
        expect(error).toContain('not found')
      })
    })

    describe('ECONNABORTED timeout', () => {
      it('sets an error message containing "timed out"', async () => {
        const error = await fetchWithError(
          { isAxiosError: true, response: undefined, code: 'ECONNABORTED' }
        )
        expect(error).toContain('timed out')
      })
    })

    describe('generic JS Error', () => {
      it('uses Error.message as the error string', async () => {
        const error = await fetchWithError(new Error('Something broke'))
        expect(error).toBe('Something broke')
      })
    })

    describe('unknown thrown value', () => {
      it('sets a truthy fallback error message', async () => {
        const error = await fetchWithError('a plain string error')
        expect(error).toBeTruthy()
      })
    })

    describe('after any error', () => {
      it('resets loading to false', async () => {
        await fetchWithError(new Error('fail'))
        expect(store.loading).toBe(false)
      })

      it('clears the previous error before a new fetch', async () => {
        mockSuccessfulFetch()
        store.error = 'Old error'
        store.selectedLocation = mockLocation
        await store.refreshWeather()
        expect(store.error).toBeNull()
      })
    })

    describe('Snapshot: all error messages', () => {
      it('matches snapshot', async () => {
        const cases: Record<string, unknown> = {
          '401': { isAxiosError: true, response: { status: 401 }, code: undefined },
          '404': { isAxiosError: true, response: { status: 404 }, code: undefined },
          'timeout': { isAxiosError: true, response: undefined, code: 'ECONNABORTED' },
          'generic': new Error('Unexpected failure'),
        }
        const results: Record<string, unknown> = {}
        for (const [label, err] of Object.entries(cases)) {
          setActivePinia(createPinia())
          store = useWeatherStore()
          results[label] = await fetchWithError(err)
        }
        expect(results).toMatchSnapshot()
      })
    })
  })

})
