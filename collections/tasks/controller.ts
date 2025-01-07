import { Context, Status, createHttpError } from '@oak/oak'
import type Task from '../../types/task.ts'
import type TaskCreation from '../../types/task-creation.ts'
import type TaskPatch from '../../types/task-patch.ts'
import TaskRepository from './repository.ts'
import taskToTaskResponse from '../../utils/transformers/task-to-task-response.ts'
import tasksToTaskPageResponse from '../../utils/transformers/tasks-to-task-page-response.ts'
import urlToTaskFields from '../../utils/transformers/url-to-task-fields.ts'
import urlToTaskFiltering from '../../utils/transformers/url-to-task-filtering.ts'
import urlToTaskSorting from '../../utils/transformers/url-to-task-sorting.ts'
import getNumberFromQueryString from '../../utils/get-number-from-query-string.ts'
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

  static async list (ctx: Context, url?: URL) {
    const src = url ?? ctx.request.url
    const fields = urlToTaskFields(src)
    const limit = getNumberFromQueryString(src, 'limit')
    const offset = getNumberFromQueryString(src, 'offset')
    const sort = urlToTaskSorting(src)
    const filter = urlToTaskFiltering(src)

    const options: { limit?: number, offset?: number, filter?: string, sort?: string } = { sort, filter }
    if (limit) options.limit = limit
    if (offset) options.offset = offset

    const data = await TaskController.getRepository().listByUID(ctx.state.client.id, options)
    const res = tasksToTaskPageResponse(data.rows, data.total, offset ?? 0, limit, fields)
    sendJSON(ctx, res)
  }

  static async update (ctx: Context) {
    const body = await ctx.request.body.json() as TaskPatch
    const { name, notes, completed } = body.data.attributes
    const { task } = ctx.state

    if (name) task.name = name
    if (notes) task.notes = notes
    if (completed === true) task.completed = new Date()
    if (completed === false) task.completed = undefined
    if (name || notes || completed) task.updated = new Date()

    const saved = await TaskController.getRepository().save(task)
    if (saved) {
      const res = taskToTaskResponse(saved)
      sendJSON(ctx, res)
    } else {
      throw createHttpError(Status.InternalServerError)
    }
  }
}

export default TaskController
