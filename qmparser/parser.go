package qmparser

import (
	"bytes"
	"log"
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

func replacePlaceholder(format, placeholder, value string) string {
	return strings.ReplaceAll(format, placeholder, value)
}
