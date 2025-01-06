import type Task from '../../types/task.ts'
import DB from '../../DB.ts'
import Repository from '../base/repository.ts'

export default class TaskRepository extends Repository<Task> {
  constructor () {
    super('tasks')
  }

  async listByUID (
    uid: string,
    {
      limit = undefined,
      offset = undefined,
      filter = undefined,
      sort = undefined,
    }: {
      limit?: number,
      offset?: number,
      filter?: string,
      sort?: string
    } = {}
  ): Promise<{ total: number, rows: Task[] }> {
    const where = filter === undefined ? 'uid = $1' : `uid = $1 AND ${filter}`
    return await DB.list<Task>('tasks', { offset, limit, where, sort, params: [uid] })
  }
}
