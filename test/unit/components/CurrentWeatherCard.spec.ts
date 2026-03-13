import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from 'src/stores/WeatherStore'
import CurrentWeatherCard from 'src/components/CurrentWeatherCard.vue'
import type { CurrentWeather } from 'src/types/Weather'

const mockWeather: CurrentWeather = {
  coord: { lon: 13.405, lat: 52.52 },
  weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
  base: 'stations',
  main: {
    temp: 18.4, feels_like: 17.1,
    temp_min: 15.0, temp_max: 20.2,
    pressure: 1013, humidity: 60,
  },
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

describe('Component: CurrentWeatherCard', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(CurrentWeatherCard, { props: { weather: mockWeather } })
  })

  describe('Method: renders location', () => {

    it('renders the city name', () => {
      expect(wrapper.text()).toContain('Berlin')
    })

    it('renders the country code', () => {
      expect(wrapper.text()).toContain('DE')
    })

    it('renders the current date element', () => {
      expect(wrapper.find('.text-caption.text-grey-6').exists()).toBe(true)
    })
  })

  describe('Method: renders temp', () => {

    it('renders the rounded temp value', () => {
      expect(wrapper.text()).toContain('18')
    })

    it('renders the weather description', () => {
      expect(wrapper.text()).toContain('clear sky')
    })

    it('renders the feels-like label', () => {
      expect(wrapper.text()).toContain('Feels like')
    })

    it('renders the rounded feels-like value', () => {
      expect(wrapper.text()).toContain('17')
    })
  })

  describe('Method: renders stat chips', () => {

    it('renders humidity chip', () => {
      expect(wrapper.text()).toContain('60%')
      expect(wrapper.text()).toContain('Humidity')
    })

    it('renders wind chip label', () => {
      expect(wrapper.text()).toContain('Wind')
    })

    it('renders visibility chip', () => {
      expect(wrapper.text()).toContain('10.0 km')
      expect(wrapper.text()).toContain('Visibility')
    })

    it('renders pressure chip', () => {
      expect(wrapper.text()).toContain('1013 hPa')
      expect(wrapper.text()).toContain('Pressure')
    })

    it('renders Sunrise label', () => {
      expect(wrapper.text()).toContain('Sunrise')
    })

    it('renders Sunset label', () => {
      expect(wrapper.text()).toContain('Sunset')
    })
  })

  describe('Method: renders weather icon', () => {

    it('renders the OWM icon with correct src', () => {
      expect(wrapper.find('img.weather-icon').attributes('src')).toContain('01d')
    })

    it('renders the icon with alt text from weather description', () => {
      expect(wrapper.find('img.weather-icon').attributes('alt')).toBe('clear sky')
    })
  })

  describe('Method: refresh button', () => {

    it('renders the refresh button', () => {
      expect(wrapper.find('[aria-label="Refresh weather"]').exists()).toBe(true)
    })

    it('calls store.refreshWeather when refresh is clicked', async () => {
      const store = useWeatherStore()
      store.refreshWeather = vi.fn().mockResolvedValue(undefined)
      const wrapper = mount(CurrentWeatherCard, { props: { weather: mockWeather } })
      await wrapper.find('[aria-label="Refresh weather"]').trigger('click')
      expect(store.refreshWeather).toHaveBeenCalledOnce()
    })
  })

  describe('Method: unit system', () => {

    it('displays °C by default in metric mode', () => {
      expect(wrapper.text()).toContain('°C')
    })

    it('displays °F when store is in imperial mode', () => {
      useWeatherStore().units = 'imperial'
      const wrapper = mount(CurrentWeatherCard, { props: { weather: mockWeather } })
      expect(wrapper.text()).toContain('°F')
    })
  })

  describe('Method: last updated section', () => {

    describe('when store.lastUpdated is null', () => {
      beforeEach(() => {
        useWeatherStore().lastUpdated = null
        wrapper = mount(CurrentWeatherCard, { props: { weather: mockWeather } })
      })

      it('does not show the last updated section', () => {
        expect(wrapper.text()).not.toContain('Last updated')
      })
    })

    describe('when store.lastUpdated is set', () => {
      beforeEach(() => {
        useWeatherStore().lastUpdated = new Date('2024-01-01T10:30:00Z')
        wrapper = mount(CurrentWeatherCard, { props: { weather: mockWeather } })
      })

      it('shows the last updated section', () => {
        expect(wrapper.text()).toContain('Last updated')
      })
    })
  })

  describe('Snapshot', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('matches snapshot in default metric state', () => {
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('matches snapshot in imperial mode', () => {
      useWeatherStore().units = 'imperial'
      const wrapper = mount(CurrentWeatherCard, { props: { weather: mockWeather } })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

})
