package com.korea.moviestar.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {
	@GetMapping("/")
	public String healthCheck() {
		return "The service is up and running...";
	}
}
