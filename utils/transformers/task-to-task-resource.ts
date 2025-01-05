import type Task from '../../types/task.ts'
import type TaskResource from '../../types/task-resource.ts'
import { type TaskAttributesKeys, taskAttributes } from '../../types/task-attributes.ts'
import taskToTaskAttributes from './task-to-task-attributes.ts'

const taskToTaskResource = (task: Task, fields: readonly TaskAttributesKeys[] = taskAttributes): TaskResource => {
  return {
    type: 'tasks',
    id: task.id ?? 'ERROR',
    attributes: taskToTaskAttributes(task, fields)
  }
}

export default taskToTaskResource
