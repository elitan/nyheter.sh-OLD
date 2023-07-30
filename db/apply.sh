atlas schema apply \
  -u "postgres://elitan:nI2UokMqE8Wa@ep-fragrant-dew-970345.eu-central-1.aws.neon.tech/srai?sslmode=require" \
  --to file://schema.sql \
  --dev-url "docker://postgres/15/test" \