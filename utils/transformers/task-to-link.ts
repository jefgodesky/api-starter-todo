import type Task from '../../types/task.ts'
import getRoot from '../get-root.ts'

const taskToLink = (task: Task): string => {
  const endpoint = task.id ? `/tasks/${task.id}` : '/tasks'
  return getRoot() + endpoint
}

export default taskToLink
