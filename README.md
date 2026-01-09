# Insightful Health - Blog Platform

A modern, accessible blogging platform for public health insights and data analytics built with **Astro** and **Tailwind CSS**.

## 🎯 Project Overview

**Insightful Health** is a user-friendly platform designed for healthcare enthusiasts to publish articles, share health data insights, and engage with a community focused on public health analytics.

### Key Features

- ✨ Clean, minimal healthcare-themed design
- 📱 Fully responsive and mobile-optimized
- ♿ WCAG 2.1 AA accessibility standards
- ⚡ High-performance (2-3s page load target)
- 🔐 Secure with SSL and data encryption
- 📊 Built-in analytics and commenting
- 🏷️ Tags, categories, and SEO optimization
- 📰 Newsletter subscription with MailerLite
- 👤 User authentication and profiles
- 📝 Rich-text editor for blog posts

## 🛠️ Tech Stack

- **Framework:** Astro
- **Styling:** Tailwind CSS
- **Backend:** PocketBase
- **Deployment:** Netlify
- **Newsletter:** MailerLite
- **Authentication:** GitHub, Google, Facebook OAuth
- **Analytics:** Google Analytics
- **CMS:** Admin Dashboard (PocketBase)

## 📁 Project Structure

```
src/
├── pages/
│   ├── index.astro              # Homepage
│   ├── posts.astro              # All posts listing
│   ├── archive.astro            # Post archive
│   ├── search.astro             # Search page
│   ├── post/
│   │   └── [slug].astro         # Individual blog post
│   └── authors/
│       └── [author].astro       # Author profile page
├── layouts/
│   └── Layout.astro             # Global layout with nav/footer
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── CommentSection.astro
│   ├── SearchBar.astro
│   ├── AnalyticsDashboard.astro
│   ├── RichTextEditor.astro
│   └── NewsletterForm.astro
├── styles/
│   └── global.css               # Tailwind + custom styles
└── lib/
    ├── api.ts                   # PocketBase API client
    ├── auth.ts                  # Authentication logic
    ├── analytics.ts             # Google Analytics setup
    └── utils.ts                 # Helper utilities
```

## 🎨 Design System

### Color Palette (Healthcare-Themed)

- **Primary Green:** `#5aa08f` - Trust, health, growth
- **Sage:** `#9db98c` - Calm, balance
- **Accent Orange:** `#f97316` - Energy, urgency
- **Neutrals:** Gray scale for readability

### Typography

- **Headings:** System font stack (SF Pro Display, Segoe UI)
- **Body:** -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- **Monospace:** Monaco, Courier New
- **Clean typography scale:** xs → 6xl

### Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Focus indicators on all interactive elements
- Color contrast ratios ≥ 4.5:1
- Reduced motion support for users with motion sensitivity
- Semantic HTML structure
- ARIA labels where appropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server will run at `http://localhost:3000`

## 🔐 Environment Variables

Environment variables are managed through `.env.local` for local development and `.env.production` for production.

### Setup Instructions

1. **Copy the template file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your values in `.env.local`:**

   - Never commit `.env.local` to version control
   - The `.env.local` file is git-ignored by default

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The system will validate all required environment variables on startup.

### Public Variables (CLIENT-SIDE)

These variables are prefixed with `PUBLIC_` and are safe to expose to the client.

| Variable                  | Type   | Required | Description           | Example                   |
| ------------------------- | ------ | -------- | --------------------- | ------------------------- |
| `PUBLIC_SITE_URL`         | URL    | Yes      | Base URL of your site | `http://localhost:3000`   |
| `PUBLIC_POCKETBASE_URL`   | URL    | Yes      | PocketBase server URL | `http://localhost:8090`   |
| `PUBLIC_GA_ID`            | String | No       | Google Analytics ID   | `G-XXXXXXXXXX`            |
| `PUBLIC_SITE_NAME`        | String | No       | Site display name     | `Insightful Health`       |
| `PUBLIC_SITE_DESCRIPTION` | String | No       | Site SEO description  | `Public health analytics` |

### Private Variables (SERVER-SIDE)

These variables are NOT prefixed with `PUBLIC_` and remain secure on the server.

#### PocketBase Configuration

| Variable                            | Type   | Required | Description                    | Example                        |
| ----------------------------------- | ------ | -------- | ------------------------------ | ------------------------------ |
| `PRIVATE_POCKETBASE_ADMIN_EMAIL`    | Email  | Yes      | Admin email for PocketBase     | `admin@insightfulhealth.local` |
| `PRIVATE_POCKETBASE_ADMIN_PASSWORD` | String | Yes      | Admin password (min 8 chars)   | `SecurePassword123`            |
| `PRIVATE_POCKETBASE_BACKUP_DIR`     | Path   | No       | Directory for database backups | `./backups`                    |

#### JWT & Security

| Variable                 | Type   | Required | Description                | Example                        |
| ------------------------ | ------ | -------- | -------------------------- | ------------------------------ |
| `PRIVATE_JWT_SECRET`     | String | Yes      | Secret key for JWT signing | `your-secret-key-min-32-chars` |
| `PRIVATE_JWT_EXPIRATION` | String | No       | Token expiration time      | `7d` (default)                 |

#### Newsletter (MailerLite)

| Variable                     | Type   | Required | Description        | Example            |
| ---------------------------- | ------ | -------- | ------------------ | ------------------ |
| `PRIVATE_MAILERLITE_API_KEY` | String | No       | MailerLite API key | `pk_xxxxxxxxxxxxx` |

#### OAuth - GitHub

| Variable                             | Type   | Required | Description         | Example                                      |
| ------------------------------------ | ------ | -------- | ------------------- | -------------------------------------------- |
| `PRIVATE_OAUTH_GITHUB_CLIENT_ID`     | String | No       | GitHub OAuth app ID | From GitHub Developer Console                |
| `PRIVATE_OAUTH_GITHUB_CLIENT_SECRET` | String | No       | GitHub OAuth secret | From GitHub Developer Console                |
| `PRIVATE_OAUTH_GITHUB_REDIRECT_URI`  | URL    | No       | GitHub callback URL | `http://localhost:3000/auth/callback/github` |

#### OAuth - Google

| Variable                             | Type   | Required | Description            | Example                                      |
| ------------------------------------ | ------ | -------- | ---------------------- | -------------------------------------------- |
| `PRIVATE_OAUTH_GOOGLE_CLIENT_ID`     | String | No       | Google OAuth Client ID | From Google Cloud Console                    |
| `PRIVATE_OAUTH_GOOGLE_CLIENT_SECRET` | String | No       | Google OAuth secret    | From Google Cloud Console                    |
| `PRIVATE_OAUTH_GOOGLE_REDIRECT_URI`  | URL    | No       | Google callback URL    | `http://localhost:3000/auth/callback/google` |

#### OAuth - Facebook

| Variable                              | Type   | Required | Description           | Example                                        |
| ------------------------------------- | ------ | -------- | --------------------- | ---------------------------------------------- |
| `PRIVATE_OAUTH_FACEBOOK_APP_ID`       | String | No       | Facebook App ID       | From Facebook Developer Console                |
| `PRIVATE_OAUTH_FACEBOOK_APP_SECRET`   | String | No       | Facebook App Secret   | From Facebook Developer Console                |
| `PRIVATE_OAUTH_FACEBOOK_REDIRECT_URI` | URL    | No       | Facebook callback URL | `http://localhost:3000/auth/callback/facebook` |

#### Development Options

| Variable        | Type    | Required | Description                | Example                     |
| --------------- | ------- | -------- | -------------------------- | --------------------------- |
| `DEBUG`         | Boolean | No       | Enable debug logging       | `false` (default) or `true` |
| `SEED_DATABASE` | Boolean | No       | Auto-seed with sample data | `false` (default) or `true` |

### Environment Validation

The project validates all required environment variables on startup:

```bash
npm run dev
```

**Output with validation:**

```
✅ Environment validation passed
📋 Insightful Health Environment Configuration:
  • Site URL: http://localhost:3000
  • PocketBase URL: http://localhost:8090
  • Site Name: Insightful Health
  • Google Analytics: ✗ Not configured
  • MailerLite: ✗ Not configured
  • GitHub OAuth: ✗ Not configured
  • Google OAuth: ✗ Not configured
  • Facebook OAuth: ✗ Not configured
  • Debug Mode: ON
```

**If required variables are missing:**

```
❌ MISSING REQUIRED ENVIRONMENT VARIABLES

The following environment variables are required but missing:
  • PUBLIC_SITE_URL
  • PRIVATE_JWT_SECRET

📝 Solution:
  1. Copy .env.example to .env.local
  2. Fill in all required values in .env.local
  3. Restart the development server
```

### Production Environment Variables

For production deployment to Netlify:

1. In Netlify dashboard, go to **Site settings → Build & deploy → Environment**
2. Add environment variables (do NOT include `.example` values)
3. Only public and production-ready secrets should be added
4. Never expose `PRIVATE_` variables publicly

**Recommended production setup:**

```
PUBLIC_SITE_URL = https://insightfulhealth.com
PUBLIC_POCKETBASE_URL = https://api.insightfulhealth.com
PUBLIC_GA_ID = G-PRODUCTION_ID
PRIVATE_POCKETBASE_ADMIN_EMAIL = admin@insightfulhealth.com
PRIVATE_POCKETBASE_ADMIN_PASSWORD = [strong-password]
PRIVATE_JWT_SECRET = [generate-secure-random-key]
PRIVATE_MAILERLITE_API_KEY = [your-api-key]
```

### Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use strong secrets** - Minimum 32 characters for `PRIVATE_JWT_SECRET`
3. **Rotate secrets regularly** - Change JWT secret and API keys periodically
4. **Different environments** - Use different OAuth credentials per environment
5. **Secure storage** - Use 1Password, Vault, or similar for sensitive data
6. **Audit logs** - Monitor who accesses environment variables
7. **CI/CD secrets** - Use GitHub Secrets or Netlify Environment Variables

## 📚 Page Structure

### Public Pages

- `/` - Homepage with featured posts
- `/posts` - Browse all posts with filters
- `/post/[slug]` - Individual blog post
- `/archive` - Posts organized by date
- `/search` - Global search
- `/author/[name]` - Author profile and posts

### Admin Pages (Protected)

- `/admin/dashboard` - Content management
- `/admin/posts` - Create/edit posts
- `/admin/users` - User management
- `/admin/analytics` - Author analytics
- `/admin/comments` - Comment moderation

### Other Pages

- `/auth/login` - Authentication
- `/auth/signup` - Registration
- `/auth/forgot-password` - Password recovery
- `/profile/[user]` - User profile (public)

## 🔑 Key Features Implementation

### Authentication

- OAuth with GitHub, Google, Facebook
- Email/password authentication via PocketBase
- JWT-based sessions

### Content Management

- Create/edit/delete posts (authors)
- Rich-text editor with image support
- Post versioning (admin only)
- SEO metadata per post
- Featured post management (admin)

### Comments & Community

- Threaded comment system
- Admin moderation required
- Rate limiting (5 comments/day per user)
- User can delete own comments
- Admin can edit/delete any comment
- Ban functionality for abusive users

### Analytics

- Post views tracking
- Comment counts
- Like tracking (anonymous users allowed)
- Author dashboard (views, engagement)
- Google Analytics integration

### Newsletter

- MailerLite integration
- Optional subscription at footer
- Double opt-in for compliance

## 📊 Database Schema

See [DATABASE.md](./DATABASE.md) for complete PocketBase schema documentation.

### Core Collections

- **Users** - User accounts and profiles
- **Posts** - Blog post content and metadata
- **Comments** - Nested comments on posts
- **Likes** - Post likes (anonymous & authenticated)
- **PostVersions** - Version history (admin only)
- **Categories** - Post categories
- **Tags** - Post tags
- **Analytics** - View/engagement tracking

## ⚡ Performance Targets

- **Page Load Time:** 2-3 seconds (first contentful paint)
- **Lighthouse Scores:** 90+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size:** < 150KB (gzipped)
- **Time to Interactive:** < 4 seconds
- **Scalability:** Support 1000 MAUs in year one

## 🔒 Security

- **SSL/TLS:** All traffic encrypted
- **Authentication:** OAuth + JWT
- **Password:** bcrypt hashing via PocketBase
- **Rate Limiting:** 5 API calls per second per IP
- **CSRF Protection:** Token-based validation
- **XSS Prevention:** HTML sanitization on user content
- **SQL Injection:** Parameterized queries via PocketBase

## ♿ Accessibility Checklist

- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility (ARIA labels)
- [ ] Color contrast ratios (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Skip to main content link
- [ ] Alternative text for images
- [ ] Form labels associated with inputs
- [ ] Error messages clear and helpful
- [ ] Reduced motion support

## 📈 SEO Optimization

- Semantic HTML structure
- Meta tags (title, description, canonical)
- Open Graph and Twitter Card tags
- Sitemap.xml generation
- Robots.txt configuration
- Structured data (JSON-LD)
- URL slugs optimized for search
- Internal linking strategy

## 📝 Development Guidelines

### Naming Conventions

- **Components:** PascalCase (HeaderNav.astro)
- **Utilities:** camelCase (getPostMetadata.ts)
- **CSS Classes:** kebab-case (post-container)
- **Variables:** camelCase (postCount)

### Code Quality

- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Comments for complex logic
- Semantic commit messages

### Component Guidelines

- Keep components focused and reusable
- Props should be typed
- Use slots for flexibility
- Document prop usage

## 🤖 AI Copilot Instructions

See [COPILOT_INSTRUCTIONS.md](./COPILOT_INSTRUCTIONS.md) for detailed AI-optimized prompts for implementing features with Cursor, Copilot, or Claude.

### Quick Prompts

- Feature implementation
- Component creation
- API integration
- Bug fixes and debugging
- Performance optimization

## 📦 Deployment

### Netlify Deployment

1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Environment variables configured
5. Automatic deploys on push to main

### Environment Variables

```
PUBLIC_SITE_URL=https://insightfulhealth.com
PUBLIC_POCKETBASE_URL=https://api.insightfulhealth.com
PRIVATE_POCKETBASE_ADMIN_EMAIL=admin@insightfulhealth.com
PRIVATE_POCKETBASE_ADMIN_PASSWORD=xxx
PRIVATE_MAILERLITE_API_KEY=xxx
PRIVATE_GOOGLE_ANALYTICS_ID=xxx
```

## 🧪 Testing

```bash
# Run build check
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

- [Database Schema](./DATABASE.md)
- [Copilot Instructions](./COPILOT_INSTRUCTIONS.md)
- [API Integration Guide](./API_GUIDE.md)
- [Component Library](./COMPONENTS.md)

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For questions or issues, contact: support@insightfulhealth.com

---

**Built with ❤️ for public health insights**

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
# insightful-health
