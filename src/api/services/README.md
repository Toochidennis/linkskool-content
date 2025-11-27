# API Services

This directory contains service modules for different features of the application. Each service module encapsulates API calls related to a specific domain.

## Structure

Services should be organized by feature/domain:

```
services/
├── auth.service.ts        # Authentication-related API calls
├── user.service.ts        # User management API calls
├── course.service.ts      # Course-related API calls
├── program.service.ts     # Program-related API calls
├── news.service.ts        # News-related API calls
└── README.md
```

## Example Service File

```typescript
// userService.ts
import { get, post, put, deleteById } from '../methods'

const USER_ENDPOINT = '/users'

export const userService = {
  // Get all users
  getAllUsers: () => getAll(USER_ENDPOINT),

  // Get user by ID
  getUserById: (id: string) => getById(USER_ENDPOINT, id),

  // Create new user
  createUser: (userData: UserData) => create(USER_ENDPOINT, userData),

  // Update user
  updateUser: (id: string, userData: Partial<UserData>) => updateById(USER_ENDPOINT, id, userData),

  // Delete user
  deleteUser: (id: string) => deleteById(USER_ENDPOINT, id),
}
```

## Usage in Components

```typescript
import { userService } from '@/api/services'

// In component
const users = await userService.getAllUsers()
const user = await userService.getUserById('123')
const newUser = await userService.createUser({ name: 'John' })
```
