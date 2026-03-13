import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from 'src/stores/WeatherStore'
import ForecastCard from 'src/components/ForecastCard.vue'
import type { DailyForecast } from 'src/types/Weather'

const mockForecasts: DailyForecast[] = [
  {
    date: '2024-01-01', dayLabel: 'Mon', icon: '01d', description: 'clear sky',
    temp_min: 10, temp_max: 18, humidity: 55, windSpeed: 3.2, pop: 0,
  },
  {
    date: '2024-01-02', dayLabel: 'Tue', icon: '10d', description: 'light rain',
    temp_min: 8,  temp_max: 14, humidity: 80, windSpeed: 5.1, pop: 60,
  },
  {
    date: '2024-01-03', dayLabel: 'Wed', icon: '02d', description: 'few clouds',
    temp_min: 9,  temp_max: 16, humidity: 65, windSpeed: 2.8, pop: 3,
  },
]

describe('Component: ForecastCard', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    useWeatherStore().dailyForecasts = mockForecasts
    wrapper = mount(ForecastCard)
  })

  describe('Method: renders forecast days', () => {

    it('renders a column for each forecast entry', () => {
      expect(wrapper.findAll('.forecast-day')).toHaveLength(3)
    })

    it('renders the day label for each entry', () => {
      expect(wrapper.text()).toContain('Mon')
      expect(wrapper.text()).toContain('Tue')
      expect(wrapper.text()).toContain('Wed')
    })

    it('renders the 5-Day Forecast heading', () => {
      expect(wrapper.text()).toContain('5-Day Forecast')
    })

    it('renders rounded tempMax for each day', () => {
      expect(wrapper.text()).toContain('18')
      expect(wrapper.text()).toContain('14')
    })

    it('renders rounded tempMin for each day', () => {
      expect(wrapper.text()).toContain('10')
      expect(wrapper.text()).toContain('8')
    })

    it('renders OWM icon images with correct src per entry', () => {
      const images = wrapper.findAll('img')
      expect(images).toHaveLength(3)
      expect(images[0]!.attributes('src')).toContain('01d')
      expect(images[1]!.attributes('src')).toContain('10d')
    })
  })

  describe('Method: precipitation display', () => {

    it('shows pop percentage when pop > 5', () => {
      expect(wrapper.text()).toContain('60%')
    })

    it('only renders one .pop element (for Tue)', () => {
      expect(wrapper.findAll('.pop')).toHaveLength(1)
    })
  })

  describe('Method: empty state', () => {

    beforeEach(() => {
      useWeatherStore().dailyForecasts = []
      wrapper = mount(ForecastCard)
    })

    it('renders no day columns when dailyForecasts is empty', () => {
      expect(wrapper.findAll('.forecast-day')).toHaveLength(0)
    })
  })

  describe('Method: unit system', () => {

    it('uses °C in metric mode', () => {
      expect(wrapper.text()).toContain('°C')
    })

    it('uses °F in imperial mode', () => {
      const store = useWeatherStore()
      store.units = 'imperial'
      store.dailyForecasts = mockForecasts
      expect(mount(ForecastCard).text()).toContain('°F')
    })
  })

  describe('Snapshot', () => {

    it('matches snapshot with mock forecasts', () => {
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('matches snapshot when empty', () => {
      useWeatherStore().dailyForecasts = []
      expect(mount(ForecastCard).html()).toMatchSnapshot()
    })
  })

})
