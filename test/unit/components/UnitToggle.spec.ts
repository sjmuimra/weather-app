import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useWeatherStore } from 'src/stores/WeatherStore'
import UnitToggle from 'src/components/UnitToggle.vue'

describe('Component: UnitToggle', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Method: renders labels', () => {

    beforeEach(() => {
      wrapper = mount(UnitToggle)
    })

    it('renders the °C label', () => {
      expect(wrapper.text()).toContain('°C')
    })

    it('renders the °F label', () => {
      expect(wrapper.text()).toContain('°F')
    })
  })

  describe('Method: active/inactive classes in metric mode', () => {

    beforeEach(() => {
      useWeatherStore().units = 'metric'
      wrapper = mount(UnitToggle)
    })

    it('°C label has the active class', () => {
      expect(wrapper.findAll('.unit-label')[0]?.classes()).toContain('active')
    })

    it('°F label has the inactive class', () => {
      expect(wrapper.findAll('.unit-label')[1]?.classes()).toContain('inactive')
    })
  })

  describe('Method: active/inactive classes in imperial mode', () => {

    beforeEach(() => {
      useWeatherStore().units = 'imperial'
      wrapper = mount(UnitToggle)
    })

    it('°F label has the active class', () => {
      expect(wrapper.findAll('.unit-label')[1]?.classes()).toContain('active')
    })

    it('°C label has the inactive class', () => {
      expect(wrapper.findAll('.unit-label')[0]?.classes()).toContain('inactive')
    })
  })

  describe('Method: toggle interaction', () => {

    it('calls store.toggleUnits when the toggle is clicked', async () => {
      const store = useWeatherStore()
      store.toggleUnits = vi.fn()
      wrapper = mount(UnitToggle)
      await wrapper.find('[role="switch"]').trigger('click')
      expect(store.toggleUnits).toHaveBeenCalledOnce()
    })

    it('toggle is disabled when store.loading is true', () => {
      useWeatherStore().loading = true
      wrapper = mount(UnitToggle)
      const toggle = wrapper.find('[role="switch"]')
      expect(toggle.attributes('aria-disabled')).toBe('true')
    })

    it('toggle is enabled when store.loading is false', () => {
      useWeatherStore().loading = false
      wrapper = mount(UnitToggle)
      const toggle = wrapper.find('[role="switch"]')
      expect(toggle.attributes('aria-disabled')).not.toBe('true')
    })
  })

  describe('Snapshot', () => {

    it('matches snapshot in metric mode', () => {
      useWeatherStore().units = 'metric'
      expect(mount(UnitToggle).html()).toMatchSnapshot()
    })

    it('matches snapshot in imperial mode', () => {
      useWeatherStore().units = 'imperial'
      expect(mount(UnitToggle).html()).toMatchSnapshot()
    })
  })

})
