# 多阶段构建(阶段 4 的手艺,原样平移到 Java):
#   build 阶段 maven 打包(依赖清单先拷,层缓存友好)
#   runtime 阶段只留 JRE + jar
# TODO(M4,你写):补 .dockerignore(target/、.git);把 -DskipTests 换成真实测试门禁。
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
