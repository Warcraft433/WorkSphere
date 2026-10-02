# Build Stage
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first to cache them
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Run Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/worksphere-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080

# Environment variables to override in docker-compose or Kubernetes
ENV SPRING_PROFILES_ACTIVE=prod
ENV DB_URL=jdbc:mysql://mysql:3306/worksphere_db
ENV DB_USER=root
ENV DB_PASSWORD=root
ENV JWT_SECRET=YOUR_VERY_SECURE_SECRET_KEY_FOR_PROD_123

ENTRYPOINT ["java", "-jar", "app.jar"]
