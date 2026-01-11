package main

// test password hashing and validation
import (
	"fmt"
	"log"

	"dailybible/internal/models"
	"dailybible/internal/password"

)

func main() {
	// test hash a plain text password, verify hash is not empty, verify hash is different from plain text, Verify hash length is correct (60 chars for bcrypt)
	plainPassword := "StrongP@ssw0rd!"

	// Validate password strength
	valid, err := password.ValidatePasswordStrength(plainPassword)
	if !valid {
		log.Fatalf("Password validation failed: %v", err)
	}
	fmt.Println("Password validation passed")

	// Hash password
	hashedPassword, err := password.HashPassword(plainPassword)
	if err != nil {
		log.Fatalf("Error hashing password: %v", err)
	}
	if hashedPassword == "" {
		log.Fatal("Hashed password is empty")
	}
	if hashedPassword == plainPassword {
		log.Fatal("Hashed password should not match plain text password")
	}
	fmt.Println("Password hashing passed")

	// Create user and set password
	user := &models.User{
		Email:    "jamesboder@example.com",
		Username: "jamesboder",
		Password: plainPassword,
	}
	err = user.SetPassword(plainPassword)
	if err != nil {
		log.Fatalf("Error setting user password: %v", err)
	}
	fmt.Println("User password set successfully")

	// Check password
	if !user.CheckPassword(plainPassword) {
		log.Fatal("Password check failed")
	}
	fmt.Println("Password check passed")
	
	// test too short password
	shortPassword := "Shrt1!"
	valid, err = password.ValidatePasswordStrength(shortPassword)
	if valid {
		log.Fatal("Short password validation should fail")
	}
	fmt.Println("Short password validation correctly failed:", err)

	// test password missing special character
	noSpecialCharPassword := "StrongPass1"
	valid, err = password.ValidatePasswordStrength(noSpecialCharPassword)
	if valid {
		log.Fatal("Password missing special character validation should fail")
	}
	fmt.Println("Password missing special character validation correctly failed:", err)

	// test password missing digit
	noDigitPassword := "StrongP@ssword"
	valid, err = password.ValidatePasswordStrength(noDigitPassword)
	if valid {
		log.Fatal("Password missing digit validation should fail")
	}
	fmt.Println("Password missing digit validation correctly failed:", err)

	// test password missing uppercase letter
	noUppercasePassword := "strongp@ssw0rd"
	valid, err = password.ValidatePasswordStrength(noUppercasePassword)
	if valid {
		log.Fatal("Password missing uppercase letter validation should fail")
	}
	fmt.Println("Password missing uppercase letter validation correctly failed:", err)

	// test password missing lowercase letter
	noLowercasePassword := "STRONGP@SSW0RD"
	valid, err = password.ValidatePasswordStrength(noLowercasePassword)
	if valid {
		log.Fatal("Password missing lowercase letter validation should fail")
	}
	fmt.Println("Password missing lowercase letter validation correctly failed:", err)

	// empty password test
	emptyPassword := ""
	valid, err = password.ValidatePasswordStrength(emptyPassword)
	if valid {
		log.Fatal("Empty password validation should fail")
	}
	fmt.Println("Empty password validation correctly failed:", err)


	// test case sensitivity
	wrongCasePassword := "strongp@ssw0rd!"
	if user.CheckPassword(wrongCasePassword) {
		log.Fatal("Password check should be case sensitive and fail")
	}
	fmt.Println("Password case sensitivity check passed")

	// verify bcrypt hash length
	if len(hashedPassword) != 60 {
		log.Fatalf("Bcrypt hashed password length should be 60, got %d", len(hashedPassword))
	}
	fmt.Println("Bcrypt hash length check passed")

	// tests same password produces different hashes
	anotherHashedPassword, err := password.HashPassword(plainPassword)
	if err != nil {
		log.Fatalf("Error hashing password again: %v", err)
	}
	if hashedPassword == anotherHashedPassword {
		log.Fatal("Hashing the same password should produce different hashes due to salting")
	}
	fmt.Println("Different hashes for same password check passed")

	// hash format validation
	if len(hashedPassword) < 4 || hashedPassword[0:4] != "$2a$" {
		log.Fatal("Bcrypt hashed password should start with $2a$")
	}
	fmt.Println("Bcrypt hash format check passed")

	// test BeforeCreate hook
	newUser := &models.User{
		Email:    "jamesboder@example.com",
		Username: "jamesboder",
		Password: plainPassword,
	}
	err = newUser.BeforeCreate(nil)
	if err != nil {
		log.Fatalf("Error in BeforeCreate hook: %v", err)
	}
	if !newUser.CheckPassword(plainPassword) {
		log.Fatal("BeforeCreate hook did not hash password correctly")
	}
	fmt.Println("BeforeCreate hook password hashing check passed")

	// Test BeforeUpdate hook (if implemented)
	updatedUser := &models.User{
		Email:    "james@example.com",
		Username: "james",
		Password: plainPassword,
	}
	err = updatedUser.BeforeUpdate(nil)
	if err != nil {
		log.Fatalf("Error in BeforeUpdate hook: %v", err)
	}
	if !updatedUser.CheckPassword(plainPassword) {
		log.Fatal("BeforeUpdate hook did not hash password correctly")
	}
	fmt.Println("BeforeUpdate hook password hashing check passed")

	fmt.Println("\n🎉 All password service tests passed!")


}