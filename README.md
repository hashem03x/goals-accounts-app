# أهدافي وحساباتي — Goals & Accounts

تطبيق ويب عربي لإدارة الأهداف الشخصية (قصيرة/طويلة المدى) والحسابات المالية (وارد/صادر).

## البنية العامة

- **Frontend:** Next.js 14 + TypeScript + TailwindCSS (واجهة عربية RTL)
- **Backend:** Node.js + Express + Mongoose
- **Database:** MongoDB
- **Deployment:** Vercel (frontend) + Render أو Railway (backend)

## هيكل المشروع

```
orders_momen/
├── backend/                 # API Express
│   ├── src/
│   │   ├── config/          # اتصال DB
│   │   ├── controllers/     # معالجة الطلبات
│   │   ├── middleware/      # معالجة أخطاء، rate limit
│   │   ├── models/          # Mongoose (Goal, Account)
│   │   ├── routes/          # مسارات API
│   │   ├── validators/      # Joi للتحقق من المدخلات
│   │   └── server.ts
│   ├── env.example
│   └── package.json
├── frontend/                # Next.js
│   ├── src/
│   │   ├── app/             # الصفحات (dashboard, goals, accounts)
│   │   ├── components/      # مكونات مشتركة + وحدات
│   │   ├── hooks/           # useGoals, useAccounts, useDashboard
│   │   └── lib/             # api.ts
│   ├── env.example
│   └── package.json
├── docs/
│   └── DEPLOYMENT.md        # دليل النشر
└── README.md
```

## متطلبات التشغيل

- Node.js 18+
- MongoDB (محلي أو MongoDB Atlas)
- npm أو yarn

## الإعداد المحلي

### 1. قاعدة البيانات

- تشغيل MongoDB محلياً، أو إنشاء cluster على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) والحصول على connection string.

### 2. Backend

```bash
cd backend
cp env.example .env
# عدّل .env: MONGODB_URI، PORT، CORS_ORIGIN
npm install
npm run dev
```

الـ API يعمل على `http://localhost:5000` (أو المنفذ المحدد في `PORT`).

### 3. Frontend

```bash
cd frontend
cp env.example .env.local
# عدّل .env.local: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm install
npm run dev
```

التطبيق يعمل على `http://localhost:3000`.

## نقاط نهاية الـ API

| الطريقة | المسار | الوصف |
|--------|--------|--------|
| GET | /api/dashboard | ملخص ورسوم لوحة التحكم |
| GET | /api/goals | قائمة الأهداف (مع تصفية/ترتيب/صفحات) |
| GET | /api/goals/:id | هدف واحد |
| POST | /api/goals | إنشاء هدف |
| PUT | /api/goals/:id | تحديث هدف |
| DELETE | /api/goals/:id | حذف هدف |
| GET | /api/accounts | قائمة الحسابات (بحث/تصفية) |
| GET | /api/accounts/:id | سجل واحد |
| POST | /api/accounts | إنشاء سجل |
| PUT | /api/accounts/:id | تحديث سجل |
| DELETE | /api/accounts/:id | حذف سجل |

## الميزات

- **الأهداف:** إضافة/تعديل/حذف، تصفية حسب النوع والحالة، ترتيب حسب التاريخ أو الموعد.
- **الحسابات:** إضافة/تعديل/حذف سجلات مالية، بحث بالاسم أو الملاحظات، تصفية حسب النوع والتاريخ.
- **لوحة التحكم:** إجمالي الوارد/الصادر/الرصيد، عدد الأهداف المعلقة والمكتملة، رسوم بيانية.
- **واجهة عربية RTL:** تنسيق كامل من اليمين لليسار، تنبيهات (toast)، نماذج في نوافذ منبثقة، حالات تحميل وفارغة، تأكيد قبل الحذف.

## الأمان والأداء

- التحقق من المدخلات (Joi) في الـ backend
- Rate limiting على مسارات الـ API
- معالجة أخطاء مركزية
- استخدام متغيرات البيئة (بدون أسرار مكتوبة في الكود)
- استعلامات مجمعة فعالة للوحة التحكم
- تحميل المكونات الثقيلة (الرسوم) بشكل كسول (lazy) في الواجهة

لتفاصيل النشر على Vercel و Render/Railway و MongoDB Atlas راجع [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
