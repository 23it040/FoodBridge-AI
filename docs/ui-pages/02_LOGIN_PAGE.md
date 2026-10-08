# 🔑 Login Page Wireframe Specification (`/auth/login`)

> **File**: `frontend/src/pages/Auth/LoginPage.jsx`  
> **Layout Wrapper**: `AuthLayout.jsx` (Lightweight Dark Header + Footer)  
> **Container**: `AuthPage.jsx` (`max-w-xl` Card, `rounded-[24px] bg-[#102A2A]/85 border border-white/10`)

---

## 📐 Page Frame Layout in Figma

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🍲 FoodBridge AI                                            [ ← Back to Home]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                  ┌───────────────────────────────────────┐                  │
│                  │  FoodBridge Platform                   │                  │
│                  │  [ Sign In ]  [ Register ]  [ Forgot ]│ ⬅ Active Tab     │
│                  ├───────────────────────────────────────┤                  │
│                  │  Welcome Back                         │                  │
│                  │  Sign in to continue to FoodBridge    │                  │
│                  │                                       │                  │
│                  │  ⚡ Quick Demo Login Fill:            │                  │
│                  │  [ Admin ]  [ NGO Partner ]  [ Donor ]│                  │
│                  │                                       │                  │
│                  │  EMAIL ADDRESS                        │                  │
│                  │  [ 📧  you@example.com              ] │                  │
│                  │                                       │                  │
│                  │  PASSWORD                 Forgot?     │                  │
│                  │  [ 🔒  ••••••••                     ] │                  │
│                  │                                       │                  │
│                  │  [          Sign In  ➔               ]│ ⬅ Primary Mint   │
│                  │                                       │                  │
│                  │  Don't have an account? Create Account│                  │
│                  └───────────────────────────────────────┘                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ © 2026 FoodBridge AI • Sustainable Surplus Food Redistribution              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Field & Element Breakdown

1. **Header Bar**:
   - FoodBridge Logo Icon + Brand Title.
   - `Back to Home` button (`bg-white/5 border border-white/15 text-[#A7B8B3]`).

2. **Auth Tab Navigation**:
   - `Sign In` Tab: Active state `bg-[#79D6B2] text-[#0A1A1A] font-extrabold shadow-[0_0_12px_rgba(121,214,178,0.35)]`.
   - `Register` / `Forgot Password` Tabs: Inactive state `bg-white/5 text-[#A7B8B3] border border-white/10`.

3. **Quick Demo Fill Bar**:
   - 3 Quick Fill Pills (`Admin`, `NGO Partner`, `Donor`).
   - Clicking fills `email` & `password` state automatically for easy testing.

4. **Inputs**:
   - Dark Surface Input `bg-[#061918]/80 border border-white/15 text-white placeholder-[#70827D] rounded-xl`.
   - Focus state: Border `#79D6B2` + Glow ring `rgba(121,214,178,0.2)`.

5. **Primary CTA**:
   - Solid Mint button `bg-[#79D6B2] hover:bg-[#68D8B0] text-[#0A1A1A] font-extrabold rounded-xl h-[50px]`.
