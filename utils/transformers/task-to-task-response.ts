import type Task from '../../types/task.ts'
import type Response from '../../types/response.ts'
import { type TaskAttributesKeys, taskAttributes } from '../../types/task-attributes.ts'
import getJSONAPI from '../get-jsonapi.ts'
import getRoot from '../get-root.ts'
import taskToLink from './task-to-link.ts'
import taskToTaskResource from './task-to-task-resource.ts'

const taskToTaskResponse = (task: Task, fields: readonly TaskAttributesKeys[] = taskAttributes): Response => {
  return {
    jsonapi: getJSONAPI(),
    links: {
      self: taskToLink(task),
      describedBy: getRoot() + '/docs'
    },
    data: taskToTaskResource(task, fields)
  }
}

export default taskToTaskResponse
