# Analytics (Draft) — MVP Event List

## Principles
- Avoid storing sensitive personal data.
m Respect cookie consent and legal requirements (Privacy/Cookies pages).

## Common properties (draft)
- user_role (guest/user/premium/admin)
- locale
- page_type
- content_id (recipe/article)
- referrer, utm params
[- filters_applied, search_query_length (not raw query if privacy requires)

## MVP events (draft)
- page_view
- search_performed (type: recipes|articles; query_length; filters)
- filter_applied (type; values_count)
- content_viewed (recipe|article; id)
- favorite_added / favorite_removed (target_type; id)
- shopping_list_opened
- shopping_list_item_added / removed / checked
- paywall_viewed (feature)
- checkout_started
- checkout_completed
- subscription_status_changed (fret→premium, premium→canceled)
- planner_opened (premium)
