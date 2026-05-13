package main

// test register endpoint

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

// test register a new user
func main() {

	url := "http://localhost:8080/api/auth/register"

	// create request body
	reqBody := map[string]string{
		"email":    "james@example.com",
		"username": "jamesboder99",
		"password": "Secure$password123",
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		fmt.Println("Error marshalling JSON:", err)
		return
	}

	// send POST request
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Println("Error making POST request:", err)
		return
	}
	defer resp.Body.Close()

	// print response status
	fmt.Println("Response Status:", resp.Status)

	// parse response body
	var respBody map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&respBody); err != nil {
		fmt.Println("Error decoding response body:", err)
		return
	}

	// print response body
	fmt.Println("Response Body:", respBody)

}
