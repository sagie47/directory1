import fs from 'node:fs';
import path from 'node:path';

type StageKey = 'offer_view_to_cta' | 'cta_to_form_start' | 'form_start_to_submit' | 'submit_to_stripe';
type Status = 'critical' | 'warn' | 'ok' | 'insufficient_data' | 'not_applicable';

interface AlertRow {
  snapshotDate: string;
  offer: string;
  city: string;
  offerViewSessions7d: number;
  ctaClickSessions7d: number;
  formStartSessions7d: number;
  formSubmitSessions7d: number;
  stripeRedirectSessions7d: number;
  offerViewToCtaStatus: Status;
  ctaToFormStartStatus: Status;
  formStartToSubmitStatus: Status;
  submitToStripeStatus: Status;
  overallStatus: Status;
  runbookHint: string;
}

interface DailyRow {
  eventDay: string;
  offer: string;
  city: string;
  offerViewSessions: number;
  ctaClickSessions: number;
  formStartSessions: number;
  formSubmitSessions: number;
  stripeRedirectSessions: number;
}

interface StageDefinition {
  key: StageKey;
  label: string;
  statusField: keyof AlertRow;
}

interface ActionItem {
  priority: 'P1' | 'P2';
  trigger: string;
  offer: string;
  city: string;
  stage: string;
  owner: string;
  action: string;
  dueDate: string;
}

interface OwnersConfig {
  reportOwner: string;
  unknownCityOwner: string;
  cadenceDay: string;
  cadenceTime: string;
  cadenceTimezone: string;
  stageOwners: Record<StageKey, string>;
}

interface CliOptions {
  alertsPath: string;
  dailyPath?: string;
  previousAlertsPath?: string;
  outPath: string;
  ownerConfigPath?: string;
  maxSegments: number;
}

const STAGES: StageDefinition[] = [
  { key: 'offer_view_to_cta', label: 'View->CTA', statusField: 'offerViewToCtaStatus' },
  { key: 'cta_to_form_start', label: 'CTA->Start', statusField: 'ctaToFormStartStatus' },
  { key: 'form_start_to_submit', label: 'Start->Submit', statusField: 'formStartToSubmitStatus' },
  { key: 'submit_to_stripe', label: 'Submit->Stripe', statusField: 'submitToStripeStatus' },
];

const STAGE_ACTIONS: Record<StageKey, string> = {
  offer_view_to_cta: 'Audit traffic quality + offer-page CTA visibility and ship fix.',
  cta_to_form_start: 'Verify CTA routing/query params and investigate form load regressions.',
  form_start_to_submit: 'Review validation failures + backend submit errors and ship friction fix.',
  submit_to_stripe: 'Validate Stripe handoff configuration and redirect reliability.',
};

const DEFAULT_OWNERS: OwnersConfig = {
  reportOwner: 'Revenue Operations Lead',
  unknownCityOwner: 'Data Quality Lead',
  cadenceDay: 'Monday',
  cadenceTime: '09:00',
  cadenceTimezone: 'America/Vancouver',
  stageOwners: {
    offer_view_to_cta: 'Growth Marketing Lead',
    cta_to_form_start: 'Product Engineering Lead',
    form_start_to_submit: 'Forms Reliability Lead',
    submit_to_stripe: 'Payments Engineering Lead',
  },
};

const UNKNOWN_CITY_WARN_THRESHOLD = 0.2;
const UNKNOWN_CITY_CRITICAL_THRESHOLD = 0.3;

function usage() {
  return [
    'Usage:',
    '  tsx scripts/analytics/generate-weekly-operating-report.ts \\',
    '    --alerts <path-to-alerts-json> \\',
    '    [--daily <path-to-daily-json>] \\',
    '    [--previous-alerts <path-to-previous-alerts-json>] \\',
    '    [--owner-config <path-to-owner-config-json>] \\',
    '    [--max-segments <number>] \\',
    '    [--out <output-markdown-path>]',
    '',
    'Expected SAN-9 inputs:',
    '  - alerts: output rows from scripts/analytics/funnel_kpi_alerts_ga4.sql',
    '  - daily: output rows from scripts/analytics/funnel_kpi_daily_ga4.sql (optional)',
  ].join('\n');
}

function parseArgs(argv: string[]): CliOptions {
  let alertsPath = '';
  let dailyPath: string | undefined;
  let previousAlertsPath: string | undefined;
  let outPath = path.resolve('generated', 'ops', `weekly-operating-report-${formatDateUtc(new Date())}.md`);
  let ownerConfigPath: string | undefined;
  let maxSegments = 12;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if ((arg === '--alerts' || arg === '-a') && next) {
      alertsPath = next;
      i += 1;
      continue;
    }

    if (arg.startsWith('--alerts=')) {
      alertsPath = arg.slice('--alerts='.length);
      continue;
    }

    if ((arg === '--daily' || arg === '-d') && next) {
      dailyPath = next;
      i += 1;
      continue;
    }

    if (arg.startsWith('--daily=')) {
      dailyPath = arg.slice('--daily='.length);
      continue;
    }

    if ((arg === '--previous-alerts' || arg === '-p') && next) {
      previousAlertsPath = next;
      i += 1;
      continue;
    }

    if (arg.startsWith('--previous-alerts=')) {
      previousAlertsPath = arg.slice('--previous-alerts='.length);
      continue;
    }

    if ((arg === '--out' || arg === '-o') && next) {
      outPath = next;
      i += 1;
      continue;
    }

    if (arg.startsWith('--out=')) {
      outPath = arg.slice('--out='.length);
      continue;
    }

    if ((arg === '--owner-config' || arg === '-c') && next) {
      ownerConfigPath = next;
      i += 1;
      continue;
    }

    if (arg.startsWith('--owner-config=')) {
      ownerConfigPath = arg.slice('--owner-config='.length);
      continue;
    }

    if ((arg === '--max-segments' || arg === '-m') && next) {
      maxSegments = Number.parseInt(next, 10);
      i += 1;
      continue;
    }

    if (arg.startsWith('--max-segments=')) {
      maxSegments = Number.parseInt(arg.slice('--max-segments='.length), 10);
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      console.log(usage());
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}\n\n${usage()}`);
  }

  if (!alertsPath) {
    throw new Error(`Missing required --alerts argument.\n\n${usage()}`);
  }

  if (!Number.isFinite(maxSegments) || maxSegments <= 0) {
    throw new Error(`Invalid --max-segments value: ${String(maxSegments)}`);
  }

  return {
    alertsPath: path.resolve(alertsPath),
    dailyPath: dailyPath ? path.resolve(dailyPath) : undefined,
    previousAlertsPath: previousAlertsPath ? path.resolve(previousAlertsPath) : undefined,
    outPath: path.resolve(outPath),
    ownerConfigPath: ownerConfigPath ? path.resolve(ownerConfigPath) : undefined,
    maxSegments,
  };
}

function readJsonRows(filePath: string): Record<string, unknown>[] {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw) as unknown;

  if (Array.isArray(parsed)) {
    return parsed.filter(isRecord);
  }

  if (isRecord(parsed)) {
    const rows = parsed.rows;
    if (Array.isArray(rows)) {
      return rows.filter(isRecord);
    }

    const data = parsed.data;
    if (Array.isArray(data)) {
      return data.filter(isRecord);
    }
  }

  throw new Error(`Unsupported JSON shape in ${filePath}. Expected an array, { rows: [...] }, or { data: [...] }.`);
}

function loadOwners(configPath?: string): OwnersConfig {
  if (!configPath) {
    return DEFAULT_OWNERS;
  }

  const parsed = JSON.parse(fs.readFileSync(configPath, 'utf8')) as unknown;
  if (!isRecord(parsed)) {
    throw new Error(`Invalid owner config format in ${configPath}. Expected JSON object.`);
  }

  const stageOwnersRaw = isRecord(parsed.stageOwners) ? parsed.stageOwners : {};

  return {
    reportOwner: readString(parsed.reportOwner) ?? DEFAULT_OWNERS.reportOwner,
    unknownCityOwner: readString(parsed.unknownCityOwner) ?? DEFAULT_OWNERS.unknownCityOwner,
    cadenceDay: readString(parsed.cadenceDay) ?? DEFAULT_OWNERS.cadenceDay,
    cadenceTime: readString(parsed.cadenceTime) ?? DEFAULT_OWNERS.cadenceTime,
    cadenceTimezone: readString(parsed.cadenceTimezone) ?? DEFAULT_OWNERS.cadenceTimezone,
    stageOwners: {
      offer_view_to_cta: readString(stageOwnersRaw.offer_view_to_cta) ?? DEFAULT_OWNERS.stageOwners.offer_view_to_cta,
      cta_to_form_start: readString(stageOwnersRaw.cta_to_form_start) ?? DEFAULT_OWNERS.stageOwners.cta_to_form_start,
      form_start_to_submit: readString(stageOwnersRaw.form_start_to_submit) ?? DEFAULT_OWNERS.stageOwners.form_start_to_submit,
      submit_to_stripe: readString(stageOwnersRaw.submit_to_stripe) ?? DEFAULT_OWNERS.stageOwners.submit_to_stripe,
    },
  };
}

function normalizeAlertRows(rows: Record<string, unknown>[]): AlertRow[] {
  return rows.map((row) => ({
    snapshotDate: readString(row.snapshot_date) ?? readString(row.snapshotDate) ?? formatDateUtc(new Date()),
    offer: readString(row.offer) ?? 'unknown_offer',
    city: readString(row.city) ?? 'unknown',
    offerViewSessions7d: readNumber(row.offer_view_sessions_7d),
    ctaClickSessions7d: readNumber(row.cta_click_sessions_7d),
    formStartSessions7d: readNumber(row.form_start_sessions_7d),
    formSubmitSessions7d: readNumber(row.form_submit_sessions_7d),
    stripeRedirectSessions7d: readNumber(row.stripe_redirect_sessions_7d),
    offerViewToCtaStatus: normalizeStatus(readString(row.offer_view_to_cta_status)),
    ctaToFormStartStatus: normalizeStatus(readString(row.cta_to_form_start_status)),
    formStartToSubmitStatus: normalizeStatus(readString(row.form_start_to_submit_status)),
    submitToStripeStatus: normalizeStatus(readString(row.submit_to_stripe_status)),
    overallStatus: normalizeStatus(readString(row.overall_status)),
    runbookHint: readString(row.runbook_hint) ?? 'No action required.',
  }));
}

function normalizeDailyRows(rows: Record<string, unknown>[]): DailyRow[] {
  return rows.map((row) => ({
    eventDay: readString(row.event_day) ?? readString(row.eventDay) ?? formatDateUtc(new Date()),
    offer: readString(row.offer) ?? 'unknown_offer',
    city: readString(row.city) ?? 'unknown',
    offerViewSessions: readNumber(row.offer_view_sessions),
    ctaClickSessions: readNumber(row.cta_click_sessions),
    formStartSessions: readNumber(row.form_start_sessions),
    formSubmitSessions: readNumber(row.form_submit_sessions),
    stripeRedirectSessions: readNumber(row.stripe_redirect_sessions),
  }));
}

function normalizeStatus(value?: string): Status {
  const normalized = value?.trim().toLowerCase() ?? 'insufficient_data';
  if (
    normalized === 'critical'
    || normalized === 'warn'
    || normalized === 'ok'
    || normalized === 'insufficient_data'
    || normalized === 'not_applicable'
  ) {
    return normalized;
  }

  return 'insufficient_data';
}

function statusRank(status: Status): number {
  switch (status) {
    case 'critical':
      return 1;
    case 'warn':
      return 2;
    case 'insufficient_data':
      return 3;
    case 'ok':
      return 4;
    case 'not_applicable':
      return 5;
    default:
      return 6;
  }
}

function segmentKey(offer: string, city: string): string {
  return `${offer}::${city}`;
}

function pickPrimaryStage(row: AlertRow): StageKey | null {
  for (const stage of STAGES) {
    const status = row[stage.statusField] as Status;
    if (status === 'critical') {
      return stage.key;
    }
  }

  for (const stage of STAGES) {
    const status = row[stage.statusField] as Status;
    if (status === 'warn') {
      return stage.key;
    }
  }

  return null;
}

function summarizeHealth(rows: AlertRow[]): Status {
  if (rows.some((row) => row.overallStatus === 'critical')) {
    return 'critical';
  }

  if (rows.some((row) => row.overallStatus === 'warn')) {
    return 'warn';
  }

  if (rows.some((row) => row.overallStatus === 'insufficient_data')) {
    return 'insufficient_data';
  }

  return 'ok';
}

function sortRisk(rows: AlertRow[]): AlertRow[] {
  return [...rows].sort((a, b) => {
    const overallRank = statusRank(a.overallStatus) - statusRank(b.overallStatus);
    if (overallRank !== 0) {
      return overallRank;
    }

    return b.offerViewSessions7d - a.offerViewSessions7d;
  });
}

function formatPct(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return 'n/a';
  }

  return `${(value * 100).toFixed(1)}%`;
}

function safeRate(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return null;
  }

  return numerator / denominator;
}

function addDays(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  date.setUTCDate(date.getUTCDate() + days);
  return formatDateUtc(date);
}

function formatDateUtc(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatSignedPctDelta(current: number | null, previous: number | null): string {
  if (current === null || previous === null) {
    return 'n/a';
  }

  const delta = (current - previous) * 100;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}pp`;
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function buildActionItems(currentAlerts: AlertRow[], previousAlerts: AlertRow[], snapshotDate: string, owners: OwnersConfig): ActionItem[] {
  const previousBySegment = new Map<string, AlertRow>();
  for (const row of previousAlerts) {
    previousBySegment.set(segmentKey(row.offer, row.city), row);
  }

  const actions: ActionItem[] = [];

  for (const row of currentAlerts) {
    const stageKey = pickPrimaryStage(row);
    if (!stageKey) {
      continue;
    }

    const stageLabel = STAGES.find((stage) => stage.key === stageKey)?.label ?? stageKey;
    const previous = previousBySegment.get(segmentKey(row.offer, row.city));
    const repeatedWarn = row.overallStatus === 'warn'
      && Boolean(previous)
      && (previous?.overallStatus === 'warn' || previous?.overallStatus === 'critical');

    if (row.overallStatus === 'critical') {
      actions.push({
        priority: 'P1',
        trigger: 'Critical threshold breach',
        offer: row.offer,
        city: row.city,
        stage: stageLabel,
        owner: owners.stageOwners[stageKey],
        action: STAGE_ACTIONS[stageKey],
        dueDate: addDays(snapshotDate, 1),
      });
      continue;
    }

    if (repeatedWarn) {
      actions.push({
        priority: 'P2',
        trigger: 'Warn repeated 2+ weekly cycles',
        offer: row.offer,
        city: row.city,
        stage: stageLabel,
        owner: owners.stageOwners[stageKey],
        action: STAGE_ACTIONS[stageKey],
        dueDate: addDays(snapshotDate, 3),
      });
    }
  }

  return actions;
}

function buildOfferTrends(dailyRows: DailyRow[]): string[] {
  if (dailyRows.length === 0) {
    return ['No daily trend input provided.'];
  }

  const maxDay = dailyRows
    .map((row) => row.eventDay)
    .sort()
    .at(-1);

  if (!maxDay) {
    return ['No daily trend input provided.'];
  }

  const maxDate = new Date(`${maxDay}T00:00:00Z`);
  if (Number.isNaN(maxDate.getTime())) {
    return ['No daily trend input provided.'];
  }

  const offerMap = new Map<string, DailyRow[]>();
  for (const row of dailyRows) {
    if (!offerMap.has(row.offer)) {
      offerMap.set(row.offer, []);
    }
    offerMap.get(row.offer)?.push(row);
  }

  const lines = [
    '| Offer | View->CTA (last7) | Delta vs prev7 | Start->Submit (last7) | Delta vs prev7 | Submit->Stripe (last7) | Delta vs prev7 |',
    '|---|---:|---:|---:|---:|---:|---:|',
  ];

  for (const [offer, rows] of Array.from(offerMap.entries()).sort((a, b) => a[0].localeCompare(b[0]))) {
    const last7 = aggregateByWindow(rows, maxDate, 0, 6);
    const prev7 = aggregateByWindow(rows, maxDate, 7, 13);

    lines.push(
      `| ${offer} | ${formatPct(safeRate(last7.ctaClicks, last7.views))} | ${formatSignedPctDelta(safeRate(last7.ctaClicks, last7.views), safeRate(prev7.ctaClicks, prev7.views))} | ${formatPct(safeRate(last7.formSubmits, last7.formStarts))} | ${formatSignedPctDelta(safeRate(last7.formSubmits, last7.formStarts), safeRate(prev7.formSubmits, prev7.formStarts))} | ${formatPct(safeRate(last7.stripeRedirects, last7.formSubmits))} | ${formatSignedPctDelta(safeRate(last7.stripeRedirects, last7.formSubmits), safeRate(prev7.stripeRedirects, prev7.formSubmits))} |`,
    );
  }

  return lines;
}

function aggregateByWindow(rows: DailyRow[], maxDate: Date, startOffsetDays: number, endOffsetDays: number) {
  let views = 0;
  let ctaClicks = 0;
  let formStarts = 0;
  let formSubmits = 0;
  let stripeRedirects = 0;

  const start = new Date(maxDate);
  start.setUTCDate(maxDate.getUTCDate() - endOffsetDays);
  const end = new Date(maxDate);
  end.setUTCDate(maxDate.getUTCDate() - startOffsetDays);

  for (const row of rows) {
    const date = new Date(`${row.eventDay}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) {
      continue;
    }

    if (date < start || date > end) {
      continue;
    }

    views += row.offerViewSessions;
    ctaClicks += row.ctaClickSessions;
    formStarts += row.formStartSessions;
    formSubmits += row.formSubmitSessions;
    stripeRedirects += row.stripeRedirectSessions;
  }

  return {
    views,
    ctaClicks,
    formStarts,
    formSubmits,
    stripeRedirects,
  };
}

function computeUnknownCityShare(dailyRows: DailyRow[]) {
  const byDay = new Map<string, { unknownViews: number; totalViews: number }>();

  for (const row of dailyRows) {
    if (!byDay.has(row.eventDay)) {
      byDay.set(row.eventDay, { unknownViews: 0, totalViews: 0 });
    }

    const entry = byDay.get(row.eventDay);
    if (!entry) {
      continue;
    }

    entry.totalViews += row.offerViewSessions;
    if (row.city === 'unknown') {
      entry.unknownViews += row.offerViewSessions;
    }
  }

  const points = Array.from(byDay.entries())
    .map(([eventDay, values]) => ({
      eventDay,
      share: safeRate(values.unknownViews, values.totalViews),
    }))
    .filter((entry) => entry.share !== null)
    .sort((a, b) => a.eventDay.localeCompare(b.eventDay));

  const latest = points.at(-1);
  const prev = points.at(-8);

  return {
    latestDay: latest?.eventDay ?? null,
    latestShare: latest?.share ?? null,
    deltaVsPrevWeek: latest && prev && latest.share !== null && prev.share !== null
      ? latest.share - prev.share
      : null,
  };
}

function renderReport(
  currentAlerts: AlertRow[],
  previousAlerts: AlertRow[],
  dailyRows: DailyRow[],
  owners: OwnersConfig,
  options: CliOptions,
): string {
  const sortedRows = sortRisk(currentAlerts);
  const topSegments = sortedRows.slice(0, options.maxSegments);
  const snapshotDate = sortedRows[0]?.snapshotDate ?? formatDateUtc(new Date());
  const periodStart = addDays(snapshotDate, -6);
  const highestRisk = sortedRows[0];
  const highestRiskStageKey = highestRisk ? pickPrimaryStage(highestRisk) : null;
  const highestRiskStageLabel = STAGES.find((stage) => stage.key === highestRiskStageKey)?.label ?? 'n/a';
  const health = summarizeHealth(currentAlerts);
  const actions = buildActionItems(currentAlerts, previousAlerts, snapshotDate, owners);
  const offerTrends = buildOfferTrends(dailyRows);
  const unknownCity = computeUnknownCityShare(dailyRows);

  if (unknownCity.latestShare !== null && unknownCity.latestShare >= UNKNOWN_CITY_CRITICAL_THRESHOLD) {
    actions.push({
      priority: 'P1',
      trigger: `Unknown city share >= ${(UNKNOWN_CITY_CRITICAL_THRESHOLD * 100).toFixed(0)}%`,
      offer: 'all',
      city: 'unknown',
      stage: 'City Attribution',
      owner: owners.unknownCityOwner,
      action: 'Run city-attribution QA and patch missing city propagation in analytics events.',
      dueDate: addDays(snapshotDate, 2),
    });
  } else if (unknownCity.latestShare !== null && unknownCity.latestShare >= UNKNOWN_CITY_WARN_THRESHOLD) {
    actions.push({
      priority: 'P2',
      trigger: `Unknown city share >= ${(UNKNOWN_CITY_WARN_THRESHOLD * 100).toFixed(0)}%`,
      offer: 'all',
      city: 'unknown',
      stage: 'City Attribution',
      owner: owners.unknownCityOwner,
      action: 'Create data-quality task for city payload coverage and investigate top unknown sessions.',
      dueDate: addDays(snapshotDate, 5),
    });
  }

  actions.sort((a, b) => {
    if (a.priority !== b.priority) {
      return a.priority === 'P1' ? -1 : 1;
    }
    return a.offer.localeCompare(b.offer);
  });

  const lines: string[] = [];
  lines.push('# Weekly Operating Report (SAN-13)');
  lines.push('');
  lines.push('Generated from SAN-9 funnel KPI outputs.');
  lines.push('');
  lines.push('Period:');
  lines.push(`- Start date: \`${periodStart}\``);
  lines.push(`- End date: \`${snapshotDate}\``);
  lines.push(`- Snapshot date: \`${snapshotDate}\``);
  lines.push('');
  lines.push('Cadence and owner:');
  lines.push(`- Report owner: \`${owners.reportOwner}\``);
  lines.push(`- Weekly operating review: \`${owners.cadenceDay} ${owners.cadenceTime} ${owners.cadenceTimezone}\``);
  lines.push(`- Inputs freeze deadline: \`${addDays(snapshotDate, 1)} 08:00 ${owners.cadenceTimezone}\``);
  lines.push('');
  lines.push('## 1. Executive Summary');
  lines.push('');
  lines.push(`- Overall funnel health: \`${health}\``);
  lines.push(`- Highest-risk segment: \`${highestRisk ? `${highestRisk.offer} / ${highestRisk.city}` : 'n/a'}\``);
  lines.push(`- Primary issue stage: \`${highestRiskStageLabel}\``);
  lines.push(`- Actionable segments this cycle: \`${actions.length}\``);
  lines.push('');
  lines.push('## 2. Segment Scorecard (Offer x City)');
  lines.push('');
  lines.push('Source query:');
  lines.push('- `scripts/analytics/funnel_kpi_alerts_ga4.sql`');
  lines.push('');
  lines.push('| Offer | City | Overall | View->CTA | CTA->Start | Start->Submit | Submit->Stripe | Views (7d) | Runbook Hint |');
  lines.push('|---|---|---|---|---|---|---|---:|---|');
  for (const row of topSegments) {
    lines.push(
      `| ${row.offer} | ${row.city} | ${row.overallStatus} | ${row.offerViewToCtaStatus} | ${row.ctaToFormStartStatus} | ${row.formStartToSubmitStatus} | ${row.submitToStripeStatus} | ${row.offerViewSessions7d} | ${row.runbookHint} |`,
    );
  }
  if (topSegments.length === 0) {
    lines.push('| n/a | n/a | n/a | n/a | n/a | n/a | n/a | 0 | No rows in alert input. |');
  }
  lines.push('');
  lines.push('## 3. Trend Snapshot (Last 14 Days)');
  lines.push('');
  lines.push('Source query:');
  lines.push('- `scripts/analytics/funnel_kpi_daily_ga4.sql`');
  lines.push('');
  lines.push(...offerTrends);
  lines.push('');
  lines.push(`Unknown city share (${unknownCity.latestDay ?? 'n/a'}): \`${formatPct(unknownCity.latestShare)}\` (delta vs prior week: \`${formatSignedPctDelta(unknownCity.latestShare, unknownCity.latestShare !== null && unknownCity.deltaVsPrevWeek !== null ? unknownCity.latestShare - unknownCity.deltaVsPrevWeek : null)}\`)`);
  lines.push('');
  lines.push('## 4. Threshold-Driven Action Rules');
  lines.push('');
  lines.push('| Trigger | Threshold | Action | Default Owner | SLA |');
  lines.push('|---|---|---|---|---|');
  lines.push('| Critical stage status | `status = critical` | Open remediation ticket and triage in weekly ops review. | Stage owner | 1 day |');
  lines.push('| Persistent warn | `status = warn` in current and prior weekly cycle | Open remediation ticket with fix ETA. | Stage owner | 3 days |');
  lines.push(`| Unknown city share (warn) | \`>= ${(UNKNOWN_CITY_WARN_THRESHOLD * 100).toFixed(0)}%\` | Open data-quality task and instrument missing city payloads. | ${owners.unknownCityOwner} | 5 days |`);
  lines.push(`| Unknown city share (critical) | \`>= ${(UNKNOWN_CITY_CRITICAL_THRESHOLD * 100).toFixed(0)}%\` | Escalate to incident and patch attribution gaps. | ${owners.unknownCityOwner} | 2 days |`);
  lines.push('');
  lines.push('Stage owners:');
  lines.push(`- View->CTA: \`${owners.stageOwners.offer_view_to_cta}\``);
  lines.push(`- CTA->Start: \`${owners.stageOwners.cta_to_form_start}\``);
  lines.push(`- Start->Submit: \`${owners.stageOwners.form_start_to_submit}\``);
  lines.push(`- Submit->Stripe: \`${owners.stageOwners.submit_to_stripe}\``);
  lines.push('');
  lines.push('## 5. Action Items');
  lines.push('');
  lines.push('| Priority | Trigger | Segment | Stage | Owner | Due Date | Action |');
  lines.push('|---|---|---|---|---|---|---|');
  if (actions.length === 0) {
    lines.push('| P2 | No threshold breaches | n/a | n/a | n/a | n/a | Monitor only. |');
  } else {
    for (const action of actions) {
      lines.push(
        `| ${action.priority} | ${action.trigger} | ${action.offer} / ${action.city} | ${action.stage} | ${action.owner} | ${action.dueDate} | ${action.action} |`,
      );
    }
  }
  lines.push('');
  lines.push('## 6. Decision Log');
  lines.push('');
  lines.push('- Keep / change thresholds this week:');
  lines.push('- Offers/cities requiring launch gating:');
  lines.push('- Escalations required:');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const owners = loadOwners(options.ownerConfigPath);

  const currentAlerts = normalizeAlertRows(readJsonRows(options.alertsPath));
  const previousAlerts = options.previousAlertsPath
    ? normalizeAlertRows(readJsonRows(options.previousAlertsPath))
    : [];
  const dailyRows = options.dailyPath
    ? normalizeDailyRows(readJsonRows(options.dailyPath))
    : [];

  const output = renderReport(currentAlerts, previousAlerts, dailyRows, owners, options);
  fs.mkdirSync(path.dirname(options.outPath), { recursive: true });
  fs.writeFileSync(options.outPath, output, 'utf8');

  console.log(`Generated weekly operating report: ${options.outPath}`);
  console.log(`Current alert rows: ${currentAlerts.length}`);
  console.log(`Previous alert rows: ${previousAlerts.length}`);
  console.log(`Daily rows: ${dailyRows.length}`);
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}
