package config

import (
    "os"
    "github.com/joho/godotenv"
	
)

type Config struct {
    DatabaseURL      string
    Port             string
    JWTSecret        string
    BibleAPIKey      string
    BibleAPIBaseURL  string
}

func Load() (*Config, error) {
    godotenv.Load()
    
    return &Config{
        DatabaseURL:     os.Getenv("DATABASE_URL"),
        Port:            os.Getenv("PORT"),
        JWTSecret:       os.Getenv("JWT_SECRET"),
        BibleAPIKey:     os.Getenv("BIBLE_API_KEY"),
        BibleAPIBaseURL: os.Getenv("BIBLE_API_BASE_URL"),
    }, nil
}
