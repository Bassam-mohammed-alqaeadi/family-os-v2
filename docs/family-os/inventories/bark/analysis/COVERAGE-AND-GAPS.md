# وثيقة الاستكشاف الوظيفي الشامل وتحليل الفجوات المعمارية — Bark
# Comprehensive Functional Discovery, Boundary Reconciliation & Gaps Analysis (Unified Plan Deep-Doc)

> **التطبيق:** Bark — الأب (`cm.pt.barkparent` 6.5.1 / RN) + الطفل (`com.pt.bark` 7.26.0 / Kotlin أصلي)

---

## 1. الإطار المنهجي المعتمد

- **المستوى A (مؤكد بالكود):** قُرئ الكود المفكك فعلياً — `Confirmed`.
- **المستوى B (مشتق):** مستنتج من البنية والتسميات — `Derived`.
- **جزئي (Partial):** منفذ جزئياً أو يتطلب طرفاً غير مفحوص (الخادم / Hermes).
- **غير موجود (Not Found):** فجوة موثقة بالبحث الشامل.

## 2. مصفوفة حدود الملكية وطوبولوجيا النظام (Dual-App Topology)

### توصيف نطاقات الملكية:
- **تطبيق الأب (RN):** لوحة التحكم، مراجعة التنبيهات، إدارة الأطفال/الأجهزة، توليد رمز الجهاز، الفوترة. **بلا أي إنفاذ أو ذكاء محلي.**
- **تطبيق الطفل (Kotlin):** كل الإنفاذ (VPN + Accessibility)، كل الذكاء (ONNX)، الرفع، الإقران.
- **السحابة (`www.bark.us`):** الوسيط الوحيد — لا قناة مباشرة أب↔طفل في أي طبقة.
- **حد الملكية الحرجة:** الأب **لا يستطيع** إثبات التنفيذ على جهاز الطفل — فقط إرسال الإعدادات (عبر السحابة) واستلام التنبيهات.

## 3. حسم الفروقات المادية والتاريخية

- تقرير الجولة الأولى (`reports/bark.md`) غطى الأب وحده وسجّل: "المراقبة والتصنيف الفعلي يتم على السيرفر/تطبيق الطفل" و"لا تبحث عن خوارزميات هنا" — **حُسم العكس**: التصنيف **على جهاز الطفل** (نماذج ONNX بأوزانها)، وهذه الوثيقة توثّقه لأول مرة.
- الإصدار المحلل (أب 6.5.1 / طفل 7.26.0) أحدث من نسخ أكتوبر.

## 4. الفحص المعماري لطبقة البيانات والتخزين

**الحسم:** لم تُرصد جداول علائقية تجارية معلنة في الكود المفحوص:
- الطفل: `MessagesDB` (قاعدة رسائل محلية — `isMessageUploadedToServer`)، `PersistenceManager` (التفضيلات: token، connectionId، polling/screenTime/scam-detection/explicit-monitoring)، `DevicesRepository` (VPN).
- الأب: `AsyncStorage` (جلسة/كاش JS) — الحالة الحقيقية خادمية (GraphQL).
- النماذج: `res/raw/` (ثنائيات `.ort`/`.onnx` + `tokenizer.json` + `tfidf_config.json`).

## 5. المطابقة القطعية للواجهات البرمجية

### 5.1 إحصائيات المطابقة:
- **تطبيق الأب:** GraphQL persisted queries (الآلية مؤكدة، العمليات غير مستخرجة)؛ OneSignal (IDs مؤكدة)؛ Iterable (تسويق)؛ Sentry مزدوج.
- **تطبيق الطفل:** 16 نقطة `BarkApi` + `BarkDataApi` + `ScreenTimeApi` (كلها مقروءة)؛ 3 مضيفين؛ مصادقة `Token token=`؛ مهلات 60s.
- **مفردات الأوامر:** ~50 فعل بث `bark.intent.action.*` + دفع OneSignal الصامت (`attention`/`ttl_in_seconds`).

## 6. مصفوفة التغطية الوظيفية

### 6.1 وظائف مؤكدة (Level A — Confirmed)
| # | الوظيفة | الدليل |
|---|---|---|
| 1 | تهيئة جسر RN (Fabric + Hermes v98 + المكوّن "Bark") | `MainActivity.java`، `MainApplication.java` |
| 2 | 20 حزمة أصلية (تخزين/بصمة/دفع/إشعارات/إعدادات/WebView) | `PackageList.java` |
| 3 | جسر الإعدادات `RNCConfig` (reflection على `BuildConfig`) | `RNCConfigModuleImpl.java` |
| 4 | GraphQL persisted queries (SHA256) | `index.android.bundle` |
| 5 | OneSignal (IDs) + Iterable + Sentry مزدوج | `BuildConfig.java`، `strings.xml`، الحزمة |
| 6 | خريطة الروابط العميقة (~140 مسار محتوى خبير) | `AndroidManifest.xml` (الأب) |
| 7 | الإقران: `POST login` بجسم `{password: <code>, log: {...}}` | `LoginHelper.java` |
| 8 | بوابات القدرات (`checkins`/`polling`/`screenTime`) | `SignInPresenterImpl.java` |
| 9 | تسجيل الجهاز `POST children/{id}/connections/android` | `BarkApi.java`، `AddChildPresenterImpl.java` |
| 10 | REST v2 (16 نقطة) + 3 مضيفين + `Token token=` | `BarkApi.java`، `BarkRestClient.java` |
| 11 | مفردات `BarkBroadcasts` (~50 فعلاً) | `BarkBroadcasts.java` |
| 12 | دفع "الانتباه" (TTL مقلّم 1800s) + تحديث السياج الصامت | `NotificationServiceExtension.java` |
| 13 | خط الرفع `ServerUpdate` (بوابات + idempotency + 401) | `ServerUpdate.java` |
| 14 | محرك ONNX (3 نماذج + مشغّل + خط `TextAnalyzer`) | `res/raw/`، `us/bark/sdk/analysis/` |
| 15 | تصنيف 12 تسمية + عتبة 0.97 | `TextAnalyzer.java` |
| 16 | مصنّف الرموز القصيرة (TF-IDF + شروط التفعيل الخمسة) | `OTPClassifier.java`، `AnalysisManager.java` |
| 17 | سياسات الحذف التلقائي (وسائط/احتيال) | `AnalysisManager.java` |
| 18 | الثنائية VPN + Accessibility (بلا DeviceAdmin) | `BarkVpnService.java`، `BarkAccessibilityService.java` |
| 19 | فوترة NitroIAP/OpenIAP + بوابة البصمة | `PackageList.java`، `com/rnbiometrics/` |
| 20 | إعادة استخدام رمز الجهاز (إقران/مضاد إلغاء/وصول مؤقت) | `strings.xml` (الطفل) |

### 6.2 وظائف مشتقة (Level B — Derived)
- رابط GraphQL للأب وقائمة عملياته (مشفّر/minified).
- توليد رمز الجهاز في الأب (قسم Account — JS).
- التصنيف التنبيهي (الفئات: تنمر/انتحار/...) خادمي بالكامل.
- توقيت دفع السحابة للطفل بعد تغيير الأب.
- دور `mfaondevice_1_1234567890.onnx` (تحقق على الجهاز على الأرجح).

### 6.3 وظائف جزئية (Partial)
- شاشات لوحة الأب التفصيلية (الحزمة minified — البنية غير مستخرجة).
- قائمة عمليات GraphQL للأب (الآلية مؤكدة، العمليات لا).

### 6.4 وظائف غير موجودة (Not Found — فجوات موثقة)
- **ذكاء اصطناعي على الجهاز في تطبيق الأب:** صفر (بحث شامل).
- **قناة مباشرة أب↔طفل:** صفر (بحث شامل — السحابة وسيط وحيد).
- **DeviceAdmin في تطبيق الطفل:** صفر (بحث شامل — رمز الجهاز بديلاً).
- **توقيع أوامر البث:** غائب (`exported=true` بلا تحقق — ثغرة).

## 7. الفجوات المعمارية وتوصيات السد

1. **رابط/عمليات GraphQL للأب** ← يُسد بفك Hermes (`hbcdump`) أو مراقبة شبكية حية — أولوية متوسطة (الطفل يغني للبناء).
2. **دعم العربية في النماذج** ← فجوة لغوية: نماذج Bark إنجليزية — Family OS يدرّب/يكيّف نماذج ثنائية اللغة (أولوية عالية لخط الذكاء).
3. **توقيع الأوامر** ← Bark بلا توقيع؛ Family OS يفرض توقيع كل أمر + مستقبلات غير مصدَّرة (أولوية أمنية عالية).
4. **انتهاء رمز الجهاز** ← غير مرصود؛ Family OS يضيف TTL ومعدل محاولات.
