import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import urlToTaskFiltering from './url-to-task-filtering.ts'

describe('urlToTaskFiltering', () => {
  it('returns undefined when no fields are specified', () => {
    const url = new URL('http://localhost:8001/v1/tasks')
    expect(urlToTaskFiltering(url)).toBeUndefined()
  })

  it('can filter to only include completed tasks', () => {
    const url = new URL('http://localhost:8001/v1/tasks?filter[completed]=true')
    const actual = urlToTaskFiltering(url)
    expect(actual).toEqual('completed IS NOT NULL')
  })

  it('can filter to only include incomplete tasks', () => {
    const url = new URL('http://localhost:8001/v1/tasks?filter[completed]=false')
    const actual = urlToTaskFiltering(url)
    expect(actual).toEqual('completed IS NULL')
  })
})
