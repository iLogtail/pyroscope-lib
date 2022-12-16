package pprof

import (
	"bytes"
	"encoding/json"
	"io"
	"mime/multipart"
	"sync"

	"github.com/pyroscope-io/pyroscope/pkg/storage/tree"
	"github.com/pyroscope-io/pyroscope/pkg/util/form"
)

type RawProfile struct {
	// parser is stateful: it holds parsed previous profile
	// which is necessary for cumulative profiles that require
	// two consecutive profiles.
	parser *Parser
	// References the next profile in the sequence (cumulative type only).
	next *RawProfile

	m sync.Mutex
	// Initializes lazily on Bytes, if not present.
	RawData             []byte // Represents raw request body as per ingestion API.
	FormDataContentType string // Set optionally, if RawData is multipart form.
	// Initializes lazily on Parse, if not present.
	Profile          []byte // Represents raw pprof data.
	PreviousProfile  []byte // Used for cumulative type only.
	SkipExemplars    bool
	SampleTypeConfig map[string]*tree.SampleTypeConfig
}

func (p *RawProfile) ContentType() string {
	if p.FormDataContentType == "" {
		return "binary/octet-stream"
	}
	return p.FormDataContentType
}

// Push loads data from profile to RawProfile making it eligible for
// Bytes and Parse calls.
//
// Returned RawProfile should be used at the next Push: the method
// established relationship between these two RawProfiles in order
// to propagate internal pprof parser state lazily on a successful
// Parse call. This is necessary for cumulative profiles that require
// two consecutive samples to calculate the diff. If parser is not
// present due to a failure, or sequence violation, the profiles will
// be re-parsed.
func (p *RawProfile) Push(profile []byte, cumulative bool) *RawProfile {
	p.m.Lock()
	p.Profile = profile
	p.RawData = nil
	n := &RawProfile{
		SampleTypeConfig: p.SampleTypeConfig,
	}
	if cumulative {
		// N.B the parser state is only propagated
		// after successful Parse call.
		n.PreviousProfile = p.Profile
		p.next = n
	}
	p.m.Unlock()
	return p.next
}

const (
	formFieldProfile, formFileProfile                   = "profile", "profile.pprof"
	formFieldPreviousProfile, formFilePreviousProfile   = "prev_profile", "profile.pprof"
	formFieldSampleTypeConfig, formFileSampleTypeConfig = "sample_type_config", "sample_type_config.json"
)

func (p *RawProfile) Bytes() ([]byte, error) {
	p.m.Lock()
	defer p.m.Unlock()
	if p.RawData != nil {
		// RawProfile was initialized with RawData or
		// Bytes has been already called.
		return p.RawData, nil
	}
	// Build multipart form.
	if len(p.Profile) == 0 && len(p.PreviousProfile) == 0 {
		return nil, nil
	}
	var b bytes.Buffer
	mw := multipart.NewWriter(&b)
	ff, err := mw.CreateFormFile(formFieldProfile, formFileProfile)
	if err != nil {
		return nil, err
	}
	_, _ = io.Copy(ff, bytes.NewReader(p.Profile))
	if len(p.PreviousProfile) > 0 {
		if ff, err = mw.CreateFormFile(formFieldPreviousProfile, formFilePreviousProfile); err != nil {
			return nil, err
		}
		_, _ = io.Copy(ff, bytes.NewReader(p.PreviousProfile))
	}
	if len(p.SampleTypeConfig) > 0 {
		if ff, err = mw.CreateFormFile(formFieldSampleTypeConfig, formFileSampleTypeConfig); err != nil {
			return nil, err
		}
		_ = json.NewEncoder(ff).Encode(p.SampleTypeConfig)
	}
	_ = mw.Close()
	p.RawData = b.Bytes()
	p.FormDataContentType = mw.FormDataContentType()
	return p.RawData, nil
}

func (p *RawProfile) loadPprofFromForm() error {
	boundary, err := form.ParseBoundary(p.FormDataContentType)
	if err != nil {
		return err
	}

	f, err := multipart.NewReader(bytes.NewReader(p.RawData), boundary).ReadForm(32 << 20)
	if err != nil {
		return err
	}
	defer func() {
		_ = f.RemoveAll()
	}()

	p.Profile, err = form.ReadField(f, formFieldProfile)
	if err != nil {
		return err
	}
	p.PreviousProfile, err = form.ReadField(f, formFieldPreviousProfile)
	if err != nil {
		return err
	}

	r, err := form.ReadField(f, formFieldSampleTypeConfig)
	if err != nil || r == nil {
		return err
	}
	var config map[string]*tree.SampleTypeConfig
	if err = json.Unmarshal(r, &config); err != nil {
		return err
	}
	p.SampleTypeConfig = config
	return nil
}
