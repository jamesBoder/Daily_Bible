# Comments Feature Documentation

## Overview
The comments feature allows users to add personal notes/comments to Bible verses. Each user can have one comment per verse, which they can create, update, view, or delete.

## Backend Implementation

### Database Schema
**Table: `comments`**
- `id` (SERIAL PRIMARY KEY) - Unique identifier
- `user_id` (UUID) - Foreign key to users table
- `verse_id` (INTEGER) - Verse ID from Bible API
- `verse_reference` (VARCHAR) - Verse reference (e.g., "John 3:16")
- `comment_text` (TEXT) - The actual comment content (max 1000 chars)
- `created_at` (TIMESTAMP) - When comment was created
- `updated_at` (TIMESTAMP) - When comment was last updated
- `deleted_at` (TIMESTAMP) - Soft delete timestamp

**Indexes:**
- `idx_comments_user_id` - For querying user's comments
- `idx_comments_verse_reference` - For finding comments by verse
- `idx_comments_user_verse` - Composite index for user+verse lookups

### API Endpoints

All comment endpoints require authentication (JWT token in Authorization header).

#### 1. Add or Update Comment
**POST** `/api/comments`

**Request Body:**
```json
{
  "verse_id": 123,
  "verse_reference": "John 3:16",
  "comment_text": "This verse reminds me of God's love..."
}
```

**Response (200 OK):**
```json
{
  "comment": {
    "id": 1,
    "user_id": "uuid-here",
    "verse_id": 123,
    "verse_reference": "John 3:16",
    "comment_text": "This verse reminds me of God's love...",
    "created_at": "2024-01-17T00:00:00Z",
    "updated_at": "2024-01-17T00:00:00Z"
  }
}
```

**Notes:**
- If a comment already exists for this user+verse, it will be updated
- If no comment exists, a new one will be created
- Comment text is limited to 1000 characters

#### 2. Get Comment for Specific Verse
**GET** `/api/comments/verse/:reference`

**Example:** `/api/comments/verse/John 3:16`

**Response (200 OK):**
```json
{
  "comment": {
    "id": 1,
    "user_id": "uuid-here",
    "verse_id": 123,
    "verse_reference": "John 3:16",
    "comment_text": "This verse reminds me of God's love...",
    "created_at": "2024-01-17T00:00:00Z",
    "updated_at": "2024-01-17T00:00:00Z"
  }
}
```

**Response (404 Not Found):**
```json
{
  "error": "Comment not found"
}
```

#### 3. Delete Comment
**DELETE** `/api/comments/:id`

**Example:** `/api/comments/1`

**Response (200 OK):**
```json
{
  "message": "Comment deleted successfully"
}
```

**Response (500 Internal Server Error):**
```json
{
  "error": "Failed to delete comment"
}
```

**Notes:**
- Users can only delete their own comments
- This is a soft delete (sets deleted_at timestamp)

#### 4. Get All User Comments
**GET** `/api/comments/user`

**Response (200 OK):**
```json
{
  "comments": [
    {
      "id": 1,
      "user_id": "uuid-here",
      "verse_id": 123,
      "verse_reference": "John 3:16",
      "comment_text": "This verse reminds me of God's love...",
      "created_at": "2024-01-17T00:00:00Z",
      "updated_at": "2024-01-17T00:00:00Z"
    },
    {
      "id": 2,
      "user_id": "uuid-here",
      "verse_id": 456,
      "verse_reference": "Psalm 23:1",
      "comment_text": "The Lord is my shepherd...",
      "created_at": "2024-01-17T00:00:00Z",
      "updated_at": "2024-01-17T00:00:00Z"
    }
  ]
}
```

## Testing the API

### Prerequisites
1. Backend server running on `http://localhost:8080`
2. Valid JWT token (obtain by logging in)

### Test Scenarios

#### Scenario 1: Add a New Comment
```bash
curl -X POST http://localhost:8080/api/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verse_id": 123,
    "verse_reference": "John 3:16",
    "comment_text": "This verse is so powerful!"
  }'
```

#### Scenario 2: Update Existing Comment
```bash
# Same as adding - if comment exists for this verse, it will be updated
curl -X POST http://localhost:8080/api/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verse_id": 123,
    "verse_reference": "John 3:16",
    "comment_text": "Updated: This verse reminds me of God's unconditional love"
  }'
```

#### Scenario 3: Get Comment for Specific Verse
```bash
curl -X GET "http://localhost:8080/api/comments/verse/John%203:16" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Scenario 4: Get All User Comments
```bash
curl -X GET http://localhost:8080/api/comments/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Scenario 5: Delete a Comment
```bash
curl -X DELETE http://localhost:8080/api/comments/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Implementation Files

### Backend Files Created/Modified:
1. **`internal/models/comment.go`** - Comment model definition
2. **`internal/repository/comment_repo.go`** - Database operations for comments
3. **`internal/services/comment_service.go`** - Business logic for comments
4. **`internal/handlers/comments.go`** - HTTP handlers for comment endpoints
5. **`internal/routes/routes.go`** - Added comment routes (MODIFIED)
6. **`cmd/api/main.go`** - Initialized comment repository, service, and handler (MODIFIED)
7. **`internal/database/migrations/004_create_comments.sql`** - Database migration

## Error Handling

The API returns appropriate HTTP status codes:
- **200 OK** - Successful operation
- **400 Bad Request** - Invalid request body or parameters
- **401 Unauthorized** - Missing or invalid JWT token
- **404 Not Found** - Comment not found
- **500 Internal Server Error** - Server-side error

## Security Considerations

1. **Authentication Required** - All endpoints require valid JWT token
2. **User Isolation** - Users can only access/modify their own comments
3. **Input Validation** - Comment text limited to 1000 characters
4. **SQL Injection Protection** - Using GORM parameterized queries
5. **Soft Deletes** - Comments are soft-deleted, not permanently removed

## Future Enhancements

Potential improvements for the comments feature:
1. **Rich Text Support** - Allow formatting in comments
2. **Comment Tags** - Categorize comments (prayer, study, reflection, etc.)
3. **Comment Sharing** - Share comments with other users or groups
4. **Comment Search** - Search through user's comments
5. **Comment Export** - Export comments to PDF or other formats
6. **Comment Versioning** - Keep history of comment edits
7. **Comment Attachments** - Attach images or files to comments

## Database Migration

The migration file `004_create_comments.sql` will be automatically run when the backend starts. It creates:
- The `comments` table with all necessary columns
- Indexes for optimal query performance
- Foreign key constraint to users table
- Cascade delete when user is deleted

## Next Steps

To integrate this feature into the frontend:
1. Create comment service in `frontend/src/services/commentService.ts`
2. Add comment UI components to verse display pages
3. Add comment management page to view all user comments
4. Add comment indicators to favorites and history pages
5. Implement comment editing and deletion UI
