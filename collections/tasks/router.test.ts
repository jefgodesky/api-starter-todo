import { describe, beforeEach, afterEach, afterAll, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import supertest from 'supertest'
import DB from '../../DB.ts'
import TaskController from './controller.ts'
import setupTask from '../../utils/testing/setup-task.ts'
import setupUser from '../../utils/testing/setup-user.ts'
import getSupertestRoot from '../../utils/testing/get-supertest-root.ts'
import Task from '../../types/task.ts'
import TaskPatch from '../../types/task-patch.ts'

describe('/tasks', () => {
  afterEach(async () => {
    await DB.clear()
  })

  afterAll(async () => {
    await DB.close()
  })

  describe('Collection [/tasks]', () => {
    describe('POST', () => {
      const body = {
        data: {
          type: 'tasks',
          attributes: {
            name: 'Pass all tests'
          }
        }
      }

      it('returns 401 if not authenticated', async () => {
        const res = await supertest(getSupertestRoot())
          .post('/tasks')
          .set({'Content-Type': 'application/vnd.api+json'})
          .send(body)

        expect(res.status).toBe(401)
      })

      it('returns 400 if given bad input', async () => {
        const { jwt } = await setupUser()
        const res = await supertest(getSupertestRoot())
          .post('/tasks')
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })
          .send({ a: 1 })

        expect(res.status).toBe(400)
      })

      it('creates a new task', async () => {
        const { jwt } = await setupUser()
        const res = await supertest(getSupertestRoot())
          .post('/tasks')
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })
          .send(body)

        expect(res.status).toBe(200)
        expect(res.body.data.type).toBe('tasks')
        expect(res.body.data.id).toBeDefined()
        expect(res.body.data.attributes.name).toBe(body.data.attributes.name)
      })
    })

    describe('GET', () => {
      it('returns 401 if user is not authenticated', async () => {
        const res = await supertest(getSupertestRoot())
          .get(`/tasks`)
          .set({ 'Content-Type': 'application/vnd.api+json' })

        expect(res.status).toBe(401)
      })

      it('returns your tasks', async () => {
        const { jwt } = await setupTask()
        const res = await supertest(getSupertestRoot())
          .get(`/tasks`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(200)
        expect(res.body.data[0].type).toBe('tasks')
        expect(res.body.data).toHaveLength(1)
      })

      it('supports sparse fieldsets', async () => {
        const { task, jwt } = await setupTask()
        const fieldsets = [
          ['name', task.name, undefined],
          ['notes', undefined, task.notes],
          ['name,notes', task.name, task.notes]
        ]

        for (const [q, name, notes] of fieldsets) {
          const url = `/tasks?fields[tasks]=${q}`
          const res = await supertest(getSupertestRoot())
            .get(url)
            .set({
              Authorization: `Bearer ${jwt}`,
              'Content-Type': 'application/vnd.api+json'
            })

          expect(res.body.data[0].attributes.name).toBe(name)
          expect(res.body.data[0].attributes.notes).toBe(notes)
        }
      })

      it('can be sorted', async () => {
        const { user, jwt } = await setupUser({ createAccount: false })
        const taskNames = [
          'Check it the test passes',
          'Begin running tests',
          'Arrange test conditions'
        ]

        for (const name of taskNames) {
          await TaskController.getRepository().save({ uid: user.id, name })
        }

        const res = await supertest(getSupertestRoot())
          .get(`/tasks?sort=name`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.body.data[0].attributes.name).toBe(taskNames[2])
        expect(res.body.data[1].attributes.name).toBe(taskNames[1])
        expect(res.body.data[2].attributes.name).toBe(taskNames[0])
      })

      it('can be filtered', async () => {
        const { jwt } = await setupTask()
        const res = await supertest(getSupertestRoot())
          .get(`/tasks?filter[completed]=true`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.body.data).toHaveLength(0)
      })

      it('paginates results', async () => {
        const { user, jwt } = await setupUser({ createAccount: false })
        for (let i = 0; i < 5; i++) {
          await TaskController.getRepository().save({ uid: user.id, name: `Task #${i}` })
        }

        const res = await supertest(getSupertestRoot())
          .get(`/tasks?limit=1&offset=1`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.body.data).toHaveLength(1)
        expect(res.body.data[0].attributes.name).toBe('Task #1')
      })
    })
  })

  describe('Resource [/tasks/:taskId]', () => {
    describe('GET', () => {
      it('returns 401 if user is not authenticated', async () => {
        const { task } = await setupTask()
        const res = await supertest(getSupertestRoot())
          .get(`/tasks/${task.id}`)
          .set({ 'Content-Type': 'application/vnd.api+json' })

        expect(res.status).toBe(401)
      })

      it('returns 403 if you try to get someone else\'s task', async () => {
        const { task } = await setupTask()
        const { jwt } = await setupUser()
        const res = await supertest(getSupertestRoot())
          .get(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(403)
      })

      it('returns 404 if the task cannot be found', async () => {
        const { jwt } = await setupUser()
        const res = await supertest(getSupertestRoot())
          .get(`/tasks/${crypto.randomUUID()}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(404)
      })

      it('returns the task', async () => {
        const { task, jwt } = await setupTask()
        const res = await supertest(getSupertestRoot())
          .get(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(200)
        expect(res.body.data.type).toBe('tasks')
        expect(res.body.data.id).toBe(task.id)
        expect(res.body.data.attributes.name).toBe(task.name)
      })

      it('supports sparse fieldsets', async () => {
        const { task, jwt } = await setupTask()
        const fieldsets = [
          ['name', task.name, undefined],
          ['notes', undefined, task.notes],
          ['name,notes', task.name, task.notes]
        ]

        for (const [q, name, notes] of fieldsets) {
          const url = `/tasks/${task.id}?fields[tasks]=${q}`
          const res = await supertest(getSupertestRoot())
            .get(url)
            .set({
              Authorization: `Bearer ${jwt}`,
              'Content-Type': 'application/vnd.api+json'
            })

          expect(res.body.data.attributes.name).toBe(name)
          expect(res.body.data.attributes.notes).toBe(notes)
        }
      })
    })

    describe('PATCH', () => {
      let task: Task
      let jwt: string
      let patch: TaskPatch

      beforeEach(async () => {
        const data = await setupTask()
        task = data.task
        jwt = data.jwt
        patch = {
          data: {
            type: 'tasks',
            id: task.id!,
            attributes: {
              name: 'Updated name',
              completed: true
            }
          }
        }
      })

      it('returns 400 if given bad input', async () => {
        const res = await supertest(getSupertestRoot())
          .patch(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })
          .send({ a: 1 })

        expect(res.status).toBe(400)
      })

      it('returns 401 if not authenticated', async () => {
        const res = await supertest(getSupertestRoot())
          .patch(`/tasks/${task.id}`)
          .set({'Content-Type': 'application/vnd.api+json'})
          .send(patch)

        expect(res.status).toBe(401)
      })

      it('returns 403 if you try to update someone else\'s task', async () => {
        const data = await setupUser({ createAccount: false })
        const res = await supertest(getSupertestRoot())
          .patch(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${data.jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })
          .send(patch)

        expect(res.status).toBe(403)
      })

      it('returns 404 if no such task can be found', async () => {
        const res = await supertest(getSupertestRoot())
          .patch(`/tasks/${crypto.randomUUID()}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })
          .send(patch)

        expect(res.status).toBe(404)
      })

      it('updates the task', async () => {
        const res = await supertest(getSupertestRoot())
          .patch(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })
          .send(patch)

        expect(res.status).toBe(200)
        expect(res.body.data.type).toBe('tasks')
        expect(res.body.data.id).toBe(task.id)
        expect(res.body.data.attributes.name).toBe(patch.data.attributes.name)
        expect(res.body.data.attributes.notes).toBe(task.notes)
        expect(res.body.data.attributes.completed).toBeDefined()
      })
    })

    describe('DELETE', () => {
      let task: Task
      let jwt: string

      beforeEach(async () => {
        const data = await setupTask()
        task = data.task
        jwt = data.jwt
      })

      it('returns 401 if not authenticated', async () => {
        const res = await supertest(getSupertestRoot())
          .delete(`/tasks/${task.id}`)
          .set({'Content-Type': 'application/vnd.api+json'})

        expect(res.status).toBe(401)
      })

      it('returns 403 if you try to delete someone else\'s task', async () => {
        const data = await setupUser({ createAccount: false })
        const res = await supertest(getSupertestRoot())
          .delete(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${data.jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(403)
      })

      it('returns 404 if no such task can be found', async () => {
        const res = await supertest(getSupertestRoot())
          .delete(`/tasks/${crypto.randomUUID()}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(404)
      })

      it('deletes the task', async () => {
        const res = await supertest(getSupertestRoot())
          .delete(`/tasks/${task.id}`)
          .set({
            Authorization: `Bearer ${jwt}`,
            'Content-Type': 'application/vnd.api+json'
          })

        expect(res.status).toBe(204)
      })
    })
  })
})
