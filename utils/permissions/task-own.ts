import { Context } from '@oak/oak'
import checkExplicitPermission from './explicit.ts'

const checkTaskOwnPermission = (ctx: Context, permission: string): boolean => {
  const { client, task } = ctx.state
  if (!client?.id || !task?.uid) return false
  const ownVersion = permission.replace('task:', 'task:own:')
  return client.id === task.uid && checkExplicitPermission(ctx, ownVersion)
}

export default checkTaskOwnPermission
