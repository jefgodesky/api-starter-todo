import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { type TaskAttributesKeys } from '../../types/task-attributes.ts'
import type Task from '../../types/task.ts'
import type TaskResource from '../../types/task-resource.ts'
import taskToTaskResponse from './task-to-task-response.ts'

describe('taskToTaskResponse', () => {
  const task: Task = {
    id: crypto.randomUUID(),
    name: 'Pass all tests',
    notes: 'All tests must pass.'
  }

  it('generates a Response', () => {
    const actual = taskToTaskResponse(task)
    const expected = {
      jsonapi: { version: '1.1' },
      links: {
        self: `http://localhost:8001/v1/tasks/${task.id}`,
        describedBy: 'http://localhost:8001/v1/docs'
      },
      data: {
        type: 'tasks',
        id: task.id,
        attributes: {
          name: task.name,
          notes: task.notes
        }
      }
    }
    expect(actual).toEqual(expected)
  })

  it('can return a sparse fieldset', () => {
    const fields = ['name', 'notes'] as readonly TaskAttributesKeys[]
    for (const field of fields) {
      const res = taskToTaskResponse(task, [field])
      const data = res.data as TaskResource
      for (const f of fields) {
        if (f === field) expect(data.attributes[f]).toBeDefined()
        if (f !== field) expect(data.attributes[f]).toBeUndefined()
      }
    }
  })
})
