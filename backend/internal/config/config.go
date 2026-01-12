package config

import (
    "os"
    "github.com/joho/godotenv"
	
)

type Config struct {
    DBHost          string
    DBPort          string
    DBUser          string
    DBPassword      string
    DBName          string
    DBSSLMode      string
    Port             string
    JWTSecret        string
    BibleAPIKey      string
    BibleVersionID    string
    BibleAPIBaseURL  string
    ServerAddress   string

}

func Load() (*Config, error) {
    godotenv.Load()
    
    return &Config{
        DBHost:          os.Getenv("DB_HOST"),
        DBPort:          os.Getenv("DB_PORT"),
        DBUser:          os.Getenv("DB_USER"),
        DBPassword:      os.Getenv("DB_PASSWORD"),
        DBName:          os.Getenv("DB_NAME"),
        DBSSLMode:      os.Getenv("DB_SSLMODE"),
        Port:            os.Getenv("PORT"),
        JWTSecret:       os.Getenv("JWT_SECRET"),
        BibleAPIKey:     os.Getenv("BIBLE_API_KEY"),
        BibleVersionID:  getEnvOrDefault("BIBLE_VERSION_ID", "de4e12af7f28f599-02"),
        BibleAPIBaseURL: getEnvOrDefault("BIBLE_API_BASE_URL", "https://rest.api.bible/v1"),
        ServerAddress:   ":" + os.Getenv("PORT"),
    }, nil
}

func getEnvOrDefault(key, defaultValue string) string {
    value := os.Getenv(key)
    if value == "" {
        return defaultValue
    }
    return value
}
