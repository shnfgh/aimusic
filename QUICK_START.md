# 🚀 راهنمای سریع فعال‌سازی GitHub Pages

## ❌ مشکل شما:
```
Error: Get Pages site failed. Please verify that the repository has Pages enabled
```

## ✅ راه حل (3 دقیقه):

### مرحله 1: رفتن به Settings

1. به صفحه اصلی Repository خود در GitHub بروید
2. روی تب **Settings** کلیک کنید (آیکون چرخ‌دنده ⚙️)

![Settings Tab](https://docs.github.com/assets/cb-34567/mw-1440/images/help/repository/repo-actions-settings.webp)

---

### مرحله 2: رفتن به Pages

1. از منوی سمت چپ، روی **Pages** کلیک کنید
2. اگر Pages را نمی‌بینید، به پایین اسکرول کنید

![Pages Menu](https://docs.github.com/assets/cb-78901/mw-1440/images/help/settings/repo-settings-pages.webp)

---

### مرحله 3: تنظیم Source

در بخش **Build and deployment**:

1. **Source** را پیدا کنید
2. dropdown را باز کنید
3. **GitHub Actions** را انتخاب کنید
   - ❌ NOT "Deploy from a branch"
   - ✅ YES "GitHub Actions"

![Source Setting](https://docs.github.com/assets/cb-23456/mw-1440/images/help/settings/pages-source-actions.webp)

---

### مرحله 4: ذخیره و Refresh

1. صفحه را refresh کنید (F5)
2. باید ببینید:
   ```
   Source: GitHub Actions
   ```

---

### مرحله 5: اجرای مجدد Workflow

#### گزینه A: Re-run از Actions
1. به تب **Actions** بروید
2. روی آخرین workflow run کلیک کنید
3. روی **Re-run all jobs** کلیک کنید
4. منتظر بمانید

#### گزینه B: Push جدید
```bash
# یک تغییر کوچک ایجاد کنید
echo "# Update" >> README.md
git add .
git commit -m "Trigger deploy"
git push
```

---

## 🎯 نتیجه موفقیت:

پس از 2-5 دقیقه، باید ببینید:

### در Actions Tab:
```
✅ Deploy to GitHub Pages
   ✓ build
   ✓ deploy
```

### در Pages Tab:
```
Your site is live at:
https://YOUR_USERNAME.github.io/farqar-ai-music-studio/
```

---

## 🐛 اگر هنوز کار نمی‌کند:

### چک‌لیست عیب‌یابی:

- [ ] Repository **Public** است؟ (یا GitHub Pro دارید؟)
- [ ] در **Settings > Pages**، Source روی **GitHub Actions** است؟
- [ ] در **Settings > Actions > General**، Workflow permissions روی **Read and write** است؟
- [ ] Branch اصلی **main** یا **master** است؟
- [ ] فایل `.github/workflows/deploy.yml` وجود دارد؟
- [ ] فایل `vite.config.pages.js` وجود دارد؟

### بررسی Permissions:

1. **Settings > Actions > General**
2. بخش **Workflow permissions**
3. انتخاب کنید:
   - ✅ **Read and write permissions**
   - ✅ تیک **Allow GitHub Actions to create and approve pull requests**
4. **Save**

---

## 📸 تصاویر راهنما:

### صفحه Settings:
```
Repository
├─ General
├─ Access
├─ Code and automation
│  ├─ Branches
│  ├─ Tags
│  └─ ...
├─ Security
└─ Integrations
   ├─ Actions  ← اینجا
   └─ ...
```

### صفحه Pages:
```
GitHub Pages

Build and deployment

Source: [GitHub Actions ▼]
                    ↑
                    این را انتخاب کنید
```

---

## 🔄 جایگزین: استفاده از Netlify (ساده‌تر)

اگر GitHub Pages کار نمی‌کند، از Netlify استفاده کنید:

### مرحله 1: رفتن به Netlify
1. به [netlify.com](https://netlify.com) بروید
2. **Sign up** یا **Log in**

### مرحله 2: Import Repository
1. **Add new site > Import an existing project**
2. **GitHub** را انتخاب کنید
3. Repository خود را انتخاب کنید

### مرحله 3: تنظیمات Build
```
Build command: npm run build
Publish directory: dist
```

### مرحله 4: Deploy
1. **Deploy site** را بزنید
2. منتظر بمانید (1-2 دقیقه)
3. سایت شما آماده است!

**مزایا:**
- ✅ رایگان
- ✅ سریع‌تر از GitHub Pages
- ✅ SSL خودکار
- ✅ Custom domain آسان

---

## 📞 کمک بیشتر:

اگر هنوز مشکل دارید:

1. **Screenshots بگیرید:**
   - Settings > Pages
   - Actions > Workflow run
   - Error message کامل

2. **اطلاعات Repository:**
   - Public یا Private؟
   - نام Repository؟
   - Branch اصلی؟

3. **Error message کامل:**
   - تمام متن خطا را کپی کنید

---

## ✅ خلاصه سریع:

```
1. Settings → Pages
2. Source → GitHub Actions
3. Actions → Re-run jobs
4. منتظر بمانید
5. سایت شما live است! 🎉
```

**زمان مورد نیاز:** 3-5 دقیقه
