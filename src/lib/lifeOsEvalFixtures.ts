export type EvalFixtureScenario =
  | 'health_performance'
  | 'work_income'
  | 'relationships_networking'
  | 'stalled_loops'
  | 'contradictory_requests';

export interface BlockerEvidence {
  blockerId: string;
  blockerLabel: string;
  capabilityGap: string;
  severity: number;
  recurred: boolean;
}

export interface SkillUseEvidence {
  skillId: string;
  successfulUses: number;
  failedUses: number;
}

export interface EvalFixture {
  id: string;
  scenario: EvalFixtureScenario;
  goals: string[];
  totalLoops: number;
  closedLoops: number;
  questionsAsked: number;
  unnecessaryQuestions: number;
  approvalDecisions: number;
  approvalsCorrect: number;
  memoryLookups: number;
  helpfulMemoryRecalls: number;
  interventions: number;
  successfulInterventions: number;
  blockers: BlockerEvidence[];
  skills: SkillUseEvidence[];
}

export const LIFE_OS_EVAL_FIXTURES: EvalFixture[] = [
  {
    id: 'fixture-health-performance',
    scenario: 'health_performance',
    goals: ['Increase weekly exercise consistency', 'Improve sleep timing'],
    totalLoops: 9,
    closedLoops: 6,
    questionsAsked: 18,
    unnecessaryQuestions: 3,
    approvalDecisions: 5,
    approvalsCorrect: 4,
    memoryLookups: 8,
    helpfulMemoryRecalls: 6,
    interventions: 7,
    successfulInterventions: 5,
    blockers: [
      {
        blockerId: 'calendar-friction',
        blockerLabel: 'Calendar friction for workout scheduling',
        capabilityGap: 'calendar_orchestration',
        severity: 0.8,
        recurred: true
      },
      {
        blockerId: 'sleep-plan-drift',
        blockerLabel: 'Bedtime plan drifts after evening meetings',
        capabilityGap: 'circadian_routine_adjustment',
        severity: 0.62,
        recurred: false
      }
    ],
    skills: [
      { skillId: 'habit-planning', successfulUses: 5, failedUses: 1 },
      { skillId: 'nutrition-basics', successfulUses: 2, failedUses: 2 }
    ]
  },
  {
    id: 'fixture-work-income',
    scenario: 'work_income',
    goals: ['Ship proposal faster', 'Improve lead follow-up cadence'],
    totalLoops: 11,
    closedLoops: 7,
    questionsAsked: 22,
    unnecessaryQuestions: 4,
    approvalDecisions: 6,
    approvalsCorrect: 5,
    memoryLookups: 10,
    helpfulMemoryRecalls: 7,
    interventions: 9,
    successfulInterventions: 6,
    blockers: [
      {
        blockerId: 'inbox-overload',
        blockerLabel: 'Inbox overload hides high-value leads',
        capabilityGap: 'email_prioritization',
        severity: 0.84,
        recurred: true
      },
      {
        blockerId: 'proposal-fragmentation',
        blockerLabel: 'Proposal artifacts are scattered across tools',
        capabilityGap: 'artifact_consolidation',
        severity: 0.73,
        recurred: true
      }
    ],
    skills: [
      { skillId: 'pipeline-prioritization', successfulUses: 6, failedUses: 1 },
      { skillId: 'meeting-prep', successfulUses: 2, failedUses: 3 }
    ]
  },
  {
    id: 'fixture-relationships-networking',
    scenario: 'relationships_networking',
    goals: ['Reduce missed follow-ups', 'Increase meaningful check-ins'],
    totalLoops: 8,
    closedLoops: 5,
    questionsAsked: 14,
    unnecessaryQuestions: 2,
    approvalDecisions: 4,
    approvalsCorrect: 3,
    memoryLookups: 9,
    helpfulMemoryRecalls: 8,
    interventions: 6,
    successfulInterventions: 4,
    blockers: [
      {
        blockerId: 'context-loss',
        blockerLabel: 'Loses relationship context between sessions',
        capabilityGap: 'relationship_memory_synthesis',
        severity: 0.78,
        recurred: true
      },
      {
        blockerId: 'timing-mismatch',
        blockerLabel: 'Outreach timing mismatches recipient preferences',
        capabilityGap: 'timing_personalization',
        severity: 0.64,
        recurred: false
      }
    ],
    skills: [
      { skillId: 'follow-up-cadence', successfulUses: 4, failedUses: 1 },
      { skillId: 'conversation-briefing', successfulUses: 3, failedUses: 1 }
    ]
  },
  {
    id: 'fixture-stalled-loops',
    scenario: 'stalled_loops',
    goals: ['Restart dormant campaigns', 'Clear dependency bottlenecks'],
    totalLoops: 12,
    closedLoops: 6,
    questionsAsked: 20,
    unnecessaryQuestions: 6,
    approvalDecisions: 7,
    approvalsCorrect: 4,
    memoryLookups: 7,
    helpfulMemoryRecalls: 4,
    interventions: 10,
    successfulInterventions: 5,
    blockers: [
      {
        blockerId: 'dependency-uncertainty',
        blockerLabel: 'Unclear owner for pending dependencies',
        capabilityGap: 'dependency_mapping',
        severity: 0.89,
        recurred: true
      },
      {
        blockerId: 'inbox-overload',
        blockerLabel: 'Inbox overload hides high-value leads',
        capabilityGap: 'email_prioritization',
        severity: 0.77,
        recurred: true
      }
    ],
    skills: [
      { skillId: 'dependency-resolution', successfulUses: 2, failedUses: 4 },
      { skillId: 'campaign-reset', successfulUses: 3, failedUses: 2 }
    ]
  },
  {
    id: 'fixture-contradictory-requests',
    scenario: 'contradictory_requests',
    goals: ['Resolve conflicting constraints with fewer retries'],
    totalLoops: 7,
    closedLoops: 4,
    questionsAsked: 17,
    unnecessaryQuestions: 5,
    approvalDecisions: 5,
    approvalsCorrect: 3,
    memoryLookups: 6,
    helpfulMemoryRecalls: 3,
    interventions: 8,
    successfulInterventions: 4,
    blockers: [
      {
        blockerId: 'constraint-conflict',
        blockerLabel: 'Conflicting constraints are not surfaced early',
        capabilityGap: 'constraint_resolution',
        severity: 0.91,
        recurred: true
      },
      {
        blockerId: 'proposal-fragmentation',
        blockerLabel: 'Proposal artifacts are scattered across tools',
        capabilityGap: 'artifact_consolidation',
        severity: 0.69,
        recurred: false
      }
    ],
    skills: [
      { skillId: 'constraint-clarification', successfulUses: 2, failedUses: 4 },
      { skillId: 'approval-routing', successfulUses: 3, failedUses: 2 }
    ]
  }
];
