import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import type Task from '../../types/task.ts'
import taskToLink from './task-to-link.ts'

describe('taskToLink', () => {
  const task: Task = {
    name: 'Pass all tests'
  }

  it('returns a link to a TaskResource', () => {
    const id = crypto.randomUUID()
    const expected = `http://localhost:8001/v1/tasks/${id}`
    expect(taskToLink({ id, ...task })).toBe(expected)
  })

  it('returns a link to the Users collection if user has no ID', () => {
    const expected = 'http://localhost:8001/v1/tasks'
    expect(taskToLink(task)).toBe(expected)
  })
})
