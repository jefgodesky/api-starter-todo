import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { isTaskPatch } from './task-patch.ts'

describe('isTaskPatch', () => {
  const name = 'Pass this test'
  const notes = 'This test must pass.'
  const completed = true

  it('returns false if given a primitive', () => {
    const primitives = [() => {}, null, undefined, true, false, 1, 'true', {}, []]
    for (const primitive of primitives) {
      expect(isTaskPatch(primitive)).toBe(false)
    }
  })

  it('returns true if given a TaskPatch object', () => {
    const scenarios = [
      { name },
      { notes },
      { completed },
      { name, notes },
      { name, completed },
      { notes, completed },
      { name, notes, completed }
    ]

    for (const attributes of scenarios) {
      expect(isTaskPatch({ data: { type: 'tasks', id: crypto.randomUUID(), attributes } })).toBe(true)
    }
  })

  it('returns false if given an object with additional properties', () => {
    expect(isTaskPatch({ data: { type: 'tasks', id: crypto.randomUUID(), attributes: { name, notes, completed, created: new Date() } } })).toBe(false)
  })
})
