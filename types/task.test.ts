import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { isTask } from './task.ts'

describe('isTask', () => {
  const id = crypto.randomUUID()
  const uid = crypto.randomUUID()
  const name = 'Pass all tests'
  const notes = 'All tests must pass.'
  const created = new Date()
  const updated = new Date()
  const completed = new Date()

  it('returns false if given a primitive', () => {
    const primitives = [() => {}, null, undefined, true, false, 'test', 1]
    for (const primitive of primitives) {
      expect(isTask(primitive)).toBe(false)
    }
  })

  it('returns false if given an empty object', () => {
    expect(isTask({})).toBe(false)
  })

  it('returns true if given a valid Task', () => {
    expect(isTask({ name })).toBe(true)
    expect(isTask({ id, name })).toBe(true)
    expect(isTask({ uid, name })).toBe(true)
    expect(isTask({ id, uid, name })).toBe(true)
    expect(isTask({ name, notes })).toBe(true)
    expect(isTask({ id, name, notes })).toBe(true)
    expect(isTask({ name, created })).toBe(true)
    expect(isTask({ name, updated })).toBe(true)
    expect(isTask({ name, completed })).toBe(true)
    expect(isTask({ id, uid, name, notes })).toBe(true)
    expect(isTask({ id, name, created })).toBe(true)
    expect(isTask({ name, created, updated })).toBe(true)
    expect(isTask({ name, created, updated, completed })).toBe(true)
    expect(isTask({ name, notes, created, updated })).toBe(true)
    expect(isTask({ name, notes, created, updated, completed })).toBe(true)
    expect(isTask({ id, uid, name, notes, created, updated })).toBe(true)
    expect(isTask({ id, uid, name, notes, created, updated, completed })).toBe(true)
  })

  it('returns false if given additional properties', () => {
    expect(isTask({ id, uid, name, notes, created, updated, completed, other: true })).toBe(false)
  })
})
