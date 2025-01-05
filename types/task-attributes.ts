import isObject from '../utils/guards/object.ts'
import isDateOrUndefined from '../utils/guards/date.ts'
import isStringOrUndefined from '../utils/guards/string.ts'

export default interface TaskAttributes {
  name?: string
  notes?: string
  created?: Date
  updated?: Date
  completed?: Date
}

const taskAttributes = ['name', 'notes', 'created', 'updated', 'completed'] as const
type TaskAttributesKeys = (typeof taskAttributes)[number]

const isTaskAttributes = (candidate: any): candidate is TaskAttributes => {
  if (!isObject(candidate)) return false
  const obj = candidate as Record<string, unknown>

  const strings = ['name', 'notes']
  const dates = ['created', 'updated', 'completed']
  const permitted = [...strings, ...dates]
  if (!Object.keys(obj).every(key => permitted.includes(key))) return false

  const allStrings = strings.every(key => isStringOrUndefined(obj[key]))
  const allDates = dates.every(key => isDateOrUndefined(obj[key]))
  return allStrings && allDates
}

export {
  isTaskAttributes,
  taskAttributes,
  type TaskAttributesKeys
}
