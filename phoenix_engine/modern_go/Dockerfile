FROM golang:1.19

WORKDIR /app

# gcc is included in the standard image

COPY . .
RUN go mod tidy

RUN go build -o main .

CMD ["./main"]
