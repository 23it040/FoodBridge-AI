# 🪟 Modals, Action Dialogs & Slide-Over Drawers

> **Location**: `frontend/src/components/ui/`

---

## 1. Centered Modal Component (`Modal.jsx`)

The standard modal dialog wrapper used for inspection views, form popups, and user detail views.

### Figma Component Structure:
- **Overlay Backdrop**: `fixed inset-0 bg-black/75 backdrop-blur-sm z-50`.
- **Modal Container**:
  - Max Widths: `sm` (400px), `md` (500px), `lg` (640px), `xl` (768px), `2xl` (900px).
  - Background: Dark Teal `#102A2A` or Clean White `#FFFFFF`.
  - Corner Radius: `24px` (`rounded-[24px]`).
  - Border: `1px solid rgba(255, 255, 255, 0.15)`.
- **Header**: Title (20px font-extrabold), Subtitle (12px muted text), Close Button (`FiX` top-right).
- **Body**: Scrollable container (`max-h-[75vh] overflow-y-auto`).
- **Footer Actions**: Right-aligned buttons (`Cancel` outline button + `Submit / Confirm` primary button).

---

## 2. Action Confirmation Dialog (`ConfirmationDialog.jsx`)

Focused modal used to confirm sensitive actions before execution.

### Variants in Figma:
1. **Destructive Action** (e.g., *Delete Donation*, *Suspend Account*):
   - Header Icon: Red Warning Circle (`FiAlertTriangle` in `#FEE2E2` box).
   - Title: `"Are you sure you want to delete this listing?"`.
   - Action Button: Solid Red `bg-red-600 text-white`.
2. **Approval Action** (e.g., *Approve NGO*, *Accept Request*):
   - Header Icon: Green Check Circle (`FiCheckCircle` in `#DCFCE7` box).
   - Title: `"Confirm NGO Approval"`.
   - Action Button: Solid Mint `#79D6B2` / Emerald `#16A34A`.

---

## 3. Slide-Over Drawer Component (`Drawer.jsx`)

Side panel that slides in from the right edge of the screen for viewing deep records without leaving the page.

### Layout in Figma:
- **Width**: `480px` or `600px` (`w-full max-w-lg`).
- **Position**: Anchored to right edge `fixed inset-y-0 right-0 z-50`.
- **Animation**: Slide-in transition from right `translateX(0)`.
- **Use Cases**: NGO Document inspection drawer, Full Audit Log details view.
