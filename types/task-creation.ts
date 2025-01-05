import isObject from '../utils/guards/object.ts'
import isStringOrUndefined from '../utils/guards/string.ts'

export default interface TaskCreation {
  data: {
    type: 'tasks'
    attributes: {
      name: string
      notes?: string
    }
  }
}

// deno-lint-ignore no-explicit-any
const isTaskCreation = (candidate: any): candidate is TaskCreation => {
  if (!isObject(candidate)) return false
  const obj = candidate as Record<string, unknown>
  if (!obj.data) return false

  const data = obj.data as Record<string, unknown>
  if (Object.keys(data).join(',') !== 'type,attributes') return false
  if (data.type !== 'tasks') return false

  const attributes = data.attributes as Record<string, unknown>
  const strings = ['name', 'notes']
  const keys = Object.keys(attributes)
  if (!keys.every(key => strings.includes(key))) return false
  if (!strings.every(key => isStringOrUndefined(attributes[key]))) return false
  return attributes.name !== undefined
}

export { isTaskCreation }
