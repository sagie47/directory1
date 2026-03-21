-- SAN-9 funnel KPI alert query (GA4 BigQuery export).
-- Produces 7-day offer + city scorecards with status columns and runbook hints.
-- Parameters:
--   @start_date DATE
--   @end_date DATE
-- Replace `YOUR_PROJECT.YOUR_DATASET.events_*` with your GA4 export table wildcard.

WITH source_events AS (
  SELECT
    PARSE_DATE('%Y%m%d', event_date) AS event_day,
    event_timestamp,
    user_pseudo_id,
    COALESCE(
      (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'ga_session_id'),
      SAFE_CAST((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'ga_session_id') AS INT64)
    ) AS ga_session_id,
    event_name,
    LOWER(NULLIF(TRIM((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'offer')), '')) AS offer,
    LOWER(NULLIF(TRIM((SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'city')), '')) AS city
  FROM `YOUR_PROJECT.YOUR_DATASET.events_*`
  WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', @start_date) AND FORMAT_DATE('%Y%m%d', @end_date)
    AND event_name IN (
      'offer_page_viewed',
      'offer_cta_clicked',
      'form_started',
      'form_submitted',
      'stripe_redirect_started'
    )
),
filtered_events AS (
  SELECT
    event_day,
    event_timestamp,
    CONCAT(user_pseudo_id, '.', CAST(ga_session_id AS STRING)) AS session_key,
    offer,
    city,
    event_name
  FROM source_events
  WHERE ga_session_id IS NOT NULL
    AND offer IS NOT NULL
),
city_by_session_offer AS (
  SELECT
    event_day,
    session_key,
    offer,
    ARRAY_AGG(city IGNORE NULLS ORDER BY event_timestamp DESC LIMIT 1)[SAFE_OFFSET(0)] AS inferred_city
  FROM filtered_events
  GROUP BY 1, 2, 3
),
session_stage_flags AS (
  SELECT
    e.event_day,
    e.session_key,
    e.offer,
    COALESCE(c.inferred_city, 'unknown') AS city,
    MAX(IF(e.event_name = 'offer_page_viewed', 1, 0)) AS offer_view_session,
    MAX(IF(e.event_name = 'offer_cta_clicked', 1, 0)) AS cta_click_session,
    MAX(IF(e.event_name = 'form_started', 1, 0)) AS form_start_session,
    MAX(IF(e.event_name = 'form_submitted', 1, 0)) AS form_submit_session,
    MAX(IF(e.event_name = 'stripe_redirect_started', 1, 0)) AS stripe_redirect_session
  FROM filtered_events e
  LEFT JOIN city_by_session_offer c
    ON c.event_day = e.event_day
    AND c.session_key = e.session_key
    AND c.offer = e.offer
  GROUP BY 1, 2, 3, 4
),
daily_rollup AS (
  SELECT
    event_day,
    offer,
    city,
    SUM(offer_view_session) AS offer_view_sessions,
    SUM(cta_click_session) AS cta_click_sessions,
    SUM(form_start_session) AS form_start_sessions,
    SUM(form_submit_session) AS form_submit_sessions,
    SUM(stripe_redirect_session) AS stripe_redirect_sessions
  FROM session_stage_flags
  GROUP BY 1, 2, 3
),
rolling_7d AS (
  SELECT
    offer,
    city,
    SUM(offer_view_sessions) AS offer_view_sessions_7d,
    SUM(cta_click_sessions) AS cta_click_sessions_7d,
    SUM(form_start_sessions) AS form_start_sessions_7d,
    SUM(form_submit_sessions) AS form_submit_sessions_7d,
    SUM(stripe_redirect_sessions) AS stripe_redirect_sessions_7d
  FROM daily_rollup
  WHERE event_day BETWEEN DATE_SUB(@end_date, INTERVAL 6 DAY) AND @end_date
  GROUP BY 1, 2
),
thresholds AS (
  SELECT
    'never-miss-a-lead' AS offer,
    FALSE AS expects_stripe,
    40 AS min_offer_views_7d,
    0.12 AS critical_offer_view_to_cta,
    0.18 AS warn_offer_view_to_cta,
    0.30 AS critical_cta_to_form_start,
    0.45 AS warn_cta_to_form_start,
    0.40 AS critical_form_start_to_submit,
    0.55 AS warn_form_start_to_submit,
    NULL AS critical_submit_to_stripe,
    NULL AS warn_submit_to_stripe
  UNION ALL
  SELECT
    'website' AS offer,
    TRUE AS expects_stripe,
    40 AS min_offer_views_7d,
    0.12 AS critical_offer_view_to_cta,
    0.18 AS warn_offer_view_to_cta,
    0.30 AS critical_cta_to_form_start,
    0.45 AS warn_cta_to_form_start,
    0.40 AS critical_form_start_to_submit,
    0.55 AS warn_form_start_to_submit,
    0.65 AS critical_submit_to_stripe,
    0.80 AS warn_submit_to_stripe
  UNION ALL
  SELECT
    'managed-growth' AS offer,
    TRUE AS expects_stripe,
    40 AS min_offer_views_7d,
    0.12 AS critical_offer_view_to_cta,
    0.18 AS warn_offer_view_to_cta,
    0.30 AS critical_cta_to_form_start,
    0.45 AS warn_cta_to_form_start,
    0.40 AS critical_form_start_to_submit,
    0.55 AS warn_form_start_to_submit,
    0.65 AS critical_submit_to_stripe,
    0.80 AS warn_submit_to_stripe
),
scored AS (
  SELECT
    @end_date AS snapshot_date,
    r.offer,
    r.city,
    COALESCE(t.expects_stripe, TRUE) AS expects_stripe,
    r.offer_view_sessions_7d,
    r.cta_click_sessions_7d,
    r.form_start_sessions_7d,
    r.form_submit_sessions_7d,
    r.stripe_redirect_sessions_7d,
    SAFE_DIVIDE(r.cta_click_sessions_7d, NULLIF(r.offer_view_sessions_7d, 0)) AS offer_view_to_cta_rate_7d,
    SAFE_DIVIDE(r.form_start_sessions_7d, NULLIF(r.cta_click_sessions_7d, 0)) AS cta_to_form_start_rate_7d,
    SAFE_DIVIDE(r.form_submit_sessions_7d, NULLIF(r.form_start_sessions_7d, 0)) AS form_start_to_submit_rate_7d,
    IF(
      COALESCE(t.expects_stripe, TRUE),
      SAFE_DIVIDE(r.stripe_redirect_sessions_7d, NULLIF(r.form_submit_sessions_7d, 0)),
      NULL
    ) AS submit_to_stripe_rate_7d,
    CASE
      WHEN r.offer_view_sessions_7d < COALESCE(t.min_offer_views_7d, 40) THEN 'insufficient_data'
      WHEN SAFE_DIVIDE(r.cta_click_sessions_7d, NULLIF(r.offer_view_sessions_7d, 0)) < COALESCE(t.critical_offer_view_to_cta, 0.12) THEN 'critical'
      WHEN SAFE_DIVIDE(r.cta_click_sessions_7d, NULLIF(r.offer_view_sessions_7d, 0)) < COALESCE(t.warn_offer_view_to_cta, 0.18) THEN 'warn'
      ELSE 'ok'
    END AS offer_view_to_cta_status,
    CASE
      WHEN r.offer_view_sessions_7d < COALESCE(t.min_offer_views_7d, 40) THEN 'insufficient_data'
      WHEN SAFE_DIVIDE(r.form_start_sessions_7d, NULLIF(r.cta_click_sessions_7d, 0)) < COALESCE(t.critical_cta_to_form_start, 0.30) THEN 'critical'
      WHEN SAFE_DIVIDE(r.form_start_sessions_7d, NULLIF(r.cta_click_sessions_7d, 0)) < COALESCE(t.warn_cta_to_form_start, 0.45) THEN 'warn'
      ELSE 'ok'
    END AS cta_to_form_start_status,
    CASE
      WHEN r.offer_view_sessions_7d < COALESCE(t.min_offer_views_7d, 40) THEN 'insufficient_data'
      WHEN SAFE_DIVIDE(r.form_submit_sessions_7d, NULLIF(r.form_start_sessions_7d, 0)) < COALESCE(t.critical_form_start_to_submit, 0.40) THEN 'critical'
      WHEN SAFE_DIVIDE(r.form_submit_sessions_7d, NULLIF(r.form_start_sessions_7d, 0)) < COALESCE(t.warn_form_start_to_submit, 0.55) THEN 'warn'
      ELSE 'ok'
    END AS form_start_to_submit_status,
    CASE
      WHEN NOT COALESCE(t.expects_stripe, TRUE) THEN 'not_applicable'
      WHEN r.offer_view_sessions_7d < COALESCE(t.min_offer_views_7d, 40) THEN 'insufficient_data'
      WHEN SAFE_DIVIDE(r.stripe_redirect_sessions_7d, NULLIF(r.form_submit_sessions_7d, 0)) < COALESCE(t.critical_submit_to_stripe, 0.65) THEN 'critical'
      WHEN SAFE_DIVIDE(r.stripe_redirect_sessions_7d, NULLIF(r.form_submit_sessions_7d, 0)) < COALESCE(t.warn_submit_to_stripe, 0.80) THEN 'warn'
      ELSE 'ok'
    END AS submit_to_stripe_status
  FROM rolling_7d r
  LEFT JOIN thresholds t
    ON t.offer = r.offer
)
SELECT
  snapshot_date,
  offer,
  city,
  offer_view_sessions_7d,
  cta_click_sessions_7d,
  form_start_sessions_7d,
  form_submit_sessions_7d,
  stripe_redirect_sessions_7d,
  offer_view_to_cta_rate_7d,
  cta_to_form_start_rate_7d,
  form_start_to_submit_rate_7d,
  submit_to_stripe_rate_7d,
  offer_view_to_cta_status,
  cta_to_form_start_status,
  form_start_to_submit_status,
  submit_to_stripe_status,
  CASE
    WHEN offer_view_to_cta_status = 'critical'
      OR cta_to_form_start_status = 'critical'
      OR form_start_to_submit_status = 'critical'
      OR submit_to_stripe_status = 'critical'
      THEN 'critical'
    WHEN offer_view_to_cta_status = 'warn'
      OR cta_to_form_start_status = 'warn'
      OR form_start_to_submit_status = 'warn'
      OR submit_to_stripe_status = 'warn'
      THEN 'warn'
    WHEN offer_view_to_cta_status = 'insufficient_data'
      AND cta_to_form_start_status = 'insufficient_data'
      AND form_start_to_submit_status = 'insufficient_data'
      AND submit_to_stripe_status IN ('insufficient_data', 'not_applicable')
      THEN 'insufficient_data'
    ELSE 'ok'
  END AS overall_status,
  CASE
    WHEN offer_view_to_cta_status = 'critical' THEN 'Check offer-page traffic quality, render regressions, and CTA visibility.'
    WHEN cta_to_form_start_status = 'critical' THEN 'Check CTA destinations, routing/query params, and form load failures.'
    WHEN form_start_to_submit_status = 'critical' THEN 'Audit form validation errors, latency, and Supabase insert failures.'
    WHEN submit_to_stripe_status = 'critical' THEN 'Check Stripe URL configuration, redirect blockers, and ad-block/browser policies.'
    WHEN offer_view_to_cta_status = 'warn' THEN 'Review messaging/creative and compare by source_page for soft top-funnel drop.'
    WHEN cta_to_form_start_status = 'warn' THEN 'Review CTA copy and form landing relevance for this offer-city segment.'
    WHEN form_start_to_submit_status = 'warn' THEN 'Review high-friction fields and error rates in submit helpers.'
    WHEN submit_to_stripe_status = 'warn' THEN 'Review payment-step dropoff and Stripe handoff UX.'
    ELSE 'No action required.'
  END AS runbook_hint
FROM scored
ORDER BY
  CASE overall_status
    WHEN 'critical' THEN 1
    WHEN 'warn' THEN 2
    WHEN 'insufficient_data' THEN 3
    ELSE 4
  END,
  offer,
  city;
