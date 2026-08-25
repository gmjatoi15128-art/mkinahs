# SEO and Workflow Re-audit

The audit confirmed that the public site and CMS entry points render cleanly on desktop and mobile, the protected preview URL does not expose saved CMS data without authorization, and the current automated suite passes after the repair work.

Two crawler-facing defects were corrected. The live site had advertised an internal deployment hostname in canonical tags, Open Graph URLs, `robots.txt`, and `sitemap.xml`; origin generation now honors the visitor-facing forwarded host. The sitemap now includes published CMS-managed editorial pages, while `robots.txt` disallows CMS, preview, setup, and API paths. Protected routes retain noindex metadata even if an SEO record exists, and published CMS pages now receive server-rendered metadata and structured page data.

The audit intentionally did not invent programme, faculty, facilities, contact, event, gallery, or download information. Their existing CMS-controlled public empty states remain in place until approved institute content is entered.

The only currently published dynamic record is the BSN programme, which returned an indexable 200 response with the visitor-facing canonical URL. No published faculty, news, event, or CMS-created editorial page record exists at present; representative unavailable detail paths correctly returned real 404 responses with noindex metadata. The refreshed CMS workflow suite covers settings persistence, account lifecycle protections, permission boundaries, saved content workflows, and authenticated Content Manager preview retrieval. The final type check and test run completed with 11 files and 34 passing tests.

For the fresh end-to-end CMS audit, a clearly labelled draft programme was created through the protected CMS API, edited, retrieved through the authenticated preview API, published and confirmed in the local public data endpoint, then reverted to draft. It was deleted immediately after the check, and a final public request confirmed that the QA slug was no longer reachable. The local CMS session and all temporary response files were removed.
