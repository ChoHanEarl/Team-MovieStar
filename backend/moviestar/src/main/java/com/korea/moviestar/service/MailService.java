package com.korea.moviestar.service;

import java.time.LocalDateTime;
import java.util.List;
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
        // 여러 개의 인증 요청이 있을 수 있으므로, List로 받아옵니다.
        List<MailVerificationEntity> entities = repository.findByEmail(email);

        // 인증 요청이 없으면 예외 처리
        if (entities.isEmpty()) {
            throw new RuntimeException("인증 요청이 없습니다.");
        }

        // 유효한 인증 요청을 찾아서 처리 (유효 기간이 아직 남아있는 요청)
        MailVerificationEntity entity = entities.stream()
                .filter(e -> e.getExpiresAt().isAfter(LocalDateTime.now())) // 만료되지 않은 요청만 필터링
                .findFirst() // 첫 번째 유효한 요청을 선택
                .orElseThrow(() -> new RuntimeException("유효한 인증 코드가 없습니다."));

        // 인증 코드가 일치하는지 확인
        if (!entity.getCode().equals(inputCode)) {
            throw new RuntimeException("인증 코드가 일치하지 않습니다.");
        }

        // 사용자가 존재하는지 확인
        UserEntity user = users.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자가 존재하지 않습니다."));

        // 사용자의 비밀번호를 인증 코드로 변경 (여기서는 예시로 코드와 비밀번호를 일치시키는 방식)
        user.setUserPwd(encoder.encode(inputCode));
        users.save(user);

        // 처리한 인증 요청 삭제
        repository.delete(entity);
        return true;
    }
    
    @Scheduled(cron = "0 0 0/1 * * *")
    public void clearVerification() {
    	repository.deleteExpiredEntities(LocalDateTime.now());
    }
    
    
}
