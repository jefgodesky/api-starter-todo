import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import type Task from '../../types/task.ts'
import { type TaskAttributesKeys } from '../../types/task-attributes.ts'
import taskToTaskAttributes from './task-to-task-attributes.ts'

describe('taskToTaskAttributes', () => {
  const task: Task = {
    id: crypto.randomUUID(),
    name: 'Pass all tests',
    notes: 'All tests must pass.'
  }

  const fieldsets: [TaskAttributesKeys[], TaskAttributesKeys[], string[]][] = [
    [['name'], ['notes'], [task.name]],
    [['notes'], ['name'], [task.notes!]],
    [['name', 'notes'], [], [task.name, task.notes!]]
  ]

  it('returns a TaskAttributes object', () => {
    const actual = taskToTaskAttributes(task)
    expect(Object.keys(actual)).toHaveLength(2)
    expect(actual.name).toBe(task.name)
    expect(actual.notes).toBe(task.notes)
  })

  it('can return a sparse fieldset', () => {
    for (const [included, excluded, expected] of fieldsets) {
      const actual = taskToTaskAttributes(task, included)
      expect(Object.keys(actual)).toHaveLength(included.length)
      for (let i = 0; i < included.length; i++) expect(actual[included[i]]).toBe(expected[i])
      for (const ex of excluded) expect(actual[ex]).not.toBeDefined()
    }
  })
})
