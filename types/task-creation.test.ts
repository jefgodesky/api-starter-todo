import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { isTaskCreation } from './task-creation.ts'

describe('isTaskCreation', () => {
  const name = 'Pass all tests'
  const notes = 'All tests must pass.'

  it('returns false if given a primitive', () => {
    const primitives = [() => {}, null, undefined, true, false, 1, 'true', {}, []]
    for (const primitive of primitives) {
      expect(isTaskCreation(primitive)).toBe(false)
    }
  })

  it('returns true if given a TaskCreation object', () => {
    const scenarios = [
      { name },
      { name, notes }
    ]

    for (const attributes of scenarios) {
      expect(isTaskCreation({ data: { type: 'tasks', attributes } })).toBe(true)
    }
  })

  it('returns false if given an object with additional properties', () => {
    expect(isTaskCreation({ data: { type: 'tasks', attributes: { name, notes, created: new Date() } } })).toBe(false)
  })
})
