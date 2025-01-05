import type Task from '../../types/task.ts'
import Repository from '../base/repository.ts'

export default class TaskRepository extends Repository<Task> {
  constructor () {
    super('tasks')
  }
}
