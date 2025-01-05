import { Router } from '@oak/oak'
import TaskController from './controller.ts'
import getPrefix from '../../utils/get-prefix.ts'
import loadClient from '../../middlewares/load/client.ts'
import loadResource from '../../middlewares/load/resource.ts'
import requireClient from '../../middlewares/require/client.ts'
import requireTaskCreationBody from '../../middlewares/require/body/task-creation.ts'
import requirePermissions from '../../middlewares/require/permissions.ts'
import requireTask from '../../middlewares/require/resources/task.ts'

const router = new Router({
  prefix: getPrefix('tasks')
})

router.post('/',
  loadClient,
  requireClient,
  requireTaskCreationBody,
  requirePermissions('task:create'),
  async ctx => {
    await TaskController.create(ctx)
  })

router.get('/:taskId',
  loadClient,
  requireClient,
  loadResource,
  requireTask,
  requirePermissions('task:read'),
  ctx => {
    TaskController.get(ctx)
  })

export default router
