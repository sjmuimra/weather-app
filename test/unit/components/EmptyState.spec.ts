import { describe, it, expect, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import EmptyState from 'src/components/EmptyState.vue'

describe('Component: EmptyState', () => {
  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mount(EmptyState)
  })

  describe('Method: renders content', () => {

    it('renders the search instruction text', () => {
      expect(wrapper.text()).toContain('Search for a location')
    })

    it('renders the example city hint', () => {
      expect(wrapper.text()).toContain('Berlin')
    })

    it('renders the cloud_queue icon', () => {
      expect(wrapper.html()).toContain('cloud_queue')
    })

    it('has the empty-state root CSS class', () => {
      expect(wrapper.find('.empty-state').exists()).toBe(true)
    })
  })

  describe('Snapshot', () => {

    it('matches snapshot', () => {
      expect(wrapper.html()).toMatchSnapshot()
    })
  })

})
