package database

import (
	"fmt"
	"time"

	"dailybible/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func resolveLogLevel(level string) logger.LogLevel {
	switch level {
	case "info":
		return logger.Info
	case "error":
		return logger.Error
	case "silent":
		return logger.Silent
	default: // "warn" and anything unrecognised
		return logger.Warn
	}
}

func Connect(config *config.Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s connect_timeout=5",
		config.DBHost, config.DBPort, config.DBUser,
		config.DBPassword, config.DBName, config.DBSSLMode)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(resolveLogLevel(config.DBLogLevel)),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
		PrepareStmt: true,
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)
	sqlDB.SetConnMaxIdleTime(2 * time.Minute)

	return db, nil
}
