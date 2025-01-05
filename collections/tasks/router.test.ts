import { describe, afterEach, afterAll, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import supertest from 'supertest'
import DB from '../../DB.ts'
import setupTask from '../../utils/testing/setup-task.ts'
import setupUser from '../../utils/testing/setup-user.ts'
import getSupertestRoot from '../../utils/testing/get-supertest-root.ts'

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
  })
})
