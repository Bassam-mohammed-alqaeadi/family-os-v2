# فهرس وتوصيف ملفات التخطيط المفككة (100 Decoded XML Layouts)
# Qustodio Parental Control Layout Catalog

> **المسار:** `benchmarks/extracted/qustodio/02_design_system_and_ui/all_layouts/`  
> **إجمالي ملفات التخطيط:** 100 ملف XML  
> **المصدر:** فك حزمة `qustodio.apk` عبر Apktool في مجلدات `res/layout*/`  

---

## 1. التوزيع الهيكلي حسب الفئة الوظيفية

| الفئة الوظيفية | عدد الملفات | النطاق والاستخدام في Qustodio |
|---|---|---|
| **In-App Messaging & Retention (Braze)** | 30 | إدارة إشعارات ورسائل التوجيه داخل التطبيق، بطاقات الأخبار والميزات الترويجية |
| **Material / Support Components (AppCompat)** | 32 | أشرطة الأدوات، القوائم المنسدلة، مربعات البحث، والحوارات القياسية |
| **System Notifications & Media** | 15 | إشعارات البقاء بالخلفية، إشعارات الطوارئ، وتنبيهات القفل المستمر |
| **Native Overlay Containers & Cards** | 10 | شاشات الحظر المنبثقة، بطاقات الإعداد، والحاويات المتجاوبة (عمودي/أفقي/أجهزة لوحية) |
| **Authentication & Biometrics** | 2 | واجهة المصادقة بالبصمة الحيوية لمنع الأطفال من فتح التطبيق |
| **Location & Maps** | 1 | نافذة تفاصيل الموقع الجغرافي للطفل فوق خريطة Google Maps |
| **Web & Browser Actions** | 2 | قوائم الخيارات وروابط التصفح السريع |
| **General UI & A/B Testing** | 8 | اختبارات واجهات الإدخال، شاشة البداية، وقوائم الاختيار |

---

## 2. الدليل التفصيلي الشامل لكافة ملفات التخطيط الـ 100

| # | اسم الملف | الفئة | العنصر الجذري (Root View) | عدد المعرفات (IDs) | أبرز المعرفات | الوصف الوظيفي |
|---|---|---|---|---|---|---|
| 1 | `abc_action_bar_title_item.xml` | Material / Support Components | `LinearLayout` | 2 | `action_bar_title, action_bar_subtitle` | Android AppCompat support action bars, dialogs, popups and search views |
| 2 | `abc_action_bar_up_container.xml` | Material / Support Components | `LinearLayout` | 0 | `None` | Android AppCompat support action bars, dialogs, popups and search views |
| 3 | `abc_action_menu_item_layout.xml` | Material / Support Components | `androidx.appcompat.view.menu.ActionMenuItemView` | 0 | `None` | Android AppCompat support action bars, dialogs, popups and search views |
| 4 | `abc_action_menu_layout.xml` | Material / Support Components | `androidx.appcompat.widget.ActionMenuView` | 0 | `None` | Android AppCompat support action bars, dialogs, popups and search views |
| 5 | `abc_action_mode_bar.xml` | Material / Support Components | `androidx.appcompat.widget.ActionBarContextView` | 0 | `None` | Android AppCompat support action bars, dialogs, popups and search views |
| 6 | `abc_action_mode_close_item_material.xml` | Material / Support Components | `ImageView` | 1 | `action_mode_close_button` | Android AppCompat support action bars, dialogs, popups and search views |
| 7 | `abc_activity_chooser_view.xml` | Material / Support Components | `view` | 5 | `activity_chooser_view_content, expand_activities_button, image` | Android AppCompat support action bars, dialogs, popups and search views |
| 8 | `abc_activity_chooser_view_list_item.xml` | Material / Support Components | `LinearLayout` | 3 | `list_item, icon, title` | Android AppCompat support action bars, dialogs, popups and search views |
| 9 | `abc_alert_dialog_button_bar_material.xml` | Material / Support Components | `ScrollView` | 5 | `buttonPanel, @android:id/button3, spacer` | Android AppCompat support action bars, dialogs, popups and search views |
| 10 | `abc_alert_dialog_button_bar_material_watch.xml` | Material / Support Components | `androidx.appcompat.widget.ButtonBarLayout` | 4 | `buttonPanel, @android:id/button3, @android:id/button2` | Android AppCompat support action bars, dialogs, popups and search views |
| 11 | `abc_alert_dialog_material.xml` | Material / Support Components | `androidx.appcompat.widget.AlertDialogLayout` | 10 | `parentPanel, contentPanel, scrollIndicatorUp` | Android AppCompat support action bars, dialogs, popups and search views |
| 12 | `abc_alert_dialog_title_material.xml` | Material / Support Components | `LinearLayout` | 5 | `topPanel, title_template, @android:id/icon` | Android AppCompat support action bars, dialogs, popups and search views |
| 13 | `abc_alert_dialog_title_material_watch.xml` | Material / Support Components | `LinearLayout` | 5 | `topPanel, title_template, @android:id/icon` | Android AppCompat support action bars, dialogs, popups and search views |
| 14 | `abc_cascading_menu_item_layout.xml` | Material / Support Components | `androidx.appcompat.view.menu.ListMenuItemView` | 5 | `group_divider, content, title` | Android AppCompat support action bars, dialogs, popups and search views |
| 15 | `abc_dialog_title_material.xml` | Material / Support Components | `androidx.appcompat.widget.FitWindowsLinearLayout` | 1 | `title` | Android AppCompat support action bars, dialogs, popups and search views |
| 16 | `abc_expanded_menu_layout.xml` | Material / Support Components | `androidx.appcompat.view.menu.ExpandedMenuView` | 1 | `expanded_menu` | Android AppCompat support action bars, dialogs, popups and search views |
| 17 | `abc_list_menu_item_checkbox.xml` | Material / Support Components | `CheckBox` | 1 | `checkbox` | Android AppCompat support action bars, dialogs, popups and search views |
| 18 | `abc_list_menu_item_icon.xml` | Material / Support Components | `ImageView` | 1 | `icon` | Android AppCompat support action bars, dialogs, popups and search views |
| 19 | `abc_list_menu_item_layout.xml` | Material / Support Components | `androidx.appcompat.view.menu.ListMenuItemView` | 2 | `title, shortcut` | Android AppCompat support action bars, dialogs, popups and search views |
| 20 | `abc_list_menu_item_radio.xml` | Material / Support Components | `RadioButton` | 1 | `radio` | Android AppCompat support action bars, dialogs, popups and search views |
| 21 | `abc_popup_menu_header_item_layout.xml` | Material / Support Components | `FrameLayout` | 1 | `@android:id/title` | Android AppCompat support action bars, dialogs, popups and search views |
| 22 | `abc_popup_menu_item_layout.xml` | Material / Support Components | `androidx.appcompat.view.menu.ListMenuItemView` | 5 | `group_divider, content, title` | Android AppCompat support action bars, dialogs, popups and search views |
| 23 | `abc_screen_content_include.xml` | Material / Support Components | `merge` | 1 | `action_bar_activity_content` | Android AppCompat support action bars, dialogs, popups and search views |
| 24 | `abc_screen_simple.xml` | Material / Support Components | `androidx.appcompat.widget.FitWindowsLinearLayout` | 2 | `action_bar_root, action_mode_bar_stub` | Android AppCompat support action bars, dialogs, popups and search views |
| 25 | `abc_screen_simple_overlay_action_mode.xml` | Material / Support Components | `androidx.appcompat.widget.FitWindowsFrameLayout` | 2 | `action_bar_root, action_mode_bar_stub` | Android AppCompat support action bars, dialogs, popups and search views |
| 26 | `abc_screen_toolbar.xml` | Material / Support Components | `androidx.appcompat.widget.ActionBarOverlayLayout` | 4 | `decor_content_parent, action_bar_container, action_bar` | Android AppCompat support action bars, dialogs, popups and search views |
| 27 | `abc_screen_toolbar_v26.xml` | Material / Support Components | `androidx.appcompat.widget.ActionBarOverlayLayout` | 4 | `decor_content_parent, action_bar_container, action_bar` | Android AppCompat support action bars, dialogs, popups and search views |
| 28 | `abc_search_dropdown_item_icons_2line.xml` | Material / Support Components | `RelativeLayout` | 5 | `@android:id/icon1, edit_query, @android:id/icon2` | Android AppCompat support action bars, dialogs, popups and search views |
| 29 | `abc_search_view.xml` | Material / Support Components | `LinearLayout` | 11 | `search_bar, search_badge, search_button` | Android AppCompat support action bars, dialogs, popups and search views |
| 30 | `abc_select_dialog_material.xml` | Material / Support Components | `view` | 1 | `select_dialog_listview` | Android AppCompat support action bars, dialogs, popups and search views |
| 31 | `abc_tooltip.xml` | Material / Support Components | `LinearLayout` | 1 | `message` | Android AppCompat support action bars, dialogs, popups and search views |
| 32 | `banner.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamFrameLayout` | 5 | `banner_root, banner_content_root, banner_image` | Responsive native overlay cards, dialogs and modal host containers |
| 33 | `biometric_activity.xml` | Authentication & Biometrics | `FrameLayout` | 0 | `None` | Biometric fingerprint prompt, status indicators and error animations |
| 34 | `browser_actions_context_menu_page.xml` | Web & Browser Actions | `androidx.browser.browseractions.BrowserActionsFallbackMenuView` | 3 | `browser_actions_menu_view, browser_actions_header_text, browser_actions_menu_items` | Context menu and shortcut rows for custom web browser tabs |
| 35 | `browser_actions_context_menu_row.xml` | Web & Browser Actions | `LinearLayout` | 2 | `browser_actions_menu_item_text, browser_actions_menu_item_icon` | Context menu and shortcut rows for custom web browser tabs |
| 36 | `card.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamCardView` | 1 | `card_root` | Responsive native overlay cards, dialogs and modal host containers |
| 37 | `card_land.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamCardView` | 1 | `card_root` | Responsive native overlay cards, dialogs and modal host containers |
| 38 | `card_landscape_inner_land.xml` | General UI Components | `com.google.firebase.inappmessaging.display.internal.layout.CardLayoutLandscape` | 8 | `card_content_root, image_view, message_title` | Support dialogs, spinners, and list choice items |
| 39 | `card_portrait_inner.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.CardLayoutPortrait` | 8 | `card_content_root, image_view, message_title` | Responsive native overlay cards, dialogs and modal host containers |
| 40 | `com_braze_captioned_image_card.xml` | In-App Messaging & Retention | `merge` | 5 | `com_braze_captioned_image_card_imageview_stub, com_braze_captioned_image_card_title_container, com_braze_captioned_image_title` | Braze in-app cards, slideups, modal graphics and feed cards |
| 41 | `com_braze_captioned_image_content_card.xml` | In-App Messaging & Retention | `RelativeLayout` | 7 | `com_braze_content_cards_captioned_image_card_image_container, com_braze_content_cards_captioned_image_card_image, com_braze_content_cards_pinned_icon` | Braze in-app cards, slideups, modal graphics and feed cards |
| 42 | `com_braze_content_cards.xml` | In-App Messaging & Retention | `androidx.swiperefreshlayout.widget.SwipeRefreshLayout` | 2 | `braze_content_cards_swipe_container, com_braze_content_cards_recycler` | Braze in-app cards, slideups, modal graphics and feed cards |
| 43 | `com_braze_content_cards_activity.xml` | In-App Messaging & Retention | `LinearLayout` | 1 | `com_braze_content_cards` | Braze in-app cards, slideups, modal graphics and feed cards |
| 44 | `com_braze_content_cards_empty.xml` | In-App Messaging & Retention | `LinearLayout` | 1 | `com_braze_content_cards_network_unavailable` | Braze in-app cards, slideups, modal graphics and feed cards |
| 45 | `com_braze_default_card.xml` | In-App Messaging & Retention | `merge` | 1 | `tag` | Braze in-app cards, slideups, modal graphics and feed cards |
| 46 | `com_braze_default_content_card.xml` | In-App Messaging & Retention | `RelativeLayout` | 0 | `None` | Braze in-app cards, slideups, modal graphics and feed cards |
| 47 | `com_braze_feed.xml` | In-App Messaging & Retention | `androidx.swiperefreshlayout.widget.SwipeRefreshLayout` | 8 | `braze_feed_swipe_container, com_braze_feed_root, com_braze_feed_loading_spinner` | Braze in-app cards, slideups, modal graphics and feed cards |
| 48 | `com_braze_feed_activity.xml` | In-App Messaging & Retention | `LinearLayout` | 1 | `com_braze_feed` | Braze in-app cards, slideups, modal graphics and feed cards |
| 49 | `com_braze_feed_footer.xml` | In-App Messaging & Retention | `View` | 1 | `tag` | Braze in-app cards, slideups, modal graphics and feed cards |
| 50 | `com_braze_feed_header.xml` | In-App Messaging & Retention | `View` | 1 | `tag` | Braze in-app cards, slideups, modal graphics and feed cards |
| 51 | `com_braze_feed_read_indicator_holder.xml` | In-App Messaging & Retention | `merge` | 1 | `com_braze_newsfeed_item_read_indicator_image_switcher` | Braze in-app cards, slideups, modal graphics and feed cards |
| 52 | `com_braze_image_only_card.xml` | In-App Messaging & Retention | `merge` | 1 | `com_braze_image_only_card_imageview_stub` | Braze in-app cards, slideups, modal graphics and feed cards |
| 53 | `com_braze_image_only_content_card.xml` | In-App Messaging & Retention | `RelativeLayout` | 3 | `com_braze_content_cards_image_only_card_image, com_braze_content_cards_pinned_icon, com_braze_content_cards_unread_bar` | Braze in-app cards, slideups, modal graphics and feed cards |
| 54 | `com_braze_inappmessage_full.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageFullView` | 15 | `com_braze_inappmessage_full_frame, com_braze_inappmessage_full, com_braze_inappmessage_full_all_content_parent` | Braze in-app cards, slideups, modal graphics and feed cards |
| 55 | `com_braze_inappmessage_full_graphic.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageFullView` | 9 | `com_braze_inappmessage_full_frame, com_braze_inappmessage_full, com_braze_inappmessage_full_imageview` | Braze in-app cards, slideups, modal graphics and feed cards |
| 56 | `com_braze_inappmessage_html.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageHtmlView` | 2 | `com_braze_inappmessage_html, com_braze_inappmessage_html_webview` | Braze in-app cards, slideups, modal graphics and feed cards |
| 57 | `com_braze_inappmessage_html_full.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageHtmlFullView` | 2 | `com_braze_inappmessage_html_full, com_braze_inappmessage_html_full_webview` | Braze in-app cards, slideups, modal graphics and feed cards |
| 58 | `com_braze_inappmessage_html_full_land.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageHtmlFullView` | 2 | `com_braze_inappmessage_html_full, com_braze_inappmessage_html_full_webview` | Braze in-app cards, slideups, modal graphics and feed cards |
| 59 | `com_braze_inappmessage_modal.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageModalView` | 17 | `com_braze_inappmessage_modal_container, com_braze_inappmessage_modal_frame, com_braze_inappmessage_modal` | Braze in-app cards, slideups, modal graphics and feed cards |
| 60 | `com_braze_inappmessage_modal_graphic.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageModalView` | 11 | `com_braze_inappmessage_modal_container, com_braze_inappmessage_modal_frame, com_braze_inappmessage_modal_graphic_bound` | Braze in-app cards, slideups, modal graphics and feed cards |
| 61 | `com_braze_inappmessage_slideup.xml` | In-App Messaging & Retention | `com.braze.ui.inappmessage.views.InAppMessageSlideupView` | 7 | `com_braze_inappmessage_slideup, com_braze_inappmessage_slideup_container, com_braze_inappmessage_slideup_image_layout` | Braze in-app cards, slideups, modal graphics and feed cards |
| 62 | `com_braze_notification_inline_image.xml` | In-App Messaging & Retention | `LinearLayout` | 11 | `com_braze_inline_image_push_layout, com_braze_inline_image_push_text_area, com_braze_inline_image_push_text_area_header_layout` | Braze in-app cards, slideups, modal graphics and feed cards |
| 63 | `com_braze_push_inline_image_constrained.xml` | In-App Messaging & Retention | `LinearLayout` | 5 | `com_braze_inline_image_push_layout, com_braze_inline_image_push_text_area, com_braze_inline_image_title_content_layout` | Braze in-app cards, slideups, modal graphics and feed cards |
| 64 | `com_braze_push_story_one_image.xml` | In-App Messaging & Retention | `FrameLayout` | 9 | `com_braze_story_full_layout, com_braze_story_relative_layout, com_braze_story_image_view` | Braze in-app cards, slideups, modal graphics and feed cards |
| 65 | `com_braze_short_news_card.xml` | In-App Messaging & Retention | `merge` | 5 | `com_braze_short_news_card_image, com_braze_short_news_card_imageview_stub, com_braze_short_news_card_title` | Braze in-app cards, slideups, modal graphics and feed cards |
| 66 | `com_braze_short_news_content_card.xml` | In-App Messaging & Retention | `RelativeLayout` | 7 | `com_braze_content_cards_short_news_card_image_container, com_braze_content_cards_short_news_card_image, com_braze_content_cards_pinned_icon` | Braze in-app cards, slideups, modal graphics and feed cards |
| 67 | `com_braze_stubbed_feed_image_view.xml` | In-App Messaging & Retention | `RelativeLayout` | 2 | `com_braze_stubbed_feed_image_view_parent, com_braze_stubbed_feed_image_view` | Braze in-app cards, slideups, modal graphics and feed cards |
| 68 | `com_braze_text_announcement_card.xml` | In-App Messaging & Retention | `merge` | 3 | `com_braze_text_announcement_card_title, com_braze_text_announcement_card_description, com_braze_text_announcement_card_domain` | Braze in-app cards, slideups, modal graphics and feed cards |
| 69 | `com_braze_text_announcement_content_card.xml` | In-App Messaging & Retention | `RelativeLayout` | 5 | `com_braze_content_cards_text_announcement_card_title, com_braze_content_cards_text_announcement_card_description, com_braze_content_cards_action_hint` | Braze in-app cards, slideups, modal graphics and feed cards |
| 70 | `com_braze_webview_activity.xml` | In-App Messaging & Retention | `RelativeLayout` | 1 | `com_braze_webview_activity_webview` | Braze in-app cards, slideups, modal graphics and feed cards |
| 71 | `custom_dialog.xml` | Native Overlay Containers | `RelativeLayout` | 1 | `dialog_button` | Responsive native overlay cards, dialogs and modal host containers |
| 72 | `dummy_infowindow.xml` | Location & Maps | `LinearLayout` | 0 | `None` | Google Maps custom marker popup bubble for child location tracking |
| 73 | `fingerprint_dialog_layout.xml` | Authentication & Biometrics | `ScrollView` | 4 | `fingerprint_subtitle, fingerprint_description, fingerprint_icon` | Biometric fingerprint prompt, status indicators and error animations |
| 74 | `image.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamFrameLayout` | 4 | `image_root, image_content_root, image_view` | Responsive native overlay cards, dialogs and modal host containers |
| 75 | `ime_base_split_test_activity.xml` | A/B Testing & Input | `LinearLayout` | 0 | `None` | IME input method editor split test evaluation activity layout |
| 76 | `ime_secondary_split_test_activity.xml` | A/B Testing & Input | `LinearLayout` | 2 | `edit_text_id, hide_ime_id` | IME input method editor split test evaluation activity layout |
| 77 | `modal.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamRelativeLayout` | 2 | `modal_root, collapse_button` | Responsive native overlay cards, dialogs and modal host containers |
| 78 | `modal_land.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamRelativeLayout` | 8 | `modal_root, modal_content_root, image_view` | Responsive native overlay cards, dialogs and modal host containers |
| 79 | `modal_portrait_inner.xml` | General UI Components | `com.google.firebase.inappmessaging.display.internal.layout.ModalLayoutPortrait` | 6 | `modal_content_root, message_title, image_view` | Support dialogs, spinners, and list choice items |
| 80 | `modal_sw600dp.xml` | Native Overlay Containers | `com.google.firebase.inappmessaging.display.internal.layout.FiamRelativeLayout` | 2 | `modal_root, collapse_button` | Responsive native overlay cards, dialogs and modal host containers |
| 81 | `notification_action.xml` | System Notifications | `LinearLayout` | 3 | `action_container, action_image, action_text` | Ongoing foreground service and lock/alert status notification template |
| 82 | `notification_action_tombstone.xml` | System Notifications | `LinearLayout` | 3 | `action_container, action_image, action_text` | Ongoing foreground service and lock/alert status notification template |
| 83 | `notification_media_action.xml` | System Notifications | `ImageButton` | 1 | `action0` | Ongoing foreground service and lock/alert status notification template |
| 84 | `notification_media_cancel_action.xml` | System Notifications | `ImageButton` | 1 | `cancel_action` | Ongoing foreground service and lock/alert status notification template |
| 85 | `notification_template_big_media.xml` | System Notifications | `RelativeLayout` | 3 | `status_bar_latest_event_content, media_actions, action_divider` | Ongoing foreground service and lock/alert status notification template |
| 86 | `notification_template_big_media_custom.xml` | System Notifications | `RelativeLayout` | 9 | `status_bar_latest_event_content, notification_main_column_container, notification_main_column` | Ongoing foreground service and lock/alert status notification template |
| 87 | `notification_template_big_media_narrow.xml` | System Notifications | `RelativeLayout` | 4 | `status_bar_latest_event_content, icon, media_actions` | Ongoing foreground service and lock/alert status notification template |
| 88 | `notification_template_big_media_narrow_custom.xml` | System Notifications | `RelativeLayout` | 10 | `status_bar_latest_event_content, icon, notification_main_column_container` | Ongoing foreground service and lock/alert status notification template |
| 89 | `notification_template_custom_big.xml` | System Notifications | `FrameLayout` | 9 | `notification_background, notification_main_column_container, notification_main_column` | Ongoing foreground service and lock/alert status notification template |
| 90 | `notification_template_icon_group.xml` | System Notifications | `FrameLayout` | 3 | `icon_group, icon, right_icon` | Ongoing foreground service and lock/alert status notification template |
| 91 | `notification_template_lines_media.xml` | System Notifications | `LinearLayout` | 8 | `line1, title, time` | Ongoing foreground service and lock/alert status notification template |
| 92 | `notification_template_media.xml` | System Notifications | `LinearLayout` | 3 | `status_bar_latest_event_content, media_actions, end_padder` | Ongoing foreground service and lock/alert status notification template |
| 93 | `notification_template_media_custom.xml` | System Notifications | `LinearLayout` | 9 | `status_bar_latest_event_content, notification_main_column_container, notification_main_column` | Ongoing foreground service and lock/alert status notification template |
| 94 | `notification_template_part_chronometer.xml` | System Notifications | `Chronometer` | 1 | `chronometer` | Ongoing foreground service and lock/alert status notification template |
| 95 | `notification_template_part_time.xml` | System Notifications | `DateTimeView` | 1 | `time` | Ongoing foreground service and lock/alert status notification template |
| 96 | `select_dialog_item_material.xml` | General UI Components | `TextView` | 1 | `@android:id/text1` | Support dialogs, spinners, and list choice items |
| 97 | `select_dialog_multichoice_material.xml` | General UI Components | `CheckedTextView` | 1 | `@android:id/text1` | Support dialogs, spinners, and list choice items |
| 98 | `select_dialog_singlechoice_material.xml` | General UI Components | `CheckedTextView` | 1 | `@android:id/text1` | Support dialogs, spinners, and list choice items |
| 99 | `splash_screen_view.xml` | App Lifecycle | `FrameLayout` | 1 | `splashscreen_icon_view` | App cold-start splash screen brand container |
| 100 | `support_simple_spinner_dropdown_item.xml` | General UI Components | `TextView` | 1 | `@android:id/text1` | Support dialogs, spinners, and list choice items |
