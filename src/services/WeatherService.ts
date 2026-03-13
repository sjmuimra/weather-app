import axios, { isAxiosError } from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  CurrentWeather,
  ForecastResponse,
  GeocodingResult,
  UnitSystem,
} from 'src/types/Weather'

class WeatherService {
  private readonly http: AxiosInstance
  private readonly apiKey: string

  constructor() {
    this.apiKey = import.meta.env.VITE_OWM_API_KEY as string
    const baseUrl = import.meta.env.VITE_OWM_BASE_URL as string

    if (!this.apiKey) {
      console.error(
        '[WeatherService] VITE_OWM_API_KEY is not set.\n' +
        'Copy .env.example → .env and fill in your OpenWeatherMap key.'
      )
    }

    if (!baseUrl) {
      console.error(
        '[WeatherService] VITE_OWM_BASE_URL is not set.\n' +
        'Copy .env.example → .env and fill in the base URL.'
      )
    }

    this.http = axios.create({
      baseURL: baseUrl,
      timeout: 10_000,
    })
  }

  async searchLocations(query: string, limit = 5): Promise<GeocodingResult[]> {
    const response: AxiosResponse<GeocodingResult[]> = await this.http.get('/geo/1.0/direct', {
      params: { q: query, limit, appid: this.apiKey },
    })
    return response.data
  }

  async getCurrentWeather(
    lat: number,
    lon: number,
    units: UnitSystem
  ): Promise<CurrentWeather> {
    const response: AxiosResponse<CurrentWeather> = await this.http.get('/data/2.5/weather', {
      params: { lat, lon, units, appid: this.apiKey },
    })
    return response.data
  }

  async getForecast(
    lat: number,
    lon: number,
    units: UnitSystem
  ): Promise<ForecastResponse> {
    const response: AxiosResponse<ForecastResponse> = await this.http.get('/data/2.5/forecast', {
      params: { lat, lon, units, appid: this.apiKey },
    })
    return response.data
  }
}

export const weatherService = new WeatherService()
export { isAxiosError }
