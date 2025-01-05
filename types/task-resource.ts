import type BaseResource from './base-resource.ts'
import TaskAttributes from './task-attributes.ts'

export default interface TaskResource extends BaseResource {
  attributes: TaskAttributes
}
