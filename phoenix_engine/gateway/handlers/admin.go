package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"gateway/config"
	"gateway/types"
)

func SetWeightHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	if r.Method == http.MethodGet {
		service := r.URL.Query().Get("service")
		var weight float64
		
		if service == "python" {
			weight = config.GlobalConfig.GetPythonWeight()
		} else if service == "php" {
			weight = config.GlobalConfig.GetPhpWeight()
		} else {
			http.Error(w, "Invalid service", http.StatusBadRequest)
			return
		}
		
		json.NewEncoder(w).Encode(types.WeightResponse{
			Service: service,
			Weight:  weight,
		})
		return
	}
	
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	
	var req types.WeightRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if req.Service == "python" {
		config.GlobalConfig.SetPythonWeight(req.Weight)
		log.Printf("Updated Python weight to %.2f%%", req.Weight*100)
	} else if req.Service == "php" {
		config.GlobalConfig.SetPhpWeight(req.Weight)
		log.Printf("Updated PHP weight to %.2f%%", req.Weight*100)
	} else {
		http.Error(w, "Invalid service type", http.StatusBadRequest)
		return
	}

	json.NewEncoder(w).Encode(types.WeightResponse{
		Service: req.Service,
		Weight:  req.Weight,
	})
}

func TrafficLockHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	if r.Method == http.MethodGet {
		locked := config.GlobalConfig.IsTrafficLocked()
		json.NewEncoder(w).Encode(types.TrafficLockResponse{Locked: locked})
		log.Printf("Traffic lock status queried: %v", locked)
		return
	}
	
	if r.Method == http.MethodPost {
		var req types.TrafficLockRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		config.GlobalConfig.SetTrafficLocked(req.Locked)
		log.Printf("Traffic lock updated: %v", req.Locked)
		json.NewEncoder(w).Encode(types.TrafficLockResponse{Locked: req.Locked})
		return
	}
	
	http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
}
