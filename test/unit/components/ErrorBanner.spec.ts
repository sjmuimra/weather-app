import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from 'src/stores/WeatherStore'
import ErrorBanner from 'src/components/ErrorBanner.vue'

describe('Component: ErrorBanner', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Method: hidden state (error is null)', () => {

    beforeEach(() => {
      useWeatherStore().error = null
      wrapper = mount(ErrorBanner)
    })

    it('renders nothing when store.error is null', () => {
      expect(wrapper.find('.error-banner').exists()).toBe(false)
    })

    it('renders the v-if comment node', () => {
      expect(wrapper.html()).toBe('<!--v-if-->')
    })
  })

  describe('Method: visible state (error is set)', () => {

    beforeEach(() => {
      useWeatherStore().error = 'Invalid API key'
      wrapper = mount(ErrorBanner)
    })

    it('renders the banner element', () => {
      expect(wrapper.find('.error-banner').exists()).toBe(true)
    })

    it('displays the error message text', () => {
      expect(wrapper.text()).toContain('Invalid API key')
    })

    it('shows a Dismiss button', () => {
      expect(wrapper.text()).toContain('Dismiss')
    })
  })

  describe('Method: dismiss interaction', () => {

    beforeEach(() => {
      useWeatherStore().error = 'Something went wrong'
      wrapper = mount(ErrorBanner)
    })

    it('clears store.error to null when Dismiss is clicked', async () => {
      await wrapper.find('button').trigger('click')
      expect(useWeatherStore().error).toBeNull()
    })

    it('hides the banner after Dismiss is clicked', async () => {
      await wrapper.find('button').trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.error-banner').exists()).toBe(false)
    })
  })

  describe('Snapshot', () => {

    it('matches snapshot when hidden', () => {
      useWeatherStore().error = null
      expect(mount(ErrorBanner).html()).toMatchSnapshot()
    })

    it('matches snapshot when showing an error', () => {
      useWeatherStore().error = 'Location not found. Try a different search.'
      expect(mount(ErrorBanner).html()).toMatchSnapshot()
    })
  })

})
