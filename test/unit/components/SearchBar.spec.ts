import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from 'src/stores/WeatherStore'
import SearchBar from 'src/components/SearchBar.vue'
import type { GeocodingResult } from 'src/types/Weather'

const mockLocation: GeocodingResult = {
  name: 'Berlin', lat: 52.52, lon: 13.405, country: 'DE', state: 'Berlin',
}

function normalizeQuasarIds(html: string): string {
  return html.replace(/f_[0-9a-f-]{36}/g, 'f_QUASAR_ID')
}

describe('Component: SearchBar', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    wrapper = mount(SearchBar)
  })

  describe('Method: renders input', () => {

    it('renders a text input element', () => {
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('renders the placeholder label text', () => {
      expect(wrapper.html()).toContain('Search for a city')
    })

    it('renders the search icon', () => {
      expect(wrapper.html()).toContain('search')
    })
  })

  describe('Method: loading spinner', () => {

    it('shows spinner when loading is true and no weather data yet', () => {
      const store = useWeatherStore()
      store.loading = true
      expect(mount(SearchBar).findComponent({ name: 'QSpinner' }).exists()).toBe(true)
    })

    it('hides spinner when loading is false', () => {
      useWeatherStore().loading = false
      expect(mount(SearchBar).findComponent({ name: 'QSpinner' }).exists()).toBe(false)
    })
  })

  describe('Method: filter interaction', () => {

    it('calls store.searchLocations when the filter event fires', async () => {
      const store = useWeatherStore()
      store.searchLocations = vi.fn().mockResolvedValue(undefined)
      wrapper = mount(SearchBar)
      await wrapper.findComponent({ name: 'QSelect' }).vm.$emit('filter', 'Ber', vi.fn())
      expect(store.searchLocations).toHaveBeenCalledWith('Ber')
    })
  })

  describe('Method: select interaction', () => {

    it('calls store.selectLocation when a suggestion is chosen', async () => {
      const store = useWeatherStore()
      store.selectLocation = vi.fn().mockResolvedValue(undefined)
      wrapper = mount(SearchBar)
      await wrapper.findComponent({ name: 'QSelect' }).vm.$emit('update:modelValue', {
        ...mockLocation,
        displayName: 'Berlin, Berlin, DE',
      })
      expect(store.selectLocation).toHaveBeenCalled()
    })
  })

  describe('Method: enter key interaction', () => {

    describe('when suggestions exist', () => {
      beforeEach(() => {
        const store = useWeatherStore()
        store.locationSuggestions = [mockLocation]
        store.selectLocation = vi.fn().mockResolvedValue(undefined)
        wrapper = mount(SearchBar)
      })

      it('calls store.selectLocation with the first suggestion', async () => {
        await wrapper.find('input').trigger('keyup.enter')
        expect(useWeatherStore().selectLocation).toHaveBeenCalledWith(mockLocation)
      })
    })

    describe('when suggestions are empty', () => {
      beforeEach(() => {
        const store = useWeatherStore()
        store.locationSuggestions = []
        store.selectLocation = vi.fn()
        wrapper = mount(SearchBar)
      })

      it('does not call store.selectLocation', async () => {
        await wrapper.find('input').trigger('keyup.enter')
        expect(useWeatherStore().selectLocation).not.toHaveBeenCalled()
      })
    })
  })

  describe('Snapshot', () => {

    it('matches snapshot in default state', () => {
      expect(normalizeQuasarIds(wrapper.html())).toMatchSnapshot()
    })
  })

})
