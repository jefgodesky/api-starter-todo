import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { isTaskAttributes } from './task-attributes.ts'

describe('isUserAttributes', () => {
  const name = 'Pass all tests'
  const notes = 'All tests must pass.'
  const created = new Date()
  const updated = new Date()
  const completed = new Date()

  it('returns false if given a primitive', () => {
    const primitives = [() => {}, null, undefined, true, false, 1, 'true']
    for (const primitive of primitives) {
      expect(isTaskAttributes(primitive)).toBe(false)
    }
  })

  it('returns true if given a TaskAttributes object', () => {
    expect(isTaskAttributes({})).toBe(true)
    expect(isTaskAttributes({ name })).toBe(true)
    expect(isTaskAttributes({ notes })).toBe(true)
    expect(isTaskAttributes({ created })).toBe(true)
    expect(isTaskAttributes({ updated })).toBe(true)
    expect(isTaskAttributes({ completed })).toBe(true)
    expect(isTaskAttributes({ name, notes })).toBe(true)
    expect(isTaskAttributes({ name, created })).toBe(true)
    expect(isTaskAttributes({ name, notes, created })).toBe(true)
    expect(isTaskAttributes({ name, created, updated })).toBe(true)
    expect(isTaskAttributes({ name, notes, created, updated })).toBe(true)
    expect(isTaskAttributes({ name, created, updated, completed })).toBe(true)
    expect(isTaskAttributes({ name, notes, created, updated, completed })).toBe(true)
  })

  it('returns false if the object has additional properties', () => {
    expect(isTaskAttributes({ name, notes, created, updated, completed, other: true })).toBe(false)
  })
})
