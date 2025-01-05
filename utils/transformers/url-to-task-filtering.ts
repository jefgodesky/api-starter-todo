import { Context } from '@oak/oak'

const urlToTaskFiltering = (input: Context | URL): string | undefined => {
  const url = (input as Context)?.request?.url ?? input
  const param = url.searchParams.get('filter[completed]')

  switch (param) {
    case 'true':
      return 'completed IS NOT NULL'
    case 'false':
      return 'completed IS NULL'
    default:
      return undefined
  }
}

export default urlToTaskFiltering
