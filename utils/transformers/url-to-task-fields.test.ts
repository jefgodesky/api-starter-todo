import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import urlToTaskFields from './url-to-task-fields.ts'

describe('urlToTaskFields', () => {
  it('returns undefined when no fields are specified', () => {
    const url = new URL('http://localhost:8001/v1/tasks')
    expect(urlToTaskFields(url)).toBeUndefined()
  })

  it('returns the fields specified', () => {
    const scenarios = [
      ['name', ['name']],
      ['notes', ['notes']],
      ['name,notes', ['name', 'notes']],
      ['name,created', ['name', 'created']],
      ['name,notes,created', ['name', 'notes', 'created']],
      ['name,notes,created,updated', ['name', 'notes', 'created', 'updated']],
      ['name,completed', ['name', 'completed']]
    ]

    for (const [q, arr] of scenarios) {
      const url = new URL(`https://example.com/v1/tasks?this=1&fields[tasks]=${q}&that=2`)
      const actual = urlToTaskFields(url)
      expect(actual).toEqual(arr)
    }
  })
})
