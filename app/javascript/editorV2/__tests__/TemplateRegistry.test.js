import { describe, expect, it } from 'vitest'
import { TEMPLATES } from '../templates/TemplateRegistry.js'

describe('TemplateRegistry', () => {
  it('defines templates with a single organizer anchored at 0,0 and titled to match the template name', () => {
    expect(TEMPLATES.length).toBeGreaterThan(0)

    TEMPLATES.forEach(template => {
      const organizers = template.nodes.filter(node => node.type === 'organizer')

      expect(organizers).toHaveLength(1)
      expect(organizers[0].position).toEqual({ x: 0, y: 0 })
      expect(organizers[0].data.title).toBe(template.name)
    })
  })

  it('uses unique node keys within each template', () => {
    TEMPLATES.forEach(template => {
      const keys = template.nodes.map(node => node.key)
      expect(new Set(keys).size).toBe(keys.length)
    })
  })
})
