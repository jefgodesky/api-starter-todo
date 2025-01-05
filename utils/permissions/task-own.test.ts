import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { createMockContext } from '@oak/oak/testing'
import type User from '../../types/user.ts'
import type Task from '../../types/task.ts'
import checkTaskOwnPermission from './task-own.ts'

describe('checkTaskOwnPermission', () => {
  const user: User = { id: crypto.randomUUID(), name: 'John Doe' }
  const task: Task = { name: 'Pass all tests' }

  it('returns false if given no task', () => {
    const ctx = createMockContext({
      state: { permissions: ['task:own:read'], client: user }
    })
    expect(checkTaskOwnPermission(ctx, 'task:read')).toBe(false)
  })

  it('returns false if the client does not have permission', () => {
    const ctx = createMockContext({
      state: { permissions: [], client: user, task: { uid: user.id, ...task } }
    })
    expect(checkTaskOwnPermission(ctx, 'task:read')).toBe(false)
  })

  it('returns false if there is no client', () => {
    const ctx = createMockContext({
      state: { permissions: ['task:own:read'], task: { uid: user.id, ...task } }
    })
    expect(checkTaskOwnPermission(ctx, 'task:read')).toBe(false)
  })

  it('returns false if client does not own the task', () => {
    const ctx = createMockContext({
      state: { permissions: ['task:own:read'], client: user, task }
    })
    expect(checkTaskOwnPermission(ctx, 'task:read')).toBe(false)
  })

  it('returns true if the permission is granted and you own the task', () => {
    const ctx = createMockContext({
      state: { permissions: ['task:own:read'], client: user, task: { uid: user.id, ...task } }
    })
    expect(checkTaskOwnPermission(ctx, 'task:read')).toBe(true)
  })
})
