import { describe, afterEach, afterAll, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { createMockContext, createMockNext } from '@oak/oak/testing'
import DB from '../../DB.ts'
import setupTask from '../../utils/testing/setup-task.ts'
import loadTask from './task.ts'

describe('loadTask', () => {
  afterEach(async () => {
    await DB.clear()
  })

  afterAll(async () => {
    await DB.close()
  })

  it('loads the task requested by ID', async () => {
    const { task } = await setupTask()
    const ctx = createMockContext({
      state: { params: { taskId: task.id } }
    })
    await loadTask(ctx, createMockNext())

    expect(ctx.state.task).toBeDefined()
    expect(ctx.state.task.id).toBe(task.id)
    expect(ctx.state.task.name).toBe(task.name)
  })
})
