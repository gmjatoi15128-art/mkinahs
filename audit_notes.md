# Website Audit Notes

## Public-site observations

- The public pages are structurally consistent, but the dominant empty-state treatment makes the institute appear unfinished rather than intentionally selective about unpublished information.
- The hero, secondary page banners, and empty content areas repeat nearly identical visual patterns, reducing the sense of a distinctive university-grade experience.
- Contact information is currently unconfigured, and the map fallback is prominent even with no confirmed location; both should use a calmer, more deliberate pre-configuration presentation.
- Secondary page routes and unknown record states render but need more useful navigation recovery and a more polished public-facing voice.
- Published content should have richer editorial layouts when it is added; the CMS currently gives the user raw JSON fields rather than module-specific forms.

## CMS observations

- The role-aware dashboard is coherent but content entry relies heavily on raw structured JSON, which is not a practical production workflow for institutional staff.
- The dashboard requires clearer module guidance, inline field labels, error handling, success feedback, and a visual preview path.

## SEO and technical observations

- Sitemap and robots endpoints are present, but public rendering needs a complete document-level metadata strategy and richer static assets for social previews.
- Dynamic detail routes should provide explicit not-found behavior where a requested record is unpublished or absent.
- The public site needs a more academic visual language: refined display typography, crest-derived framing, formal dividers, and visual hierarchy that varies by page type.
