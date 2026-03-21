-- SAN-9 canonical funnel KPI query (GA4 BigQuery export).
-- Funnel: offer_page_viewed -> offer_cta_clicked -> form_started -> form_submitted -> stripe_redirect_started
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
offer_config AS (
  SELECT 'never-miss-a-lead' AS offer, FALSE AS expects_stripe
  UNION ALL
  SELECT 'website' AS offer, TRUE AS expects_stripe
  UNION ALL
  SELECT 'managed-growth' AS offer, TRUE AS expects_stripe
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
)
SELECT
  d.event_day,
  d.offer,
  d.city,
  d.offer_view_sessions,
  d.cta_click_sessions,
  d.form_start_sessions,
  d.form_submit_sessions,
  d.stripe_redirect_sessions,
  SAFE_DIVIDE(d.cta_click_sessions, NULLIF(d.offer_view_sessions, 0)) AS offer_view_to_cta_rate,
  SAFE_DIVIDE(d.form_start_sessions, NULLIF(d.cta_click_sessions, 0)) AS cta_to_form_start_rate,
  SAFE_DIVIDE(d.form_submit_sessions, NULLIF(d.form_start_sessions, 0)) AS form_start_to_submit_rate,
  IF(
    COALESCE(c.expects_stripe, TRUE),
    SAFE_DIVIDE(d.stripe_redirect_sessions, NULLIF(d.form_submit_sessions, 0)),
    NULL
  ) AS submit_to_stripe_redirect_rate,
  COALESCE(c.expects_stripe, TRUE) AS expects_stripe
FROM daily_rollup d
LEFT JOIN offer_config c
  ON c.offer = d.offer
ORDER BY d.event_day DESC, d.offer, d.city;
