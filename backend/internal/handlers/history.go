package handlers

import (
	"net/http"
)

type HistoryHandler struct {
	// Will add history service later
}

func NewHistoryHandler() *HistoryHandler {
	return &HistoryHandler{}
}

// Placeholder handlers - will implement later
func (h *HistoryHandler) GetHistory(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Get history endpoint - to be implemented"))
}

func (h *HistoryHandler) ClearHistory(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNotImplemented)
	w.Write([]byte("Clear history endpoint - to be implemented"))
}
