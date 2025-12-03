FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests=true

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=build /app/target/XCity-0.0.1-SNAPSHOT.jar ./XCity.jar

EXPOSE 8090
ENTRYPOINT ["java", "-jar", "XCity.jar"]