FROM golang:1.21-alpine

WORKDIR /app

# Initialize module
RUN go mod init fallback-service
RUN go get github.com/gorilla/mux
RUN go get github.com/lib/pq

COPY main.go .

RUN go build -o main .

EXPOSE 8080

CMD ["./main"]
