package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/google/uuid"
)

var (
	pythonWeight float64 = 0.0
	phpWeight    float64 = 0.0
	mu           sync.RWMutex
	kafkaProducer *kafka.Producer
	kafkaTopic    = "shadow-requests"
)

type WeightRequest struct {
	Service string  `json:"service"` // "python" or "php"
	Weight  float64 `json:"weight"`
}

func main() {
	rand.Seed(time.Now().UnixNano())

	kafkaBootstrap := os.Getenv("KAFKA_BOOTSTRAP_SERVERS")
	var err error
	for i := 0; i < 30; i++ {
		kafkaProducer, err = kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBootstrap})
		if err == nil {
			break
		}
		log.Printf("Failed to create Kafka producer: %s. Retrying in 2s...", err)
		time.Sleep(2 * time.Second)
	}
	
	if err != nil {
		log.Printf("Failed to create Kafka producer after retries: %s", err)
	} else {
		defer kafkaProducer.Close()
	}

	http.HandleFunc("/admin/set-weight", setWeightHandler)
	http.HandleFunc("/python/transfer", func(w http.ResponseWriter, r *http.Request) {
		handleTransfer(w, r, "python", os.Getenv("LEGACY_PYTHON_URL"), os.Getenv("MODERN_PYTHON_URL"))
	})
	http.HandleFunc("/php/transfer", func(w http.ResponseWriter, r *http.Request) {
		handleTransfer(w, r, "php", os.Getenv("LEGACY_PHP_URL"), os.Getenv("MODERN_GO_URL"))
	})

	log.Println("Gateway listening on :8082")
	log.Fatal(http.ListenAndServe(":8082", nil))
}

func setWeightHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var req WeightRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mu.Lock()
	if req.Service == "python" {
		pythonWeight = req.Weight
	} else if req.Service == "php" {
		phpWeight = req.Weight
	}
	mu.Unlock()

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "Updated weight for %s to %f", req.Service, req.Weight)
}

func handleTransfer(w http.ResponseWriter, r *http.Request, serviceType, legacyURL, modernURL string) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	bodyBytes, _ := ioutil.ReadAll(r.Body)
	r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	// Add Transaction ID
	txID := uuid.New().String()
	
	// Parse body to inject txID if needed, but for now we just pass it in headers or assume services handle it.
	// Actually, our services expect it in the body or generate it. 
	// Let's inject it into the JSON body.
	var bodyMap map[string]interface{}
	json.Unmarshal(bodyBytes, &bodyMap)
	bodyMap["transaction_id"] = txID
	newBodyBytes, _ := json.Marshal(bodyMap)

	// Determine Routing
	mu.RLock()
	weight := pythonWeight
	if serviceType == "php" {
		weight = phpWeight
	}
	mu.RUnlock()

	useModern := rand.Float64() < weight

	// Shadowing: Always call BOTH, but decide which one to return.
	// Actually, for "Shadowing" phase (weight=0), we return Legacy but call Modern in background.
	// For "Canary" phase (weight>0), we might return Modern.
	
	// To simplify: We ALWAYS call both.
	// If useModern == true, we return Modern response.
	// Else, we return Legacy response.

	var wg sync.WaitGroup
	wg.Add(2)

	var legacyResp *http.Response
	var modernResp *http.Response
	var legacyErr, modernErr error
	var legacyDuration, modernDuration time.Duration

	go func() {
		defer wg.Done()
		start := time.Now()
		legacyResp, legacyErr = http.Post(legacyURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		legacyDuration = time.Since(start)
	}()

	go func() {
		defer wg.Done()
		start := time.Now()
		modernResp, modernErr = http.Post(modernURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		modernDuration = time.Since(start)
	}()

	wg.Wait()

	// Prepare Kafka Message
	kafkaMsg := map[string]interface{}{
		"transaction_id": txID,
		"service_type":   serviceType,
		"legacy_status":  0,
		"modern_status":  0,
		"legacy_latency": legacyDuration.Seconds(),
		"modern_latency": modernDuration.Seconds(),
	}

	if legacyErr == nil {
		kafkaMsg["legacy_status"] = legacyResp.StatusCode
		defer legacyResp.Body.Close()
	}
	if modernErr == nil {
		kafkaMsg["modern_status"] = modernResp.StatusCode
		defer modernResp.Body.Close()
	}
	
	// Send to Kafka
	if kafkaProducer != nil {
		msgBytes, _ := json.Marshal(kafkaMsg)
		kafkaProducer.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &kafkaTopic, Partition: kafka.PartitionAny},
			Value:          msgBytes,
		}, nil)
	}

	// Return Response
	if useModern && modernErr == nil {
		// Return Modern
		body, _ := ioutil.ReadAll(modernResp.Body)
		w.WriteHeader(modernResp.StatusCode)
		w.Write(body)
	} else if legacyErr == nil {
		// Return Legacy
		body, _ := ioutil.ReadAll(legacyResp.Body)
		w.WriteHeader(legacyResp.StatusCode)
		w.Write(body)
	} else {
		http.Error(w, "Both services failed", http.StatusInternalServerError)
	}
}
