package router

import (
	"net/http"
	"os"

	"gateway/handlers"
	"gateway/middleware"
	"gateway/services"
)

func SetupRoutes(kafkaService *services.KafkaService) {
	// Admin endpoints
	http.HandleFunc("/admin/set-weight", middleware.LoggingMiddleware(handlers.SetWeightHandler))
	http.HandleFunc("/admin/traffic-lock", middleware.LoggingMiddleware(handlers.TrafficLockHandler))
	
	// Transfer endpoints
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
}
