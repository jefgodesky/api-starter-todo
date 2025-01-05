import type Model from './model.ts'
import isObject from '../utils/guards/object.ts'
import isDateOrUndefined from '../utils/guards/date.ts'
import isStringOrUndefined from '../utils/guards/string.ts'

export default interface Task extends Model {
  uid?: string
  name: string
  notes?: string
  created?: Date
  updated?: Date
  completed?: Date
}

const isTask = (candidate: unknown): candidate is Task => {
  if (!isObject(candidate)) return false

  const obj = candidate as Record<string, unknown>
  if (typeof obj.name !== 'string') return false

  const strings = ['id', 'uid', 'name', 'notes']
  const dates = ['created', 'updated', 'completed']
  const permitted = [...strings, ...dates]
  if (!Object.keys(obj).every(key => permitted.includes(key))) return false

  const allStrings = strings.every(key => isStringOrUndefined(obj[key]))
  const allDates = dates.every(key => isDateOrUndefined(obj[key]))
  return allStrings && allDates
}

export { isTask }
