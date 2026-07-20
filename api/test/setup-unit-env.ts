process.env.DATABASE_URL ??=
  'postgresql://ci:ci@127.0.0.1:5432/ci?schema=public'
process.env.NODE_ENV ??= 'test'
