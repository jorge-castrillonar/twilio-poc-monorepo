# Stage 1: Build
FROM maven:3.9.5-eclipse-temurin-17 AS builder

WORKDIR /build

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/target/*.jar app.jar

# Copy RSA keys
COPY keys/private_key.pem /app/keys/private_key.pem
COPY keys/public_key.pem /app/keys/public_key.pem

# Create non-root user
RUN addgroup -S spring && adduser -S spring -G spring
RUN chown -R spring:spring /app
USER spring:spring

# Expose port
EXPOSE 8085

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8085/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
