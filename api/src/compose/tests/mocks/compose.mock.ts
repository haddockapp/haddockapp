export const customBuildComposeConfig = `
version: '3'
services:
  fastapi:
    build: .
    ports:
      - "3000:3000"
    restart: always
`;

export const composeConfig = `
version: '3'
services:
  postgres:
    image: postgres:13-alpine
    restart: unless-stopped
    expose:
      - "5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: pgdb
    volumes:
      - postgres:/var/lib/postgresql/data
    ports:
      - "5432:5432"
volumes:
  postgres:
`;

export const fullComposeConfig = `
version: '3.8'
services:
  backend:
    image: node:16
    container_name: backend
    working_dir: /app
    volumes:
      - ./backend:/app
    command: npm start
    ports:
      - "8080:8080"
    depends_on:
      - database
    networks:
      - app-network
    environment:
      - NODE_ENV=development
    deploy:
      resources:
        limits:
          cpus: "0.50"    # Limite l'utilisation du CPU à 50%
          memory: "512M"  # Limite la mémoire à 512MB
    user: "1000:1000"      # Définit l'utilisateur avec UID 1000 et GID 1000
  database:
    image: postgres:13
    container_name: postgres-db
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network
    environment:
      - POSTGRES_USER=admin
      - POSTGRES_PASSWORD=secretpassword
      - POSTGRES_DB=mangadb
networks:
  app-network:
    driver: bridge
volumes:
  db-data:
`;
