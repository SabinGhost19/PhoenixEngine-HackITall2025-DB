package types

type WeightRequest struct {
	Service string  `json:"service"`
	Weight  float64 `json:"weight"`
}

type TrafficLockRequest struct {
	Locked bool `json:"locked"`
}

type TrafficLockResponse struct {
	Locked bool `json:"locked"`
}

type WeightResponse struct {
	Service string  `json:"service"`
	Weight  float64 `json:"weight"`
}
