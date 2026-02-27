package main

import (
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "os"
    "strings"
)

// BibleVersion represents a Bible version from the API
type BibleVersion struct {
    ID           string `json:"id"`
    Name         string `json:"name"`
    Abbreviation string `json:"abbreviation"`
    Language     struct {
        ID   string `json:"id"`
        Name string `json:"name"`
    } `json:"language"`
    Description string `json:"description"`
}

// APIResponse represents the API response structure
type APIResponse struct {
    Data []BibleVersion `json:"data"`
}

func main() {
    apiKey := os.Getenv("BIBLE_API_KEY")
    if apiKey == "" {
        fmt.Println("Please set BIBLE_API_KEY environment variable")
        fmt.Println("You can get one from https://scripture.api.bible/")
        return
    }

    // Languages we're interested in
    targetLanguages := []string{
        "eng", // English
        "spa", // Spanish
        "fra", // French
        "hat", // Haitian Creole
    }

    fmt.Println("Fetching Bible versions from API.Bible...")
    fmt.Println("=" + strings.Repeat("=", 70))

    url := "https://rest.api.bible/v1/bibles"
    
    req, err := http.NewRequest("GET", url, nil)
    if err != nil {
        fmt.Printf("Error creating request: %v\n", err)
        return
    }

    req.Header.Set("api-key", apiKey)
    req.Header.Set("Accept", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Printf("Error making request: %v\n", err)
        return
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        fmt.Printf("API returned status: %d\n", resp.StatusCode)
        body, _ := io.ReadAll(resp.Body)
        fmt.Printf("Response: %s\n", string(body))
        return
    }

    var apiResp APIResponse
    if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
        fmt.Printf("Error decoding response: %v\n", err)
        return
    }

    // Group versions by language
    versionsByLang := make(map[string][]BibleVersion)
    for _, version := range apiResp.Data {
        langID := version.Language.ID
        for _, target := range targetLanguages {
            if strings.HasPrefix(langID, target) {
                versionsByLang[target] = append(versionsByLang[target], version)
            }
        }
    }

    // Display results
    languageNames := map[string]string{
        "eng": "ENGLISH",
        "spa": "SPANISH",
        "fra": "FRENCH",
        "hat": "HAITIAN CREOLE",
    }

    for _, lang := range targetLanguages {
        versions := versionsByLang[lang]
        fmt.Printf("\n%s VERSIONS (%d found):\n", languageNames[lang], len(versions))
        fmt.Println(strings.Repeat("-", 70))
        
        if len(versions) == 0 {
            fmt.Println("No versions found for this language")
            continue
        }

        for _, v := range versions {
            fmt.Printf("ID: %s\n", v.ID)
            fmt.Printf("Name: %s (%s)\n", v.Name, v.Abbreviation)
            fmt.Printf("Language: %s\n", v.Language.Name)
            if v.Description != "" {
                // Truncate long descriptions
                desc := v.Description
                if len(desc) > 100 {
                    desc = desc[:97] + "..."
                }
                fmt.Printf("Description: %s\n", desc)
            }
            fmt.Println()
        }
    }

    // Show what we're currently using
    fmt.Println("\n" + strings.Repeat("=", 70))
    fmt.Println("CURRENTLY CONFIGURED IN YOUR APP:")
    fmt.Println(strings.Repeat("-", 70))
    fmt.Println("English: de4e12af7f28f599-02 (King James Version)")
    fmt.Println("Spanish: 592420522e16049f-01 (Reina Valera 1909)")
    fmt.Println("French: f72b840c855f362c-04 (Louis Segond 1910)")
    fmt.Println("Haitian Creole: 179568874c45066f-01 (Haitian Creole Version)")
    fmt.Println("\nNote: These IDs may need to be verified/updated based on the above list")
}