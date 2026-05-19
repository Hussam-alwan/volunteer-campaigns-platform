# First stage: Build the application
FROM maven:3.9.4-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy only the pom.xml first to cache dependencies
COPY pom.xml .
# Download dependencies (cached unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Now copy the source files and package the application
COPY src ./src
RUN mvn clean package -DskipTests

# Second stage: Create a smaller image with only the JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/impact-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]