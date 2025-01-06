import isObject from '../utils/guards/object.ts'
import isBooleanOrUndefined from '../utils/guards/boolean.ts'
import isStringOrUndefined from '../utils/guards/string.ts'

export default interface TaskPatch {
  data: {
    type: 'tasks'
    id: string
    attributes: {
      name?: string
      notes?: string
      completed?: boolean
    }
  }
}

// deno-lint-ignore no-explicit-any
const isTaskPatch = (candidate: any): candidate is TaskPatch => {
  if (!isObject(candidate)) return false
  const obj = candidate as Record<string, unknown>
  if (!obj.data) return false

  const data = obj.data as Record<string, unknown>
  if (Object.keys(data).join(',') !== 'type,id,attributes') return false
  if (data.type !== 'tasks') return false
  if (typeof data.id !== 'string') return false

  const attributes = data.attributes as Record<string, unknown>
  const strings = ['name', 'notes']
  const booleans = ['completed']
  const permitted = [...strings, ...booleans]
  const keys = Object.keys(attributes)
  if (!keys.every(key => permitted.includes(key))) return false
  if (!strings.every(key => isStringOrUndefined(attributes[key]))) return false
  return booleans.every(key => isBooleanOrUndefined(attributes[key]));

}

export { isTaskPatch }
