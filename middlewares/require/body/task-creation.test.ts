import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { HttpError, Status } from '@oak/oak'
import { createMockContext } from '@oak/oak/testing'
import type TaskCreation from '../../../types/task-creation.ts'
import createNextSpy from '../../../utils/testing/create-next-spy.ts'
import stringToReadableStream from '../../../utils/transformers/string-to-readable-stream.ts'
import getMessage from '../../../utils/get-message.ts'
import requireTaskCreationBody from './task-creation.ts'

describe('requireTaskCreationBody', () => {
  it('proceeds if given a task creation object', async () => {
    const payload: TaskCreation = {
      data: {
        type: 'tasks',
        attributes: {
          name: 'Pass all tests'
        }
      }
    }

    const ctx = createMockContext({
      body: stringToReadableStream(JSON.stringify(payload))
    })

    const next = createNextSpy()
    await requireTaskCreationBody(ctx, next)
    expect(next.calls).toHaveLength(1)
  })

  it('throws 400 error if not given a task creation object', async () => {
    const ctx = createMockContext({
      body: stringToReadableStream(JSON.stringify({ a: 1 }))
    })
    const next = createNextSpy()

    try {
      await requireTaskCreationBody(ctx, next)
      expect(0).toBe('Invalid TaskCreation should throw 400 error.')
    } catch (err) {
      expect((err as HttpError).message).toBe(getMessage('invalid_task_creation'))
      expect((err as HttpError).status).toBe(Status.BadRequest)
      expect(next.calls).toHaveLength(0)
    }
  })
})
