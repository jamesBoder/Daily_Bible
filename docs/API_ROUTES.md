# Words of Praise API Documentation


**Base URL:** `http://localhost:8080`

**Authentication:** Bearer token in Authorization header

**Request Body Format:** JSON

**Response Format:** JSON

**Possible Error Codes:**

**Curl Command Examples:** Provided for each endpoint


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

**Possible Error Codes:**
    - 400: Invalid email/password format
    - 401: Invalid credentials

**Example curl command:**

```bash

curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
        "email": "user@example.com",
        "password": "SecurePass123!"
      }'
```


### POST /api/auth/logout

**Method:** POST

**Description:** Logout from the user account

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response Format:** 

```json
{
  "message": "Successfully logged out"
}
```

**Possible Error Codes:**
    - 401: Unauthorized (invalid or missing token)

**Example curl command:**   

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer your-jwt-token-here"
```

### GET /api/auth/me

**Method:** GET

**Description:** Get the authenticated user's profile information

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response Format:** 

```json
{
  "id": "uuid-123",
  "email": "user@example.com",
  "username": "john_doe",
  "created_at": "2026-01-08T18:00:00Z"
}
```

**Possible Error Codes:**
    - 401: Unauthorized (invalid or missing token)

**Example curl command:**
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer your-jwt-token-here"
```

### GET /api/verses/daily

**Method:** GET

**Description:** Retrieve the daily Bible verse

**Authentication:** Not required (public endpoint)

**Request Body:** None

**Response Format:**

```json
{
    "verse": {
        "id": "verse-123",
        "text": "For God so loved the world...",
        "book": "John",
        "chapter": 3,
        "verse": 16,
        "reference": "John 3:16"
    },
    "date": "2026-01-08"
}
```

**Possible Error Codes:**
    - 500: Internal server error(Failed to fetch verse)

**Example curl command:**

```bash
curl -X GET http://localhost:8080/api/verses/daily
```

### GET /api/verses/:reference

**Method:** GET

**Description:** Retrieve a specific Bible verse by reference

**Authentication:** Not required (public endpoint)

**Request Body:** None

**Response Format:**

```json
{
    "verse": {
        "translation": "KJV",
        "id": "verse-123",
        "text": "For God so loved the world...",
        "book": "John",
        "chapter": 3,
        "verse": 16,
        "reference": "John 3:16"
    }
}
```

**Possible Error Codes:**
    - 400: Invalid reference format
    - 404: Verse not found

**Example curl command:**

```bash
curl -X GET http://localhost:8080/api/verses/John%203:16
``` 

### GET /api/verses/search

**Method:** GET

**Description:** Search for Bible verses containing specific keywords

**Authentication:** Not required (public endpoint)

**Query Parameters:**
    - q (string, required): Keywords to search for in verses
    - limit (integer, optional): Number of results to return (default: 10)
    - translation (string, optional): Bible translation to use (default: KJV)

**Response Format:**

```json
{
    "results": [
        {
            "text": "For God so loved the world...",
            "book": "John",
            "chapter": 3,
            "verse": 16,
            "reference": "John 3:16"
            "translation": "KJV"
        },
        ...
    ],
    "total_results": 25
    "limit": 10,
    "offset": 0
}
```

**Possible Error Codes:**
    - 400: Missing or invalid query parameter

**Example curl command:**

```bash
curl -X GET "http://localhost:8080/api/verses/search?q=love&limit=5&translation=NIV"
```

### GET /api/favorites

**Method:** GET

**Description:** Retrieve the authenticated user's favorite verses

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response Format:**

```json
{
  "favorites": [
    {
      "id": "fav-uuid-1",
      "verse": {
        "reference": "John 3:16",
        "text": "For God so loved the world...",
        "translation": "KJV"
      },
      "added_at": "2026-01-08T18:00:00Z"
    },
    {
      "id": "fav-uuid-2",
      "verse": {
        "reference": "Psalm 23:1",
        "text": "The Lord is my shepherd...",
        "translation": "KJV"
      },
      "added_at": "2026-01-07T12:00:00Z"
    }
  ],
  "count": 2
}
```

**Possible Error Codes:**
    - 401: Unauthorized (invalid or missing token)

**Example curl command:**

```bash
curl -X GET http://localhost:8080/api/favorites \
  -H "Authorization: Bearer your-jwt-token-here"
```

### POST /api/favorites

**Method:** POST

**Description:** Add a verse to the authenticated user's favorites

**Authentication:** Required (Bearer token)

**Request Body:** 

```json
{
  "reference": "John 3:16",
  "translation": "KJV"
}
```

**Response Format:** 

```json
{
  "message": "Verse added to favorites",
  "favorite": {
    "id": "fav-uuid-3",
    "verse": {
      "reference": "John 3:16",
      "text": "For God so loved the world...",
      "translation": "KJV"
    },
    "added_at": "2026-01-08T20:00:00Z"
  }
}
```

**Possible Error Codes:**
    - 400: Invalid reference format
    - 401: Unauthorized (invalid or missing token)
    - 404: Verse not found
    - 409: Verse already in favorites

**Example curl command:**

```bash
curl -X POST http://localhost:8080/api/favorites \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json" \
  -d '{
        "reference": "John 3:16",
        "translation": "KJV"
      }'
```

### DELETE /api/favorites/:id

**Method:** DELETE

**Description:** Remove a verse from the authenticated user's favorites

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response Format:** 

```json
{
  "message": "Verse removed from favorites"
}
```

**Possible Error Codes:**
    - 401: Unauthorized (invalid or missing token)
    - 404: Favorite not found

**Example curl command:**

```bash
curl -X DELETE http://localhost:8080/api/favorites/fav-uuid-3 \
  -H "Authorization: Bearer your-jwt-token-here"
```

### GET /api/history

**Method:** GET

**Description:** Retrieve the authenticated user's verse lookup history

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response Format:**

```json
{
  "history": [
    {
      "id": "hist-uuid-1",
      "verse": {
        "reference": "John 3:16",
        "text": "For God so loved the world...",
        "translation": "KJV"
      },
      "looked_up_at": "2026-01-08T18:00:00Z"
    },
    {
      "id": "hist-uuid-2",
      "verse": {
        "reference": "Psalm 23:1",
        "text": "The Lord is my shepherd...",
        "translation": "KJV"
      },
      "looked_up_at": "2026-01-07T12:00:00Z"
    }
  ],
  "count": 2
}
```

**Possible Error Codes:**
    - 401: Unauthorized (invalid or missing token)

**Example curl command:**

```bash
curl -X GET http://localhost:8080/api/history \
  -H "Authorization: Bearer your-jwt-token-here"
```


### DELETE /api/history/:id

**Method:** DELETE

**Description:** Clear the authenticated user's verse lookup history

**Authentication:** Required (Bearer token)

**Request Body:** None

**Response Format:** 

```json
{
  "message": "History cleared successfully"
}
```

**Possible Error Codes:**
    - 401: Unauthorized (invalid or missing token)

**Example curl command:**

```bash
curl -X DELETE http://localhost:8080/api/history \
  -H "Authorization: Bearer your-jwt-token-here"
```
