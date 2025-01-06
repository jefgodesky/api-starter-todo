import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { HttpError, Status } from '@oak/oak'
import { createMockContext } from '@oak/oak/testing'
import type TaskPatch from '../../../types/task-patch.ts'
import createNextSpy from '../../../utils/testing/create-next-spy.ts'
import stringToReadableStream from '../../../utils/transformers/string-to-readable-stream.ts'
import getMessage from '../../../utils/get-message.ts'
import requireTaskPatchBody from './task-patch.ts'

describe('requireTaskPatchBody', () => {
  it('proceeds if given a task patch object', async () => {
    const payload: TaskPatch = {
      data: {
        type: 'tasks',
        id: crypto.randomUUID(),
        attributes: {
          name: 'Pass all tests'
        }
      }
    }

    const ctx = createMockContext({
      body: stringToReadableStream(JSON.stringify(payload))
    })

    const next = createNextSpy()
    await requireTaskPatchBody(ctx, next)
    expect(next.calls).toHaveLength(1)
  })

  it('throws 400 error if not given a task patch object', async () => {
    const ctx = createMockContext({
      body: stringToReadableStream(JSON.stringify({ a: 1 }))
    })
    const next = createNextSpy()

    try {
      await requireTaskPatchBody(ctx, next)
      expect(0).toBe('Invalid TaskPatch should throw 400 error.')
    } catch (err) {
      expect((err as HttpError).message).toBe(getMessage('invalid_task_patch'))
      expect((err as HttpError).status).toBe(Status.BadRequest)
      expect(next.calls).toHaveLength(0)
    }
  })
})
