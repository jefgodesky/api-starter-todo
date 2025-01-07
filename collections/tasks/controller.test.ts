import { describe, beforeEach, afterEach, afterAll, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import { Status } from '@oak/oak'
import { createMockContext } from '@oak/oak/testing'
import type Response from '../../types/response.ts'
import type Task from '../../types/task.ts'
import type TaskAttributes from '../../types/task-attributes.ts'
import type TaskCreation from '../../types/task-creation.ts'
import type TaskPatch from '../../types/task-patch.ts'
import type TaskResource from '../../types/task-resource.ts'
import DB from '../../DB.ts'
import TaskRepository from './repository.ts'
import stringToReadableStream from '../../utils/transformers/string-to-readable-stream.ts'
import setupTask from '../../utils/testing/setup-task.ts'
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

  describe('list', () => {
    it('shows your tasks', async () => {
      const { user, task } = await setupTask()
      await setupTask()

      const ctx = createMockContext({ state: { client: user } })
      await TaskController.list(ctx)
      const data = (ctx.response.body as Response)?.data as TaskResource[]

      expect(ctx.response.status).toBe(Status.OK)
      expect(data).toHaveLength(1)
      expect(data[0].type).toBe('tasks')
      expect(data[0].id).toBe(task.id)
      expect(data[0].attributes.name).toBe(task.name)
    })

    it('can be sorted', async () => {
      const repository = new TaskRepository()
      const { user } = await setupUser({ createAccount: false, createToken: false })
      const taskNames = [
        'Check it the test passes',
        'Begin running tests',
        'Arrange test conditions'
      ]

      for (const name of taskNames) {
        await repository.save({ uid: user.id, name })
      }

      const ctx = createMockContext({ state: { client: user } })
      const url = new URL('http://localhost:8001/v1/tasks?sort=name')
      await TaskController.list(ctx, url)
      const data = (ctx.response.body as Response)?.data as TaskResource[]

      expect(ctx.response.status).toBe(Status.OK)
      expect(data).toHaveLength(3)
      expect(data[0].attributes.name).toBe(taskNames[2])
      expect(data[1].attributes.name).toBe(taskNames[1])
      expect(data[2].attributes.name).toBe(taskNames[0])
    })

    it('can be filtered', async () => {
      const { user } = await setupTask()

      const ctx = createMockContext({ state: { client: user } })
      const url = new URL('http://localhost:8001/v1/tasks?filter[completed]=true')
      await TaskController.list(ctx, url)
      const data = (ctx.response.body as Response)?.data as TaskResource[]

      expect(ctx.response.status).toBe(Status.OK)
      expect(data).toHaveLength(0)
    })

    it('paginates results', async () => {
      const repository = new TaskRepository()
      const total = 5
      const limit = 3
      const { user } = await setupUser({ createAccount: false, createToken: false })
      for (let i = 0; i < total; i++) {
        await repository.save({ uid: user.id, name: `Task #${i}` })
      }

      const ctx = createMockContext({ state: { client: user } })
      const url = new URL(`http://localhost:8001/v1/tasks?limit=${limit}&offset=1`)
      await TaskController.list(ctx, url)
      const data = (ctx.response.body as Response)?.data as TaskResource[]

      expect(data).toHaveLength(limit)
      expect(data[0].attributes.name).toBe('Task #1')
    })
  })

  describe('update', () => {
    let task: Task

    beforeEach(async () => {
      const data = await setupTask()
      task = data.task
    })

    const updateTask = async (patch: TaskPatch): Promise<{ status: number, attributes: TaskAttributes, check: Task | null }> => {
      const ctx = createMockContext({
        state: { task },
        body: stringToReadableStream(JSON.stringify(patch))
      })

      await TaskController.update(ctx)
      const { attributes } = (ctx.response.body as Response).data as TaskResource
      const check = await TaskController.getRepository().get(task.id!)
      return { status: ctx.response.status, attributes, check }
    }

    it('patches a task', async () => {
      const patch: TaskPatch = {
        data: {
          type: 'tasks',
          id: task.id!,
          attributes: {
            name: 'Updated name',
            completed: true
          }
        }
      }

      const { status, attributes, check } = await updateTask(patch)

      expect(status).toBe(Status.OK)
      expect(attributes.name).toBe(patch.data.attributes.name)
      expect(attributes.notes).toBe(task.notes)
      expect(attributes.completed).toBeDefined()
      expect(check).not.toBeNull()
      expect(check?.name).toBe(patch.data.attributes.name)
      expect(check?.notes).toBe(task.notes)
      expect(check?.completed).toEqual(attributes.completed)
    })

    it('can mark a completed task incomplete', async () => {
      const patch: TaskPatch = {
        data: {
          type: 'tasks',
          id: task.id!,
          attributes: {
            completed: false
          }
        }
      }

      task.completed = new Date()
      await TaskController.getRepository().save(task)
      const { status, attributes, check } = await updateTask(patch)

      expect(status).toBe(Status.OK)
      expect(attributes.completed).not.toBeDefined()
      expect(check).not.toBeNull()
      expect(check?.completed).toBeNull()
    })
  })
})
