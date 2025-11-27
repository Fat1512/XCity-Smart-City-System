package com.tpd.XCity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
public class XCityApplication {

	public static void main(String[] args) {
		SpringApplication.run(XCityApplication.class, args);
	}

}
