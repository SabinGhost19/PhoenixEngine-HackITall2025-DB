package router

import (
	"net/http"
	"os"
	"strings"

	"gateway/handlers"
	"gateway/middleware"
	"gateway/services"
)

func SetupRoutes(kafkaService *services.KafkaService) {
	// Admin endpoints
	http.HandleFunc("/admin/set-weight", middleware.LoggingMiddleware(handlers.SetWeightHandler))
	http.HandleFunc("/admin/traffic-lock", middleware.LoggingMiddleware(handlers.TrafficLockHandler))
	http.HandleFunc("/admin/status", handlers.StatusHandler) // No logging to reduce noise

	// Legacy transfer endpoints (kept for backwards compatibility)
	http.HandleFunc("/python/transfer", middleware.LoggingMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleTransfer(
			w, r,
			"python",
			os.Getenv("LEGACY_PYTHON_URL"),
			os.Getenv("MODERN_PYTHON_URL"),
			kafkaService,
		)
	}))

	http.HandleFunc("/php/transfer", middleware.LoggingMiddleware(func(w http.ResponseWriter, r *http.Request) {
		handlers.HandleTransfer(
			w, r,
			"php",
			os.Getenv("LEGACY_PHP_URL"),
			os.Getenv("MODERN_GO_URL"),
			kafkaService,
		)
	}))

	// Dynamic routing: /php/* goes to PHP legacy and Go modern
	http.HandleFunc("/php/", middleware.LoggingMiddleware(func(w http.ResponseWriter, r *http.Request) {
		// Extract the path after /php/
		path := strings.TrimPrefix(r.URL.Path, "/php")
		
		// Build backend URLs
		legacyURL := os.Getenv("LEGACY_PHP_URL")
		modernURL := os.Getenv("MODERN_GO_URL")
		
		// If no env vars, use defaults
		if legacyURL == "" {
			legacyURL = "http://localhost:8080"
		}
		if modernURL == "" {
			modernURL = "http://localhost:8081"
		}

		handlers.HandleDynamicTransfer(
			w, r,
			"php",
			legacyURL + path,
			modernURL + path,
			kafkaService,
		)
	}))

	// Dynamic routing: /python/* goes to Python legacy and modern
	http.HandleFunc("/python/", middleware.LoggingMiddleware(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/python")
		
		legacyURL := os.Getenv("LEGACY_PYTHON_URL")
		modernURL := os.Getenv("MODERN_PYTHON_URL")
		
		if legacyURL == "" {
			legacyURL = "http://localhost:5001"
		}
		if modernURL == "" {
			modernURL = "http://localhost:5002"
		}

		handlers.HandleDynamicTransfer(
			w, r,
			"python",
			legacyURL + path,
			modernURL + path,
			kafkaService,
		)
	}))
}
