package database

import (
    "gorm.io/gorm"
    "dailybible/internal/models"
)

func RunMigrations(db *gorm.DB) error {
    return db.AutoMigrate(
        &models.User{},
        &models.Verse{},
        &models.Favorite{},
        &models.History{},
    )
}
