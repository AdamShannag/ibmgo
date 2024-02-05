package qmparser

import (
	"bytes"
	"log"
	"math/rand"
	"strings"
	"text/template"
	"time"

	"github.com/google/uuid"
)

type QueueMessageParser interface {
	ParseMessage(string) string
}

type queueMessageParserImpl struct{}

func NewParser() QueueMessageParser {
	return &queueMessageParserImpl{}
}

func (q *queueMessageParserImpl) ParseMessage(message string) string {
	tmpl, err := template.New("templ").Parse(message)
	if err != nil {
		log.Fatalf("parsing template: %v", err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, queueMessageParserImpl{}); err != nil {
		log.Fatalf("executing template: %v", err)
	}

	return buf.String()
}

func (q queueMessageParserImpl) UUID() string {
	return uuid.NewString()
}

// formatDate formats a date based on the provided format.
func (q queueMessageParserImpl) Date(format string) string {
	date := time.Now()
	year := date.Format("2006")
	month := date.Format("01")
	day := date.Format("02")

	// Replace format placeholders with actual date components
	formattedDate := format
	formattedDate = replacePlaceholder(formattedDate, "yyyy", year)
	formattedDate = replacePlaceholder(formattedDate, "yy", year[2:])
	formattedDate = replacePlaceholder(formattedDate, "MM", month)
	formattedDate = replacePlaceholder(formattedDate, "dd", day)

	return formattedDate
}

func (q queueMessageParserImpl) RandomString(n int) string {
	var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	randGen := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[randGen.Intn(len(letters))]
	}
	return string(b)
}

func replacePlaceholder(format, placeholder, value string) string {
	return strings.ReplaceAll(format, placeholder, value)
}
