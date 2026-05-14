package com.example.decathlon_project.service;

import com.example.decathlon_project.exception.ResourceNotFoundException;
import com.example.decathlon_project.model.Reaction;
import com.example.decathlon_project.model.ReactionType;
import com.example.decathlon_project.model.TargetType;   // ✅ import direct
import com.example.decathlon_project.model.User;
import com.example.decathlon_project.repository.ReactionRepository;
import com.example.decathlon_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReactionService {

    private final ReactionRepository reactionRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggleReaction(Long userId, Long targetId, TargetType targetType) { // ✅
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", userId));

        Optional<Reaction> existing = reactionRepository
                .findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);

        if (existing.isPresent()) {
            reactionRepository.delete(existing.get());
            return false;
        } else {
            Reaction reaction = Reaction.builder()
                    .user(user)
                    .targetId(targetId)
                    .targetType(targetType)
                    .type(ReactionType.HEART)
                    .build();
            reactionRepository.save(reaction);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public long countReactions(Long targetId, TargetType targetType) { // ✅
        return reactionRepository.countByTargetIdAndTargetType(targetId, targetType);
    }

    @Transactional(readOnly = true)
    public boolean hasReacted(Long userId, Long targetId, TargetType targetType) { // ✅
        return reactionRepository
                .existsByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
    }

    @Transactional(readOnly = true)
    public List<Reaction> getReactions(Long targetId, TargetType targetType) { // ✅
        return reactionRepository.findByTargetIdAndTargetType(targetId, targetType);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReactionSummary(Long userId, Long targetId, TargetType targetType) { // ✅
        return Map.of(
                "count", countReactions(targetId, targetType),
                "hasReacted", hasReacted(userId, targetId, targetType)
        );
    }
}