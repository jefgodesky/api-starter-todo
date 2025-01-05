import { describe, afterEach, afterAll, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { Status } from '@oak/oak'
import { createMockContext } from '@oak/oak/testing'
import type Response from '../../types/response.ts'
import type Task from '../../types/task.ts'
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

  describe('get', () => {
    const task: Task = { id: crypto.randomUUID(), name: 'Pass all tests', notes: 'All tests must pass.' }
    const ctx = createMockContext({ state: { task } })

    it('returns the task', () => {
      TaskController.get(ctx)
      const data = (ctx.response.body as Response)?.data as TaskResource
      expect(ctx.response.status).toBe(200)
      expect(data).toBeDefined()
      expect(data.type).toBe('tasks')
      expect(data.attributes).toHaveProperty('name', task.name)
    })

    it('returns a sparse fieldset', () => {
      const fieldsets = [
        ['name', task.name, undefined],
        ['notes', undefined, task.notes],
        ['name,notes', task.name, task.notes]
      ]

      for (const [q, name, username] of fieldsets) {
        const url = new URL(`http://localhost:8001/v1/tasks/${task.id}?fields[tasks]=${q}`)
        TaskController.get(ctx, url)
        const data = (ctx.response.body as Response)?.data as TaskResource
        expect(ctx.response.status).toBe(200)
        expect(data.attributes.name).toBe(name)
        expect(data.attributes.notes).toBe(username)
      }
    })
  })
})
