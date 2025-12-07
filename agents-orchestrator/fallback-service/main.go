package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	_ "github.com/lib/pq"
)

type TransferRequest struct {
	AccountNumber string  `json:"account_number"`
	Amount        float64 `json:"amount"`
}

type TransferResponse struct {
	Status            string  `json:"status"`
	NewBalance        float64 `json:"new_balance"`
	CommissionCharged float64 `json:"commission_charged"`
	System            string  `json:"system"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

var db *sql.DB

func main() {
	// Database Connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	var err error
	db, err = sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatalf("Error opening database: %v", err)
	}
	defer db.Close()

	// Test connection
	err = db.Ping()
	if err != nil {
		log.Printf("Warning: Could not ping database: %v", err)
	} else {
		log.Println("Connected to database successfully")
	}

	r := mux.NewRouter()

	// Health Check
	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status": "online",
			"system": "modern_go_fallback",
		})
	}).Methods("GET")

	// User Endpoints
	r.HandleFunc("/users", HandleGetUsers).Methods("GET")
	r.HandleFunc("/users", HandleCreateUser).Methods("POST")

    // Debug Catch-All
    r.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        log.Printf("UNMATCHED REQUEST: %s %s", r.Method, r.URL.Path)
        http.Error(w, "Not Found", http.StatusNotFound)
    })

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Ensure users table exists
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,
		email VARCHAR(100) UNIQUE NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		log.Printf("Warning: Could not create users table: %v", err)
	}

	log.Printf("Service starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, LoggingMiddleware(r)))
}

type User struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func HandleGetUsers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Fetching users list...")

	rows, err := db.Query("SELECT id, name, email, created_at FROM users ORDER BY id DESC")
	if err != nil {
		log.Printf("Error querying users: %v", err)
		http.Error(w, `{"error": "Database error"}`, http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.CreatedAt); err != nil {
			log.Printf("Error scanning user: %v", err)
			continue
		}
		users = append(users, u)
	}

	json.NewEncoder(w).Encode(users)
}

func HandleCreateUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if u.Name == "" || u.Email == "" {
		http.Error(w, `{"message": "Incomplete data. Name and email required."}`, http.StatusBadRequest)
		return
	}

	log.Printf("Creating user: %s (%s)", u.Name, u.Email)

	var id int
	err := db.QueryRow("INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id", u.Name, u.Email).Scan(&id)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadRequest)
		return
	}

	log.Printf("User created successfully with ID: %d", id)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User created successfully.",
		"id":      id,
	})
}

func HandleTransfer(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req TransferRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if req.AccountNumber == "" || req.Amount <= 0 {
		http.Error(w, `{"error": "Missing parameters or invalid amount"}`, http.StatusBadRequest)
		return
	}

	log.Printf("Processing transfer for account: %s, amount: %.2f", req.AccountNumber, req.Amount)

	tx, err := db.Begin()
	if err != nil {
		log.Printf("Database error: %v", err)
		http.Error(w, `{"error": "Database error"}`, http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	// Select Account
	var id int
	var balance float64
	var clientType string

	// Note: Replicating legacy query logic
	err = tx.QueryRow("SELECT id, balance, client_type FROM accounts WHERE account_number = $1 AND is_shadow = FALSE FOR UPDATE", req.AccountNumber).Scan(&id, &balance, &clientType)
	if err == sql.ErrNoRows {
		log.Printf("Account not found: %s", req.AccountNumber)
		http.Error(w, `{"error": "Account not found"}`, http.StatusInternalServerError) // PHP returns 500 for exception
		return
	} else if err != nil {
		log.Printf("Error querying account: %v", err)
		http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusInternalServerError)
		return
	}

	// Calculate Commission (Replicating Legacy Logic including Rounding)
	commissionRate := 0.01
	if clientType == "VIP" {
		commissionRate = 0.005
	}

	// Legacy Flaw Replication: round(amount * rate, 2)
	commission := math.Round(req.Amount*commissionRate*100) / 100
	totalDeduction := req.Amount + commission

	log.Printf("Account type: %s, Commission rate: %.3f, Commission: %.2f", clientType, commissionRate, commission)

	if balance < totalDeduction {
		log.Printf("Insufficient funds. Balance: %.2f, Required: %.2f", balance, totalDeduction)
		http.Error(w, `{"error": "Insufficient funds"}`, http.StatusInternalServerError)
		return
	}

	newBalance := balance - totalDeduction

	// Update Balance
	_, err = tx.Exec("UPDATE accounts SET balance = $1 WHERE id = $2", newBalance, id)
	if err != nil {
		log.Printf("Failed to update balance: %v", err)
		http.Error(w, `{"error": "Failed to update balance"}`, http.StatusInternalServerError)
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("Failed to commit transaction: %v", err)
		http.Error(w, `{"error": "Failed to commit transaction"}`, http.StatusInternalServerError)
		return
	}

	log.Printf("Transfer successful. New Balance: %.2f", newBalance)

	resp := TransferResponse{
		Status:            "success",
		NewBalance:        newBalance,
		CommissionCharged: commission,
		System:            "modern_go_fallback",
	}

	json.NewEncoder(w).Encode(resp)
}

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		log.Printf("Started %s %s", r.Method, r.URL.Path)
		next.ServeHTTP(w, r)
		log.Printf("Completed %s %s in %v", r.Method, r.URL.Path, time.Since(start))
	})
}
