import { Middleware, Status } from '@oak/oak'
import { createHttpError } from 'jsr:@oak/commons@1/http_errors'
import { isTaskCreation } from '../../../types/task-creation.ts'
import getMessage from '../../../utils/get-message.ts'

const requireTaskCreationBody: Middleware = async (ctx, next) => {
  const body = await ctx.request.body.json()
  if (!isTaskCreation(body)) throw createHttpError(Status.BadRequest, getMessage('invalid_task_creation'))
  await next()
}

export default requireTaskCreationBody
