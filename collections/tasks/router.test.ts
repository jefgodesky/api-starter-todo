import { describe, afterEach, afterAll, it } from '@std/testing/bdd'
import { expect } from '@std/expect'
import supertest from 'supertest'
import DB from '../../DB.ts'
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
})
