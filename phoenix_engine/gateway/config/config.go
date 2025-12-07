package config

import "sync"

type Config struct {
	PythonWeight  float64
	PhpWeight     float64
	TrafficLocked bool
	Mu            sync.RWMutex
}

var GlobalConfig = &Config{
	PythonWeight:  0.1,   // Start with 10% to enable shadowing
	PhpWeight:     0.1,   // Start with 10% to enable shadowing
	TrafficLocked: false, // Default to unlocked for development
}

func (c *Config) GetPythonWeight() float64 {
	c.Mu.RLock()
	defer c.Mu.RUnlock()
	return c.PythonWeight
}

func (c *Config) SetPythonWeight(weight float64) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.PythonWeight = weight
}

func (c *Config) GetPhpWeight() float64 {
	c.Mu.RLock()
	defer c.Mu.RUnlock()
	return c.PhpWeight
}

func (c *Config) SetPhpWeight(weight float64) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.PhpWeight = weight
}

func (c *Config) IsTrafficLocked() bool {
	c.Mu.RLock()
	defer c.Mu.RUnlock()
	return c.TrafficLocked
}

func (c *Config) SetTrafficLocked(locked bool) {
	c.Mu.Lock()
	defer c.Mu.Unlock()
	c.TrafficLocked = locked
}
