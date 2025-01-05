import type Task from '../../types/task.ts'
import type User from '../../types/user.ts'
import TaskRepository from '../../collections/tasks/repository.ts'
import setupUser from './setup-user.ts'

const setupTask = async (): Promise<{ user: User, jwt: string, task: Task }> => {
  const { user, jwt } = await setupUser({ createAccount: false })
  const repository = new TaskRepository()
  const task = await repository.save({
    uid: user.id,
    name: 'Pass all tests',
    notes: 'All tests must pass.'
  })
  return { user, jwt: jwt!, task: task! }
}

export default setupTask
