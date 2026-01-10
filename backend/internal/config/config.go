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
        BibleAPIBaseURL: os.Getenv("BIBLE_API_BASE_URL"),
        ServerAddress:   ":" + os.Getenv("PORT"),
    }, nil
}
