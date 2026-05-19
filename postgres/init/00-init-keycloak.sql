-- Create Keycloak database and user
CREATE DATABASE keycloak;
CREATE USER keycloak WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;

-- Connect to keycloak database to set schema permissions
\c keycloak;

-- Grant schema permissions
ALTER DATABASE keycloak OWNER TO keycloak;
GRANT ALL ON SCHEMA public TO keycloak;
GRANT ALL ON ALL TABLES IN SCHEMA public TO keycloak;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO keycloak;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO keycloak;

-- Allow keycloak user to create tables
ALTER USER keycloak CREATEDB;
ALTER ROLE keycloak SUPERUSER;