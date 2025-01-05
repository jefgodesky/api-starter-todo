import { describe, beforeEach, afterEach, afterAll, it } from 'jsr:@std/testing/bdd'
import { expect } from 'jsr:@std/expect'
import { validateJWT } from '@cross/jwt'
import type AuthToken from '../../types/auth-token.ts'
import type User from '../../types/user.ts'
import DB from '../../DB.ts'
import getJWTSecret from '../get-jwt-secret.ts'
import setupUser from '../testing/setup-user.ts'
import expectAuthTokenJWT from '../testing/expect-auth-token-jwt.ts'
import authTokenToJWT from './auth-token-to-jwt.ts'

describe('authTokenToJWT', () => {
  let user: User
  let token: AuthToken | null

  beforeEach(async () => {
    const data = await setupUser()
    user = data.user
    token = data.token ?? null
  })

  afterEach(async () => {
    await DB.clear()
  })

  afterAll(async () => {
    await DB.close()
  })

  it('returns a JWT', async () => {
    const actual = await authTokenToJWT(token!)

    try {
      const payload = await validateJWT(actual, getJWTSecret())
      expectAuthTokenJWT(payload, user)
    } catch (err) {
      expect(err).not.toBeDefined()
    }
  })
})