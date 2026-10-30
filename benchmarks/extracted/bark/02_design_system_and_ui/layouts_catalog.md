# فهرس وتوصيف ملفات التخطيط المفككة (152 Decoded XML Layouts)
# Bark Parental Controls Layout Catalog

> **المسار:** `benchmarks/extracted/bark/02_design_system_and_ui/all_layouts/`  
> **إجمالي ملفات التخطيط:** 152 ملف XML (142 ملف أساسي + 10 ملفات متكيفة حسب الاتجاه ودقة الشاشة `layout-land`, `layout-sw600dp`, `layout-v26`, `layout-watch`)  
> **المصدر:** فك حزمة `bark.apk` و `Bark .xapk` عبر Apktool v3.0.3  

---

## 1. التوزيع الهيكلي حسب الفئة الوظيفية

| الفئة الوظيفية | عدد الملفات | النطاق والاستخدام في Bark و Family OS |
|---|---|---|
| **Material 3 & Support Controls** | 70 | مكوّنات Material Design 3 القياسية، أشرطة الأدوات، حقول الإدخال، والأزرار |
| **Bark In-App Messaging & Notifications** | 18 | إشعارات الخلفية الدائمة لخدمات الرصد والـ VPN، وإشعارات OneSignal التفاعلية وتنبيهات الخطر |
| **Date & Calendar Pickers** | 27 | منتقي التواريخ والجداول الزمنية لوقت المدرسة ووقت النوم والحظر الزمني |
| **Navigation & Bottom Sheets** | 6 | القوائم السفلية المنبثقة، أشرطة التنقل، وشاشات اختيار الطفل والجهاز |
| **Custom Dialogs & Overlays** | 25 | مربعات التأكيد، تنبيهات إيقاف الإنترنت، وشاشات تأكيد الرمز التعريفي |
| **Authentication & Biometrics** | 1 | واجهات المصادقة ببصمة الإصبع لحماية وضع الوالدين ومنع الطفل من تغيير الإعدادات |
| **React Native Catalyst & Debug Hosts** | 5 | حاويات استضافة جسر React Native وشاشات عرض معدل الإطارات وسجلات التطوير |

---

## 2. الدليل التفصيلي الشامل لكافة ملفات التخطيط الـ 152

| # | مسار الملف | الفئة الوظيفية | العنصر الجذري (Root View) | عدد المعرفات (IDs) | أبرز المعرفات | الحجم (بايت) |
|---|---|---|---|---|---|---|
| 1 | `abc_action_bar_title_item.xml` | Material 3 & Support Controls | `LinearLayout` | 2 | `action_bar_title, action_bar_subtitle` | 759 |
| 2 | `abc_action_bar_up_container.xml` | Material 3 & Support Controls | `LinearLayout` | 0 | `None` | 297 |
| 3 | `abc_action_menu_item_layout.xml` | Material 3 & Support Controls | `androidx.appcompat.view.menu.ActionMenuItemView` | 0 | `None` | 543 |
| 4 | `abc_action_menu_layout.xml` | Material 3 & Support Controls | `androidx.appcompat.widget.ActionMenuView` | 0 | `None` | 367 |
| 5 | `abc_action_mode_bar.xml` | Material 3 & Support Controls | `androidx.appcompat.widget.ActionBarContextView` | 0 | `None` | 311 |
| 6 | `abc_action_mode_close_item_material.xml` | Material 3 & Support Controls | `ImageView` | 1 | `action_mode_close_button` | 604 |
| 7 | `abc_activity_chooser_view.xml` | Material 3 & Support Controls | `view` | 5 | `activity_chooser_view_content, expand_activities_button, image` | 1592 |
| 8 | `abc_activity_chooser_view_list_item.xml` | Material 3 & Support Controls | `LinearLayout` | 3 | `list_item, icon, title` | 1123 |
| 9 | `abc_alert_dialog_button_bar_material.xml` | Custom Dialogs & Overlays | `ScrollView` | 5 | `buttonPanel, button3, spacer` | 1369 |
| 10 | `abc_alert_dialog_material.xml` | Custom Dialogs & Overlays | `androidx.appcompat.widget.AlertDialogLayout` | 10 | `parentPanel, contentPanel, scrollIndicatorUp` | 2670 |
| 11 | `abc_alert_dialog_title_material.xml` | Custom Dialogs & Overlays | `LinearLayout` | 5 | `topPanel, title_template, icon` | 1356 |
| 12 | `abc_cascading_menu_item_layout.xml` | Material 3 & Support Controls | `androidx.appcompat.view.menu.ListMenuItemView` | 5 | `group_divider, content, title` | 1897 |
| 13 | `abc_dialog_title_material.xml` | Custom Dialogs & Overlays | `androidx.appcompat.widget.FitWindowsLinearLayout` | 1 | `title` | 922 |
| 14 | `abc_expanded_menu_layout.xml` | Material 3 & Support Controls | `androidx.appcompat.view.menu.ExpandedMenuView` | 1 | `expanded_menu` | 264 |
| 15 | `abc_list_menu_item_checkbox.xml` | Material 3 & Support Controls | `CheckBox` | 1 | `checkbox` | 344 |
| 16 | `abc_list_menu_item_icon.xml` | Material 3 & Support Controls | `ImageView` | 1 | `icon` | 530 |
| 17 | `abc_list_menu_item_layout.xml` | Material 3 & Support Controls | `androidx.appcompat.view.menu.ListMenuItemView` | 2 | `title, shortcut` | 1302 |
| 18 | `abc_list_menu_item_radio.xml` | Material 3 & Support Controls | `RadioButton` | 1 | `radio` | 344 |
| 19 | `abc_popup_menu_header_item_layout.xml` | Material 3 & Support Controls | `FrameLayout` | 1 | `title` | 651 |
| 20 | `abc_popup_menu_item_layout.xml` | Material 3 & Support Controls | `androidx.appcompat.view.menu.ListMenuItemView` | 5 | `group_divider, content, title` | 2137 |
| 21 | `abc_screen_content_include.xml` | Material 3 & Support Controls | `merge` | 1 | `action_bar_activity_content` | 392 |
| 22 | `abc_screen_simple.xml` | Material 3 & Support Controls | `androidx.appcompat.widget.FitWindowsLinearLayout` | 2 | `action_bar_root, action_mode_bar_stub` | 685 |
| 23 | `abc_screen_simple_overlay_action_mode.xml` | Material 3 & Support Controls | `androidx.appcompat.widget.FitWindowsFrameLayout` | 2 | `action_bar_root, action_mode_bar_stub` | 652 |
| 24 | `abc_screen_toolbar.xml` | Material 3 & Support Controls | `androidx.appcompat.widget.ActionBarOverlayLayout` | 4 | `decor_content_parent, action_bar_container, action_bar` | 1297 |
| 25 | `abc_search_dropdown_item_icons_2line.xml` | Material 3 & Support Controls | `RelativeLayout` | 5 | `icon1, edit_query, icon2` | 2047 |
| 26 | `abc_search_view.xml` | Material 3 & Support Controls | `LinearLayout` | 11 | `search_bar, search_badge, search_button` | 3884 |
| 27 | `abc_select_dialog_material.xml` | Custom Dialogs & Overlays | `view` | 1 | `select_dialog_listview` | 793 |
| 28 | `abc_tooltip.xml` | Material 3 & Support Controls | `LinearLayout` | 1 | `message` | 961 |
| 29 | `alert_title_layout.xml` | Bark In-App Messaging & Notifications | `LinearLayout` | 1 | `alert_title` | 683 |
| 30 | `autofill_inline_suggestion.xml` | Material 3 & Support Controls | `LinearLayout` | 4 | `autofill_inline_suggestion_start_icon, autofill_inline_suggestion_title, autofill_inline_suggestion_subtitle` | 1250 |
| 31 | `browser_actions_context_menu_page.xml` | Material 3 & Support Controls | `androidx.browser.browseractions.BrowserActionsFallbackMenuView` | 3 | `browser_actions_menu_view, browser_actions_header_text, browser_actions_menu_items` | 1370 |
| 32 | `browser_actions_context_menu_row.xml` | Material 3 & Support Controls | `LinearLayout` | 2 | `browser_actions_menu_item_icon, browser_actions_menu_item_text` | 904 |
| 33 | `by_qualifier/layout-land/com_facebook_sso_noapp_dialog.xml` | Custom Dialogs & Overlays | `LinearLayout` | 5 | `com_facebook_sso_noapp_title, com_facebook_sso_noapp_close, com_facebook_sso_noapp_body` | 3064 |
| 34 | `by_qualifier/layout-land/material_clock_period_toggle_land.xml` | Material 3 & Support Controls | `com.google.android.material.button.MaterialButtonToggleGroup` | 3 | `material_clock_period_toggle, material_clock_period_am_button, material_clock_period_pm_button` | 1089 |
| 35 | `by_qualifier/layout-land/material_timepicker.xml` | Date & Calendar Pickers | `merge` | 5 | `material_timepicker_container, material_clock_display_and_toggle, material_clock_display` | 1520 |
| 36 | `by_qualifier/layout-land/mtrl_picker_header_dialog.xml` | Date & Calendar Pickers | `merge` | 2 | `mtrl_picker_header, mtrl_picker_header_title_and_selection` | 1635 |
| 37 | `by_qualifier/layout-sw600dp/design_layout_snackbar.xml` | Material 3 & Support Controls | `view` | 0 | `None` | 382 |
| 38 | `by_qualifier/layout-sw600dp/mtrl_layout_snackbar.xml` | Material 3 & Support Controls | `view` | 0 | `None` | 316 |
| 39 | `by_qualifier/layout-v26/abc_screen_toolbar.xml` | Material 3 & Support Controls | `androidx.appcompat.widget.ActionBarOverlayLayout` | 4 | `decor_content_parent, action_bar_container, action_bar` | 1338 |
| 40 | `by_qualifier/layout-v26/mtrl_calendar_month.xml` | Date & Calendar Pickers | `com.google.android.material.datepicker.MaterialCalendarGridView` | 1 | `month_grid` | 624 |
| 41 | `by_qualifier/layout-watch/abc_alert_dialog_button_bar_material.xml` | Custom Dialogs & Overlays | `androidx.appcompat.widget.ButtonBarLayout` | 4 | `buttonPanel, button3, button2` | 1065 |
| 42 | `by_qualifier/layout-watch/abc_alert_dialog_title_material.xml` | Custom Dialogs & Overlays | `LinearLayout` | 5 | `topPanel, title_template, icon` | 1201 |
| 43 | `com_facebook_activity_layout.xml` | Material 3 & Support Controls | `FrameLayout` | 1 | `com_facebook_fragment_container` | 241 |
| 44 | `com_facebook_device_auth_dialog_fragment.xml` | Custom Dialogs & Overlays | `androidx.cardview.widget.CardView` | 4 | `confirmation_code, progress_bar, com_facebook_device_auth_instructions` | 3201 |
| 45 | `com_facebook_login_fragment.xml` | Material 3 & Support Controls | `RelativeLayout` | 1 | `com_facebook_login_fragment_progress_bar` | 483 |
| 46 | `com_facebook_smart_device_dialog_fragment.xml` | Custom Dialogs & Overlays | `androidx.cardview.widget.CardView` | 6 | `confirmation_code, progress_bar, com_facebook_smart_instructions_0` | 3788 |
| 47 | `com_facebook_sso_noapp_dialog.xml` | Custom Dialogs & Overlays | `LinearLayout` | 5 | `com_facebook_sso_noapp_close, com_facebook_sso_noapp_title, com_facebook_sso_noapp_body` | 3251 |
| 48 | `com_facebook_tooltip_bubble.xml` | Material 3 & Support Controls | `RelativeLayout` | 5 | `com_facebook_body_frame, com_facebook_button_xout, com_facebook_tooltip_bubble_view_text_body` | 1801 |
| 49 | `custom_dialog.xml` | Custom Dialogs & Overlays | `RelativeLayout` | 1 | `dialog_button` | 415 |
| 50 | `design_bottom_navigation_item.xml` | Navigation & Bottom Sheets | `merge` | 8 | `navigation_bar_item_content_container, navigation_bar_item_icon_container, navigation_bar_item_active_indicator_view` | 2753 |
| 51 | `design_bottom_sheet_dialog.xml` | Navigation & Bottom Sheets | `FrameLayout` | 4 | `container, coordinator, touch_outside` | 1044 |
| 52 | `design_layout_snackbar.xml` | Material 3 & Support Controls | `view` | 0 | `None` | 375 |
| 53 | `design_layout_snackbar_include.xml` | Material 3 & Support Controls | `view` | 2 | `snackbar_text, snackbar_action` | 1399 |
| 54 | `design_layout_tab_icon.xml` | Material 3 & Support Controls | `ImageView` | 0 | `None` | 348 |
| 55 | `design_layout_tab_text.xml` | Material 3 & Support Controls | `TextView` | 0 | `None` | 259 |
| 56 | `design_menu_item_action_area.xml` | Material 3 & Support Controls | `FrameLayout` | 0 | `None` | 192 |
| 57 | `design_navigation_item.xml` | Material 3 & Support Controls | `com.google.android.material.internal.NavigationMenuItemView` | 0 | `None` | 511 |
| 58 | `design_navigation_item_header.xml` | Material 3 & Support Controls | `LinearLayout` | 1 | `navigation_header_container` | 345 |
| 59 | `design_navigation_item_separator.xml` | Material 3 & Support Controls | `FrameLayout` | 0 | `None` | 328 |
| 60 | `design_navigation_item_subheader.xml` | Material 3 & Support Controls | `TextView` | 0 | `None` | 507 |
| 61 | `design_navigation_menu.xml` | Navigation & Bottom Sheets | `com.google.android.material.internal.NavigationMenuView` | 1 | `design_navigation_view` | 400 |
| 62 | `design_navigation_menu_item.xml` | Navigation & Bottom Sheets | `merge` | 2 | `design_menu_item_text, design_menu_item_action_area_stub` | 744 |
| 63 | `design_text_input_end_icon.xml` | Material 3 & Support Controls | `com.google.android.material.internal.CheckableImageButton` | 1 | `text_input_end_icon` | 563 |
| 64 | `design_text_input_start_icon.xml` | Material 3 & Support Controls | `com.google.android.material.internal.CheckableImageButton` | 1 | `text_input_start_icon` | 565 |
| 65 | `dev_loading_view.xml` | React Native Catalyst & Debug Hosts | `LinearLayout` | 2 | `loading_text, dismiss_button` | 1147 |
| 66 | `fingerprint_dialog_layout.xml` | Authentication & Biometrics | `ScrollView` | 4 | `fingerprint_subtitle, fingerprint_description, fingerprint_icon` | 1847 |
| 67 | `fps_view.xml` | React Native Catalyst & Debug Hosts | `merge` | 1 | `fps_text` | 449 |
| 68 | `ime_base_split_test_activity.xml` | Material 3 & Support Controls | `LinearLayout` | 0 | `None` | 224 |
| 69 | `ime_secondary_split_test_activity.xml` | Material 3 & Support Controls | `LinearLayout` | 2 | `edit_text_id, hide_ime_id` | 632 |
| 70 | `m3_alert_dialog.xml` | Custom Dialogs & Overlays | `androidx.appcompat.widget.AlertDialogLayout` | 10 | `parentPanel, contentPanel, scrollIndicatorUp` | 2739 |
| 71 | `m3_alert_dialog_actions.xml` | Custom Dialogs & Overlays | `ScrollView` | 5 | `buttonPanel, button3, spacer` | 1511 |
| 72 | `m3_alert_dialog_title.xml` | Custom Dialogs & Overlays | `LinearLayout` | 5 | `topPanel, title_template, icon` | 797 |
| 73 | `m3_auto_complete_simple_item.xml` | Material 3 & Support Controls | `TextView` | 0 | `None` | 402 |
| 74 | `m3_navigation_menu_divider.xml` | Navigation & Bottom Sheets | `com.google.android.material.divider.MaterialDivider` | 0 | `None` | 605 |
| 75 | `m3_navigation_menu_subheader.xml` | Navigation & Bottom Sheets | `TextView` | 1 | `navigation_menu_subheader_label` | 938 |
| 76 | `m3_side_sheet_dialog.xml` | Custom Dialogs & Overlays | `FrameLayout` | 4 | `container, coordinator, touch_outside` | 930 |
| 77 | `material_chip_input_combo.xml` | Material 3 & Support Controls | `com.google.android.material.timepicker.ChipTextInputComboView` | 0 | `None` | 242 |
| 78 | `material_clock_display.xml` | Material 3 & Support Controls | `LinearLayout` | 3 | `material_clock_display, material_hour_tv, material_minute_tv` | 584 |
| 79 | `material_clock_display_divider.xml` | Material 3 & Support Controls | `TextView` | 0 | `None` | 339 |
| 80 | `material_clock_period_toggle.xml` | Material 3 & Support Controls | `com.google.android.material.button.MaterialButtonToggleGroup` | 3 | `material_clock_period_toggle, material_clock_period_am_button, material_clock_period_pm_button` | 1216 |
| 81 | `material_clockface_textview.xml` | Material 3 & Support Controls | `TextView` | 0 | `None` | 376 |
| 82 | `material_clockface_view.xml` | Material 3 & Support Controls | `merge` | 2 | `material_clock_face, material_clock_hand` | 700 |
| 83 | `material_radial_view_group.xml` | Material 3 & Support Controls | `merge` | 1 | `circle_center` | 455 |
| 84 | `material_textinput_timepicker.xml` | Date & Calendar Pickers | `LinearLayout` | 1 | `material_clock_period_toggle` | 666 |
| 85 | `material_time_chip.xml` | Material 3 & Support Controls | `com.google.android.material.chip.Chip` | 0 | `None` | 284 |
| 86 | `material_time_input.xml` | Material 3 & Support Controls | `com.google.android.material.textfield.TextInputLayout` | 1 | `material_label` | 794 |
| 87 | `material_timepicker.xml` | Date & Calendar Pickers | `merge` | 5 | `material_timepicker_container, material_clock_display_and_toggle, material_clock_display` | 1425 |
| 88 | `material_timepicker_dialog.xml` | Date & Calendar Pickers | `androidx.constraintlayout.widget.ConstraintLayout` | 6 | `header_title, material_timepicker_view, material_textinput_timepicker` | 3299 |
| 89 | `material_timepicker_textinput_display.xml` | Date & Calendar Pickers | `LinearLayout` | 2 | `material_hour_text_input, material_minute_text_input` | 536 |
| 90 | `messenger_button_send_blue_large.xml` | Material 3 & Support Controls | `FrameLayout` | 1 | `messenger_send_button` | 328 |
| 91 | `messenger_button_send_blue_round.xml` | Material 3 & Support Controls | `Button` | 1 | `messenger_send_button` | 276 |
| 92 | `messenger_button_send_blue_small.xml` | Material 3 & Support Controls | `FrameLayout` | 1 | `messenger_send_button` | 328 |
| 93 | `messenger_button_send_white_large.xml` | Material 3 & Support Controls | `FrameLayout` | 1 | `messenger_send_button` | 330 |
| 94 | `messenger_button_send_white_round.xml` | Material 3 & Support Controls | `Button` | 1 | `messenger_send_button` | 277 |
| 95 | `messenger_button_send_white_small.xml` | Material 3 & Support Controls | `FrameLayout` | 1 | `messenger_send_button` | 330 |
| 96 | `mtrl_alert_dialog.xml` | Custom Dialogs & Overlays | `androidx.appcompat.widget.AlertDialogLayout` | 10 | `parentPanel, contentPanel, scrollIndicatorUp` | 2517 |
| 97 | `mtrl_alert_dialog_actions.xml` | Custom Dialogs & Overlays | `ScrollView` | 5 | `buttonPanel, button3, spacer` | 1522 |
| 98 | `mtrl_alert_dialog_title.xml` | Custom Dialogs & Overlays | `LinearLayout` | 5 | `topPanel, title_template, icon` | 795 |
| 99 | `mtrl_alert_select_dialog_item.xml` | Custom Dialogs & Overlays | `TextView` | 1 | `text1` | 480 |
| 100 | `mtrl_alert_select_dialog_multichoice.xml` | Custom Dialogs & Overlays | `CheckedTextView` | 1 | `text1` | 812 |
| 101 | `mtrl_alert_select_dialog_singlechoice.xml` | Custom Dialogs & Overlays | `CheckedTextView` | 1 | `text1` | 808 |
| 102 | `mtrl_auto_complete_simple_item.xml` | Material 3 & Support Controls | `TextView` | 0 | `None` | 402 |
| 103 | `mtrl_calendar_day.xml` | Date & Calendar Pickers | `TextView` | 0 | `None` | 255 |
| 104 | `mtrl_calendar_day_of_week.xml` | Date & Calendar Pickers | `TextView` | 0 | `None` | 275 |
| 105 | `mtrl_calendar_days_of_week.xml` | Date & Calendar Pickers | `GridView` | 1 | `mtrl_calendar_days_of_week` | 371 |
| 106 | `mtrl_calendar_horizontal.xml` | Date & Calendar Pickers | `LinearLayout` | 3 | `mtrl_calendar_selection_frame, mtrl_calendar_year_selector_frame, mtrl_calendar_day_selector_frame` | 1046 |
| 107 | `mtrl_calendar_month.xml` | Date & Calendar Pickers | `com.google.android.material.datepicker.MaterialCalendarGridView` | 1 | `month_grid` | 579 |
| 108 | `mtrl_calendar_month_labeled.xml` | Date & Calendar Pickers | `LinearLayout` | 1 | `month_title` | 519 |
| 109 | `mtrl_calendar_month_navigation.xml` | Date & Calendar Pickers | `LinearLayout` | 4 | `month_navigation_bar, month_navigation_fragment_toggle, month_navigation_previous` | 2076 |
| 110 | `mtrl_calendar_months.xml` | Date & Calendar Pickers | `androidx.recyclerview.widget.RecyclerView` | 1 | `mtrl_calendar_months` | 310 |
| 111 | `mtrl_calendar_vertical.xml` | Date & Calendar Pickers | `LinearLayout` | 0 | `None` | 497 |
| 112 | `mtrl_calendar_year.xml` | Date & Calendar Pickers | `TextView` | 0 | `None` | 257 |
| 113 | `mtrl_layout_snackbar.xml` | Material 3 & Support Controls | `view` | 0 | `None` | 309 |
| 114 | `mtrl_layout_snackbar_include.xml` | Material 3 & Support Controls | `view` | 2 | `snackbar_text, snackbar_action` | 749 |
| 115 | `mtrl_navigation_rail_item.xml` | Material 3 & Support Controls | `merge` | 8 | `navigation_bar_item_content_container, navigation_bar_item_icon_container, navigation_bar_item_active_indicator_view` | 3033 |
| 116 | `mtrl_picker_actions.xml` | Date & Calendar Pickers | `LinearLayout` | 3 | `date_picker_actions, cancel_button, confirm_button` | 994 |
| 117 | `mtrl_picker_dialog.xml` | Date & Calendar Pickers | `LinearLayout` | 2 | `mtrl_calendar_main_pane, mtrl_calendar_frame` | 1156 |
| 118 | `mtrl_picker_fullscreen.xml` | Date & Calendar Pickers | `LinearLayout` | 2 | `mtrl_picker_fullscreen, mtrl_calendar_frame` | 779 |
| 119 | `mtrl_picker_header_dialog.xml` | Date & Calendar Pickers | `merge` | 2 | `mtrl_picker_header, mtrl_picker_header_title_and_selection` | 1498 |
| 120 | `mtrl_picker_header_fullscreen.xml` | Date & Calendar Pickers | `merge` | 6 | `fullscreen_header, cancel_button, mtrl_picker_header_title_and_selection` | 3388 |
| 121 | `mtrl_picker_header_selection_text.xml` | Date & Calendar Pickers | `TextView` | 1 | `mtrl_picker_header_selection_text` | 545 |
| 122 | `mtrl_picker_header_title_text.xml` | Date & Calendar Pickers | `TextView` | 1 | `mtrl_picker_title_text` | 455 |
| 123 | `mtrl_picker_header_toggle.xml` | Date & Calendar Pickers | `com.google.android.material.internal.CheckableImageButton` | 1 | `mtrl_picker_header_toggle` | 519 |
| 124 | `mtrl_picker_text_input_date.xml` | Date & Calendar Pickers | `FrameLayout` | 2 | `mtrl_calendar_text_input_frame, mtrl_picker_text_input_date` | 1134 |
| 125 | `mtrl_picker_text_input_date_range.xml` | Date & Calendar Pickers | `ScrollView` | 2 | `mtrl_picker_text_input_range_start, mtrl_picker_text_input_range_end` | 2030 |
| 126 | `mtrl_search_bar.xml` | Material 3 & Support Controls | `FrameLayout` | 3 | `open_search_bar_text_view_container, open_search_bar_text_view, open_search_bar_placeholder_text_view` | 738 |
| 127 | `mtrl_search_view.xml` | Material 3 & Support Controls | `merge` | 14 | `open_search_view_scrim, open_search_view_root, open_search_view_background` | 3804 |
| 128 | `notification_action.xml` | Bark In-App Messaging & Notifications | `LinearLayout` | 3 | `action_container, action_image, action_text` | 932 |
| 129 | `notification_action_tombstone.xml` | Bark In-App Messaging & Notifications | `LinearLayout` | 3 | `action_container, action_image, action_text` | 1071 |
| 130 | `notification_media_action.xml` | Bark In-App Messaging & Notifications | `ImageButton` | 1 | `action0` | 372 |
| 131 | `notification_media_cancel_action.xml` | Bark In-App Messaging & Notifications | `ImageButton` | 1 | `cancel_action` | 515 |
| 132 | `notification_template_big_media.xml` | Bark In-App Messaging & Notifications | `RelativeLayout` | 3 | `status_bar_latest_event_content, media_actions, action_divider` | 1618 |
| 133 | `notification_template_big_media_custom.xml` | Bark In-App Messaging & Notifications | `RelativeLayout` | 9 | `status_bar_latest_event_content, notification_main_column_container, notification_main_column` | 3330 |
| 134 | `notification_template_big_media_narrow.xml` | Bark In-App Messaging & Notifications | `RelativeLayout` | 4 | `status_bar_latest_event_content, icon, media_actions` | 1607 |
| 135 | `notification_template_big_media_narrow_custom.xml` | Bark In-App Messaging & Notifications | `RelativeLayout` | 10 | `status_bar_latest_event_content, icon, notification_main_column_container` | 3354 |
| 136 | `notification_template_custom_big.xml` | Bark In-App Messaging & Notifications | `FrameLayout` | 9 | `notification_background, notification_main_column_container, notification_main_column` | 2621 |
| 137 | `notification_template_icon_group.xml` | Bark In-App Messaging & Notifications | `FrameLayout` | 3 | `icon_group, icon, right_icon` | 1025 |
| 138 | `notification_template_lines_media.xml` | Bark In-App Messaging & Notifications | `LinearLayout` | 8 | `line1, title, time` | 3291 |
| 139 | `notification_template_media.xml` | Bark In-App Messaging & Notifications | `LinearLayout` | 3 | `status_bar_latest_event_content, media_actions, end_padder` | 1175 |
| 140 | `notification_template_media_custom.xml` | Bark In-App Messaging & Notifications | `LinearLayout` | 9 | `status_bar_latest_event_content, notification_main_column_container, notification_main_column` | 3013 |
| 141 | `notification_template_part_chronometer.xml` | Bark In-App Messaging & Notifications | `Chronometer` | 1 | `chronometer` | 319 |
| 142 | `notification_template_part_time.xml` | Bark In-App Messaging & Notifications | `DateTimeView` | 1 | `time` | 313 |
| 143 | `onesignal_bgimage_notif_layout.xml` | Bark In-App Messaging & Notifications | `RelativeLayout` | 5 | `os_bgimage_notif_bgimage_align_layout, os_bgimage_notif_bgimage, os_bgimage_notif_bgimage_right_aligned` | 1923 |
| 144 | `paused_in_debugger_view.xml` | Material 3 & Support Controls | `LinearLayout` | 2 | `button, button_text` | 1027 |
| 145 | `redbox_item_frame.xml` | React Native Catalyst & Debug Hosts | `LinearLayout` | 2 | `rn_frame_method, rn_frame_file` | 784 |
| 146 | `redbox_item_title.xml` | React Native Catalyst & Debug Hosts | `TextView` | 1 | `catalyst_redbox_title` | 408 |
| 147 | `redbox_view.xml` | React Native Catalyst & Debug Hosts | `LinearLayout` | 7 | `rn_redbox_stack, rn_redbox_line_separator, rn_redbox_loading_indicator` | 2139 |
| 148 | `select_dialog_item_material.xml` | Custom Dialogs & Overlays | `TextView` | 1 | `text1` | 542 |
| 149 | `select_dialog_multichoice_material.xml` | Custom Dialogs & Overlays | `CheckedTextView` | 1 | `text1` | 831 |
| 150 | `select_dialog_singlechoice_material.xml` | Custom Dialogs & Overlays | `CheckedTextView` | 1 | `text1` | 827 |
| 151 | `sentry_dialog_user_feedback.xml` | Bark In-App Messaging & Notifications | `RelativeLayout` | 11 | `sentry_dialog_user_feedback_layout, sentry_dialog_user_feedback_title, sentry_dialog_user_feedback_logo` | 4048 |
| 152 | `support_simple_spinner_dropdown_item.xml` | Material 3 & Support Controls | `TextView` | 1 | `text1` | 328 |
