# 🎨 FoodBridge AI — UI Components Documentation & Figma Design System

> **Folder Path**: `docs/ui-components/`  
> **Purpose**: Complete design system specifications, component tokens, variants, props, and layout structures for building wireframes and high-fidelity UI kits in **Figma**.

---

## 📁 Component Documentation Index

| File | Component Group | Included Components |
| :--- | :--- | :--- |
| 📄 [`01_CORE_BUTTONS_AND_INPUTS.md`](./01_CORE_BUTTONS_AND_INPUTS.md) | **Inputs & Triggers** | `Button`, `Input`, `Select`, `Textarea`, `Checkbox`, `RadioButton`, `ToggleSwitch`, `SearchBar` |
| 📄 [`02_CARD_AND_SURFACE_COMPONENTS.md`](./02_CARD_AND_SURFACE_COMPONENTS.md) | **Surfaces & Cards** | `Card`, `StatCard`, `AIFoodSpoilageRiskCard`, `NGORecommendationCard`, `NearbyNGOCard`, `Container` |
| 📄 [`03_NAVIGATION_AND_HEADER_COMPONENTS.md`](./03_NAVIGATION_AND_HEADER_COMPONENTS.md) | **Navigation & Menus** | `Navbar`, `Sidebar` (Collapsible), `Breadcrumb`, `PageHeader`, `NotificationsDropdown`, `ProfileDropdown` |
| 📄 [`04_MODALS_DIALOGS_AND_DRAWERS.md`](./04_MODALS_DIALOGS_AND_DRAWERS.md) | **Overlays & Dialogs** | `Modal`, `ConfirmationDialog`, `Drawer` |
| 📄 [`05_DATA_TABLES_AND_FEEDBACK.md`](./05_DATA_TABLES_AND_FEEDBACK.md) | **Tables & Status Feedback** | `DataTable`, `Badge` (Status Pills), `Pagination`, `EmptyState`, `ErrorState`, `BrandedLoader`, `Skeleton` |
| 📄 [`06_MAPS_AND_CHARTS_COMPONENTS.md`](./06_MAPS_AND_CHARTS_COMPONENTS.md) | **Maps & Analytics** | `NGOMap`, `GoogleMap`, `FoodDonationMarker`, `NGOMarker`, `BarChart`, `PieChart`, `LineChart` |

---

## 🎨 Global Design Tokens (For Figma Color Styles)

```text
Background Primary:      #0A1A1A (Dark Green / Near-Black)
Card Surface:            #102A2A (Dark Teal / Glass Panel background)
Card Surface Light:      #FFFFFF (Used in light dashboard variants)
Primary Accent / Mint:   #79D6B2 / #68D8B0 (Buttons, Active Icons, Highlights)
Brand Secondary / Green: #2F8F72 (Dark Mint / Secondary Buttons)
Text Main:               #FFFFFF (Clean White)
Text Muted:              #A7B8B3 (Muted Gray-Green)
Borders / Subtles:       rgba(255, 255, 255, 0.12) / border-white/10

Status Badges:
• ACCEPTED / ACTIVE:      #DCFCE7 (Bg), #16A34A (Text) [Green]
• PENDING:               #FEF3C7 (Bg), #D97706 (Text) [Amber]
• REJECTED / SUSPENDED:  #FEE2E2 (Bg), #DC2626 (Text) [Red]
• EXPIRED:               #F3F4F6 (Bg), #4B5563 (Text) [Gray]
```
