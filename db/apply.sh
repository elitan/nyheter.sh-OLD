# atlas schema apply \
#   -u "postgres://postgres:password@localhost/nyheter?sslmode=disable" \
#   --to file://schema.sql \
#   --dev-url "docker://postgres/15/test" \

atlas schema apply \
  -u "postgres://postgres:password@ai:9001/postgres?sslmode=disable" \
  --to file://schema.sql \
  --dev-url "docker://postgres/15/test" \