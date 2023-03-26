module github.com/pyroscope-io/pyroscope

go 1.19

require (
	github.com/cespare/xxhash/v2 v2.1.2
	github.com/dgraph-io/badger/v2 v2.2007.2
	github.com/imdario/mergo v0.3.15
	github.com/mwitkow/go-conntrack v0.0.0-20190716064945-2f068394615f
	github.com/onsi/ginkgo/v2 v2.1.3
	github.com/onsi/gomega v1.17.0
	github.com/prometheus/client_golang v1.12.2
	github.com/sirupsen/logrus v1.8.1
	github.com/valyala/bytebufferpool v1.0.0
	golang.org/x/net v0.0.0-20220520000938-2e3eb7b945c2
	golang.org/x/oauth2 v0.0.0-20220223155221-ee480838109b
	google.golang.org/protobuf v1.28.0
	gopkg.in/yaml.v2 v2.4.0

)

require (
	github.com/DataDog/zstd v1.4.1 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/cespare/xxhash v1.1.0 // indirect
	github.com/dgraph-io/ristretto v0.1.0 // indirect
	github.com/dgryski/go-farm v0.0.0-20190423205320-6a90982ecee2 // indirect
	github.com/dustin/go-humanize v1.0.0 // indirect
	github.com/fsnotify/fsnotify v1.5.4 // indirect
	github.com/golang/glog v1.0.0 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/google/go-cmp v0.5.8 // indirect
	github.com/jpillora/backoff v1.0.0 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.2-0.20181231171920-c182affec369 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/prometheus/client_model v0.2.0 // indirect
	github.com/prometheus/common v0.34.0 // indirect
	github.com/prometheus/procfs v0.7.3 // indirect
	github.com/stretchr/testify v1.7.1 // indirect
	golang.org/x/sys v0.0.0-20220520151302-bc2c85ada10a // indirect
	golang.org/x/text v0.3.7 // indirect
	google.golang.org/appengine v1.6.6 // indirect
	gopkg.in/check.v1 v1.0.0-20201130134442-10cb98267c6c // indirect
)

replace github.com/mgechev/revive v1.0.3 => github.com/pyroscope-io/revive v1.0.6-0.20210330033039-4a71146f9dc1
