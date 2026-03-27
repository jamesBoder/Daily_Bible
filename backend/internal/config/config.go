package config

import (
    "os"
    "strconv"
    "github.com/joho/godotenv"
)

type Config struct {
    DBHost          string
    DBPort          string
    DBUser          string
    DBPassword      string
    DBName          string
    DBSSLMode       string
    // DBLogLevel controls GORM SQL verbosity.
    // "info"  — log every SQL statement (useful for debugging)
    // "warn"  — log only slow queries and warnings (default)
    // "error" — log only errors
    // "silent"— no DB logging
    DBLogLevel      string
    Port            string
    JWTSecret       string
    BibleAPIKey     string
    BibleVersionID  string
    BibleAPIBaseURL string
    ServerAddress   string

    // Email service
    ResendAPIKey string
    FromEmail    string
    FrontendURL  string

    // Web Push (VAPID)
    VAPIDPublicKey  string
    VAPIDPrivateKey string
    VAPIDSubscriber string // e.g. "mailto:admin@wordsofpraise.app"
    // Hour of day (UTC, 0-23) to dispatch daily verse push reminders.
    PushReminderHour int
}

func Load() (*Config, error) {
    // load .env from current directory (for dev mode)
    // If it doesn't exist, that's fine - Docker provides env vars directly
    _ = godotenv.Load()
    
    // Also try loading from parent directory (for when running from backend/)
    _ = godotenv.Load("../.env")
    
    return &Config{
        DBHost:          os.Getenv("DB_HOST"),
        DBPort:          os.Getenv("DB_PORT"),
        DBUser:          os.Getenv("DB_USER"),
        DBPassword:      os.Getenv("DB_PASSWORD"),
        DBName:          os.Getenv("DB_NAME"),
        DBSSLMode:      os.Getenv("DB_SSLMODE"),
        DBLogLevel:     getEnvOrDefault("DB_LOG_LEVEL", "warn"),
        Port:            getEnvOrDefault("PORT", "8888"),
        JWTSecret:       os.Getenv("JWT_SECRET"),
        BibleAPIKey:     os.Getenv("BIBLE_API_KEY"),
        BibleVersionID:  getEnvOrDefault("BIBLE_VERSION_ID", "de4e12af7f28f599-02"),
        BibleAPIBaseURL: getEnvOrDefault("BIBLE_API_BASE_URL", "https://rest.api.bible/v1"),
        ServerAddress:   "0.0.0.0:" + getEnvOrDefault("PORT", "8888"),
        ResendAPIKey:    os.Getenv("RESEND_API_KEY"),
        FromEmail:       getEnvOrDefault("FROM_EMAIL", "noreply@wordsofpraise.app"),
        FrontendURL:     getEnvOrDefault("FRONTEND_URL", "http://localhost:3000"),
        VAPIDPublicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
        VAPIDPrivateKey: os.Getenv("VAPID_PRIVATE_KEY"),
        VAPIDSubscriber: getEnvOrDefault("VAPID_SUBSCRIBER", "mailto:admin@wordsofpraise.app"),
        PushReminderHour: parsePushHour(getEnvOrDefault("PUSH_REMINDER_HOUR", "8")),
    }, nil
}

// parsePushHour parses the PUSH_REMINDER_HOUR env var, defaulting to 8.
func parsePushHour(s string) int {
    h, err := strconv.Atoi(s)
    if err != nil || h < 0 || h > 23 {
        return 8
    }
    return h
}

func getEnvOrDefault(key, defaultValue string) string {
    value := os.Getenv(key)
    if value == "" {
        return defaultValue
    }
    return value
}
