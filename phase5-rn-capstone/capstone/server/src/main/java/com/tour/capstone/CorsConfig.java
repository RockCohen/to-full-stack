package com.tour.capstone;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS(契约 §CORS)—— 立法在服务端,执法在浏览器。
 * TODO(你写):把 allowedOriginProfiles 收紧成 Web 的真实来源列表;
 * RN 端无源,不受 CORS 管——这里的配置只服务浏览器。
 */
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:5173", "http://localhost:4173")
                        .allowedMethods("GET", "POST")
                        // 进阶任务:加 "OPTIONS" 秒回与 Idempotency-Key 请求头放行
                        .allowedHeaders("Content-Type", "Idempotency-Key");
            }
        };
    }
}
