# API ROUTES DOCUMENTATION

- HTTP method
- Path
- Description
- Authentication required?
- Request body (if any)
- Response format
- Possible error codes
- Example curl command

### POST /api/auth/register

**Method:** POST

**Description:** Register a new user account

**Authentication:** Not required (public endpoint)

**Request Body:** 

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "username": "john_doe"
}

```

**Response Format:** 

```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "username": "john_doe",
    "created_at": "2026-01-08T18:00:00Z"
  },
  "token": "jwt-token-here"
}
```

**Possible Error Codes:**
    - 400: Invalid email/password format
    - 409: Email already exists

**Example curl command:**

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
        "email": "test@example.com",
        "password": "SecurePass123!",
        "username": "john_doe"
      }'
```

### POST /api/auth/login

**Method:** POST

**Description:** login into a user account

**Authentication:** Not required (public endpoint)

**Request Body:** 

```json
{
    "email": "user@example.com",
    "password": "SecurePass123!"
}
```

**Response format:** 

```json
{
    "user": {
        "id": "uuid-123",
        "email": "user@example.com",
        "username": "john_doe",
        "created_at": "2026-01-08T18:00:00Z"
    },
    "token": "jwt-token-here"
}
```


