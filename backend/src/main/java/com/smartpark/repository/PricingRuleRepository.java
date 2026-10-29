package com.smartpark.repository;

import com.smartpark.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {
    @Query("SELECT pr FROM PricingRule pr WHERE pr.active = true ORDER BY pr.effectiveFrom DESC LIMIT 1")
    Optional<PricingRule> findCurrentActiveRule();
}
