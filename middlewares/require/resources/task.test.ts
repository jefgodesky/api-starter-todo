import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { HttpError, Status } from '@oak/oak'
import { createMockContext } from '@oak/oak/testing'
import createNextSpy from '../../../utils/testing/create-next-spy.ts'
import getMessage from '../../../utils/get-message.ts'
import requireTask from './task.ts'

describe('requireTask', () => {
  it('proceeds if there is a task resource in state', async () => {
    const ctx = createMockContext({
      state: { task: { name: 'Pass all tests' } }
    })

    const next = createNextSpy()
    await requireTask(ctx, next)
    expect(next.calls).toHaveLength(1)
  })

  it('returns 404 if there is no task', async () => {
    const ctx = createMockContext()
    const next = createNextSpy()

    try {
      await requireTask(ctx, next)
      expect(0).toBe('No task found should throw a 404 error.')
    } catch (err) {
      expect((err as HttpError).message).toBe(getMessage('task_not_found'))
      expect((err as HttpError).status).toBe(Status.NotFound)
      expect(next.calls).toHaveLength(0)
    }
  })
})