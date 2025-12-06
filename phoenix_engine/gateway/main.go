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
	pythonWeight  float64 = 0.0
	phpWeight     float64 = 0.0
	mu            sync.RWMutex
	trafficLocked bool    = true // Start locked by default
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
	http.HandleFunc("/admin/traffic-lock", trafficLockHandler)
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
	w.Header().Set("Content-Type", "application/json")
	
	if r.Method == http.MethodGet {
		// Return current weight
		service := r.URL.Query().Get("service")
		mu.RLock()
		var weight float64
		if service == "python" {
			weight = pythonWeight
		} else if service == "php" {
			weight = phpWeight
		} else {
			mu.RUnlock()
			http.Error(w, "Invalid service", http.StatusBadRequest)
			return
		}
		mu.RUnlock()
		
		json.NewEncoder(w).Encode(map[string]interface{}{
			"service": service,
			"weight":  weight,
		})
		return
	}
	
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
		log.Printf("Updated Python weight to %.2f%%", req.Weight*100)
	} else if req.Service == "php" {
		phpWeight = req.Weight
		log.Printf("Updated PHP weight to %.2f%%", req.Weight*100)
	}
	mu.Unlock()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"service": req.Service,
		"weight":  req.Weight,
	})
}

type TrafficLockRequest struct {
	Locked bool `json:"locked"`
}

type TrafficLockResponse struct {
	Locked bool `json:"locked"`
}

func trafficLockHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	if r.Method == http.MethodGet {
		// Return current lock status
		mu.RLock()
		locked := trafficLocked
		mu.RUnlock()
		
		json.NewEncoder(w).Encode(TrafficLockResponse{Locked: locked})
		log.Printf("Traffic lock status queried: %v", locked)
		return
	}
	
	if r.Method == http.MethodPost {
		// Update lock status
		var req TrafficLockRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		mu.Lock()
		trafficLocked = req.Locked
		mu.Unlock()
		
		log.Printf("Traffic lock updated: %v", req.Locked)
		json.NewEncoder(w).Encode(TrafficLockResponse{Locked: req.Locked})
		return
	}
	
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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
	
	// Parse body to check for mode and inject txID
	var bodyMap map[string]interface{}
	json.Unmarshal(bodyBytes, &bodyMap)
	
	// Check for mode parameter
	mode, _ := bodyMap["mode"].(string)
	if mode == "" {
		mode = "shadowing"
	}
	
	log.Printf("=== INCOMING REQUEST ===")
	log.Printf("Transaction ID: %s", txID)
	log.Printf("Service Type: %s", serviceType)
	log.Printf("Mode: %s", mode)
	log.Printf("Account: %v", bodyMap["account_number"])
	log.Printf("Amount: %v", bodyMap["amount"])
	
	// Check traffic lock
	mu.RLock()
	locked := trafficLocked
	mu.RUnlock()
	
	if locked && (mode == "modern" || mode == "shadowing") {
		log.Printf("✗ REQUEST REJECTED: Traffic is LOCKED (mode=%s not allowed)", mode)
		http.Error(w, fmt.Sprintf("Traffic locked: %s mode not allowed. Only 'legacy' mode is permitted.", mode), http.StatusForbidden)
		return
	}
	
	log.Printf("Traffic lock status: %v (mode %s allowed)", locked, mode)
	
	bodyMap["transaction_id"] = txID
	newBodyBytes, _ := json.Marshal(bodyMap)

	// Determine Routing based on mode
	mu.RLock()
	weight := pythonWeight
	if serviceType == "php" {
		weight = phpWeight
	}
	mu.RUnlock()

	useModern := rand.Float64() < weight
	log.Printf("Current weight for %s: %.2f, useModern: %v", serviceType, weight, useModern)

	// Mode-based routing
	if mode == "legacy" {
		log.Printf("→ Routing to LEGACY ONLY (%s)", legacyURL)
		// Call ONLY legacy
		start := time.Now()
		legacyResp, legacyErr := http.Post(legacyURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		legacyDuration := time.Since(start)
		
		if legacyErr == nil {
			defer legacyResp.Body.Close()
			body, _ := ioutil.ReadAll(legacyResp.Body)
			log.Printf("✓ Legacy responded: %d in %.3fs", legacyResp.StatusCode, legacyDuration.Seconds())
			log.Printf("  Response: %s", string(body))
			w.WriteHeader(legacyResp.StatusCode)
			w.Write(body)
			
			// Log to Kafka
			if kafkaProducer != nil {
				kafkaMsg := map[string]interface{}{
					"transaction_id": txID,
					"service_type":   serviceType,
					"legacy_status":  legacyResp.StatusCode,
					"legacy_latency": legacyDuration.Seconds(),
					"mode":           "legacy-only",
				}
				msgBytes, _ := json.Marshal(kafkaMsg)
				kafkaProducer.Produce(&kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &kafkaTopic, Partition: kafka.PartitionAny},
					Value:          msgBytes,
				}, nil)
			}
		} else {
			log.Printf("✗ Legacy FAILED: %v", legacyErr)
			http.Error(w, "Legacy service failed", http.StatusInternalServerError)
		}
		log.Printf("=== REQUEST COMPLETED ===\n")
		return
	}

	if mode == "modern" {
		log.Printf("→ Routing to MODERN ONLY (%s)", modernURL)
		// Call ONLY modern
		start := time.Now()
		modernResp, modernErr := http.Post(modernURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		modernDuration := time.Since(start)
		
		if modernErr == nil {
			defer modernResp.Body.Close()
			body, _ := ioutil.ReadAll(modernResp.Body)
			log.Printf("✓ Modern responded: %d in %.3fs", modernResp.StatusCode, modernDuration.Seconds())
			log.Printf("  Response: %s", string(body))
			w.WriteHeader(modernResp.StatusCode)
			w.Write(body)
			
			// Log to Kafka
			if kafkaProducer != nil {
				kafkaMsg := map[string]interface{}{
					"transaction_id": txID,
					"service_type":   serviceType,
					"modern_status":  modernResp.StatusCode,
					"modern_latency": modernDuration.Seconds(),
					"mode":           "modern-only",
				}
				msgBytes, _ := json.Marshal(kafkaMsg)
				kafkaProducer.Produce(&kafka.Message{
					TopicPartition: kafka.TopicPartition{Topic: &kafkaTopic, Partition: kafka.PartitionAny},
					Value:          msgBytes,
				}, nil)
			}
		} else {
			log.Printf("✗ Modern FAILED: %v", modernErr)
			http.Error(w, "Modern service failed", http.StatusInternalServerError)
		}
		log.Printf("=== REQUEST COMPLETED ===\n")
		return
	}

	// Default: Shadowing mode - call BOTH
	log.Printf("→ Routing to BOTH (Shadowing)")
	log.Printf("  Legacy: %s", legacyURL)
	log.Printf("  Modern: %s", modernURL)
	
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
		if legacyErr == nil {
			log.Printf("✓ Legacy responded: %d in %.3fs", legacyResp.StatusCode, legacyDuration.Seconds())
		} else {
			log.Printf("✗ Legacy FAILED: %v", legacyErr)
		}
	}()

	go func() {
		defer wg.Done()
		start := time.Now()
		modernResp, modernErr = http.Post(modernURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		modernDuration = time.Since(start)
		if modernErr == nil {
			log.Printf("✓ Modern responded: %d in %.3fs", modernResp.StatusCode, modernDuration.Seconds())
		} else {
			log.Printf("✗ Modern FAILED: %v", modernErr)
		}
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
		"mode":           "shadowing",
	}

	var legacyBody, modernBody []byte
	
	if legacyErr == nil {
		kafkaMsg["legacy_status"] = legacyResp.StatusCode
		legacyBody, _ = ioutil.ReadAll(legacyResp.Body)
		defer legacyResp.Body.Close()
	}
	if modernErr == nil {
		kafkaMsg["modern_status"] = modernResp.StatusCode
		modernBody, _ = ioutil.ReadAll(modernResp.Body)
		defer modernResp.Body.Close()
	}
	
	// Send to Kafka
	if kafkaProducer != nil {
		msgBytes, _ := json.Marshal(kafkaMsg)
		kafkaProducer.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &kafkaTopic, Partition: kafka.PartitionAny},
			Value:          msgBytes,
		}, nil)
		log.Printf("→ Sent comparison data to Kafka")
	}

	// Return BOTH responses in shadowing mode
	combinedResponse := map[string]interface{}{
		"mode": "shadowing",
		"transaction_id": txID,
		"legacy": map[string]interface{}{
			"status": 0,
			"latency_ms": legacyDuration.Milliseconds(),
			"response": nil,
		},
		"modern": map[string]interface{}{
			"status": 0,
			"latency_ms": modernDuration.Milliseconds(),
			"response": nil,
		},
	}

	if legacyErr == nil {
		var legacyJSON interface{}
		json.Unmarshal(legacyBody, &legacyJSON)
		combinedResponse["legacy"].(map[string]interface{})["status"] = legacyResp.StatusCode
		combinedResponse["legacy"].(map[string]interface{})["response"] = legacyJSON
		log.Printf("← Including LEGACY response: %d", legacyResp.StatusCode)
	} else {
		combinedResponse["legacy"].(map[string]interface{})["error"] = legacyErr.Error()
	}

	if modernErr == nil {
		var modernJSON interface{}
		json.Unmarshal(modernBody, &modernJSON)
		combinedResponse["modern"].(map[string]interface{})["status"] = modernResp.StatusCode
		combinedResponse["modern"].(map[string]interface{})["response"] = modernJSON
		log.Printf("← Including MODERN response: %d", modernResp.StatusCode)
	} else {
		combinedResponse["modern"].(map[string]interface{})["error"] = modernErr.Error()
	}

	responseBytes, _ := json.Marshal(combinedResponse)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseBytes)
	
	log.Printf("← Returned BOTH responses to client")
	log.Printf("=== REQUEST COMPLETED ===\n")
}

