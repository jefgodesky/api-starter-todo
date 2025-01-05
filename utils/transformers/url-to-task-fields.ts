import { Context } from '@oak/oak'
import { intersect } from '@std/collections'
import { type TaskAttributesKeys, taskAttributes } from '../../types/task-attributes.ts'

const urlToTaskFields = (input: Context | URL): readonly TaskAttributesKeys[] | undefined => {
  const url = (input as Context)?.request?.url ?? input
  const fields = url.searchParams.get('fields[tasks]')

  if (fields) {
    const requested = fields.split(',')
    return intersect(requested, taskAttributes) as readonly TaskAttributesKeys[]
  }

  return undefined
}

export default urlToTaskFields
