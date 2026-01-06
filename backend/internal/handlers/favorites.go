package handlers

import (
	"net/http"
)

type FavoritesHandler struct {
	// Will add favorite service later
}

func NewFavoritesHandler() *FavoritesHandler {
	return &FavoritesHandler{}
}

// Placeholder handlers - will implement later
func (h *FavoritesHandler) GetFavorites(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Get favorites endpoint - to be implemented"))
}

func (h *FavoritesHandler) AddFavorite(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Add favorite endpoint - to be implemented"))
}

func (h *FavoritesHandler) RemoveFavorite(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Remove favorite endpoint - to be implemented"))
}
