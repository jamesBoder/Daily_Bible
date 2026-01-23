# History Unique Verses Fix

## Problem
The history page was showing duplicate entries for the same verse (e.g., multiple entries for "Philippians 4:13") instead of showing one entry per unique verse.

## Root Cause
The `AddToHistory` function in the backend was creating a new history entry every time a user viewed a verse, even if they had already viewed that verse before. This resulted in multiple entries for the same verse.

## Solution

### Backend Changes

#### 1. Updated History Repository (`backend/internal/repository/history_repo.go`)
Added two new methods to support "upsert" functionality:

```go
// FindByUserAndVerse finds an existing history entry for a user and verse
FindByUserAndVerse(userID, verseID uint) (*models.History, error)

// UpdateViewedAt updates the viewed_at timestamp for a history entry
UpdateViewedAt(historyID uint, viewedAt time.Time) error
```

#### 2. Updated History Service (`backend/internal/services/history_service.go`)
Modified `AddToHistory` to implement upsert logic:

**Before:**
- Always created a new history entry

**After:**
- Checks if the verse already exists in the user's history
- If exists: Updates the `viewed_at` timestamp to the current time
- If not exists: Creates a new history entry

This ensures each user has only ONE entry per unique verse, with the timestamp reflecting the most recent view.

### Database Cleanup

Created `cleanup_history_duplicates.sh` script to remove existing duplicate entries:
- Identifies duplicate entries (same user_id + verse_id)
- Keeps only the most recent view of each verse
- Soft-deletes older duplicates

## How It Works Now

### For New Views
1. User views a verse (e.g., Philippians 4:13)
2. Backend checks if this verse is already in the user's history
3. **If yes:** Updates the timestamp to now (no new entry created)
4. **If no:** Creates a new history entry

### Result
- Each unique verse appears only once in history
- The timestamp shows when the verse was last viewed
- History page displays a variety of different verses over time

## Files Modified

1. `backend/internal/repository/history_repo.go` - Added FindByUserAndVerse and UpdateViewedAt methods
2. `backend/internal/services/history_service.go` - Implemented upsert logic in AddToHistory
3. `cleanup_history_duplicates.sh` - Script to clean up existing duplicates

## Important Notes

⚠️ **Server Restart Required**: The code changes require a server restart to take effect. Until the server is restarted:
- New views will still create duplicates (old code is running)
- The cleanup script can remove existing duplicates
- After restart, new views will use the upsert logic

## Testing

After server restart, verify:
1. View the daily verse multiple times
2. Check history page - should show only ONE entry for that verse
3. The timestamp should update each time you view it
4. View different verses on different days
5. History should show a variety of unique verses

## Benefits

✅ **Cleaner History**: No duplicate entries cluttering the history page
✅ **Better UX**: Users see a variety of verses they've viewed over time
✅ **Accurate Tracking**: Timestamp shows the most recent view
✅ **Database Efficiency**: Fewer rows in the histories table
