import { describe, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import urlToTaskSorting from './url-to-task-sorting.ts'

describe('urlToTaskSorting', () => {
  it('returns undefined when no fields are specified', () => {
    const url = new URL('http://localhost:8001/v1/tasks')
    expect(urlToTaskSorting(url)).toBeUndefined()
  })

  it('returns the sorting options specified', () => {
    const scenarios = [
      ['name', 'name ASC'],
      ['-name', 'name DESC'],
      ['created', 'created ASC'],
      ['-created', 'created DESC'],
      ['updated', 'updated ASC'],
      ['-updated', 'updated DESC'],
      ['completed', 'completed ASC'],
      ['-completed', 'completed DESC'],
      ['name,-completed,-created', 'name ASC, completed DESC, created DESC'],
      ['name,other', 'name ASC'],
    ]

    for (const [q, order] of scenarios) {
      const url = new URL(`https://example.com/v1/users?this=1&sort=${q}&that=2`)
      const actual = urlToTaskSorting(url)
      expect(actual).toEqual(order)
    }
  })
})
