package handlers

import (
	"net/http"
)

type AuthHandler struct {
	// Will add auth service later
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// Placeholder handlers - will implement later
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Register endpoint - to be implemented"))
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Login endpoint - to be implemented"))
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Logout endpoint - to be implemented"))
}
