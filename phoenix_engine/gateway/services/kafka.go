package services

import (
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type KafkaService struct {
	Producer *kafka.Producer
	Topic    string
}

func NewKafkaService(bootstrapServers, topic string) (*KafkaService, error) {
	var producer *kafka.Producer
	var err error
	
	// Retry logic for Kafka connection
	for i := 0; i < 30; i++ {
		producer, err = kafka.NewProducer(&kafka.ConfigMap{
			"bootstrap.servers": bootstrapServers,
		})
		if err == nil {
			break
		}
		log.Printf("Failed to create Kafka producer: %s. Retrying in 2s...", err)
		time.Sleep(2 * time.Second)
	}
	
	if err != nil {
		return nil, err
	}
	
	return &KafkaService{
		Producer: producer,
		Topic:    topic,
	}, nil
}

func (k *KafkaService) SendMessage(value []byte) error {
	if k.Producer == nil {
		return nil // Gracefully handle nil producer
	}
	
	return k.Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{
			Topic:     &k.Topic,
			Partition: kafka.PartitionAny,
		},
		Value: value,
	}, nil)
}

func (k *KafkaService) Close() {
	if k.Producer != nil {
		k.Producer.Close()
	}
}
