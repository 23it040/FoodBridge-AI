# 🎛️ Core Buttons, Form Inputs & Triggers

> **Location**: `frontend/src/components/ui/` & `frontend/src/components/ui/fields/`

---

## 1. Button Component (`Button.jsx`)

### Variants & Styles for Figma

| Variant Name | Visual Style | Hex / Tailwind Token | Use Case |
| :--- | :--- | :--- | :--- |
| **`primary`** | Mint solid button with dark text | `bg-[#79D6B2] text-[#0A1A1A] hover:bg-[#68D8B0] font-extrabold` | Primary CTAs (e.g. *Sign In*, *Create Account*, *Approve*) |
| **`secondary`** | Subtle mint glass outline button | `bg-white/5 border border-white/15 text-[#79D6B2] hover:bg-[#79D6B2]/20` | Secondary actions (e.g. *Cancel*, *View Details*) |
| **`outline`** | Border outline button | `border-2 border-[#79D6B2] text-[#79D6B2] bg-transparent hover:bg-[#79D6B2] hover:text-[#0A1A1A]` | Alternative secondary CTA |
| **`ghost`** | Flat text button | `bg-transparent text-[#79D6B2] hover:bg-white/5` | Inline link actions |
| **`danger`** | Solid red button | `bg-red-600 text-white hover:bg-red-700` | Destructive actions (e.g. *Delete Donation*, *Suspend User*) |

### Size Variants
- **`sm`**: Height `32px`, Padding `8px 14px`, Text `12px` font-semibold.
- **`md`**: Height `42px`, Padding `10px 20px`, Text `14px` font-semibold.
- **`lg`**: Height `50px`, Padding `14px 28px`, Text `16px` font-bold.

### States in Figma:
- `Default`, `Hover`, `Active/Pressed`, `Loading (with Spinner)`, `Disabled` (Opacity 50%).

---

## 2. Text Input & Form Fields (`Input.jsx`, `FormField.jsx`, `SearchBar.jsx`)

### Visual Specifications for Figma:
- **Surface Background**: `#061918` (Dark green input surface).
- **Border**: `1px solid rgba(255, 255, 255, 0.15)` (Subtle white).
- **Corner Radius**: `12px` (`rounded-xl`).
- **Typography**: Input text `#FFFFFF` (14px), Placeholder text `#70827D` (14px), Label `#A7B8B3` (12px Uppercase tracking-wider).
- **Focus State**: Border `#79D6B2` + Glow ring `rgba(121, 214, 178, 0.2)`.
- **Icon Support**: Left icon slot (e.g. `FiMail`, `FiLock`, `FiUser`, `FiSearch`).

---

## 3. Select Dropdown & Visual Role Cards (`Select.jsx`, `RegisterPage.jsx Role Selector`)

### Dual Input Types:

1. **Standard Select Dropdown (`Select.jsx`)**:
   - Dark dropdown menu matching input surface (`#061918`).
   - Downward chevron icon (`FiChevronDown`).

2. **Visual Role Selector Cards** (Used in Signup / Role Switchers):
   - Grid of 3 interactive cards: `Food Donor`, `NGO Partner`, `Partner`.
   - **Unselected Card State**: Dark surface `bg-[#061918]/60`, border `1px solid rgba(255,255,255,0.1)`, text `#A7B8B3`.
   - **Selected Card State**: Mint tint `bg-[#79D6B2]/15`, border `#79D6B2`, text `#FFFFFF` + Checkmark badge top-right.

---

## 4. Textarea & Toggle Components (`Textarea.jsx`, `Checkbox.jsx`, `ToggleSwitch.jsx`)

- **Textarea**: 4-row expandable input field with vertical scroll, 12px rounded radius.
- **Checkbox**: `18px x 18px` rounded square. Checked state: `#79D6B2` fill with dark check icon.
- **Toggle Switch**: Pill track `44px x 24px`. Active track: `#79D6B2`, Knob: White circle (`20px`).
