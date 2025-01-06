import { describe, beforeAll, afterAll, afterEach, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import DB from '../../DB.ts'
import setupTask from '../../utils/testing/setup-task.ts'
import setupUser from '../../utils/testing/setup-user.ts'
import TaskRepository from './repository.ts'

describe('TaskRepository', () => {
  let repository: TaskRepository

  beforeAll(() => {
    repository = new TaskRepository()
  })

  afterAll(async () => {
    await DB.close()
  })

  afterEach(async () => {
    await DB.clear()
  })

  describe('listByUID', () => {
    it('lists only the user\'s tasks', async () => {
      const t1 = await setupTask()
      await setupTask()

      const results = await repository.listByUID(t1.user.id!)
      expect(results.total).toBe(1)
      expect(results.rows).toHaveLength(results.total)
    })

    it('can be sorted', async () => {
      const { user } = await setupUser({ createAccount: false, createToken: false })
      const taskNames = [
        'Check it the test passes',
        'Begin running tests',
        'Arrange test conditions'
      ]

      for (const name of taskNames) {
        await repository.save({ uid: user.id, name })
      }

      const results = await repository.listByUID(user.id!, { sort: 'name ASC' })
      expect(results.total).toBe(3)
      expect(results.rows[0].name).toBe(taskNames[2])
      expect(results.rows[1].name).toBe(taskNames[1])
      expect(results.rows[2].name).toBe(taskNames[0])
    })

    it('can be filtered', async () => {
      const data = await setupTask()
      const results = await repository.listByUID(data.user.id!, { filter: 'completed IS NOT NULL' })
      expect(results.total).toBe(0)
      expect(results.rows).toHaveLength(results.total)
    })

    it('paginates results', async () => {
      const total = 5
      const limit = 3
      const { user } = await setupUser({ createAccount: false, createToken: false })
      for (let i = 0; i < total; i++) {
        await repository.save({ uid: user.id, name: `Task #${i}` })
      }

      const results = await repository.listByUID(user.id!, { limit })
      expect(results.total).toBe(total)
      expect(results.rows).toHaveLength(limit)
    })
  })
})
