---
id: kit-url-filters
topic: kit
summary: Which state of a list lives in the URL, which state stays in the page, and how a filter change resets the page.
keywords: [url filters, filters in the url, search params, filter params, shareable filters, filter codec, list filters, query string, list state, reset page on filter change]
related: [kit-recipes, kit-composition, tables, navigation]
---

# Kit Filters In The URL

A reload and a shared link show the same list, so the state that chooses the rows lives in schema-validated search params. The codec of the filters is `src/components/helpers/filter-params.ts`: read it with `design docs FilterParams`. The chip bar is `design docs Filters`.

## Rules

- Keep the search text, the sort, the filters, and the page of a list in search params. Give the search text and the sort their own params, such as `q` and `sort`.
- Define the filter fields once in the feature. The route schema, the chip bar, and the server query use the same fields.
- Build the server query from the parsed filters, not from the raw params.
- A change of a filter or of the search text resets the page.
- The row selection and the hidden columns of a `DataTable` follow its own rules: read `design docs DataTable#selection` and `#columns`.
