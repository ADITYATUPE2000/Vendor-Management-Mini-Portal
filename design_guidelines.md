# Vendor Management Portal - Design Guidelines

## Design Approach
**System-Based Approach**: Material Design principles adapted for a professional B2B vendor management platform. Focus on clarity, efficiency, and data-dense interfaces that prioritize functionality while maintaining visual professionalism.

## Typography System
- **Primary Font**: Inter (Google Fonts) for all UI elements
- **Headings**: 
  - H1: text-4xl font-bold (page titles)
  - H2: text-2xl font-semibold (section headers)
  - H3: text-xl font-medium (card titles, form sections)
- **Body**: text-base (forms, descriptions, content)
- **Small**: text-sm (labels, metadata, helper text)
- **Emphasis**: font-semibold for CTAs, font-medium for labels

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (form field groups)
- Standard spacing: p-4, gap-4 (cards, containers)
- Section spacing: p-8, py-12 (page sections)
- Large spacing: p-16 (page containers on desktop)

**Container Strategy**:
- Max-width: max-w-7xl for dashboards and listing pages
- Max-width: max-w-2xl for forms (registration, login)
- Full-width tables with horizontal scroll on mobile

## Component Library

### Navigation
- **Top Navigation Bar**: Fixed header with logo left, main nav center, user profile/logout right
- Height: h-16, shadow-sm for subtle elevation
- Sticky positioning for dashboard pages

### Forms (Registration, Login, Product Management)
- **Layout**: Single column, max-w-2xl centered
- **Input Fields**: Full width, h-12, rounded-lg, border with focus states
- **Labels**: text-sm font-medium, mb-2
- **Field Spacing**: space-y-6 between field groups
- **Buttons**: h-12, px-8, rounded-lg, font-semibold
- **File Upload**: Drag-and-drop zone with preview (300x300px for logos, 400x300px for products)
- **Dropdown**: Custom select with chevron icon, consistent h-12 height

### Vendor Cards (Listing Page)
- **Grid**: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- **Card Structure**: rounded-xl, shadow-md, p-6
- **Logo**: w-16 h-16, rounded-lg, object-cover
- **Star Rating**: Display as filled/unfilled star icons (Heroicons), text-sm
- **CTA Button**: "View Profile" - full width within card, h-10

### Vendor Profile Page (Public)
- **Hero Section**: 40vh height, vendor name overlay on subtle gradient
- **Content Layout**: Two-column on desktop (lg:grid-cols-3)
  - Left sidebar (col-span-1): Vendor info card with logo, category, rating, contact
  - Main content (col-span-2): Products grid
- **Product Cards**: grid-cols-1 md:grid-cols-2, gap-4
- **Product Image**: aspect-video, rounded-lg, object-cover

### Dashboard (Vendor Panel)
- **Sidebar Navigation**: Fixed left sidebar, w-64, with icon + label menu items
- **Main Content**: ml-64, p-8
- **Stats Cards**: grid-cols-1 md:grid-cols-3, showing profile views, products, avg rating
- **Products Table**: Responsive table with edit/delete actions

### Feedback/Rating Page
- **Form Layout**: max-w-2xl centered
- **Star Input**: Interactive 5-star selector (clickable Heroicons stars)
- **Textarea**: min-h-32, rounded-lg
- **Recent Reviews**: List below form, each review in rounded-lg card with p-4

### Admin Panel
- **Table**: Full-width responsive table with fixed header
- **Columns**: Vendor Name (with logo thumbnail), Category, Rating (stars + number), Review Count, Actions
- **Row Height**: h-16 for comfortable scanning
- **Hover State**: Subtle row highlight for interactivity

### Rating Display
- Use Heroicons star icons (solid for filled, outline for empty)
- Display: inline-flex gap-1
- Show numeric rating alongside: "4.5/5"

## Icons
- **Library**: Heroicons (via CDN)
- **Usage**: 
  - Navigation icons: w-5 h-5
  - Form icons: w-4 h-4 (input prefixes)
  - Action buttons: w-5 h-5
  - Stars: w-5 h-5

## Images
**Logo/Product Images**: 
- Vendor logos: Circular or rounded-lg thumbnails
- Product images: Maintain aspect-video ratio
- Fallback: Display placeholder with icon for missing images

**No Hero Images**: This is a utility-focused portal; prioritize immediate functionality over decorative imagery

## Responsive Behavior
- **Mobile**: Single column layouts, collapsible sidebar, stacked cards
- **Tablet**: 2-column grids, visible sidebar toggle
- **Desktop**: Full grid layouts, persistent sidebar navigation

## Key UI Patterns
- **Empty States**: Show helpful messages with "Add Product" CTA when vendors have no products
- **Loading States**: Skeleton loaders matching card/table structures
- **Success Messages**: Toast notifications (top-right, rounded-lg, shadow-lg)
- **Form Validation**: Inline error messages (text-sm, mt-1) below fields