FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /workspace/app

COPY . .

RUN mvn clean install -DskipTests

RUN mkdir -p target/dependency && (cd target/dependency; jar -xf ../target/DocumentDatabaseService.jar)


FROM openjdk:17-jdk-slim
VOLUME /tmp

WORKDIR /app

COPY --from=build /workspace/app/target/dependency/BOOT-INF/lib /app/lib
COPY --from=build /workspace/app/target/dependency/META-INF /app/META-INF
COPY --from=build /workspace/app/target/dependency/BOOT-INF/classes /app


EXPOSE 9040

ENTRYPOINT ["java", "-cp", "app:app/lib/*", "rs.ac.uns.acs.nais.DocumentDatabaseService.DocumentDatabaseServiceApplication"]
