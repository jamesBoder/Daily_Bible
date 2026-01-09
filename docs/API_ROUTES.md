# API ROUTES DOCUMENTATION

- HTTP method
- Path
- Description
- Authentication required?
- Request body (if any)
- Response format
- Example curl command

### POST /api/auth/register

**Description:** Register a new user account

**Authentication:** Not required (public endpoint)

**Request Body:** 
`json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "john_doe"
}

`
**Response format:** 
`json
{
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "username": "john_doe",
    "created_at": "2026-01-08T18:00:00Z"
  },
  "token": "jwt-token-here"
}
`
**Errors:**
    - 400: Invalid email/password format
    - 409: Email already exists

### POST /api/auth/login

**Description:** login into a user account

**Authentication:** Not required (public endpoint)

**Request Body:** 
`json


`
**Response format:** 



