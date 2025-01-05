import { intersect } from '@std/collections'
import type Task from '../../types/task.ts'
import TaskAttributes, {
  taskAttributes,
  type TaskAttributesKeys
} from '../../types/task-attributes.ts'

const taskToTaskAttributes = (task: Task, fields: readonly TaskAttributesKeys[] = taskAttributes): TaskAttributes => {
  fields = intersect(fields, taskAttributes)
  const attributes: TaskAttributes = {}
  for (const field of fields) {
    const val = task[field] as (string & Date) | undefined
    if (val) attributes[field] = val
  }
  return attributes
}

export default taskToTaskAttributes
