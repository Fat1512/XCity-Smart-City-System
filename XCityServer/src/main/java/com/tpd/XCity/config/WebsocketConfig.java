/*
 * -----------------------------------------------------------------------------
 * Copyright 2025 Fenwick Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -----------------------------------------------------------------------------
 */
package com.tpd.XCity.config;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.converter.*;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

import java.util.List;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {
    private final ObjectMapper objectMapper;
    @Value(value = "${app.client-url}")
    private String clientUrl;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/user", "/topic");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/api/v1/ws")
                .setAllowedOrigins("http://localhost:5173", "https://xcity.tanle.site")
                .withSockJS();
    }

    @Bean
    public ThreadPoolTaskExecutor clientInboundExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(10); // Minimum threads
        executor.setMaxPoolSize(50); // Maximum threads
        executor.setQueueCapacity(100); // Queue for pending tasks
        executor.setThreadNamePrefix("ClientInbound-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy()); // Handle rejected tasks
        executor.initialize();
        return executor;
    }

//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        registration.taskExecutor(clientInboundExecutor());
//        registration.interceptors(new ChannelInterceptor() {
//            @Override
//            public Message<?> preSend(Message<?> message, MessageChannel channel) {
//                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
//                try {
//                    if (StompCommand.CONNECT.equals(accessor.getCommand())
//                            || StompCommand.SUBSCRIBE.equals(accessor.getCommand())
//                            || StompCommand.SEND.equals(accessor.getCommand())) {
//                        String token = accessor.getFirstNativeHeader("Authorization");
//                        if (token == null) {
//                            return createErrorMessage(accessor, "Empty token!");
//                        }
//                        token = jwtService.extractToken(token);
//                        if (jwtService.validateToken(token)) {
//                            String username = jwtService.extractUsername(token);
//                            String uuid = jwtService.extractUuid(token);
//                            Token redisToken = tokenService.get(uuid);
//
//                            if (redisToken == null) {
//                                return createErrorMessage(accessor, "Token not existed");
//                            }
//
//                            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
//                            if (userDetails != null) {
//                                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
//                                        userDetails, null, userDetails.getAuthorities());
//                                accessor.setUser(authToken);
//
//                                // IMPORTANT: build new message with updated headers
//                                return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
//                            } else {
//                                return createErrorMessage(accessor, "User doesn't exist");
//                            }
//                        } else {
//                            return createErrorMessage(accessor, "Invalid token");
//                        }
//                    }
//                    return message;
//                } catch (Exception e) {
//                    System.out.format("Error processing STOMP message: {}", e.getMessage(), e);
//                    return createErrorMessage(accessor, "Internal server error");
//                }
//            }
//        });
//    }

    private Message<?> createErrorMessage(StompHeaderAccessor accessor, String errorMessage) {
        StompHeaderAccessor errorAccessor = StompHeaderAccessor.create(StompCommand.ERROR);
        errorAccessor.setMessage(errorMessage);
        errorAccessor.setSessionId(accessor.getSessionId());
        return MessageBuilder.createMessage(new byte[0], errorAccessor.getMessageHeaders());
    }

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(this.objectMapper);
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);
        converter.setContentTypeResolver(resolver);
        messageConverters.add(new StringMessageConverter());
        messageConverters.add(new ByteArrayMessageConverter());
        messageConverters.add(converter);

        return false;
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(100240 * 10240);
        registry.setSendBufferSizeLimit(100240 * 10240);
        registry.setSendTimeLimit(20000);
    }


}
