# Documents Page - Feature Implementation Guide

## Features Implemented

### 1. Grid/Table View Toggle
- **Location**: Top navigation bar, right side
- **Icons**: LayoutList (table) and LayoutGrid (grid)
- **State**: `viewMode: 'table' | 'grid'`
- **Default**: Table view
- **Styling**: Active view highlighted with shadow and background

### 2. Top Navigation Bar
```jsx
<div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
  <div className="max-w-7xl mx-auto px-6 py-4">
    // Navigation content
  </div>
</div>
```
- **Components**: 
  - Document icon and title (left)
  - View toggle and upload button (right)
- **Responsive**: Works on all screen sizes

### 3. Light/Dark Mode Support

#### Color Mappings:
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | bg-gray-50 | bg-gray-900 |
| Card Background | bg-white | bg-gray-800 |
| Card Border | border-gray-200 | border-gray-700 |
| Primary Text | text-gray-900 | text-white |
| Secondary Text | text-gray-600 | text-gray-400 |
| Hover Background | hover:bg-gray-100 | hover:bg-gray-700 |

#### Updated Components:
- Navigation bar
- Upload section
- Filter inputs
- Category cards
- Document table
- Document grid cards
- Empty state
- Action buttons

### 4. Grid View Implementation
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {filteredDocuments.map((doc) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      // Card content
    </div>
  ))}
</div>
```

#### Grid Card Features:
- Category badge and status badge at top
- Document name (clickable)
- Size and upload date info
- Action buttons at bottom
- Hover shadow effect

### 5. Responsive Design
- **Mobile (< 768px)**: 1 column grid
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (1024px - 1280px)**: 3 columns
- **Wide (> 1280px)**: 4 columns

## State Management
```typescript
const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
```

## Category Colors (Updated)
```typescript
function getCategoryColor(categoryId?: string): string {
  const colors = {
    contracts: 'border-blue-500 text-blue-600 dark:text-blue-400',
    invoices: 'border-green-500 text-green-600 dark:text-green-400',
    permits: 'border-purple-500 text-purple-600 dark:text-purple-400',
    blueprints: 'border-cyan-500 text-cyan-600 dark:text-cyan-400',
    safety: 'border-red-500 text-red-600 dark:text-red-400',
  };
  return colors[categoryId] || 'border-gray-500 text-gray-600 dark:text-gray-400';
}
```

## Action Buttons
Both views include:
- **View** (Eye icon)
- **Sign** (PenTool icon) - PDFs only, not signed/completed
- **Download** (Download icon)
- **Delete** (Trash2 icon)

## Usage Examples

### Toggle View Mode
```jsx
<button onClick={() => setViewMode('grid')}>
  <LayoutGrid className="h-4 w-4" />
</button>
```

### Conditional Rendering
```jsx
{viewMode === 'table' ? (
  <TableView />
) : (
  <GridView />
)}
```

## Performance Optimizations
- Conditional rendering prevents unused view from rendering
- Tailwind classes for optimal CSS bundle size
- Icons loaded on demand
- Smooth transitions without JavaScript animations

## Accessibility
- Proper button labels with title attributes
- Semantic HTML structure
- Color contrast meets WCAG standards
- Keyboard navigation support

## Future Enhancements
- Remember user's preferred view mode
- Add list view (compact single column)
- Sorting options for grid view
- Bulk selection and actions
- Drag and drop file reordering
