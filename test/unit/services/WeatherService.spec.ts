import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AxiosInstance } from 'axios'
import type { CurrentWeather, ForecastResponse, GeocodingResult } from 'src/types/Weather'

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal<typeof import('axios')>()
  return {
    ...actual,
    default: {
      ...actual.default,
      create: vi.fn(() => ({ get: vi.fn() }) as unknown as AxiosInstance),
    },
  }
})

import { weatherService } from 'src/services/WeatherService'

const mockGet = (weatherService as any).http.get as ReturnType<typeof vi.fn>


const mockGeoResults: GeocodingResult[] = [
  { name: 'Berlin', lat: 52.52, lon: 13.405, country: 'DE', state: 'Berlin' },
  { name: 'Berlin', lat: 44.46, lon: -71.18, country: 'US', state: 'New Hampshire' },
]

const mockCurrentWeather: CurrentWeather = {
  coord: { lon: 13.405, lat: 52.52 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  base: 'stations',
  main: { temp: 18, feels_like: 17, temp_min: 15, temp_max: 20, pressure: 1013, humidity: 60 },
  visibility: 10000,
  wind: { speed: 3.5, deg: 200 },
  clouds: { all: 0 },
  dt: 1704063600,
  sys: { country: 'DE', sunrise: 1704040800, sunset: 1704074400 },
  timezone: 3600,
  id: 2950159,
  name: 'Berlin',
  cod: 200,
}

const mockForecastResponse: ForecastResponse = {
  cod: '200',
  message: 0,
  cnt: 2,
  list: [
    {
      dt: 1704063600,
      main: { temp: 15, feels_like: 14, temp_min: 12, temp_max: 17, pressure: 1010, humidity: 70 },
      weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
      clouds: { all: 80 },
      wind: { speed: 4.2, deg: 180 },
      visibility: 9000,
      pop: 0.6,
      sys: { pod: 'd' },
      dt_txt: '2024-01-01 12:00:00',
    },
    {
      dt: 1704074400,
      main: { temp: 12, feels_like: 11, temp_min: 10, temp_max: 14, pressure: 1008, humidity: 75 },
      weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10n' }],
      clouds: { all: 90 },
      wind: { speed: 5.0, deg: 190 },
      visibility: 8000,
      pop: 0.8,
      sys: { pod: 'n' },
      dt_txt: '2024-01-01 15:00:00',
    },
  ],
  city: {
    id: 2950159,
    name: 'Berlin',
    coordinates: { lat: 52.52, lon: 13.405 },
    country: 'DE',
    population: 1000000,
    timezone: 3600,
    sunrise: 1704040800,
    sunset: 1704074400,
  },
}

describe('Service: WeatherService', () => {

  beforeEach(() => {
    mockGet.mockReset()
  })

  describe('Method: searchLocations', () => {

    it('calls the geocoding endpoint with the correct params', async () => {
      mockGet.mockResolvedValueOnce({ data: mockGeoResults })

      await weatherService.searchLocations('Berlin')

      expect(mockGet).toHaveBeenCalledWith('/geo/1.0/direct', {
        params: expect.objectContaining({ q: 'Berlin', limit: 5 }),
      })
    })

    it('passes appid in params', async () => {
      mockGet.mockResolvedValueOnce({ data: mockGeoResults })

      await weatherService.searchLocations('Berlin')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params).toHaveProperty('appid')
    })

    it('respects a custom limit argument', async () => {
      mockGet.mockResolvedValueOnce({ data: [] })

      await weatherService.searchLocations('Paris', 3)

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params.limit).toBe(3)
    })

    it('returns the array from response.data', async () => {
      mockGet.mockResolvedValueOnce({ data: mockGeoResults })

      const result = await weatherService.searchLocations('Berlin')

      expect(result).toEqual(mockGeoResults)
    })

    it('returns an empty array when the API returns []', async () => {
      mockGet.mockResolvedValueOnce({ data: [] })

      const result = await weatherService.searchLocations('zzzzz')

      expect(result).toEqual([])
    })

    it('propagates errors thrown by axios', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network Error'))

      await expect(weatherService.searchLocations('Berlin')).rejects.toThrow('Network Error')
    })
  })

  describe('Method: getCurrentWeather', () => {

    it('calls the current weather endpoint with the correct path', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeather })

      await weatherService.getCurrentWeather(52.52, 13.405, 'metric')

      expect(mockGet).toHaveBeenCalledWith('/data/2.5/weather', expect.any(Object))
    })

    it('passes lat, lon, and units in params', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeather })

      await weatherService.getCurrentWeather(52.52, 13.405, 'metric')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params).toMatchObject({ lat: 52.52, lon: 13.405, units: 'metric' })
    })

    it('passes appid in params', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeather })

      await weatherService.getCurrentWeather(52.52, 13.405, 'metric')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params).toHaveProperty('appid')
    })

    it('passes imperial units when requested', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeather })

      await weatherService.getCurrentWeather(40.71, -74.0, 'imperial')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params.units).toBe('imperial')
    })

    it('returns the weather object from response.data', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeather })

      const result = await weatherService.getCurrentWeather(52.52, 13.405, 'metric')

      expect(result).toEqual(mockCurrentWeather)
    })

    it('propagates errors thrown by axios', async () => {
      mockGet.mockRejectedValueOnce(new Error('timeout'))

      await expect(
        weatherService.getCurrentWeather(52.52, 13.405, 'metric')
      ).rejects.toThrow('timeout')
    })
  })

  describe('Method: getForecast', () => {

    it('calls the forecast endpoint with the correct path', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })

      await weatherService.getForecast(52.52, 13.405, 'metric')

      expect(mockGet).toHaveBeenCalledWith('/data/2.5/forecast', expect.any(Object))
    })

    it('passes lat, lon, and units in params', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })

      await weatherService.getForecast(52.52, 13.405, 'metric')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params).toMatchObject({ lat: 52.52, lon: 13.405, units: 'metric' })
    })

    it('passes appid in params', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })

      await weatherService.getForecast(52.52, 13.405, 'metric')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params).toHaveProperty('appid')
    })

    it('passes imperial units when requested', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })

      await weatherService.getForecast(40.71, -74.0, 'imperial')

      const params = mockGet.mock.calls[0]?.[1]?.params
      expect(params.units).toBe('imperial')
    })

    it('returns the forecast object from response.data', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })

      const result = await weatherService.getForecast(52.52, 13.405, 'metric')

      expect(result).toEqual(mockForecastResponse)
    })

    it('returns the full list of forecast entries', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })

      const result = await weatherService.getForecast(52.52, 13.405, 'metric')

      expect(result.list).toHaveLength(2)
    })

    it('propagates errors thrown by axios', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network Error'))

      await expect(
        weatherService.getForecast(52.52, 13.405, 'metric')
      ).rejects.toThrow('Network Error')
    })
  })

  describe('Snapshot', () => {

    it('searchLocations response matches snapshot', async () => {
      mockGet.mockResolvedValueOnce({ data: mockGeoResults })
      const result = await weatherService.searchLocations('Berlin')
      expect(result).toMatchSnapshot()
    })

    it('getCurrentWeather response matches snapshot', async () => {
      mockGet.mockResolvedValueOnce({ data: mockCurrentWeather })
      const result = await weatherService.getCurrentWeather(52.52, 13.405, 'metric')
      expect(result).toMatchSnapshot()
    })

    it('getForecast response matches snapshot', async () => {
      mockGet.mockResolvedValueOnce({ data: mockForecastResponse })
      const result = await weatherService.getForecast(52.52, 13.405, 'metric')
      expect(result).toMatchSnapshot()
    })
  })

})
