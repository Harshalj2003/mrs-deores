# ---------- Build Stage ----------
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests


# ---------- Run Stage ----------
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

# Create persistent upload directory with write permissions
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.jar"]
