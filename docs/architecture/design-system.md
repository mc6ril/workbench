# Design System Documentation

## Overview

This document describes the design system tokens and principles used throughout the application. All design tokens are defined in `src/styles/variables/` and must be used consistently to maintain visual harmony and enable easy theming.

## Core Principles

1. **No Hardcoded Values**: All colors, spacing, typography, shadows, and animations must use variables from `styles/variables/`
2. **Consistency**: Use the same tokens across all components to ensure visual consistency
3. **Accessibility**: All design tokens support accessibility requirements (WCAG 2.1 AA)
4. **Scalability**: Design tokens are organized in a scalable system that supports future theming

## Design Tokens

### Colors (`styles/variables/colors.scss`)

The color system is organized into semantic categories:

#### Primary Colors
- `$color-primary`: Main brand color (#171717)
- `$color-primary-hover`: Hover state for primary elements (#383838)
- `$color-primary-text`: Text color on primary background (#f9fafb)

#### Secondary Colors
- `$color-secondary`: Secondary brand color (#ffffff)
- `$color-secondary-hover`: Hover state for secondary elements

#### Success Colors
- `$color-success`: Success state color (#16a34a)
- `$color-success-background`: Background for success messages (#dcfce7)
- `$color-success-text`: Text color for success messages (#15803d)
- `$color-success-ring`: Focus ring color for success states

#### Error Colors
- `$color-error`: Error state color (#dc2626)
- `$color-error-background`: Background for error messages (#fee2e2)
- `$color-error-text`: Text color for error messages (#991b1b)
- `$color-error-ring`: Focus ring color for error states

#### Neutral Colors
A complete neutral palette from 50 (lightest) to 900 (darkest):
- `$color-neutral-50` through `$color-neutral-900`

#### Background & Foreground
- `$color-background`: Main background color (#ffffff)
- `$color-background-dark`: Dark mode background (#0a0a0a)
- `$color-foreground`: Main foreground color (#171717)
- `$color-foreground-dark`: Dark mode foreground (#ededed)

#### Text Colors
- `$color-text`: Primary text color (#171717)
- `$color-text-secondary`: Secondary text color (#4b5563)

#### Border Colors
- `$color-border`: Default border color
- `$color-border-dark`: Dark mode border color

#### Focus Colors
- `$color-focus`: Focus indicator color (#2563eb)
- `$color-focus-ring`: Focus ring color with transparency

#### Disabled Colors
- `$color-disabled`: Disabled element color
- `$color-disabled-background`: Disabled background color
- `$color-disabled-text`: Disabled text color

**Usage Example:**
```scss
@use "@/styles/variables/colors" as *;

.button {
  background-color: $color-primary;
  color: $color-primary-text;
  
  &:hover {
    background-color: $color-primary-hover;
  }
}
```

### Typography (`styles/variables/typography.scss`)

#### Font Families
- `$font-family-sans`: System sans-serif font stack
- `$font-family-mono`: Monospace font stack

#### Font Sizes
Scale from extra small to extra large:
- `$font-size-xs`: 0.75rem (12px)
- `$font-size-sm`: 0.875rem (14px)
- `$font-size-base`: 1rem (16px)
- `$font-size-lg`: 1.125rem (18px)
- `$font-size-xl`: 1.25rem (20px)
- `$font-size-2xl`: 1.5rem (24px)
- `$font-size-3xl`: 1.875rem (30px)
- `$font-size-4xl`: 2.25rem (36px)

#### Font Weights
- `$font-weight-normal`: 400
- `$font-weight-medium`: 500
- `$font-weight-semibold`: 600
- `$font-weight-bold`: 700

#### Line Heights
- `$line-height-tight`: 1.25
- `$line-height-normal`: 1.5
- `$line-height-relaxed`: 1.6
- `$line-height-loose`: 2

**Usage Example:**
```scss
@use "@/styles/variables/typography" as *;

.heading {
  font-family: $font-family-sans;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  line-height: $line-height-tight;
}
```

### Spacing (`styles/variables/spacing.scss`)

Spacing uses a consistent 4px base unit scale:

#### Base Unit
- `$spacing-unit`: 0.25rem (4px)

#### Spacing Scale
- `$spacing-xs`: 0.25rem (4px)
- `$spacing-sm`: 0.5rem (8px)
- `$spacing-md`: 1rem (16px)
- `$spacing-lg`: 1.5rem (24px)
- `$spacing-xl`: 2rem (32px)
- `$spacing-2xl`: 3rem (48px)
- `$spacing-3xl`: 4rem (64px)

#### Component-Specific Spacing
- `$spacing-input-padding-x`: 1.25rem (20px)
- `$spacing-input-padding-y`: 0.75rem (12px)
- `$spacing-button-padding-x`: 1.25rem (20px)
- `$spacing-button-padding-y`: 0.75rem (12px)
- `$spacing-button-height`: 3rem (48px)

#### Container Widths
- `$container-max-width`: 25rem (400px)

**Usage Example:**
```scss
@use "@/styles/variables/spacing" as *;

.card {
  padding: $spacing-md;
  margin-bottom: $spacing-lg;
  gap: $spacing-sm;
}
```

### Shadows (`styles/variables/shadows.scss`)

Elevation system for depth and hierarchy:

#### Shadow Levels
- `$shadow-sm`: Subtle shadow for slight elevation
- `$shadow-base`: Default shadow for cards and containers
- `$shadow-md`: Medium shadow for elevated elements
- `$shadow-lg`: Large shadow for modals and dropdowns
- `$shadow-xl`: Extra large shadow for high elevation
- `$shadow-2xl`: Maximum shadow for maximum elevation

#### Inner Shadows
- `$shadow-inner`: Inset shadow for pressed states

#### Focus Shadows
- `$shadow-focus`: Focus ring shadow (blue)
- `$shadow-focus-error`: Error focus ring shadow (red)
- `$shadow-focus-success`: Success focus ring shadow (green)

#### Component-Specific Shadows
- `$shadow-button-hover`: Shadow for button hover state
- `$shadow-card`: Shadow for card components
- `$shadow-modal`: Shadow for modal dialogs

**Usage Example:**
```scss
@use "@/styles/variables/shadows" as *;

.card {
  box-shadow: $shadow-card;
  
  &:hover {
    box-shadow: $shadow-md;
  }
}
```

### Animations (`styles/variables/animations.scss`)

Animation system with accessibility support:

#### Animation Durations
- `$animation-duration-instant`: 0ms (for reduced motion)
- `$animation-duration-fast`: 150ms
- `$animation-duration-base`: 200ms
- `$animation-duration-slow`: 300ms
- `$animation-duration-slower`: 500ms

#### Easing Functions
- `$easing-linear`: Linear easing
- `$easing-ease-in`: Ease in
- `$easing-ease-out`: Ease out
- `$easing-ease-in-out`: Ease in-out
- `$easing-smooth`: Smooth cubic bezier
- `$easing-bounce`: Bounce effect

#### Common Transitions
- `$transition-base`: Base transition (200ms ease-in-out)
- `$transition-color`: Color transition
- `$transition-background`: Background color transition
- `$transition-border`: Border color transition
- `$transition-transform`: Transform transition
- `$transition-opacity`: Opacity transition
- `$transition-shadow`: Box shadow transition

#### Animation Delays
- `$animation-delay-none`: 0ms
- `$animation-delay-short`: 50ms
- `$animation-delay-medium`: 100ms
- `$animation-delay-long`: 200ms

**Usage Example:**
```scss
@use "@/styles/variables/animations" as *;

.button {
  transition: $transition-background, $transition-transform;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}
```

### Borders (`styles/variables/borders.scss`)

#### Border Width
- `$border-width`: 1px
- `$border-width-thick`: 2px

#### Border Radius
- `$border-radius-sm`: 0.25rem (4px)
- `$border-radius-md`: 0.375rem (6px)
- `$border-radius-lg`: 0.5rem (8px)
- `$border-radius-full`: 9999px (fully rounded)

#### Component-Specific Radius
- `$border-radius-input`: 0.375rem (6px)
- `$border-radius-button`: 9999px (fully rounded)

**Usage Example:**
```scss
@use "@/styles/variables/borders" as *;

.input {
  border: $border-width solid $color-border;
  border-radius: $border-radius-input;
}
```

## Importing Variables

All variables should be imported using the `@use` directive with the `as *` namespace:

```scss
@use "@/styles/variables/colors" as *;
@use "@/styles/variables/typography" as *;
@use "@/styles/variables/spacing" as *;
@use "@/styles/variables/shadows" as *;
@use "@/styles/variables/animations" as *;
@use "@/styles/variables/borders" as *;
```

## Best Practices

1. **Always Use Variables**: Never hardcode values like `#fff`, `16px`, or `1rem`
2. **Semantic Naming**: Use semantic color names (e.g., `$color-primary`) rather than descriptive names (e.g., `$color-blue`)
3. **Consistent Spacing**: Always use the spacing scale, avoid arbitrary values
4. **Accessibility First**: Ensure sufficient color contrast and respect `prefers-reduced-motion`
5. **Component-Specific Tokens**: When a component needs a specific value, add it to the appropriate variable file rather than hardcoding

## Adding New Tokens

When adding new design tokens:

1. **Identify the Category**: Determine which variable file the token belongs to
2. **Follow Naming Conventions**: Use consistent naming (e.g., `$color-{semantic-name}`)
3. **Document the Token**: Add a comment explaining the token's purpose
4. **Update This Documentation**: Add the new token to the appropriate section

## Migration Guide

When migrating existing code to use design tokens:

1. **Identify Hardcoded Values**: Search for hardcoded colors, spacing, etc.
2. **Find or Create Token**: Check if a token exists, or create a new one
3. **Replace Values**: Replace hardcoded values with token references
4. **Test**: Verify visual appearance remains consistent
5. **Verify Accessibility**: Ensure accessibility is maintained

## Accessibility Considerations

- **Color Contrast**: All color combinations meet WCAG 2.1 AA standards
- **Reduced Motion**: Animations respect `prefers-reduced-motion` media query
- **Focus Indicators**: Focus states use high-contrast colors and shadows
- **Text Readability**: Typography scale ensures readable text sizes

## Future Enhancements

- Dark mode token variants
- Custom theme support
- Design token export for other platforms
- Visual design system documentation (Storybook)

