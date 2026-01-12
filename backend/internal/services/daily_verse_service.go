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
func (s *DailyVerseService) GetDailyVerse() (*models.Verse, error) {
    today := time.Now().Format("2006-01-02")
    
    // Check cache first
    cached, err := s.verseRepo.GetByDate(today)
    if err == nil && cached != nil {
        return cached, nil
    }
    
    // Select verse for today
    reference := s.selectVerseForDate(today)
    
    // Fetch from Bible API
    apiVerse, err := s.bibleAPI.GetVerse(reference)
    if err != nil {
        return nil, fmt.Errorf("failed to fetch verse: %w", err)
    }
    
    // Convert and save
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
func (s *DailyVerseService) selectVerseForDate(date string) string {
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
        "John 3:16",
        "Psalm 23:1",
        "Proverbs 3:5-6",
        "Romans 8:28",
        "Philippians 4:13",
        "Jeremiah 29:11",
        "Matthew 6:33",
        "Isaiah 41:10",
        "2 Timothy 1:7",
        "Joshua 1:9",
        "Psalm 46:1",
        "Romans 12:2",
        "1 Corinthians 13:4-7",
        "Galatians 5:22-23",
        "Ephesians 2:8-9",
        "Colossians 3:23",
        "Hebrews 11:1",
        "James 1:2-3",
        "1 Peter 5:7",
        "1 John 4:19",
        // Add more verses for variety
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