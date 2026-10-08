# 📄 FoodBridge AI — UI Pages Wireframing & Design Blueprint

> **Folder Path**: `docs/ui-pages/`  
> **Purpose**: Individual, page-by-page UI blueprints detailing sections, card layouts, table columns, modals, forms, and responsiveness for every screen in **FoodBridge AI**. Use these files to design high-fidelity Figma screens.

---

## 📁 UI Pages Index

### 🌐 1. Public & Authentication Pages
| File | Screen / Route | Description |
| :--- | :--- | :--- |
| 📄 [`01_HOME_PAGE.md`](./01_HOME_PAGE.md) | `/` | Public Landing Page, Hero Section, Live Map, Impact Metrics |
| 📄 [`02_LOGIN_PAGE.md`](./02_LOGIN_PAGE.md) | `/auth/login` | Sign In Screen with demo fill pills and dark mint card |
| 📄 [`03_REGISTER_PAGE.md`](./03_REGISTER_PAGE.md) | `/auth/register` | Sign Up Screen with interactive Role Selector cards |
| 📄 [`04_FORGOT_PASSWORD_PAGE.md`](./04_FORGOT_PASSWORD_PAGE.md) | `/auth/forgot-password` | Email Password Recovery & Reset confirmation |

---

### 📦 2. Donor Portal (`/donor/*`)
| File | Screen / Route | Description |
| :--- | :--- | :--- |
| 📄 [`05_DONOR_DASHBOARD_PAGE.md`](./05_DONOR_DASHBOARD_PAGE.md) | `/donor/dashboard` | Donor KPI metrics, AI Spoilage alert widget, listing quick view |
| 📄 [`06_DONOR_DONATE_FOOD_PAGE.md`](./06_DONOR_DONATE_FOOD_PAGE.md) | `/donor/donate` | 4-step Surplus Food Posting Form with Google Maps Pin picker |
| 📄 [`07_DONOR_MY_DONATIONS_PAGE.md`](./07_DONOR_MY_DONATIONS_PAGE.md) | `/donor/my-donations` | Active & expired food listings grid with status filters |
| 📄 [`08_DONOR_DONATION_DETAILS_PAGE.md`](./08_DONOR_DONATION_DETAILS_PAGE.md) | `/donor/donations/:id` | 2-column food inspection view & incoming NGO request reviewer |
| 📄 [`09_DONOR_FOOD_REQUESTS_PAGE.md`](./09_DONOR_FOOD_REQUESTS_PAGE.md) | `/donor/requests` | Incoming NGO pickup request manager & decision triggers |
| 📄 [`10_DONOR_NOTIFICATIONS_AND_PROFILE_PAGES.md`](./10_DONOR_NOTIFICATIONS_AND_PROFILE_PAGES.md) | `/donor/notifications`, `/donor/profile` | Donor activity alerts and establishment profile details |

---

### 🤝 3. NGO Partner Portal (`/ngo/*`)
| File | Screen / Route | Description |
| :--- | :--- | :--- |
| 📄 [`11_NGO_DASHBOARD_PAGE.md`](./11_NGO_DASHBOARD_PAGE.md) | `/ngo/dashboard` | NGO stats, nearby radar map widget, AI match recommendations |
| 📄 [`12_NGO_NEARBY_FOOD_MAP_PAGE.md`](./12_NGO_NEARBY_FOOD_MAP_PAGE.md) | `/ngo/nearby` | Split-screen discovery map + feed with radius slider & filters |
| 📄 [`13_NGO_FOOD_DETAILS_AND_REQUEST_PAGE.md`](./13_NGO_FOOD_DETAILS_AND_REQUEST_PAGE.md) | `/ngo/food/:id`, `/ngo/food/:id/request` | Food listing view & pickup request submission modal |
| 📄 [`14_NGO_MY_REQUESTS_AND_HISTORY_PAGES.md`](./14_NGO_MY_REQUESTS_AND_HISTORY_PAGES.md) | `/ngo/my-requests`, `/ngo/history` | Active pickup trackers & finalized decision history log |
| 📄 [`15_NGO_NOTIFICATIONS_AND_PROFILE_PAGES.md`](./15_NGO_NOTIFICATIONS_AND_PROFILE_PAGES.md) | `/ngo/notifications`, `/ngo/profile` | Status alerts and NGO verification details |

---

### 🛡️ 4. Admin Control Center (`/admin/*`)
| File | Screen / Route | Description |
| :--- | :--- | :--- |
| 📄 [`16_ADMIN_DASHBOARD_PAGE.md`](./16_ADMIN_DASHBOARD_PAGE.md) | `/admin/dashboard` | Executive KPIs, platform health monitor, charts & tables |
| 📄 [`17_ADMIN_USERS_PAGE.md`](./17_ADMIN_USERS_PAGE.md) | `/admin/users` | User management table, role filters & account suspension modals |
| 📄 [`18_ADMIN_NGO_VERIFICATION_PAGE.md`](./18_ADMIN_NGO_VERIFICATION_PAGE.md) | `/admin/ngo-verification` | Document review queue, 1-click Approve & Reject modal |
| 📄 [`19_ADMIN_DONATIONS_AND_REQUESTS_PAGES.md`](./19_ADMIN_DONATIONS_AND_REQUESTS_PAGES.md) | `/admin/donations`, `/admin/requests` | Supervision table for all system donations & pickup logs |
| 📄 [`20_ADMIN_REPORTS_ANALYTICS_AUDIT_PAGES.md`](./20_ADMIN_REPORTS_ANALYTICS_AUDIT_PAGES.md) | `/admin/reports`, `/admin/analytics`, `/admin/audit-logs` | CSV report exports, Recharts analytics, and security audit log |

---

### 👤 5. User Account & Error Pages
| File | Screen / Route | Description |
| :--- | :--- | :--- |
| 📄 [`21_USER_PROFILE_AND_SETTINGS_PAGES.md`](./21_USER_PROFILE_AND_SETTINGS_PAGES.md) | `/profile`, `/profile/edit`, `/profile/change-password`, `/settings` | Account view, profile editor, password updater, notification toggles |
| 📄 [`22_SYSTEM_ERROR_AND_OFFLINE_PAGES.md`](./22_SYSTEM_ERROR_AND_OFFLINE_PAGES.md) | `/404`, `/500`, `/401`, `/403`, `/offline` | Feedback error pages & offline network state overlay |
