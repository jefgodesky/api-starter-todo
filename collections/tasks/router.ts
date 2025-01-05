import { Router } from '@oak/oak'
import TaskController from './controller.ts'
import getPrefix from '../../utils/get-prefix.ts'
import loadClient from '../../middlewares/load/client.ts'
import requireClient from '../../middlewares/require/client.ts'
import requireTaskCreationBody from '../../middlewares/require/body/task-creation.ts'
import requirePermissions from '../../middlewares/require/permissions.ts'

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

export default router
