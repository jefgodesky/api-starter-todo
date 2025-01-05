import { Middleware, Status } from '@oak/oak'
import { createHttpError } from 'jsr:@oak/commons@1/http_errors'
import getMessage from '../../../utils/get-message.ts'

const requireTask: Middleware = async (ctx, next) => {
  if (!ctx.state.task) throw createHttpError(Status.NotFound, getMessage('task_not_found'))
  await next()
}

export default requireTask
