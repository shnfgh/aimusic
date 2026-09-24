# 🚀 راهنمای Deploy

## 📋 پیش‌نیازها

- GitHub account
- Repository در GitHub
- Node.js 18+ و npm

## 🔧 روش 1: Deploy خودکار با GitHub Actions (توصیه شده)

### مرحله 1: آماده‌سازی Repository

```bash
# اگر هنوز git init نکرده‌اید
git init
git add .
git commit -m "Initial commit"

# Remote را اضافه کنید
git remote add origin https://github.com/shnfgh/aimusic.git
git branch -M main
git push -u origin main
```

### مرحله 2: فعال‌سازی GitHub Pages

1. به Repository خود در GitHub بروید
2. روی **Settings** کلیک کنید
3. از منوی سمت چپ، **Pages** را انتخاب کنید
4. در بخش **Build and deployment**:
   - **Source** را روی **GitHub Actions** تنظیم کنید
5. تنظیمات را ذخیره کنید

### مرحله 3: Deploy

```bash
# تغییرات را push کنید
git push origin main
```

Workflow به صورت خودکار اجرا می‌شود و:
1. Dependencies را نصب می‌کند
2. پروژه را build می‌کند
3. خروجی را به GitHub Pages deploy می‌کند

### مرحله 4: بررسی Deploy

1. به تب **Actions** در Repository بروید
2. آخرین workflow run را مشاهده کنید
3. پس از موفقیت، سایت شما در آدرس زیر در دسترس خواهد بود:
   ```
   https://shnfgh.github.io/aimusic/
   ```

## 🔧 روش 2: Deploy دستی

### مرحله 1: Build پروژه

```bash
# نصب dependencies
npm install

# Build با config مخصوص GitHub Pages
npm run build -- --config vite.config.pages.js
```

### مرحله 2: Deploy به GitHub Pages

#### گزینه A: استفاده از gh-pages package

```bash
# نصب gh-pages
npm install -D gh-pages

# Deploy
npx gh-pages -d dist
```

#### گزینه B: استفاده از git subtree

```bash
# اضافه کردن dist به branch gh-pages
git subtree push --prefix dist origin gh-pages
```

#### گزینه C: استفاده از git worktree

```bash
# ساخت worktree برای gh-pages
git worktree add dist gh-pages

# کپی فایل‌های build
cp -r dist/* dist/

# Commit و push
cd dist
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages
cd ..
```

### مرحله 3: فعال‌سازی GitHub Pages

1. به **Settings > Pages** بروید
2. **Source** را روی **Deploy from a branch** تنظیم کنید
3. **Branch** را روی **gh-pages** و **/ (root)** تنظیم کنید
4. **Save** را بزنید

## 🔧 روش 3: Deploy به Netlify

### مرحله 1: اتصال به Netlify

1. به [Netlify](https://netlify.com) بروید
2. روی **Add new site > Import an existing project** کلیک کنید
3. Repository خود را انتخاب کنید

### مرحله 2: تنظیمات Build

- **Build command**: `npm run build`
- **Publish directory**: `dist`

### مرحله 3: Deploy

Netlify به صورت خودکار:
1. Repository را clone می‌کند
2. Dependencies را نصب می‌کند
3. پروژه را build می‌کند
4. Deploy می‌کند

## 🔧 روش 4: Deploy به Vercel

### مرحله 1: اتصال به Vercel

1. به [Vercel](https://vercel.com) بروید
2. روی **New Project** کلیک کنید
3. Repository خود را انتخاب کنید

### مرحله 2: تنظیمات

Vercel به صورت خودکار Vite را شناسایی می‌کند:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### مرحله 3: Deploy

روی **Deploy** کلیک کنید و منتظر بمانید.

## 🔧 روش 5: Deploy به Cloudflare Pages

### مرحله 1: اتصال به Cloudflare

1. به [Cloudflare Pages](https://pages.cloudflare.com) بروید
2. روی **Create a project** کلیک کنید
3. Repository خود را انتخاب کنید

### مرحله 2: تنظیمات Build

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### مرحله 3: Deploy

روی **Save and Deploy** کلیک کنید.

## 🌐 Custom Domain

### GitHub Pages

1. به **Settings > Pages** بروید
2. در بخش **Custom domain**، دامنه خود را وارد کنید
3. DNS records را طبق راهنمای GitHub تنظیم کنید

### Netlify/Vercel/Cloudflare

هر کدام راهنمای خاص خود را برای Custom Domain دارند. معمولاً:
1. دامنه را در پنل اضافه کنید
2. DNS records را تنظیم کنید
3. SSL certificate به صورت خودکار صادر می‌شود

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

فایل `.github/workflows/deploy.yml` شامل:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build -- --config vite.config.pages.js
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/deploy-pages@v4
```

### Trigger های Workflow

- **Push به main/master**: Deploy خودکار
- **Manual trigger**: از تب Actions می‌توانید دستی اجرا کنید

## 📊 بررسی Status

### GitHub Actions

1. به تب **Actions** بروید
2. آخرین workflow run را مشاهده کنید
3. Status را بررسی کنید:
   - ✅ Success: Deploy موفق
   - ❌ Failure: خطا در build یا deploy

### GitHub Pages

1. به **Settings > Pages** بروید
2. Status را بررسی کنید
3. URL سایت را مشاهده کنید

## 🐛 عیب‌یابی

### مشکل: Build ناموفق

**علت**: خطا در کد یا dependencies
**راه حل**:
```bash
# بررسی locally
npm run build

# بررسی error logs
```

### مشکل: Deploy ناموفق

**علت**: تنظیمات نادرست GitHub Pages
**راه حل**:
1. بررسی کنید Source روی GitHub Actions باشد
2. Workflow file را بررسی کنید
3. Permissions را بررسی کنید

### مشکل: سایت نمایش داده نمی‌شود

**علت**: Base path نادرست
**راه حل**:
1. `vite.config.pages.js` را بررسی کنید
2. `base` باید با نام repository مطابقت داشته باشد
3. مثال: `base: '/farqar-ai-music-studio/'`

### مشکل: Assets load نمی‌شوند

**علت**: Path های نسبی نادرست
**راه حل**:
1. در `vite.config.pages.js`، `base` را تنظیم کنید
2. Build را دوباره اجرا کنید
3. Deploy کنید

## 🔐 Environment Variables

اگر از environment variables استفاده می‌کنید:

### GitHub Actions

```yaml
env:
  VITE_API_URL: ${{ secrets.VITE_API_URL }}
```

### Netlify/Vercel

از پنل تنظیمات، environment variables را اضافه کنید.

## 📝 نکات مهم

1. **Base Path**: برای GitHub Pages، `base` در vite config باید با نام repository مطابقت داشته باشد
2. **Permissions**: Workflow نیاز به permissions صحیح دارد
3. **Branch**: Default branch باید `main` یا `master` باشد
4. **Build Time**: معمولاً 2-5 دقیقه طول می‌کشد
5. **Cache**: GitHub Actions از cache npm استفاده می‌کند

## 🎯 بهترین روش‌ها

1. ✅ از GitHub Actions برای deploy خودکار استفاده کنید
2. ✅ Environment variables را در Secrets نگه دارید
3. ✅ قبل از push، locally test کنید
4. ✅ از branch protection rules استفاده کنید
5. ✅ Deploy status را monitor کنید

## 📚 منابع بیشتر

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)
