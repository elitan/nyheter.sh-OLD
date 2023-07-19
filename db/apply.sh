atlas schema apply \
  -u "postgres://postgres:password@:5432/srai?sslmode=disable" \
  --to file://schema.sql \
  --dev-url "docker://postgres/15/test" \