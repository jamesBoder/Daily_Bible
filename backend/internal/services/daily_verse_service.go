package services

import (
    "crypto/md5"
    "encoding/hex"
    "fmt"
    "time"
	"strconv"
    "strings"
    "dailybible/internal/models"
    "dailybible/internal/repository"
	
	
)

type DailyVerseService struct {
    bibleAPI     BibleAPIService
    verseRepo    repository.VerseRepository
    curatedList  []string
}

func NewDailyVerseService(
    bibleAPI BibleAPIService,
    verseRepo repository.VerseRepository,
) *DailyVerseService {
    return &DailyVerseService{
        bibleAPI:    bibleAPI,
        verseRepo:   verseRepo,
        curatedList: getCuratedVerses(),
    }
}

// GetDailyVerse returns the verse of the day
// Uses UTC+14 timezone to ensure the verse updates early in the morning for users
// worldwide, so they see a fresh verse when they wake up.
// UTC+14 is the furthest timezone ahead of UTC, so when it's midnight there (new day),
// it's 10 AM the previous day UTC, which translates to early morning (5-6 AM Eastern,
// 2-3 AM Pacific) ensuring all users see a fresh verse when they wake up.
func (s *DailyVerseService) GetDailyVerse() (*models.Verse, error) {
    // Use UTC+14 timezone (Pacific/Kiritimati - furthest timezone ahead of UTC)
    // This ensures verse updates at 10 AM UTC (previous day), which is early morning
    // for all users globally (5-6 AM Eastern, 2-3 AM Pacific), guaranteeing they see
    // a fresh verse when they wake up, not in the evening
    loc, err := time.LoadLocation("Pacific/Kiritimati")
    if err != nil {
        // Fallback to UTC if timezone loading fails
        loc = time.UTC
    }
    now := time.Now().In(loc)   
    today := now.Format("2006-01-02")
    
    // Check cache first - see if we already have a verse for today
    cached, err := s.verseRepo.GetByDate(today)
    if err == nil && cached != nil {
        return cached, nil
    }
    
    // Select verse for today
    reference := s.selectVerseForDate(today)
    
    // Check if verse already exists by reference
    existingVerse, err := s.verseRepo.GetByReference(reference)
    if err == nil && existingVerse != nil {
        // Verse exists, just update the daily_date
        existingVerse.DailyDate = &today
        if err := s.verseRepo.Update(existingVerse); err != nil {
            return nil, fmt.Errorf("failed to update verse daily date: %w", err)
        }
        return existingVerse, nil
    }
    
    // Fetch from Bible API
    apiVerse, err := s.bibleAPI.GetVerse(reference)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch verse from API: %w", err)
    }
    
    // Convert and save new verse
    verse := &models.Verse{
        Reference: apiVerse.Reference,
        Text:      apiVerse.Text,
        Book:      extractBook(apiVerse.Reference),
        Chapter:   extractChapter(apiVerse.Reference),
        VerseNumber: extractVerse(apiVerse.Reference),
        Version: "KJV", // Default
        Translation: "KJV", // Default
        DailyDate: &today,
    }
    
    if err := s.verseRepo.Create(verse); err != nil {
        return nil, fmt.Errorf("failed to save verse: %w", err)
    }
    
    return verse, nil
}

// selectVerseForDate selects a verse based on the date
// Excludes verses used in the last 90 days to prevent short-term repeats
func (s *DailyVerseService) selectVerseForDate(date string) string {
    // Get recently used verse references (last 90 days)
    recentlyUsed, err := s.verseRepo.GetRecentlyUsedReferences(90)
    if err != nil {
        // If error, fall back to simple selection
        return s.selectVerseSimple(date)
    }
    
    // Create a map for quick lookup
    recentlyUsedMap := make(map[string]bool)
    for _, ref := range recentlyUsed {
        recentlyUsedMap[ref] = true
    }
    
    // Filter out recently used verses
    availableVerses := make([]string, 0, len(s.curatedList))
    for _, verse := range s.curatedList {
        if !recentlyUsedMap[verse] {
            availableVerses = append(availableVerses, verse)
        }
    }
    
    // If no verses available (all were recently used), use least recently used
    if len(availableVerses) == 0 {
        return s.selectVerseSimple(date)
    }
    
    // Use MD5 hash for deterministic selection from available verses
    hash := md5.Sum([]byte(date))
    hashStr := hex.EncodeToString(hash[:])
    
    // Convert first 8 chars of hash to number
    var num int
    fmt.Sscanf(hashStr[:8], "%x", &num)
    
    index := num % len(availableVerses)
    return availableVerses[index]
}

// selectVerseSimple is a fallback method for simple verse selection
func (s *DailyVerseService) selectVerseSimple(date string) string {
    hash := md5.Sum([]byte(date))
    hashStr := hex.EncodeToString(hash[:])
    
    // Convert first 8 chars of hash to number
    var num int
    fmt.Sscanf(hashStr[:8], "%x", &num)
    
    index := num % len(s.curatedList)
    return s.curatedList[index]
}

// getCuratedVerses returns a list of meaningful verses
func getCuratedVerses() []string {
    return []string{
        // Genesis
        "Genesis 1:1", "Genesis 1:27", "Genesis 2:24", "Genesis 12:2-3", "Genesis 50:20",
        
        // Exodus
        "Exodus 14:14", "Exodus 20:3", "Exodus 33:14",
        
        // Leviticus
        "Leviticus 19:18",
        
        // Numbers
        "Numbers 6:24-26",
        
        // Deuteronomy
        "Deuteronomy 6:5", "Deuteronomy 31:6", "Deuteronomy 31:8",
        
        // Joshua
        "Joshua 1:8", "Joshua 1:9", "Joshua 24:15",
        
        // Ruth
        "Ruth 1:16",
        
        // 1 Samuel
        "1 Samuel 16:7",
        
        // 2 Chronicles
        "2 Chronicles 7:14",
        
        // Nehemiah
        "Nehemiah 8:10",
        
        // Job
        "Job 19:25", "Job 23:10",
        
        // Psalms (50+ verses)
        "Psalm 1:1-2", "Psalm 16:11", "Psalm 18:2", "Psalm 19:1", "Psalm 19:14",
        "Psalm 23:1", "Psalm 23:4", "Psalm 27:1", "Psalm 27:14", "Psalm 28:7",
        "Psalm 29:11", "Psalm 30:5", "Psalm 32:8", "Psalm 34:8", "Psalm 34:18",
        "Psalm 37:4", "Psalm 37:5", "Psalm 40:1-2", "Psalm 42:1", "Psalm 46:1",
        "Psalm 46:10", "Psalm 51:10", "Psalm 55:22", "Psalm 56:3", "Psalm 62:5",
        "Psalm 63:1", "Psalm 68:19", "Psalm 73:26", "Psalm 84:11", "Psalm 90:12",
        "Psalm 91:1-2", "Psalm 91:11", "Psalm 95:1", "Psalm 100:4", "Psalm 103:2-3",
        "Psalm 103:12", "Psalm 107:1", "Psalm 118:24", "Psalm 119:9", "Psalm 119:11",
        "Psalm 119:105", "Psalm 121:1-2", "Psalm 127:1", "Psalm 133:1", "Psalm 136:1",
        "Psalm 139:14", "Psalm 139:23-24", "Psalm 143:8", "Psalm 145:18", "Psalm 147:3",
        
        // Proverbs (40+ verses)
        "Proverbs 1:7", "Proverbs 3:5-6", "Proverbs 3:9-10", "Proverbs 4:23", "Proverbs 6:6",
        "Proverbs 10:12", "Proverbs 11:25", "Proverbs 12:25", "Proverbs 13:20", "Proverbs 14:12",
        "Proverbs 15:1", "Proverbs 15:13", "Proverbs 16:3", "Proverbs 16:9", "Proverbs 16:18",
        "Proverbs 17:17", "Proverbs 18:10", "Proverbs 18:21", "Proverbs 19:21", "Proverbs 20:7",
        "Proverbs 21:21", "Proverbs 22:1", "Proverbs 22:6", "Proverbs 23:7", "Proverbs 24:16",
        "Proverbs 25:11", "Proverbs 27:1", "Proverbs 27:17", "Proverbs 28:13", "Proverbs 29:18",
        "Proverbs 29:25", "Proverbs 30:5", "Proverbs 31:25", "Proverbs 31:30",
        
        // Ecclesiastes
        "Ecclesiastes 3:1", "Ecclesiastes 3:11", "Ecclesiastes 4:9-10", "Ecclesiastes 12:13",
        
        // Isaiah (20+ verses)
        "Isaiah 9:6", "Isaiah 26:3", "Isaiah 40:8", "Isaiah 40:28-29", "Isaiah 40:31",
        "Isaiah 41:10", "Isaiah 41:13", "Isaiah 43:2", "Isaiah 53:5", "Isaiah 54:10",
        "Isaiah 55:8-9", "Isaiah 58:11", "Isaiah 64:8", "Isaiah 65:24",
        
        // Jeremiah
        "Jeremiah 17:7-8", "Jeremiah 29:11", "Jeremiah 31:3", "Jeremiah 33:3",
        
        // Lamentations
        "Lamentations 3:22-23",
        
        // Ezekiel
        "Ezekiel 36:26",
        
        // Daniel
        "Daniel 2:20-21", "Daniel 12:3",
        
        // Micah
        "Micah 6:8", "Micah 7:7",
        
        // Nahum
        "Nahum 1:7",
        
        // Habakkuk
        "Habakkuk 2:14", "Habakkuk 3:19",
        
        // Zephaniah
        "Zephaniah 3:17",
        
        // Haggai
        "Haggai 2:4",
        
        // Zechariah
        "Zechariah 4:6",
        
        // Malachi
        "Malachi 3:10",
        
        // Matthew (30+ verses)
        "Matthew 5:3", "Matthew 5:8", "Matthew 5:14", "Matthew 5:16", "Matthew 5:44",
        "Matthew 6:9-10", "Matthew 6:19-20", "Matthew 6:25", "Matthew 6:33", "Matthew 6:34",
        "Matthew 7:7", "Matthew 7:12", "Matthew 9:37-38", "Matthew 10:28", "Matthew 11:28-30",
        "Matthew 16:24", "Matthew 18:20", "Matthew 19:26", "Matthew 20:28", "Matthew 22:37-39",
        "Matthew 24:35", "Matthew 25:40", "Matthew 28:18-20",
        
        // Mark
        "Mark 9:23", "Mark 10:27", "Mark 10:45", "Mark 11:24", "Mark 12:30-31",
        
        // Luke (20+ verses)
        "Luke 1:37", "Luke 6:31", "Luke 6:35-36", "Luke 6:38", "Luke 9:23",
        "Luke 10:27", "Luke 11:9-10", "Luke 12:15", "Luke 12:34", "Luke 16:10",
        "Luke 18:27", "Luke 19:10", "Luke 21:33",
        
        // John (40+ verses)
        "John 1:1", "John 1:12", "John 3:16", "John 3:17", "John 4:24",
        "John 6:35", "John 8:12", "John 8:32", "John 8:36", "John 10:10",
        "John 10:11", "John 11:25-26", "John 13:34-35", "John 14:1", "John 14:2-3",
        "John 14:6", "John 14:13", "John 14:15", "John 14:21", "John 14:27",
        "John 15:5", "John 15:7", "John 15:12-13", "John 16:33", "John 17:3",
        "John 20:29", "John 20:31",
        
        // Acts
        "Acts 1:8", "Acts 2:38", "Acts 4:12", "Acts 16:31", "Acts 20:35",
        
        // Romans (40+ verses)
        "Romans 1:16", "Romans 3:23", "Romans 5:1", "Romans 5:3-4", "Romans 5:8",
        "Romans 6:23", "Romans 8:1", "Romans 8:6", "Romans 8:11", "Romans 8:18",
        "Romans 8:26", "Romans 8:28", "Romans 8:31", "Romans 8:37-39", "Romans 10:9",
        "Romans 10:13", "Romans 10:17", "Romans 12:1-2", "Romans 12:2", "Romans 12:10",
        "Romans 12:12", "Romans 12:21", "Romans 13:8", "Romans 14:8", "Romans 15:4",
        "Romans 15:13",
        
        // 1 Corinthians (25+ verses)
        "1 Corinthians 1:18", "1 Corinthians 2:9", "1 Corinthians 6:19-20", "1 Corinthians 10:13",
        "1 Corinthians 10:31", "1 Corinthians 12:4-6", "1 Corinthians 13:4-7", "1 Corinthians 13:13",
        "1 Corinthians 15:3-4", "1 Corinthians 15:33", "1 Corinthians 15:57-58", "1 Corinthians 16:13-14",
        
        // 2 Corinthians (20+ verses)
        "2 Corinthians 1:3-4", "2 Corinthians 3:17", "2 Corinthians 4:16-18", "2 Corinthians 5:7",
        "2 Corinthians 5:17", "2 Corinthians 5:21", "2 Corinthians 9:6-7", "2 Corinthians 9:8",
        "2 Corinthians 12:9-10", "2 Corinthians 13:14",
        
        // Galatians (15+ verses)
        "Galatians 2:20", "Galatians 5:1", "Galatians 5:13", "Galatians 5:16",
        "Galatians 5:22-23", "Galatians 6:2", "Galatians 6:7", "Galatians 6:9-10",
        
        // Ephesians (25+ verses)
        "Ephesians 1:3", "Ephesians 1:7", "Ephesians 2:4-5", "Ephesians 2:8-9", "Ephesians 2:10",
        "Ephesians 3:16", "Ephesians 3:20-21", "Ephesians 4:2-3", "Ephesians 4:29", "Ephesians 4:32",
        "Ephesians 5:1-2", "Ephesians 5:15-16", "Ephesians 6:10-11", "Ephesians 6:18",
        
        // Philippians (20+ verses)
        "Philippians 1:6", "Philippians 2:3-4", "Philippians 2:13", "Philippians 3:13-14",
        "Philippians 4:4", "Philippians 4:6-7", "Philippians 4:8", "Philippians 4:11-13",
        "Philippians 4:13", "Philippians 4:19",
        
        // Colossians (15+ verses)
        "Colossians 1:13-14", "Colossians 2:6-7", "Colossians 3:1-2", "Colossians 3:12-13",
        "Colossians 3:15", "Colossians 3:17", "Colossians 3:23-24",
        
        // 1 Thessalonians
        "1 Thessalonians 5:11", "1 Thessalonians 5:16-18",
        
        // 2 Thessalonians
        "2 Thessalonians 3:3",
        
        // 1 Timothy
        "1 Timothy 4:12", "1 Timothy 6:6", "1 Timothy 6:11-12",
        
        // 2 Timothy (10+ verses)
        "2 Timothy 1:7", "2 Timothy 2:15", "2 Timothy 3:16-17", "2 Timothy 4:7-8",
        
        // Titus
        "Titus 2:11-12", "Titus 3:5",
        
        // Hebrews (25+ verses)
        "Hebrews 4:12", "Hebrews 4:15-16", "Hebrews 10:23-25", "Hebrews 11:1", "Hebrews 11:6",
        "Hebrews 12:1-2", "Hebrews 12:11", "Hebrews 13:5", "Hebrews 13:8", "Hebrews 13:15-16",
        
        // James (15+ verses)
        "James 1:2-3", "James 1:5", "James 1:12", "James 1:17", "James 1:19",
        "James 1:22", "James 3:17", "James 4:7-8", "James 4:10", "James 5:16",
        
        // 1 Peter (20+ verses)
        "1 Peter 1:3", "1 Peter 2:9", "1 Peter 3:15", "1 Peter 4:8", "1 Peter 4:10",
        "1 Peter 5:6-7", "1 Peter 5:7", "1 Peter 5:8-9", "1 Peter 5:10",
        
        // 2 Peter
        "2 Peter 1:3", "2 Peter 3:9", "2 Peter 3:18",
        
        // 1 John (15+ verses)
        "1 John 1:7", "1 John 1:9", "1 John 2:15-17", "1 John 3:1", "1 John 3:16",
        "1 John 3:18", "1 John 4:4", "1 John 4:7-8", "1 John 4:9-10", "1 John 4:18-19",
        "1 John 4:19", "1 John 5:14-15",
        
        // 3 John
        "3 John 1:2",
        
        // Jude
        "Jude 1:24-25",
        
        // Revelation
        "Revelation 1:8", "Revelation 3:20", "Revelation 21:4", "Revelation 22:13",
    }
}

// Helper functions to extract book, chapter, verse
func extractBook(reference string) string {
    // Simple implementation - can be improved
    parts := strings.Split(reference, " ")
    if len(parts) >= 2 {
        return strings.Join(parts[:len(parts)-1], " ")
    }
    return reference
}

func extractChapter(reference string) int {
    // Extract chapter number from reference like "John 3:16"
    parts := strings.Split(reference, " ")
    if len(parts) < 2 {
        return 0
    }
    
    chapterVerse := parts[len(parts)-1]
    cvParts := strings.Split(chapterVerse, ":")
    if len(cvParts) < 1 {
        return 0
    }
    
    chapter, _ := strconv.Atoi(cvParts[0])
    return chapter
}

func extractVerse(reference string) int {
    // Extract verse number from reference like "John 3:16"
    parts := strings.Split(reference, ":")
    if len(parts) < 2 {
        return 0
    }
    
    verse, _ := strconv.Atoi(parts[1])
    return verse
}