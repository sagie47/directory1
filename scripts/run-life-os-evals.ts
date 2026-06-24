import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildEvalReport } from '@/src/lib/lifeOsEvalEngine';
import { LIFE_OS_EVAL_FIXTURES } from '@/src/lib/lifeOsEvalFixtures';

interface ImprovementArtifact {
  generatedAt: string;
  topRecurringBlockers: string[];
  capabilityUpgradeRecommendation: string | null;
  promotedSkills: string[];
  decayedSkills: string[];
  campaignLoopTrend: 'improving' | 'flat_or_declining';
}

const ARTIFACT_ROOT = path.resolve('artifacts/life-os');
const LATEST_REPORT_PATH = path.join(ARTIFACT_ROOT, 'latest-eval-report.json');
const LATEST_IMPROVEMENT_PATH = path.join(ARTIFACT_ROOT, 'latest-improvement-artifacts.json');

function toImprovementArtifact(report: ReturnType<typeof buildEvalReport>): ImprovementArtifact {
  return {
    generatedAt: report.generatedAt,
    topRecurringBlockers: report.topRecurringBlockers.slice(0, 3).map((blocker) => blocker.blockerId),
    capabilityUpgradeRecommendation: report.summary.topCapabilityUpgrade,
    promotedSkills: report.skillHealth.filter((skill) => skill.trend === 'promote').map((skill) => skill.skillId),
    decayedSkills: report.skillHealth.filter((skill) => skill.trend === 'decay').map((skill) => skill.skillId),
    campaignLoopTrend: report.summary.campaignLoopTrend
  };
}

async function persistEvalArtifacts(): Promise<void> {
  const report = buildEvalReport(LIFE_OS_EVAL_FIXTURES);
  const timestampSlug = report.generatedAt.replaceAll(':', '-');
  const historicalReportPath = path.join(ARTIFACT_ROOT, `eval-report-${timestampSlug}.json`);
  const historicalImprovementPath = path.join(ARTIFACT_ROOT, `improvement-artifacts-${timestampSlug}.json`);

  const improvementArtifact = toImprovementArtifact(report);

  await mkdir(ARTIFACT_ROOT, { recursive: true });

  const writes = [
    writeFile(LATEST_REPORT_PATH, JSON.stringify(report, null, 2)),
    writeFile(historicalReportPath, JSON.stringify(report, null, 2)),
    writeFile(LATEST_IMPROVEMENT_PATH, JSON.stringify(improvementArtifact, null, 2)),
    writeFile(historicalImprovementPath, JSON.stringify(improvementArtifact, null, 2))
  ];

  await Promise.all(writes);

  console.log(`Saved report to ${LATEST_REPORT_PATH}`);
  console.log(`Saved improvement artifacts to ${LATEST_IMPROVEMENT_PATH}`);
  console.log(`Top recurring blocker: ${report.summary.mostRecurringBlocker ?? 'none'}`);
  console.log(`Recommended capability upgrade: ${report.summary.topCapabilityUpgrade ?? 'none'}`);
}

persistEvalArtifacts().catch((error: unknown) => {
  console.error('Failed to run Life OS eval artifacts generation.', error);
  process.exitCode = 1;
});
