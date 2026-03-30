// vapid generates a new VAPID key pair for Web Push and prints them to stdout.
//
// Usage:
//
//	cd backend && go run ./cmd/vapid
//
// Copy the output into your environment (fly secrets, .env, etc.):
//
//	VAPID_PUBLIC_KEY=<public key>
//	VAPID_PRIVATE_KEY=<private key>
//	VAPID_SUBSCRIBER=mailto:admin@wordsofpraise.app
//
// IMPORTANT: generate once and keep the private key secret. Changing the
// public key invalidates all existing push subscriptions (users will need
// to re-enable push notifications from Settings).
package main

import (
	"fmt"
	"log"

	webpush "github.com/SherClockHolmes/webpush-go"
)

func main() {
	priv, pub, err := webpush.GenerateVAPIDKeys()
	if err != nil {
		log.Fatalf("failed to generate VAPID keys: %v", err)
	}

	fmt.Println("# Copy these into your environment secrets:")
	fmt.Printf("VAPID_PUBLIC_KEY=%s\n", pub)
	fmt.Printf("VAPID_PRIVATE_KEY=%s\n", priv)
	fmt.Println("VAPID_SUBSCRIBER=mailto:admin@wordsofpraise.app")
	fmt.Println()
	fmt.Println("# Optional: change the reminder hour (UTC, default 8)")
	fmt.Println("PUSH_REMINDER_HOUR=8")
}
