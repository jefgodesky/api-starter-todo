import { Middleware, Status } from '@oak/oak'
import { createHttpError } from 'jsr:@oak/commons@1/http_errors'
import { isTaskPatch } from '../../../types/task-patch.ts'
import getMessage from '../../../utils/get-message.ts'

const requireTaskPatchBody: Middleware = async (ctx, next) => {
  const body = await ctx.request.body.json()
  if (!isTaskPatch(body)) throw createHttpError(Status.BadRequest, getMessage('invalid_task_patch'))
  await next()
}

export default requireTaskPatchBody
