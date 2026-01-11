package main

// test login functionality

import (
	"fmt"
	"log"
	"net/http"
	"bytes"
	"encoding/json"
	"io/ioutil"
)

// init LoginRequest struct
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// init LoginResponse struct
type LoginResponse struct {
	User  UserResponse `json:"user"`
	Token string       `json:"token"`
}

// create user response struct
type UserResponse struct {
	ID       uint   `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	CreatedAt string `json:"created_at"`
}

func main() {
	// create login request
	loginReq := LoginRequest{
		Email:    "james@example.com",
		Password: "Secure$password123",
	}

	// marshal login request to JSON
	jsonData, err := json.Marshal(loginReq)
	if err != nil {
		log.Fatalf("Error marshalling login request: %v", err)
	}

	// send POST request to login endpoint
	resp, err := http.Post("http://localhost:8080/api/auth/login", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error making POST request: %v", err)
	}
	defer resp.Body.Close()

	// read response body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error reading response body: %v", err)
	}

	// print response status
	fmt.Println("Response Status:", resp.Status)

	// parse response body
	var loginResp LoginResponse
	if err := json.Unmarshal(body, &loginResp); err != nil {
		log.Fatalf("Error unmarshalling response body: %v", err)
	}

	// print response body
	fmt.Printf("Response Body: %+v\n", loginResp)

	
}