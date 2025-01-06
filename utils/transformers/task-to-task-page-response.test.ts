import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import type Task from '../../types/task.ts'
import tasksToTaskPageResponse from './tasks-to-task-page-response.ts'

describe('tasksToTaskPageResponse', () => {
  const task: Task = {
    id: crypto.randomUUID(),
    name: 'Pass all tests'
  }

  it('generates a paginated Response', () => {
    const actual = tasksToTaskPageResponse([task], 2, 0, 1)
    const expected = {
      jsonapi: { version: '1.1' },
      links: {
        self: 'http://localhost:8001/v1/tasks',
        first: 'http://localhost:8001/v1/tasks?offset=0&limit=1',
        prev: 'http://localhost:8001/v1/tasks?offset=0&limit=1',
        next: 'http://localhost:8001/v1/tasks?offset=1&limit=1',
        last: 'http://localhost:8001/v1/tasks?offset=1&limit=1',
      },
      data: [
        {
          type: 'tasks',
          id: task.id,
          attributes: {
            name: task.name
          }
        }
      ]
    }
    expect(actual).toEqual(expected)
  })
})
