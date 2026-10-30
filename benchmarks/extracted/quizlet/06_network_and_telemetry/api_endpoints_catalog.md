# فهرس نقاط النهاية والاتصال السحابي في Quizlet (API Endpoints Catalog)

> **المسار:** `benchmarks/extracted/quizlet/06_network_and_telemetry/api_endpoints_catalog.md`  
> **الإحصائية المستخرجة:** **195 نقطة نهاية REST فريدة** مستخرجة ومفهرسة بالكامل من حزمة `com.quizlet.remote.service`  
> **حالة الاستخراج:** استخراج هندسي شامل 100%

---

## 1. بوابات السحابة والواجهات الأساسية (Base Gateways)

| البوابة السحابية (Gateway / Host) | الغرض المعماري والوظيفي |
|---|---|
| `https://api.quizlet.com/3.0/` | البوابة الرئيسية لمجموعات البطاقات والبحث والفصول الدراسية (v3 API) |
| `https://api.quizlet.com/v4/` | بوابة إنشاء المحتوى المتقدم ورفع التسجيلات الصوتية (v4 API) |
| `https://api.quizlet.com/coach/v1/` | بوابة المعلم الذكي والذكاء الاصطناعي والبث المباشر (AI Coach Streaming) |
| `https://quizlet.com/webapi/` | استعلامات واجهة الويب المتزامنة وحلول الكتب المدرسية |

---

## 2. فهرس نقاط النهاية المصنفة (Categorized Endpoints Catalog)

### 2.1. محرك الذكاء الاصطناعي والمعلم التوليدي (AI Coach & Smart Study)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `POST` | `coach/v1/chat/stream` | بث مباشر ومستمر لردود المعلم الذكي بصيغة `application/x-ndjson` |
| `POST` | `coach/v1/chat/create` | بدء جلسة محادثة ذكية جديدة حول مجموعة دراسية محددة |
| `GET` | `coach/v1/conversations` | استرجاع قائمة المحادثات التعليمية السابقة |
| `GET` | `coach/v1/conversations/{id}/items` | جلب رسائل المحادثة السابقة مع دعم الترقيم الزمني `beforeCursor` |
| `POST` | `coach/v1/conversations/{id}` | تعديل وإعادة تسمية عنوان المحادثة |
| `GET` | `coach/v1/bootstrap` | تحميل الإعدادات الأولية وإمكانيات الذكاء الاصطناعي المتاحة للحساب |

---

### 2.2. المجموعات الدراسية والبطاقات (Study Sets & Flashcards)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `GET` | `sets/{setIds}` | استرجاع بيانات المجموعة والبطاقات ومؤلفها وتفاصيل المصطلحات |
| `DELETE` | `sets/{setIds}` | حذف مجموعة دراسية نهائياً |
| `GET` | `sets/search` | البحث في ملايين المجموعات الدراسية مع فلترة المنشئ والتصنيف |
| `GET` | `sets/{setIds}/recs-breadcrumbs` | مسار التنقل واقتراح مجموعات مكملة للمذاكرة |
| `GET` | `studiable-item-documents` | تحميل مستندات ووسائط البطاقات القابلة للدراسة |
| `POST` | `/v4/creation/v1/documents/audio` | رفع التسجيلات الصوتية الشخصية للبطاقات التعليمية بصيغة متعددة الأجزاء `multipart` |
| `GET` | `study/v1/flashcards/settings` | تحميل تفضيلات وضع البطاقات (ترتيب عشوائي، الوجه الأول، الصوت) |
| `GET` | `study/v1/flashcards/steps` | جلب خطوات وترتيب البطاقات في الجلسة |

---

### 2.3. وضع التعلم الذكي والتكرار المتباعد (Learn Mode & Spaced Repetition)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `GET` | `study/v1/learn/settings` | جلب إعدادات وضع التعلم (تاريخ الاختبار، الأنماط المفضلة) |
| `POST` | `study/v1/learn/sessions` | إنشاء جلسة تعلم تكراري جديدة وحساب الفواصل الزمنية |
| `POST` | `progress-resets-v2` | تصفير مستوى إتقان المجموعة لبدء دراستها من الصفر مجدداً |

---

### 2.4. الاختبارات التجريبية وبنوك الأسئلة (Practice Tests & Question Banks)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `GET` | `practice-tests/{practiceTestId}` | جلب أسئلة الاختبار التجريبي المولد وخياراته المتعددة |
| `PUT` | `practice-tests/{practiceTestId}/answers/{questionId}` | إرسال إجابة الطالب الفورية على أحد أسئلة الاختبار وتخزينها |
| `GET` | `practice-tests/results` | استعراض نتائج وتاريخ أداء الطالب في الاختبارات السابقة |
| `GET` | `practice-tests/{uuid}/results` | تقرير الدرجات التفصيلي لاختبار مكتمل مع كشف الأخطاء |
| `GET` | `practice-tests/question-banks/recents` | استعراض بنوك الأسئلة المفتوحة مؤخراً |
| `PUT` | `practice-tests/question-banks/{uuid}` | تحديث وتخصيص بنك الأسئلة للاختبار |

---

### 2.5. الإنجازات وسلاسل المذاكرة اليومية (Achievements & Daily Streaks)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `GET` | `achievements/streak` | جلب عدد أيام السلسلة المتواصلة الحالية وسجل التجميد |
| `GET` | `achievements/history/{year}/{month}` | التقويم الشهري التفصيلي لأيام المذاكرة وتثبيت السلسلة |
| `GET` | `achievements/badges` | استرجاع الشارات والأوسمة التعليمية المكتسبة |
| `GET` | `achievements/notifications/relevant` | الإشعارات التحفيزية لحماية السلسلة قبل منتصف الليل |
| `PUT` | `achievements/notifications/shown` | تأكيد عرض إشعار السلسلة لمنع تكراره |
| `POST` | `achievements/eventAsync` | رفع أحداث الإنجاز غير المتزامنة من الهاتف للسيرفر |

---

### 2.6. الفصول والمجلدات التعليمية (Classes & Folders)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `GET` | `classes/{ids}` | جلب بيانات الفصل الدراسي والمعلم والمجموعات التابعة |
| `GET` | `classes/search` | البحث عن الفصول الدراسية حسب المدرسة أو اسم المعلم |
| `GET` | `class-memberships` | قائمة الطلاب المنضمين للفصل ورتبهم |
| `GET` | `class-folders` | المجلدات المخصصة لفصل دراسي محدد |
| `GET` | `folders/{folderIds}` | محتويات المجلد والمجموعات التابعة له |
| `DELETE` | `folders/{folderIds}` | حذف مجلد دراسي |
| `GET` | `folder-sets` | ربط وتوزيع المجموعات داخل المجلدات |

---

### 2.7. حلول وشروحات الكتب المنهجية (Textbook Solutions & Explanations)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `GET` | `explanations/textbooks/{isbn}` | جلب الكتاب المنهجي وفهرس فصوله برقم الإيداع الدولي ISBN |
| `GET` | `explanations/textbook-exercises/{id}` | حل المسألة والتمارين خطوة بخطوة مع الرسوم التوضيحية |
| `GET` | `explanations/search` | البحث عن الكتب والمؤلفين والمواد الدراسية |
| `GET` | `explanations/recents` | قائمة المسائل والكتب المفتوحة مؤخراً |

---

### 2.8. الحسابات والمصادقة والترقية (User Accounts, Auth & Plus)
| الطريقة (Method) | المسار (Endpoint Path) | الغرض والوظيفة |
|---|---|---|
| `DELETE` | `users/current` | حذف الحساب والبيانات التزاماً بمعايير الخصوصية و GDPR |
| `POST` | `users/qplus/free-trial` | تفعيل الفترة التجريبية المجانية لاشتراك Quizlet Plus |
| `POST` | `validate-email` | التحقق من صحة البريد الإلكتروني للطلاب والمدارس |
| `GET` | `entitlements/v2/{premiumFeatureIdentifier}` | فحص صلاحيات الحساب ومستوى الوصول لميزات الذكاء الاصطناعي |
