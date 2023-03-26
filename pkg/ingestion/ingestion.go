package ingestion

import (
	"context"
	"time"

	"github.com/pyroscope-io/pyroscope/pkg/convert/pprof"
	"github.com/pyroscope-io/pyroscope/pkg/storage/metadata"
	"github.com/pyroscope-io/pyroscope/pkg/storage/segment"
)

type Ingester interface {
	Ingest(context.Context, *IngestInput) error
}

type IngestInput struct {
	Format   Format
	Profile  *pprof.RawProfile
	Metadata Metadata
}

type Format string

type Metadata struct {
	StartTime       time.Time
	EndTime         time.Time
	Key             *segment.Key
	SpyName         string
	SampleRate      uint32
	Units           metadata.Units
	AggregationType metadata.AggregationType
}
