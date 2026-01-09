# Archive, Categories, and Tags - Quick Reference

**Last Updated:** January 4, 2026  
**Status:** Production Ready ✅

---

## Page URLs

### Archive Page

- **URL:** `/archive`
- **Purpose:** Browse all posts grouped by year and month
- **Layout:** Timeline view with year/month hierarchy
- **Sort:** Descending (newest first)

### Category Pages

- **URL Pattern:** `/category/[slug]`
- **Examples:**
  - `/category/health-insights`
  - `/category/research`
  - `/category/wellness?page=2`
  - `/category/nutrition?sort=views`
- **Purpose:** Browse posts in specific category
- **Layout:** Grid view with pagination

### Tag Pages

- **URL Pattern:** `/tag/[slug]`
- **Examples:**
  - `/tag/mental-health`
  - `/tag/nutrition`
  - `/tag/research?page=2`
  - `/tag/covid-19?sort=views`
- **Purpose:** Browse posts with specific tag
- **Layout:** Grid view with related tags and pagination

---

## Query Parameters

### Sort Options (Category & Tag Pages)

- `?sort=newest` - Newest first (default)
- `?sort=oldest` - Oldest first
- `?sort=views` - Most viewed first
- `?sort=title` - Alphabetical by title

### Pagination

- `?page=1` - Page number (default: 1)
- **Items per page:** 20

### Combined

- `?sort=views&page=2` - Sort by views, page 2

---

## File Locations

```
src/pages/
├── archive.astro                    # /archive
├── category/
│   └── [slug].astro                # /category/[slug]
└── tag/
    └── [slug].astro                # /tag/[slug]
```

---

## PocketBase Filters

### Archive Page

```typescript
filter: 'status = "published"';
sort: '-created';
```

### Category Pages

```typescript
filter: `status = "published" && categoryId = "${category.id}"`;
sort: sortString; // -created, created, -viewCount, title
```

### Tag Pages

```typescript
filter: `status = "published" && tags ~ "${tag.name}"`;
sort: sortString; // -created, created, -viewCount, title
```

---

## Navigation Integration

### Main Navigation

- Archive link in desktop navigation
- Archive link in mobile menu

### Post Detail Pages

- Category link (breadcrumb + metadata)
- Tag links (clickable badges)

### Search Results

- Category filter
- Tag links in results

---

## Key Features

### Archive Page

✅ Group by year/month  
✅ Timeline layout  
✅ Post metadata (author, category, views, comments)  
✅ Empty state

### Category Pages

✅ Breadcrumb navigation  
✅ Sort dropdown  
✅ Pagination  
✅ Grid layout (responsive)  
✅ Featured images  
✅ Empty state

### Tag Pages

✅ Breadcrumb navigation  
✅ Related tags section  
✅ Sort dropdown  
✅ Pagination  
✅ Grid layout (responsive)  
✅ Tag cloud on cards  
✅ Empty state

---

## Testing URLs

Test these routes after starting dev server:

```bash
npm run dev

# Then visit:
http://localhost:4321/archive
http://localhost:4321/category/health
http://localhost:4321/tag/nutrition
http://localhost:4321/category/research?sort=views
http://localhost:4321/tag/mental-health?page=2
```

---

## Common Tasks

### Create New Category

1. Add in PocketBase admin
2. Set name and slug
3. Category page auto-available at `/category/{slug}`

### Create New Tag

1. Add tag to post in PocketBase
2. Tag page auto-available at `/tag/{slug}`

### Link to Category

```astro
<a href={`/category/${category.slug}`}>
  {category.name}
</a>
```

### Link to Tag

```astro
<a href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}>
  {tag}
</a>
```

---

## SEO Best Practices

### Archive Page

- Title: "Archive | Insightful Health"
- Description: Dynamic (post count)

### Category Pages

- Title: "{Category Name} | Insightful Health"
- Description: Category description + post count
- Breadcrumbs for structure

### Tag Pages

- Title: "{Tag Name} | Insightful Health"
- Description: "Browse all posts tagged with '{Tag Name}'"
- Related tags for discovery

---

## Troubleshooting

### 404 on Category Page

- Verify category exists in PocketBase
- Check slug matches URL
- Ensure status is not archived

### 404 on Tag Page

- Verify tag exists in PocketBase
- Check tag name matches URL slug
- Tag slug format: lowercase, hyphens

### Empty Results

- Check post status = "published"
- Verify categoryId/tag assignment
- Check filters in PocketBase admin

### Pagination Not Working

- Verify query params preserved
- Check totalPages calculation
- Ensure page number valid

---

**Quick Start:** All pages are ready to use! Just ensure PocketBase has categories and tags configured.
