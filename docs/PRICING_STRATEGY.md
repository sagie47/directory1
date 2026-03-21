# Pricing Strategy: Okanagan Trades Directory

## Scope
Pricing strategy for the trades directory and business-side offers (`Claim`, `Verified`, lead capture, growth services), designed for local contractors in the Okanagan.

## What Changed From Discussion
- Keep pricing simple for launch and email campaigns.
- Tie paid upgrades to claim-flow quality gates (do not scale pricing before claim reliability is stable).
- Separate `based in city` from `serves area` in both ranking and packaging.

## 1) Value Delivered

### Core value proposition
- Help homeowners find trustworthy local trades faster.
- Help trade businesses get more qualified local demand with less admin.
- Provide verified trust signals and cleaner profile control after claim approval.

### Customer alternatives and implicit costs
- `Google Local Services Ads`: pay per lead, budget and lead cost volatility.
- `Yelp Ads`: pay per click, variable CPC and less outcome predictability.
- `Bark`: credit-based lead purchase with per-lead credit spend.
- Doing nothing: inconsistent visibility, missed calls, and slow follow-up.

### Quantifiable outcomes to anchor pricing
- One additional booked small job/month can justify a monthly listing subscription.
- Faster lead response (missed-call text back + workflow) can recover otherwise lost leads.
- Verified trust + better profile completeness should increase call/message conversion from existing traffic.

## 2) Recommended Pricing Model

Recommended Model: `Tiered subscription + optional usage/performance add-on + services`
Value Metric: `active claimed listing` (base), plus `qualified lead` (optional add-on)

Why this fit:
- Predictable baseline spend for small trade businesses.
- Keeps entry friction low (`Free Claim`).
- Preserves upside with optional performance pricing when intent is high.
- Maps to your current offer lanes and avoids forcing services into one table.

## 3) Competitive Pricing Context (Model-Level)

| Competitor | Model | What matters for us |
|---|---|---|
| Google Local Services Ads | Pay-per-lead | High intent, but variable lead costs and auction/budget dynamics. |
| Yelp Ads | CPC | Variable click costs; not directly tied to qualified lead outcomes. |
| Bark | Credit-based lead unlock | Lead response costs are prepaid via credits; quality variance risk. |

Positioning target:
- `Mid-market predictable` for subscription tiers.
- `Value-based` for managed services and high-touch outcomes.

## 4) Proposed Pricing Structure

### A) Directory Plans (self-serve)

| Tier | Price | Target Segment | Key Features | Positioning |
|---|---|---|---|---|
| Free Claim | $0 | New/price-sensitive contractors | Claim listing, edit core info, owner dashboard basics | Low-friction entry |
| Verified Profile | $29/mo (`$290/yr`) launch, then $39/mo (`$390/yr`) | Owner-operators and small crews | Verified badge, trust block, profile enhancements, base analytics, priority support | Trust + visibility baseline |
| Verified Pro | $99/mo (`$990/yr`) | Growing shops with repeat demand needs | Includes Verified + priority category placement, richer analytics, lead response SLA tooling, advanced profile modules | Primary growth tier (anchor) |
| Performance Add-on (optional) | $18-$45 per qualified lead (city/category dependent) | Teams that want outcome-linked spend | Qualified lead routing/reporting with dispute policy | Variable upside without forcing all users into PPL |

### B) Growth Services (sales-assisted, separate from directory table)

| Offer | Price | Who it is for | Included |
|---|---|---|---|
| Never Miss a Lead | From $297/mo (+ usage if needed) | Teams missing calls and slow follow-up | Missed-call text back, intake automation, lead triage |
| Websites for Trades | From $2,500 setup + $99/mo care | Businesses with weak web credibility | Mobile-first site, service pages, CTA flows, maintenance |
| Managed Growth | From $1,250/mo | Owners wanting done-for-you execution | Profile ops, visibility ops, review/reputation support, reporting |

## 5) Feature Gating Rules

- Gate by value, not arbitrary limits.
- `Verified` unlocks trust and credibility basics.
- `Verified Pro` unlocks distribution and conversion acceleration.
- Keep core data hygiene (hours/contact/services/service areas) in all tiers to protect directory quality.
- Performance add-on should require approved claim + quality profile baseline.
- Service-area expansion should be an explicit upgrade, not silently bundled into base listing logic.

## 6) Based City vs Service Area Policy

- Store and use two separate fields:
  - `based_city_id` (where the business is physically based).
  - `service_area_city_ids` (where they serve).
- Ranking rules:
  - For city pages, show `based_city_id` businesses first.
  - Show `service_area_city_ids` matches after locally based businesses.
- Packaging rules:
  - `Verified` includes one primary city (`based_city_id`) plus nearby service areas displayed.
  - `Verified Pro` can include broader multi-city service-area prominence.
- Messaging rules:
  - Badges and copy must clearly indicate "Based in X, serves Y/Z" to avoid trust issues.

## 7) Price Sensitivity (Current Estimate)

Without direct survey data, treat this as a testable estimate:
- Too cheap zone: `<$29/mo` may signal low quality and underfund support.
- Good value zone: `$39-$99/mo` for recurring visibility/trust benefits.
- Expensive hesitation zone: `>$149/mo` without clear measurable lead lift.
- Too expensive zone: `>$249/mo` for pure listing product (services excluded).

## 8) Rollout and Experiment Plan

1. Keep `Free Claim` unchanged.
2. Launch with `Verified` at `$29/mo` for first 60 days (campaign offer), then move to `$39/mo`.
3. Set `Verified Pro` at `$99/mo` and make it the visually recommended tier.
4. Pilot performance add-on in 2-3 cities and highest-intent categories only.
5. Run pricing page experiments:
   - Test A: `$29` vs `$39` for Verified conversion and 90-day retention.
   - Test B: Pro at `$99` vs `$119` with/without stronger analytics bundle.
   - Test C: Annual discount `15%` vs `20%`.
6. Founder-led sales calls (20-30 businesses) to validate WTP and objections.
7. Add explicit launch gates before scaling paid:
   - claim submission race-condition fix shipped and tested.
   - claim status notifications reliably sent.
   - verified-state UX clarified for non-owners.

## 9) Economics Targets

- Gross margin target: `80%+` on directory subscriptions.
- CAC target (paid plan): `<= $150`.
- ARPA target (directory only): `$70-$110`.
- Net revenue retention target: `>100%` once Pro + add-ons are live.
- LTV:CAC target: `>3x` (goal `5x+`).

## 10) Key Assumptions and Risks

Key assumptions:
- Verified trust signals materially improve conversion from existing traffic.
- Contractors value predictable monthly spend over fully variable paid lead costs.
- Claim flow quality is high enough to support paid upsell confidence.

Risks and mitigations:
- Claim friction reduces paid conversion.
  - Mitigation: tighten claim UX and approval SLA before aggressive pricing rollout.
- Weak lead quality in add-on damages trust.
  - Mitigation: strict qualified-lead definition, dispute windows, transparent reporting.
- City/category liquidity imbalance.
  - Mitigation: launch Pro and PPL by city/category readiness, not globally.
- Competitor price pressure.
  - Mitigation: compete on quality + predictability + local relevance, not pure cheapest price.

## 11) Recommended First Launch (Pragmatic)

- Immediately: `Free Claim` + `Verified $29/mo` launch offer + annual 17% discount.
- 30 days later: introduce `Verified Pro $99/mo` for selected categories.
- 60 days: move new signups to `Verified $39/mo`; keep early adopters grandfathered for 6-12 months.
- 60-90 days later: small pilot of performance add-on where lead quality is already strong.

## 12) Email Campaign Offer (Directory-Specific)

- Offer for unclaimed businesses:
  - `Claim Free` + `30-day launch upgrade at $29/mo` for Verified.
- Primary CTA:
  - "Claim your profile"
- Secondary CTA after claim approval:
  - "Activate Verified (launch pricing)"
- Campaign KPI targets:
  - Claim submission rate.
  - Claim approval rate.
  - Approved-to-paid conversion within 14 days.
  - 60-day paid retention.

---

## References
- Google Local Services Ads model (pay-per-lead): https://business.google.com/us/resources/articles/build-online-presence-with-local-services-ads/
- Yelp CPC model: https://biz.yelp.com/support-center/article/How-does-Yelp-s-Cost-Per-Click-CPC-advertising-program-work
- Bark credits model (US help center): https://help.bark.com/hc/en-us/articles/13346288068892-What-is-a-credit-and-how-much-does-it-cost
