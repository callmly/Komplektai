# Design Guidelines: KNX Home Automation Landing Page

## Design Approach
**Reference-Based Hybrid**: Drawing from Linear (clean tech aesthetic), Stripe (clear pricing presentation), and Apple (minimalist product focus). The design balances professional credibility with interactive functionality, prioritizing clarity for technical product comparison.

## Core Design Principles
1. **Information Hierarchy**: Price comparison is the core user journey - design flows from hero → plans → comparison → conversion
2. **Interaction Clarity**: Make interactive elements (accordions, selectors) visually obvious
3. **Trust & Professionalism**: Clean, spacious design conveys technical expertise
4. **Minimal Distraction**: Focus on CSS/SVG, limited imagery

---

## Typography
- **Primary Font**: Inter or DM Sans (400, 500, 600, 700)
- **Headings**: 
  - H1 (Hero): text-5xl lg:text-6xl, font-bold, tracking-tight
  - H2 (Section): text-3xl lg:text-4xl, font-semibold
  - H3 (Card titles): text-2xl, font-semibold
  - H4 (Labels): text-lg, font-medium
- **Body**: text-base lg:text-lg for main content, text-sm for details
- **Lithuanian Support**: Ensure proper rendering of ą, č, ę, ė, į, š, ų, ū, ž

---

## Layout System
**Spacing Units**: Use Tailwind's 4, 6, 8, 12, 16, 20, 24 for consistency
- Section padding: py-16 lg:py-24
- Component spacing: gap-6 to gap-12
- Container: max-w-7xl mx-auto px-6 lg:px-8

---

## Component Specifications

### 1. Hero Section
- Layout: Single column, centered, max-w-4xl
- Height: min-h-[70vh], not full viewport
- Elements:
  - Headline (value proposition in Lithuanian)
  - Subheadline (2-3 lines explaining KNX automation)
  - Primary CTA button
  - Trust indicator below (e.g., "Sertifikuoti KNX specialistai" with icon)
- Background: Subtle gradient or single clean architectural/tech image with overlay

### 2. Pricing Plan Cards (3 Cards)
- Layout: grid-cols-1 md:grid-cols-3, gap-8
- Card Structure:
  - Border: 1px solid, rounded-xl
  - Padding: p-8
  - Popular plan: Highlight with shadow-lg and border-width-2
  - Header: Plan name, starting price (large, bold), brief description
  - "Pasirinkti" button: Full-width, positioned prominently
  - **Accordion (Hidden by Default)**:
    - Smooth expand animation (300ms)
    - Inner padding: pt-6, border-t
    - Quantity selector: Horizontal stepper (- / number / +)
    - Switch type: Radio buttons with visual switch icons
    - Add-ons: Checkbox list with prices aligned right
    - **Real-time Price Display**: Large, bold total at bottom of accordion, updates live
    - Close accordion: X button or collapse on button re-click

### 3. Feature Comparison Table
- Section: pt-24, clear heading "Palyginti visas funkcijas"
- Table Layout:
  - Sticky header row with plan names
  - Left column: Feature categories (grouped)
  - Cells: Checkmarks (SVG icons) or text values
  - Responsive: Horizontal scroll on mobile, vertical accordion alternative
- Visual: Subtle zebra striping, clean borders

### 4. Modal Form ("Gauti pasiūlymą")
- Overlay: Fixed, backdrop-blur-sm with semi-transparent background
- Modal: Centered, max-w-2xl, rounded-2xl, p-8 to p-12
- Form Fields:
  - Name (required): Standard input
  - Email (required): Email input with validation
  - Phone (optional): Tel input with Lithuanian format hint
  - City/Object (required): Text input or select
  - Comment (optional): Textarea, rows-4
  - Selected plan summary: Read-only display showing configuration and total price
- CTA: Primary button "Siųsti užklausą"
- Close: X button top-right

### 5. Navigation & Footer
- **Header**: Minimal - Logo left, single CTA button right (sticky optional)
- **Footer**: 
  - Single row or 2-column layout
  - Left: Contact info, address, phone, email
  - Right: Social links (if applicable), copyright
  - Newsletter/CTA: Optional small section "Gaukite naujienas"

---

## Interactions & States

### Buttons
- Primary: Solid background, rounded-lg, px-6 py-3, font-medium
- Secondary: Outline variant
- Hover: Subtle scale (scale-105) or brightness shift
- States: Clear disabled, loading (spinner icon)

### Form Inputs
- Consistent: rounded-lg, border, px-4 py-2.5
- Focus: Ring effect (ring-2)
- Error: Red border, error text below
- Success: Green checkmark

### Accordions
- Icon: Chevron (rotate on expand)
- Animation: Height transition 300ms, ease-in-out
- Open state: Subtle background tint

---

## Visual Elements

### Icons
- Library: Heroicons (outline for most, solid for selected states)
- Size: w-5 h-5 for inline, w-6 h-6 for feature icons
- Usage: Checkmarks, arrows, quantity controls, feature bullets

### Illustrations/Graphics
- Hero: Single background image (modern home interior or KNX panel close-up) with text overlay, OR minimal geometric SVG pattern
- Plan cards: Optional small SVG icon for each tier
- Comparison table: Checkmark SVG icons only

---

## Responsive Behavior
- Mobile (<768px): Stack all cards, simplified table (accordion view), larger touch targets
- Tablet (768-1024px): 2-column grid for plans, maintain spacing
- Desktop (>1024px): Full 3-column layout, optimal reading widths

---

## Accessibility
- All interactive elements: Keyboard navigable
- Form labels: Clearly associated with inputs
- Color contrast: WCAG AA minimum
- Focus indicators: Visible on all interactive elements
- ARIA labels: For icon-only buttons

---

## Content Strategy Notes
- Keep hero message focused: One primary benefit
- Plan cards: Differentiate clearly (e.g., "Starter", "Professional", "Premium")
- Comparison table: Group features logically (Hardware, Software, Support)
- Form: Minimal friction, only essential fields marked required