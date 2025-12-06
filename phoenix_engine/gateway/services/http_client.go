package services

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"time"
)

type HTTPClient struct {
	client *http.Client
}

func NewHTTPClient() *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

type HTTPResponse struct {
	StatusCode int
	Body       []byte
	Duration   time.Duration
	Error      error
}

func (h *HTTPClient) Post(url string, contentType string, body []byte) *HTTPResponse {
	start := time.Now()
	
	resp, err := h.client.Post(url, contentType, bytes.NewBuffer(body))
	duration := time.Since(start)
	
	if err != nil {
		return &HTTPResponse{
			Duration: duration,
			Error:    err,
		}
	}
	
	defer resp.Body.Close()
	bodyBytes, _ := ioutil.ReadAll(resp.Body)
	
	return &HTTPResponse{
		StatusCode: resp.StatusCode,
		Body:       bodyBytes,
		Duration:   duration,
		Error:      nil,
	}
}
