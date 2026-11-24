# Hammam Al-Aidaroos Portfolio

الموقع الشخصي للمهندس همام عبد القادر علي العيدروس (تقنية معلومات)، مبني بـ React و TypeScript و Tailwind CSS و Firebase.

## التشغيل المحلي

```bash
npm install
npm run dev
```

## التحقق والبناء

```bash
npm run lint
npm run build
```

## النشر على GitHub و Vercel

1. ارفع الملفات إلى مستودع GitHub.
2. اربط المستودع في [Vercel](https://vercel.com) (ملف `vercel.json` مضبوط تلقائياً لدعم مسار `/admin`).
3. في لوحة تحكم Firebase Console:
   - انتقل إلى **Authentication > Settings > Authorized domains** وأضف رابط الاستضافة.
   - انتقل إلى **Storage > Rules** وتأكد من تطبيق قواعد `storage.rules`.
