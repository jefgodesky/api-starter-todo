import { Context, Status, createHttpError } from '@oak/oak'
import type Task from '../../types/task.ts'
import type TaskCreation from '../../types/task-creation.ts'
import TaskRepository from './repository.ts'
import taskToTaskResponse from '../../utils/transformers/task-to-task-response.ts'
import urlToTaskFields from '../../utils/transformers/url-to-task-fields.ts'
import sendJSON from '../../utils/send-json.ts'

class TaskController {
  private static repository: TaskRepository

  constructor () {
    TaskController.getRepository()
  }

  static getRepository (): TaskRepository {
    if (!TaskController.repository) TaskController.repository = new TaskRepository()
    return TaskController.repository
  }

  static async create (ctx: Context) {
    const uid = ctx.state.client.id
    const body = await ctx.request.body.json() as TaskCreation
    const orig: Task = { uid, ...body.data.attributes }
    const task = await TaskController.getRepository().save(orig)
    if (!task) throw createHttpError(Status.InternalServerError)
    sendJSON(ctx, taskToTaskResponse(task))
  }

  static get (ctx: Context, url?: URL) {
    const fieldSrc = url ?? ctx
    const fields = urlToTaskFields(fieldSrc)
    const res = taskToTaskResponse(ctx.state.task, fields)
    sendJSON(ctx, res)
  }
}

export default TaskController
