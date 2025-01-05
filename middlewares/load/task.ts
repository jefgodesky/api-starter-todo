import { Middleware } from '@oak/oak'
import TaskRepository from '../../collections/tasks/repository.ts'

const loadTask: Middleware = async (ctx, next) => {
  const tasks = new TaskRepository()
  ctx.state.task = await tasks.get(ctx.state.params.taskId)
  await next()
}

export default loadTask
