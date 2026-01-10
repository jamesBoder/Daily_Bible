package database

import (
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
)

dsn := "host=localhost user=dailybible_user password=test123 dbname=daily_bible_dev port=5432 sslmode=disable"

func Connect(databaseURL string) (*gorm.DB, error) {
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
        // logger : logger.Default.LogMode(logger.Info),
        logger : logger.Default.LogMode(logger.Info),
        NowFunc: func() time.Time {
        return time.Now().UTC()  // Use UTC timestamps
        },
        PrepareStmt: true,  // Cache prepared statements
    })
    
    if err != nil {
        return nil, err
    }

    
    // Configure connection pool
    sqlDB, err := db.DB()
    sqlDB.SetMaxIdleConns(10)
    sqlDB.SetMaxOpenConns(100)
    sqlDB.SetConnMaxLifetime(time.Hour)
    
    return db, nil
}
