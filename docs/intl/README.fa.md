<p align="center">
  <img src="../crumb-logo.svg" alt="نشان Crumb Widget" width="128" height="128">
</p>

<h1 align="center">Crumb Widget</h1>

<p align="center">
  <a href="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml"><img src="https://github.com/bmlt-enabled/crumb-widget/actions/workflows/test.yml/badge.svg" alt="test"></a>
  <a href="https://codecov.io/gh/bmlt-enabled/crumb-widget"><img src="https://codecov.io/gh/bmlt-enabled/crumb-widget/graph/badge.svg" alt="codecov"></a>
  <a href="https://www.npmjs.com/package/crumb-widget"><img src="https://img.shields.io/npm/v/crumb-widget" alt="npm"></a>
  <a href="https://crumb.bmlt.app/?lang=fa"><img src="https://img.shields.io/badge/docs-crumb.bmlt.app-blue" alt="docs"></a>
</p>

<p align="center">
  🌐 <a href="https://github.com/bmlt-enabled/crumb-widget/">English</a> | <a href="README.es.md">Español</a> | <a href="README.pt-BR.md">Português (Brasil)</a> | <a href="README.fr.md">Français</a> | <a href="README.de.md">Deutsch</a> | <a href="README.it.md">Italiano</a> | <a href="README.sv.md">Svenska</a> | <a href="README.da.md">Dansk</a> | <a href="README.pl.md">Polski</a> | <a href="README.el.md">Ελληνικά</a> | <a href="README.ru.md">Русский</a> | <a href="README.ja.md">日本語</a> | فارسی
</p>

<p align="center">
  <strong>👉 دموی زنده:</strong> <a href="https://crumb.bmlt.app/meetings.html?lang=fa">crumb.bmlt.app/meetings.html?lang=fa</a>
</p>

<p align="center">
  <img src="../screenshot-carousel.gif" alt="Crumb Widget — list, map, and meeting detail views" width="550">
</p>

<div dir="rtl">

یک ویجت قابل جاسازی برای یافتن جلسات NA. با Svelte 5 ساخته شده و به‌صورت یک فایل جاوااسکریپت واحد و مستقل توزیع می‌شود. به‌صورت [افزونهٔ وردپرس](https://wordpress.org/plugins/crumb/)، [ماژول دروپال](https://github.com/bmlt-enabled/crumb-drupal)، [افزونهٔ جوملا](https://github.com/bmlt-enabled/crumb-joomla)، [اسکریپت CDN](https://cdn.aws.bmlt.app/crumb-widget.js) یا [بستهٔ npm](https://www.npmjs.com/package/crumb-widget) در دسترس است.

## از کدام نسخه استفاده کنم؟

| سایت شما                                                | از این استفاده کنید                                                          |
|---------------------------------------------------------|------------------------------------------------------------------------------|
| **وردپرس**                                              | [افزونهٔ وردپرس](https://wordpress.org/plugins/crumb/)                       |
| **دروپال** ۱۰٫۳+ یا ۱۱                                   | [ماژول دروپال](https://github.com/bmlt-enabled/crumb-drupal)                 |
| **جوملا** ۴، ۵ یا ۶                                       | [افزونهٔ جوملا](https://github.com/bmlt-enabled/crumb-joomla)                  |
| **Wix، Squarespace، Google Sites یا HTML ساده**         | قطعهٔ [CDN](#شروع-سریع) را در یک بلاک کد بچسبانید                              |
| **یک برنامهٔ JS/TS** (React, Svelte, Vue, Vite و غیره) | `npm install crumb-widget` ([مستندات](https://crumb.bmlt.app/?lang=fa#npm-package)) |

## امکانات

- نمای فهرست و نقشه با جستجو و فیلتر زنده
- صفحهٔ جزئیات جلسه شامل مسیریابی، پیوند پیوستن آنلاین و قالب‌ها
- جستجوی نزدیک بر اساس موقعیت‌یابی جغرافیایی
- پیوند به هر جلسه از طریق مسیریاب توکار
- ۱۳ زبان توکار (English, Español, Português (Brasil), Français, Deutsch, Italiano, Svenska, Dansk, Polski, Ελληνικά, Русский, 日本語, فارسی — شامل چینش RTL برای فارسی)
- ستون‌ها، کاشی‌های نقشه و نشانگرهای قابل تنظیم
- نمای فهرست مناسب چاپ

## شروع سریع

**به چه چیزهایی نیاز خواهید داشت:**

1. **آدرس سرور BMLT** شما — معمولاً چیزی شبیه به `https://bmlt.example.org/main_server/`. اگر آن را ندارید، از وب‌سرونت کمیتهٔ خدماتی خود بپرسید.
2. (اختیاری) یک **شناسهٔ کمیتهٔ خدماتی** برای فیلتر کردن به یک ناحیه یا منطقهٔ خاص. [نحوهٔ یافتن آن ←](https://crumb.bmlt.app/?lang=fa#find-service-body)

**کمینهٔ جاسازی قابل استفاده** (در هر صفحهٔ HTML، بلاک کد Squarespace، جاسازی HTML در Wix و غیره بچسبانید):

</div>

```html
<div id="crumb-widget" data-server="https://myserver.com/main_server/"></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

<div dir="rtl">

**فیلتر کردن به یک کمیتهٔ خدماتی واحد:**

</div>

```html
<div id="crumb-widget"
    data-server="https://myserver.com/main_server/"
    data-service-body="3"
></div>
<script type="module" src="https://cdn.aws.bmlt.app/crumb-widget.js"></script>
```

<div dir="rtl">

## مستندات

مستندات کامل Crumb — شامل گزینه‌های پیکربندی، نمونه‌ها و راهنمای شروع — را در **[crumb.bmlt.app](https://crumb.bmlt.app/?lang=fa)** ببینید.

## به کمک نیاز دارید؟

- 🐛 **گزارش باگ یا درخواست ویژگی:** یک Issue در [GitHub](https://github.com/bmlt-enabled/crumb-widget/issues) باز کنید
- 📧 **ایمیل:** [help@bmlt.app](mailto:help@bmlt.app)
- 💬 **انجمن:** [گروه فیسبوک BMLT](https://www.facebook.com/groups/bmltapp/)

## مجوز

MIT

</div>
