import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import StatChip from 'src/components/StatChip.vue'

describe('Component: StatChip', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(StatChip, {
      props: { icon: 'water_drop', value: '72%', label: 'Humidity', color: 'blue-5' },
    })
  })

  describe('Method: renders props', () => {

    it('renders the value prop', () => {
      expect(wrapper.text()).toContain('72%')
    })

    it('renders the label prop', () => {
      expect(wrapper.text()).toContain('Humidity')
    })

    it('renders the icon name in the DOM', () => {
      expect(wrapper.html()).toContain('water_drop')
    })

    it('renders a different value and label when props change', () => {
      const wrapper = mount(StatChip, {
        props: { icon: 'air', value: '5.2 m/s', label: 'Wind', color: 'teal-5' },
      })
      expect(wrapper.text()).toContain('5.2 m/s')
      expect(wrapper.text()).toContain('Wind')
    })

    it('renders pressure chip correctly', () => {
      const wrapper = mount(StatChip, {
        props: { icon: 'compress', value: '1013 hPa', label: 'Pressure', color: 'orange-7' },
      })
      expect(wrapper.text()).toContain('1013 hPa')
      expect(wrapper.text()).toContain('Pressure')
    })

    it('renders visibility chip correctly', () => {
      const wrapper = mount(StatChip, {
        props: { icon: 'visibility', value: '10.0 km', label: 'Visibility', color: 'purple-5' },
      })
      expect(wrapper.text()).toContain('10.0 km')
      expect(wrapper.text()).toContain('Visibility')
    })
  })

  describe('Snapshot', () => {

    it('matches snapshot with humidity props', () => {
      expect(wrapper.html()).toMatchSnapshot()
    })

    it('matches snapshot with wind props', () => {
      const wrapper = mount(StatChip, {
        props: { icon: 'air', value: '3.5 m/s', label: 'Wind', color: 'teal-5' },
      })
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

})
