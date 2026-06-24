import type { EvalFixture } from '@/src/lib/lifeOsEvalFixtures';

export interface EvalMetricSet {
  loopClosureRate: number;
  unnecessaryQuestionRate: number;
  approvalCorrectnessRate: number;
  memoryUsefulnessRate: number;
  interventionUsefulnessRate: number;
  blockerRecurrenceRate: number;
}

export interface CapabilityProposal {
  capabilityGap: string;
  evidenceCount: number;
  recurringEvidenceCount: number;
  averageSeverity: number;
  impactedScenarios: string[];
  recommendationScore: number;
}

export interface SkillHealth {
  skillId: string;
  successRate: number;
  totalAttempts: number;
  trend: 'promote' | 'decay' | 'maintain';
}

export interface EvalReport {
  generatedAt: string;
  fixtureCount: number;
  metrics: EvalMetricSet;
  topRecurringBlockers: Array<{
    blockerId: string;
    blockerLabel: string;
    count: number;
    recurringCount: number;
  }>;
  capabilityProposals: CapabilityProposal[];
  skillHealth: SkillHealth[];
  summary: {
    mostRecurringBlocker: string | null;
    topCapabilityUpgrade: string | null;
    campaignLoopTrend: 'improving' | 'flat_or_declining';
  };
}

const DECIMAL_PRECISION = 4;

function safeRate(numerator: number, denominator: number): number {
  if (denominator <= 0) {
    return 0;
  }

  return Number((numerator / denominator).toFixed(DECIMAL_PRECISION));
}

export function computeEvalMetrics(fixtures: EvalFixture[]): EvalMetricSet {
  const totals = fixtures.reduce(
    (acc, fixture) => {
      acc.totalLoops += fixture.totalLoops;
      acc.closedLoops += fixture.closedLoops;
      acc.questionsAsked += fixture.questionsAsked;
      acc.unnecessaryQuestions += fixture.unnecessaryQuestions;
      acc.approvalDecisions += fixture.approvalDecisions;
      acc.approvalsCorrect += fixture.approvalsCorrect;
      acc.memoryLookups += fixture.memoryLookups;
      acc.helpfulMemoryRecalls += fixture.helpfulMemoryRecalls;
      acc.interventions += fixture.interventions;
      acc.successfulInterventions += fixture.successfulInterventions;
      acc.totalBlockers += fixture.blockers.length;
      acc.recurringBlockers += fixture.blockers.filter((blocker) => blocker.recurred).length;

      return acc;
    },
    {
      totalLoops: 0,
      closedLoops: 0,
      questionsAsked: 0,
      unnecessaryQuestions: 0,
      approvalDecisions: 0,
      approvalsCorrect: 0,
      memoryLookups: 0,
      helpfulMemoryRecalls: 0,
      interventions: 0,
      successfulInterventions: 0,
      totalBlockers: 0,
      recurringBlockers: 0
    }
  );

  return {
    loopClosureRate: safeRate(totals.closedLoops, totals.totalLoops),
    unnecessaryQuestionRate: safeRate(totals.unnecessaryQuestions, totals.questionsAsked),
    approvalCorrectnessRate: safeRate(totals.approvalsCorrect, totals.approvalDecisions),
    memoryUsefulnessRate: safeRate(totals.helpfulMemoryRecalls, totals.memoryLookups),
    interventionUsefulnessRate: safeRate(totals.successfulInterventions, totals.interventions),
    blockerRecurrenceRate: safeRate(totals.recurringBlockers, totals.totalBlockers)
  };
}

export function rankCapabilityProposals(fixtures: EvalFixture[]): CapabilityProposal[] {
  const proposals = new Map<string, CapabilityProposal>();

  fixtures.forEach((fixture) => {
    fixture.blockers.forEach((blocker) => {
      const existing = proposals.get(blocker.capabilityGap);
      const recurringDelta = blocker.recurred ? 1 : 0;

      if (!existing) {
        proposals.set(blocker.capabilityGap, {
          capabilityGap: blocker.capabilityGap,
          evidenceCount: 1,
          recurringEvidenceCount: recurringDelta,
          averageSeverity: blocker.severity,
          impactedScenarios: [fixture.scenario],
          recommendationScore: 0
        });
        return;
      }

      const totalSeverity = (existing.averageSeverity * existing.evidenceCount) + blocker.severity;
      existing.evidenceCount += 1;
      existing.recurringEvidenceCount += recurringDelta;
      existing.averageSeverity = Number((totalSeverity / existing.evidenceCount).toFixed(DECIMAL_PRECISION));

      if (!existing.impactedScenarios.includes(fixture.scenario)) {
        existing.impactedScenarios.push(fixture.scenario);
      }
    });
  });

  const ranked = Array.from(proposals.values()).map((proposal) => {
    const recurrenceWeight = safeRate(proposal.recurringEvidenceCount, Math.max(proposal.evidenceCount, 1));
    const impactWeight = safeRate(proposal.impactedScenarios.length, fixtures.length || 1);

    proposal.recommendationScore = Number((
      (proposal.averageSeverity * 0.45) +
      (recurrenceWeight * 0.35) +
      (impactWeight * 0.2)
    ).toFixed(DECIMAL_PRECISION));

    return proposal;
  });

  return ranked.sort((a, b) => {
    if (b.recommendationScore !== a.recommendationScore) {
      return b.recommendationScore - a.recommendationScore;
    }

    return b.recurringEvidenceCount - a.recurringEvidenceCount;
  });
}

export function deriveSkillHealth(fixtures: EvalFixture[]): SkillHealth[] {
  const skillMap = new Map<string, { successfulUses: number; failedUses: number }>();

  fixtures.forEach((fixture) => {
    fixture.skills.forEach((skill) => {
      const existing = skillMap.get(skill.skillId) ?? { successfulUses: 0, failedUses: 0 };
      existing.successfulUses += skill.successfulUses;
      existing.failedUses += skill.failedUses;
      skillMap.set(skill.skillId, existing);
    });
  });

  const health: SkillHealth[] = Array.from(skillMap.entries()).map(([skillId, stats]) => {
    const totalAttempts = stats.successfulUses + stats.failedUses;
    const successRate = safeRate(stats.successfulUses, totalAttempts);

    let trend: SkillHealth['trend'] = 'maintain';
    if (totalAttempts >= 5 && successRate >= 0.75) {
      trend = 'promote';
    } else if (totalAttempts >= 4 && successRate <= 0.45) {
      trend = 'decay';
    }

    return {
      skillId,
      successRate,
      totalAttempts,
      trend
    };
  });

  return health.sort((a, b) => {
    if (a.trend === b.trend) {
      return b.successRate - a.successRate;
    }

    const trendPriority: Record<SkillHealth['trend'], number> = {
      promote: 0,
      maintain: 1,
      decay: 2
    };

    return trendPriority[a.trend] - trendPriority[b.trend];
  });
}

export function buildEvalReport(fixtures: EvalFixture[], generatedAt = new Date().toISOString()): EvalReport {
  const metrics = computeEvalMetrics(fixtures);
  const capabilityProposals = rankCapabilityProposals(fixtures);
  const skillHealth = deriveSkillHealth(fixtures);

  const blockerCountMap = new Map<string, { blockerLabel: string; count: number; recurringCount: number }>();
  fixtures.forEach((fixture) => {
    fixture.blockers.forEach((blocker) => {
      const current = blockerCountMap.get(blocker.blockerId) ?? {
        blockerLabel: blocker.blockerLabel,
        count: 0,
        recurringCount: 0
      };

      current.count += 1;
      if (blocker.recurred) {
        current.recurringCount += 1;
      }

      blockerCountMap.set(blocker.blockerId, current);
    });
  });

  const topRecurringBlockers = Array.from(blockerCountMap.entries())
    .map(([blockerId, value]) => ({ blockerId, ...value }))
    .sort((a, b) => {
      if (b.recurringCount !== a.recurringCount) {
        return b.recurringCount - a.recurringCount;
      }

      return b.count - a.count;
    });

  return {
    generatedAt,
    fixtureCount: fixtures.length,
    metrics,
    topRecurringBlockers,
    capabilityProposals,
    skillHealth,
    summary: {
      mostRecurringBlocker: topRecurringBlockers[0]?.blockerId ?? null,
      topCapabilityUpgrade: capabilityProposals[0]?.capabilityGap ?? null,
      campaignLoopTrend: metrics.loopClosureRate >= 0.6 && metrics.interventionUsefulnessRate >= 0.55
        ? 'improving'
        : 'flat_or_declining'
    }
  };
}
