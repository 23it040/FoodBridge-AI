# 📝 Register / Signup Page Wireframe Specification (`/auth/register`)

> **File**: `frontend/src/pages/Auth/RegisterPage.jsx`  
> **Layout Wrapper**: `AuthLayout.jsx`  
> **Container**: `AuthPage.jsx`

---

## 📐 Page Frame Layout in Figma

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🍲 FoodBridge AI                                            [ ← Back to Home]│
├─────────────────────────────────────────────────────────────────────────────┤
│                  ┌───────────────────────────────────────┐                  │
│                  │  Create Your Account                  │                  │
│                  │  Select your account type to join     │                  │
│                  │                                       │                  │
│                  │  CHOOSE ACCOUNT TYPE                  │                  │
│                  │  ┌────────────┬────────────┬─────────┐│                  │
│                  │  │  [ 🍲 ]    │  [ 🛡️ ]    │ [ 💼 ]  ││ ⬅ Role Cards     │
│                  │  │ Food Donor │ NGO Partner│ Partner ││   (Interactive)  │
│                  │  └────────────┴────────────┴─────────┘│                  │
│                  │                                       │                  │
│                  │  FULL NAME                            │                  │
│                  │  [ 👤  John Doe                     ] │                  │
│                  │                                       │                  │
│                  │  EMAIL ADDRESS                        │                  │
│                  │  [ 📧  you@example.com              ] │                  │
│                  │                                       │                  │
│                  │  PASSWORD         CONFIRM PASSWORD    │                  │
│                  │  [ 🔒 •••••••• ]  [ 🔒 •••••••• ]     │ ⬅ 2-Column Grid  │
│                  │                                       │                  │
│                  │  [       Create Account  ➔           ]│ ⬅ Primary Mint   │
│                  │                                       │                  │
│                  │  Already have an account? Sign In     │                  │
│                  └───────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Field & Role Selector Specs

1. **Role Selection Grid (3 Interactive Cards)**:
   - **Card 1: Food Donor** (`role: 'user'`): Icon `FiHeart`, Title *"Food Donor"*, Subtitle *"Restaurants, events & individuals"*.
   - **Card 2: NGO Partner** (`role: 'ngo'`): Icon `FiUsers`, Title *"NGO Partner"*, Subtitle *"Non-profits & community kitchens"*.
   - **Card 3: Partner** (`role: 'partner'`): Icon `FiBriefcase`, Title *"Partner"*, Subtitle *"Corporate & logistics partners"*.
   - **Selected State**: Tint background `bg-[#79D6B2]/15`, border `#79D6B2`, text `#FFFFFF` + Checkmark badge top-right.

2. **Form Inputs Grid**:
   - `Full Name` (Col span 2)
   - `Email Address` (Col span 2)
   - `Password` (Col span 1) & `Confirm Password` (Col span 1)
   - Inputs styled with dark surface `bg-[#061918]/80 border border-white/15 text-white`.
