package com.example.ArcadeHub.controller;

import com.example.ArcadeHub.entity.User;
import com.example.ArcadeHub.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody User user){
        userService.registerUser(user);
        return "User registered successfully!";
    }

    @PostMapping("/login")
    public User login(@RequestBody User user){
        User existingUser=userService.findByEmail(user.getEmail());

        if(existingUser!=null && existingUser.getPassword().equals(user.getPassword())){
            return existingUser;
        }else{
            return null;
        }
    }
}
