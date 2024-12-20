package com.korea.moviestar.service;

import java.time.LocalDateTime;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.korea.moviestar.entity.MailVerificationEntity;
import com.korea.moviestar.entity.UserEntity;
import com.korea.moviestar.repo.MailVerificationRepository;
import com.korea.moviestar.repo.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class MailService {
	private final JavaMailSender emailSender;
	private final MailVerificationRepository repository;
	private final UserRepository users;

    public void sendEmail(String toEmail,
                          String title,
                          String text) {
        SimpleMailMessage emailForm = createEmailForm(toEmail, title, text);
        try {
            emailSender.send(emailForm);
        } catch (RuntimeException e) {
            log.debug("MailService.sendEmail exception occur toEmail: {}, " +
                    "title: {}, text: {}", toEmail, title, text);
            throw new RuntimeException("이메일 발송에 실패하였습니다.");
        }
    }

    // 발신할 이메일 데이터 세팅
    private SimpleMailMessage createEmailForm(String toEmail,
                                             String title,
                                             String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(title);
        message.setText(text);

        return message;
    }
    
    public void sendVerificationCode(String email) {
    	if(!users.existsByUserEmail(email)) {
    		throw new RuntimeException("존재하지 않는 이메일입니다");
    	}
    	
        String code = Integer.toString((int)(Math.random() * 900000) + 100000);
        
        MailVerificationEntity entity = MailVerificationEntity.builder()
        		.code(code)
        		.email(email)
        		.expiresAt(LocalDateTime.now().plusMinutes(10))
        		.build();
        repository.save(entity);
        
        String message = "이메일 인증을 위해 아래 코드를 입력하세요\n(보내주신 코드는 임시 비밀번호로 사용됩니다):\n\n" + code;
        sendEmail(email, "이메일 인증 코드", message);
    }
    
    public boolean verifyCode(String email, String inputCode, PasswordEncoder encoder) {
        MailVerificationEntity entity = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("인증 요청이 없습니다."));

        if (entity.getExpiresAt().isBefore(LocalDateTime.now())) {
        	repository.delete(entity);
            throw new RuntimeException("인증 코드가 만료되었습니다.");
        }

        if (!entity.getCode().equals(inputCode)) {
            throw new RuntimeException("인증 코드가 일치하지 않습니다.");
        }
        
        UserEntity user = users.findByUserEmail(email).get();
        user.setUserPwd(encoder.encode(inputCode));
        users.save(user);
        
        repository.delete(entity);
        return true;
    }
    
    @Scheduled(cron = "0 0 0/1 * * *")
    public void clearVerification() {
    	repository.deleteExpiredEntities(LocalDateTime.now());
    }
    
    
}
