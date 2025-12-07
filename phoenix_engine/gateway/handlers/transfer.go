package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"gateway/config"
	"gateway/services"

	"github.com/google/uuid"
)

func HandleTransfer(w http.ResponseWriter, r *http.Request, serviceType, legacyURL, modernURL string, kafkaService *services.KafkaService) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Helper function to send Kafka messages
	sendKafkaMessage := func(data map[string]interface{}) {
		if kafkaService != nil {
			msgBytes, _ := json.Marshal(data)
			kafkaService.SendMessage(msgBytes)
		}
	}

	bodyBytes, _ := ioutil.ReadAll(r.Body)
	r.Body = ioutil.NopCloser(bytes.NewBuffer(bodyBytes))

	txID := uuid.New().String()

	var bodyMap map[string]interface{}
	json.Unmarshal(bodyBytes, &bodyMap)

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

	// Check traffic lock using config
	if config.GlobalConfig.IsTrafficLocked() && (mode == "modern" || mode == "shadowing") {
		log.Printf("✗ REQUEST REJECTED: Traffic is LOCKED (mode=%s not allowed)", mode)
		http.Error(w, fmt.Sprintf("Traffic locked: %s mode not allowed. Only 'legacy' mode is permitted.", mode), http.StatusForbidden)
		return
	}

	log.Printf("Traffic lock status: %v (mode %s allowed)", config.GlobalConfig.IsTrafficLocked(), mode)

	bodyMap["transaction_id"] = txID
	newBodyBytes, _ := json.Marshal(bodyMap)

	// Get weight using config
	weight := config.GlobalConfig.GetPythonWeight()
	if serviceType == "php" {
		weight = config.GlobalConfig.GetPhpWeight()
	}

	log.Printf("Current weight for %s: %.2f", serviceType, weight)

	// Mode-based routing
	if mode == "legacy" {
		log.Printf("→ Routing to LEGACY ONLY (%s)", legacyURL)
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

			sendKafkaMessage(map[string]interface{}{
				"transaction_id": txID,
				"service_type":   serviceType,
				"legacy_status":  legacyResp.StatusCode,
				"legacy_latency": legacyDuration.Seconds(),
				"mode":           "legacy-only",
			})
		} else {
			log.Printf("✗ Legacy FAILED: %v", legacyErr)
			http.Error(w, "Legacy service failed", http.StatusInternalServerError)
		}
		log.Printf("=== REQUEST COMPLETED ===\n")
		return
	}

	if mode == "modern" {
		log.Printf("→ Routing to MODERN ONLY (%s)", modernURL)
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

			sendKafkaMessage(map[string]interface{}{
				"transaction_id": txID,
				"service_type":   serviceType,
				"modern_status":  modernResp.StatusCode,
				"modern_latency": modernDuration.Seconds(),
				"mode":           "modern-only",
			})
		} else {
			log.Printf("✗ Modern FAILED: %v", modernErr)
			http.Error(w, "Modern service failed", http.StatusInternalServerError)
		}
		log.Printf("=== REQUEST COMPLETED ===\n")
		return
	}

	// Shadowing mode - weight determines request distribution
	log.Printf("→ Routing in SHADOWING mode (weight: %.0f%%)", weight*100)

	// Special cases: weight=0% or weight=100%
	if weight == 0.0 {
		log.Printf("  Weight is 0%% - Routing to LEGACY ONLY (no shadowing)")
		start := time.Now()
		legacyResp, legacyErr := http.Post(legacyURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		legacyDuration := time.Since(start)

		if legacyErr == nil {
			defer legacyResp.Body.Close()
			body, _ := ioutil.ReadAll(legacyResp.Body)
			log.Printf("✓ Legacy responded: %d in %.3fs", legacyResp.StatusCode, legacyDuration.Seconds())
			w.WriteHeader(legacyResp.StatusCode)
			w.Write(body)

			sendKafkaMessage(map[string]interface{}{
				"transaction_id": txID,
				"service_type":   serviceType,
				"legacy_status":  legacyResp.StatusCode,
				"legacy_latency": legacyDuration.Seconds(),
				"mode":           "shadowing-legacy-only",
				"weight":         weight,
			})
		} else {
			log.Printf("✗ Legacy FAILED: %v", legacyErr)
			http.Error(w, "Legacy service failed", http.StatusInternalServerError)
		}
		log.Printf("=== REQUEST COMPLETED ===\n")
		return
	}

	if weight == 1.0 {
		log.Printf("  Weight is 100%% - Routing to MODERN ONLY (no shadowing)")
		start := time.Now()
		modernResp, modernErr := http.Post(modernURL+"/api/transfer-funds", "application/json", bytes.NewBuffer(newBodyBytes))
		modernDuration := time.Since(start)

		if modernErr == nil {
			defer modernResp.Body.Close()
			body, _ := ioutil.ReadAll(modernResp.Body)
			log.Printf("✓ Modern responded: %d in %.3fs", modernResp.StatusCode, modernDuration.Seconds())
			w.WriteHeader(modernResp.StatusCode)
			w.Write(body)

			sendKafkaMessage(map[string]interface{}{
				"transaction_id": txID,
				"service_type":   serviceType,
				"modern_status":  modernResp.StatusCode,
				"modern_latency": modernDuration.Seconds(),
				"mode":           "shadowing-modern-only",
				"weight":         weight,
			})
		} else {
			log.Printf("✗ Modern FAILED: %v", modernErr)
			http.Error(w, "Modern service failed", http.StatusInternalServerError)
		}
		log.Printf("=== REQUEST COMPLETED ===\n")
		return
	}

	// Normal shadowing: 0% < weight < 100%
	// Decide primary target based on weight
	useModern := rand.Float64() < weight

	if useModern {
		log.Printf("  Primary: Modern (%s) | Shadow: Legacy (%s)", modernURL, legacyURL)
	} else {
		log.Printf("  Primary: Legacy (%s) | Shadow: Modern (%s)", legacyURL, modernURL)
	}

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

	kafkaMsg := map[string]interface{}{
		"transaction_id": txID,
		"service_type":   serviceType,
		"legacy_status":  0,
		"modern_status":  0,
		"legacy_latency": legacyDuration.Seconds(),
		"modern_latency": modernDuration.Seconds(),
		"mode":           "shadowing",
		"weight":         weight,
		"primary_target": "legacy",
	}

	if useModern {
		kafkaMsg["primary_target"] = "modern"
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

	sendKafkaMessage(kafkaMsg)
	log.Printf("→ Sent comparison data to Kafka (primary: %s)", kafkaMsg["primary_target"])

	// Return BOTH responses with indication of which was primary
	combinedResponse := map[string]interface{}{
		"mode":           "shadowing",
		"transaction_id": txID,
		"weight":         weight,
		"primary_target": "legacy",
		"legacy": map[string]interface{}{
			"status":     0,
			"latency_ms": legacyDuration.Milliseconds(),
			"response":   nil,
			"is_primary": true,
		},
		"modern": map[string]interface{}{
			"status":     0,
			"latency_ms": modernDuration.Milliseconds(),
			"response":   nil,
			"is_primary": false,
		},
	}

	if useModern {
		combinedResponse["primary_target"] = "modern"
		combinedResponse["legacy"].(map[string]interface{})["is_primary"] = false
		combinedResponse["modern"].(map[string]interface{})["is_primary"] = true
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

	if useModern {
		log.Printf("← Returned BOTH responses (PRIMARY: Modern, weight: %.0f%%)", weight*100)
	} else {
		log.Printf("← Returned BOTH responses (PRIMARY: Legacy, weight: %.0f%%)", weight*100)
	}
	log.Printf("=== REQUEST COMPLETED ===\n")
}
