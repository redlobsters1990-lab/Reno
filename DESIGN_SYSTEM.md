# Design System - Renovation Advisor AI

## Overview
This document defines the design system for Renovation Advisor AI, ensuring consistency, accessibility, and professional appearance across the entire application.

## Color Palette

### Brand Colors
- **Primary**: `primary-500` (#8b5cf6) - Main brand color for primary actions
- **Secondary**: `secondary-500` (#a855f7) - Secondary brand color for accents

### Semantic Colors
- **Success**: `success-500` (#22c55e) - Positive actions, success states
- **Warning**: `warning-500` (#f59e0b) - Warnings, caution states
- **Error**: `error-500` (#ef4444) - Errors, destructive actions
- **Info**: `info-500` (#3b82f6) - Informational messages

### Text Colors
- **Primary**: `text-primary` (#f8fafc) - High contrast text (WCAG AAA)
- **Secondary**: `text-secondary` (#cbd5e1) - Medium contrast text (WCAG AA)
- **Tertiary**: `text-tertiary` (#94a3b8) - Low contrast text (use sparingly)
- **Disabled**: `text-disabled` (#64748b) - Disabled state text

### Background Colors
- **Background**: `background` (#0b1020) - Main background
- **Card**: `card` (#111827) - Card backgrounds
- **Border**: `border` (rgba(148,163,184,0.2)) - Default borders

## Typography Scale

### Display
- **Class**: `.text-display`
- **Size**: 3.5rem (56px)
- **Use**: Hero sections, major page titles
- **Example**: `text-display font-bold`

### Heading 1
- **Class**: `.text-h1`
- **Size**: 2.5rem (40px)
- **Use**: Page titles, major section headers
- **Example**: `text-h1`

### Heading 2
- **Class**: `.text-h2`
- **Size**: 2rem (32px)
- **Use**: Section headers
- **Example**: `text-h2`

### Heading 3
- **Class**: `.text-h3`
- **Size**: 1.5rem (24px)
- **Use**: Subsection headers, card titles
- **Example**: `text-h3`

### Body
- **Class**: `.text-body`
- **Size**: 1rem (16px)
- **Use**: Main content, paragraphs
- **Example**: `text-body`

### Small
- **Class**: `.text-small`
- **Size**: 0.875rem (14px)
- **Use**: Captions, helper text
- **Example**: `text-small`

### Caption
- **Class**: `.text-caption`
- **Size**: 0.75rem (12px)
- **Use**: Labels, metadata, uppercase labels
- **Example**: `text-caption`

## Spacing Scale

### Vertical Spacing
- **Section**: `.section` (py-12 md:py-16 lg:py-20)
- **Section Small**: `.section-sm` (py-8 md:py-12)
- **Section Large**: `.section-lg` (py-16 md:py-20 lg:py-24)

### Gap Sizes
- **Small**: `gap-2` (8px) - Tight spacing
- **Medium**: `gap-4` (16px) - Default spacing
- **Large**: `gap-6` (24px) - Loose spacing
- **Extra Large**: `gap-8` (32px) - Very loose spacing

### Padding
Use consistent padding values:
- **Small**: `p-4` (16px)
- **Medium**: `p-6` (24px)
- **Large**: `p-8` (32px)

## Border Radius

### Scale
- **Small**: `rounded-sm` (6px) - Inputs, small elements
- **Medium**: `rounded-md` (8px) - Default for most elements
- **Large**: `rounded-lg` (12px) - Cards, containers
- **Extra Large**: `rounded-xl` (16px) - Large cards, modals
- **2XL**: `rounded-2xl` (24px) - Hero sections, special cards
- **Full**: `rounded-full` - Circles, pills

## Shadows

### Elevation
- **None**: No shadow
- **Small**: `shadow-sm` - Subtle elevation
- **Medium**: `shadow-md` - Default card elevation
- **Large**: `shadow-lg` - Prominent elevation
- **Extra Large**: `shadow-xl` - High elevation
- **Glow**: `shadow-glow` - Brand glow effect
- **Glow Small**: `shadow-glow-sm` - Subtle glow

## Components

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Primary Action
</button>
```

#### Secondary Button
```tsx
<button className="btn-secondary">
  Secondary Action
</button>
```

#### Ghost Button
```tsx
<button className="btn-ghost">
  Ghost Action
</button>
```

#### Danger Button
```tsx
<button className="btn-danger">
  Dangerous Action
</button>
```

### Forms

#### Input Field
```tsx
<label className="input-label">Email Address</label>
<input className="input" type="email" placeholder="you@example.com" />
```

#### Input with Error
```tsx
<label className="input-label">Email Address</label>
<input className="input input-error" type="email" />
<p className="text-small text-error-500 mt-2">Error message</p>
```

#### Select
```tsx
<label className="input-label">Property Type</label>
<select className="select">
  <option>HDB Resale</option>
</select>
```

#### Textarea
```tsx
<label className="input-label">Description</label>
<textarea className="textarea" rows={4} />
```

### Cards

#### Basic Card
```tsx
<div className="card p-6">
  <h3 className="text-h3 mb-4">Card Title</h3>
  <p className="text-body">Card content</p>
</div>
```

#### Hover Card
```tsx
<div className="card-hover p-6">
  <h3 className="text-h3 mb-4">Interactive Card</h3>
  <p className="text-body">Hover over me</p>
</div>
```

#### Elevated Card
```tsx
<div className="card-elevated p-6">
  <h3 className="text-h3 mb-4">Prominent Card</h3>
  <p className="text-body">With shadow elevation</p>
</div>
```

### Badges

#### Primary Badge
```tsx
<span className="badge-primary">New</span>
```

#### Success Badge
```tsx
<span className="badge-success">Completed</span>
```

#### Warning Badge
```tsx
<span className="badge-warning">Pending</span>
```

#### Error Badge
```tsx
<span className="badge-error">Failed</span>
```

#### Neutral Badge
```tsx
<span className="badge-neutral">Draft</span>
```

### Alerts

#### Success Alert
```tsx
<div className="alert-success">
  <p>Operation completed successfully</p>
</div>
```

#### Error Alert
```tsx
<div className="alert-error">
  <p>Something went wrong</p>
</div>
```

#### Warning Alert
```tsx
<div className="alert-warning">
  <p>Please check your input</p>
</div>
```

#### Info Alert
```tsx
<div className="alert-info">
  <p>Information message</p>
</div>
```

## Layout

### Container
```tsx
<div className="container">
  <!-- Content -->
</div>
```

### Section
```tsx
<section className="section">
  <div className="container">
    <!-- Section content -->
  </div>
</section>
```

### Grid
```tsx
<div className="grid-cols-auto-fit gap-6">
  <!-- Grid items -->
</div>
```

## Animations

### Available Animations
- `.animate-gradient` - Gradient background animation
- `.animate-float` - Floating up and down
- `.animate-pulse-slow` - Slow pulsing opacity
- `.animate-spin-slow` - Slow spinning
- `.animate-fade-in` - Fade in from transparent
- `.animate-slide-up` - Slide up from below

## Accessibility

### Focus Rings
```tsx
<button className="btn-primary focus-ring">
  Accessible Button
</button>
```

### Skip to Content
```tsx
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>
```

## Usage Guidelines

### Do's
- Use design system classes consistently
- Follow the typography scale hierarchy
- Maintain proper color contrast (WCAG AA minimum)
- Use semantic colors appropriately
- Test responsive behavior

### Don'ts
- Don't invent new styles outside the system
- Don't use low contrast text for important content
- Don't mix multiple button styles without reason
- Don't ignore focus states for accessibility

## Responsive Design

### Breakpoints
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Responsive Patterns
```tsx
// Responsive typography
<h1 className="text-h1 md:text-display">Responsive Heading</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">Responsive Padding</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Responsive grid items -->
</div>
```

## Maintenance

### Adding New Components
1. Define in `tailwind.config.ts` if needed
2. Add utility classes to `app/globals.css`
3. Document in this file
4. Test across breakpoints
5. Verify accessibility

### Updating the System
1. Update configuration files
2. Update documentation
3. Test existing components
4. Communicate changes to team

---

*Last Updated: April 8, 2026*
*Version: 1.0.0*
