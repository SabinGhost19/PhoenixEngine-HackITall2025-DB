package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"gateway/router"
	"gateway/services"
)

func main() {
	rand.Seed(time.Now().UnixNano())

	// Initialize Kafka Service
	kafkaService, err := services.NewKafkaService(
		os.Getenv("KAFKA_BOOTSTRAP_SERVERS"),
		"shadow-requests",
	)
	
	if err != nil {
		log.Printf("Failed to create Kafka service: %s", err)
	} else {
		defer kafkaService.Close()
		log.Println("Kafka service initialized successfully")
	}

	// Setup routes
	router.SetupRoutes(kafkaService)

	// Start server
	port := ":8082"
	log.Printf("Gateway listening on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
