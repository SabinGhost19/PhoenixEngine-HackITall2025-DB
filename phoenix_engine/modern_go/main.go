package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/lib/pq"
)

type TransferRequest struct {
	AccountNumber string  `json:"account_number"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
}

type TransferResponse struct {
	Status            string  `json:"status"`
	NewBalance        float64 `json:"new_balance"`
	CommissionCharged float64 `json:"commission_charged"`
	System            string  `json:"system"`
	Error             string  `json:"error,omitempty"`
}

var db *sql.DB
var kafkaProducer *kafka.Producer
var kafkaTopic = "db-state-updates"

func main() {
	var err error
	dbURL := os.Getenv("DATABASE_URL")
	kafkaBootstrap := os.Getenv("KAFKA_BOOTSTRAP_SERVERS")

	// Connect to DB
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Connect to Kafka
	kafkaProducer, err = kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": kafkaBootstrap})
	if err != nil {
		log.Printf("Failed to create Kafka producer: %s", err)
	} else {
		defer kafkaProducer.Close()
	}

	http.HandleFunc("/api/transfer-funds", transferFundsHandler)

	log.Println("Modern Go Service listening on :8084")
	log.Fatal(http.ListenAndServe(":8084", nil))
}

func transferFundsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req TransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	tx, err := db.Begin()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Get Account (Shadow)
	var id int
	var balance float64
	var clientType string
	err = tx.QueryRow("SELECT id, balance, client_type FROM accounts WHERE account_number = $1 AND is_shadow = TRUE FOR UPDATE", req.AccountNumber).Scan(&id, &balance, &clientType)
	if err != nil {
		http.Error(w, "Account not found (Shadow)", http.StatusNotFound)
		return
	}

	// Correct Logic: High precision calculation (no premature rounding)
	var commissionRate float64
	if clientType == "VIP" {
		commissionRate = 0.005
	} else {
		commissionRate = 0.01
	}

	commission := req.Amount * commissionRate
	totalDeduction := req.Amount + commission

	if balance < totalDeduction {
		http.Error(w, "Insufficient funds", http.StatusBadRequest)
		return
	}

	newBalance := balance - totalDeduction

	// Update DB
	_, err = tx.Exec("UPDATE accounts SET balance = $1 WHERE id = $2", newBalance, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Notify Kafka
	if kafkaProducer != nil {
		msg := map[string]interface{}{
			"transaction_id": req.TransactionID,
			"system":         "modern_go",
			"account_number": req.AccountNumber,
			"status":         "completed",
		}
		msgBytes, _ := json.Marshal(msg)
		kafkaProducer.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &kafkaTopic, Partition: kafka.PartitionAny},
			Value:          msgBytes,
		}, nil)
	}

	resp := TransferResponse{
		Status:            "success",
		NewBalance:        newBalance,
		CommissionCharged: commission,
		System:            "modern_go",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
