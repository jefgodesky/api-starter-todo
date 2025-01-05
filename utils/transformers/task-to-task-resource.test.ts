import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import type Task from '../../types/task.ts'
import type { TaskAttributesKeys } from '../../types/task-attributes.ts'
import taskToTaskResource from './task-to-task-resource.ts'

describe('taskToTaskResource', () => {
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

  it('returns a TaskResource object', () => {
    const actual = taskToTaskResource(task)
    const expected = {
      type: 'tasks',
      id: task.id,
      attributes: {
        name: task.name,
        notes: task.notes
      }
    }
    expect(actual).toEqual(expected)
  })

  it('can return a sparse fieldset', () => {
    for (const [included, excluded, expected] of fieldsets) {
      const actual = taskToTaskResource(task, included)
      expect(actual.type).toBe('tasks')
      expect(actual.id).toBe(task.id)
      expect(Object.keys(actual.attributes)).toHaveLength(included.length)
      for (let i = 0; i < included.length; i++) expect(actual.attributes[included[i]]).toBe(expected[i])
      for (const ex of excluded) expect(actual.attributes[ex]).not.toBeDefined()
    }
  })
})
