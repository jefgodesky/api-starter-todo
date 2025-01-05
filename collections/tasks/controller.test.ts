import { describe, afterEach, afterAll, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { Status } from '@oak/oak'
import { createMockContext } from '@oak/oak/testing'
import type Response from '../../types/response.ts'
import type TaskCreation from '../../types/task-creation.ts'
import type TaskResource from '../../types/task-resource.ts'
import DB from '../../DB.ts'
import stringToReadableStream from '../../utils/transformers/string-to-readable-stream.ts'
import setupUser from '../../utils/testing/setup-user.ts'
import TaskController from './controller.ts'

describe('TaskController', () => {
  afterEach(async () => {
    await DB.clear()
  })

  afterAll(async () => {
    await DB.close()
  })

  describe('create', () => {
    it('creates a new task', async () => {
      const name = 'Pass all tests'
      const { user } = await setupUser({ createAccount: false, createToken: false })
      const body: TaskCreation = { data: { type: 'tasks', attributes: { name } } }
      const ctx = createMockContext({
        state: { client: user },
        body: stringToReadableStream(JSON.stringify(body))
      })

      await TaskController.create(ctx)
      const task = (ctx.response.body as Response).data as TaskResource
      const record = await TaskController.getRepository().get(task.id)

      expect(ctx.response.status).toBe(Status.OK)
      expect(record).not.toBeNull()
    })
  })
})
