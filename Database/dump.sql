CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  identity varchar(64),
  key varchar(36),
  last_trigger timestamp);
