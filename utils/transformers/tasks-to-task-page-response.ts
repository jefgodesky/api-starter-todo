import type Response from '../../types/response.ts'
import type Task from '../../types/task.ts'
import { type TaskAttributesKeys, taskAttributes } from '../../types/task-attributes.ts'
import getEnvNumber from '../get-env-number.ts'
import getRoot from '../get-root.ts'
import getJSONAPI from '../get-jsonapi.ts'
import addPaginationLinks from '../add-pagination-links.ts'
import taskToTaskResource from './task-to-task-resource.ts'

const tasksToTaskPageResponse = (
  tasks: Task[],
  total: number,
  offset: number,
  limit: number = getEnvNumber('DEFAULT_PAGE_SIZE', 10),
  fields: readonly TaskAttributesKeys[] = taskAttributes
): Response => {
  const self = getRoot() + '/tasks'
  const links = addPaginationLinks({ self }, self, total, offset, limit)
  const data = tasks.map(task => taskToTaskResource(task, fields))
  return {
    jsonapi: getJSONAPI(),
    links,
    data
  }
}

export default tasksToTaskPageResponse
