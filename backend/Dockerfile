# Run stage using Eclipse Temurin JRE 17 (official OpenJDK replacement)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY target/panelgpt-backend-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
