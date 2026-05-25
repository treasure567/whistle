process.env.NODE_ENV = 'test';
process.env.PORT ??= '4998';
process.env.DATABASE_URL ??= 'postgresql://test:test@127.0.0.1:5432/whistle_test?schema=public';
process.env.REDIS_URL ??= 'redis://127.0.0.1:6379/15';
