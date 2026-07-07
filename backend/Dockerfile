# Run stage using a slim OpenJDK 17 runtime and pre-compiled JAR
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/panelgpt-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
