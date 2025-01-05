import type AuthTokenResource from './auth-token-resource.ts'
import type ProviderResource from './provider-resource.ts'
import type TaskResource from './task-resource.ts'
import type UserResource from './user-resource.ts'

type Resource =
  AuthTokenResource |
  ProviderResource |
  TaskResource |
  UserResource

export default Resource
