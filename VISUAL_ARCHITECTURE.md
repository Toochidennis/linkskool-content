# 🎨 Lesson Management - Visual Architecture

## Component Hierarchy

```
App
└── ProgramCourseLessonsView.vue (Main Page)
    ├── Header Section
    │   ├── Back Button
    │   ├── Title & Subtitle
    │   ├── Status Indicator (Saving/Saved)
    │   └── Add Lesson Button
    │
    ├── Lessons List Container
    │   └── Lesson Item (Repeating)
    │       ├── LessonCard
    │       │   ├── Card Header
    │       │   │   ├── Badge (Lesson # or Final)
    │       │   │   ├── Title (Collapsed Preview)
    │       │   │   └── Action Buttons
    │       │   │       ├── Collapse/Expand
    │       │   │       ├── Duplicate
    │       │   │       └── Delete
    │       │   │
    │       │   ├── Preview Section (When Collapsed)
    │       │   │   ├── Description
    │       │   │   └── Meta Tags
    │       │   │       ├── Has Video
    │       │   │       ├── Materials Count
    │       │   │       ├── Has Quiz
    │       │   │       └── Date
    │       │   │
    │       │   └── Form Section (When Expanded)
    │       │       ├── Basic Information
    │       │       │   ├── Title Input
    │       │       │   └── Description Textarea
    │       │       │
    │       │       ├── Learning Outcomes
    │       │       │   ├── Goal Textarea
    │       │       │   └── Objectives (RichTextEditor)
    │       │       │
    │       │       ├── Video & Materials
    │       │       │   ├── Video URL Input
    │       │       │   ├── Recorded Video URL
    │       │       │   ├── Material Files (FileUploadZone)
    │       │       │   └── Write-up Files (FileUploadZone)
    │       │       │
    │       │       ├── Assignment Section
    │       │       │   ├── Instructions (RichTextEditor)
    │       │       │   ├── Assignment Files (FileUploadZone)
    │       │       │   └── Schedule (Dates & Times)
    │       │       │
    │       │       ├── Quiz Section
    │       │       │   └── Quiz JSON Upload (FileUploadZone)
    │       │       │
    │       │       └── Settings
    │       │           ├── Final Lesson Toggle
    │       │           ├── Certificate Upload (if Final)
    │       │           └── Lesson Date
    │       │
    │       └── File Lists (Per section)
    │           ├── Material Files List
    │           ├── Write-up Files List
    │           ├── Assignment Files List
    │           ├── Quiz File
    │           └── Certificate File
    │
    ├── Empty State (When no lessons)
    │   ├── Icon
    │   ├── Message
    │   └── Create Button
    │
    └── Save Indicator (Bottom right)
        └── Spinner + "Saving..." or Checkmark + "Saved"


Sub-Components Used:
├── RichTextEditor.vue (2 instances)
│   ├── Objectives field
│   └── Assignment Instructions field
│
└── FileUploadZone.vue (Multiple instances)
    ├── Material files
    ├── Write-up files
    ├── Assignment files
    ├── Quiz file
    └── Certificate file (final only)
```

---

## Data Flow Diagram

```
User Action → Vue Component → Composable Hook → Service → API Backend
                    ↓                ↓              ↓          ↓
            Update Local State   Batch Changes   Format    Save/Update
                    ↓                ↓              ↓          ↓
            Re-render UI      Auto-save (2s)  HTTP Call   Database
                    ↑                ↑              ↑          ↑
                    └────────────────┴──────────────┴──────────┘
                              Response Flow
```

### Detailed Flow Example: Save Lesson

```
User Edits Field
        ↓
Input Event Fires
        ↓
markEdited(lesson)
        ↓
Clear Previous Timer
        ↓
Set 2-Second Timer
        ↓
Show "Saving..." Status
        ↓
Wait 2 Seconds (no more edits?)
        ↓
Call saveChanges()
        ↓
Call saveLessons() from useLesson
        ↓
useLesson calls lessonService.post()
        ↓
baseService sends HTTP POST
        ↓
Backend saves to database
        ↓
Backend returns success response
        ↓
Update lessons array
        ↓
Clear editedLessons Set
        ↓
Show "Saved" Status
        ↓
Auto-hide after 3 seconds
```

---

## State Management Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Component State                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  lessons_data: Lesson[]           ← All lessons        │
│                                                         │
│  editedLessons: Set<string>       ← Which are edited   │
│                                                         │
│  collapsedCards: Set<string>      ← Which are hidden   │
│                                                         │
│  isSaving: boolean                ← Loading state      │
│                                                         │
│  savedIndicator: boolean          ← Show saved badge   │
│                                                         │
│  courseId: number                 ← Context            │
│                                                         │
│  courseTitle: string              ← Display context    │
│                                                         │
└─────────────────────────────────────────────────────────┘
        ↓                       ↓                    ↓
    Render UI          Handle User Input      Update on Save
```

---

## File Upload Process

```
User Drops File
       ↓
handleDrop() triggered
       ↓
Get File(s) from DataTransfer
       ↓
Validate:
├─ File Type (PDF/JSON/SVG)
├─ File Size (≤10MB)
└─ Count (if multiple)
       ↓
Pass Validation?
├─ YES: Convert to Base64
└─ NO: Show Error Alert
       ↓
Convert File → Base64 String
       ↓
Create LessonFile object:
├─ file_name
├─ type
└─ file (base64)
       ↓
Add to appropriate array:
├─ materialFiles[]
├─ writeupFiles[]
├─ assignment.files[]
├─ quiz.jsonFile
└─ certificateFile
       ↓
markEdited(lesson)
       ↓
Display in File List
       ↓
User can remove before saving
       ↓
On Save: Send base64 to backend
```

---

## UI State Machine

```
┌─────────────┐
│   Idle      │ Initial state
└──────┬──────┘
       │ User expands card
       ↓
┌─────────────┐
│   Editing   │ Form is open
└──────┬──────┘
       │ User makes change
       ↓
┌─────────────┐
│   Dirty     │ Has unsaved changes
└──────┬──────┘
       │ Start auto-save timer
       ↓
┌─────────────┐
│   Saving    │ Sending to server
└──────┬──────┘
       │ Server responds
       ↓
┌─────────────┐
│   Saved     │ Changes persisted
└──────┬──────┘
       │ Timer expires / New edit
       ↓
┌─────────────┐
│   Idle      │ Back to start
└─────────────┘
```

---

## Animation Timeline

```
Lesson Card Lifecycle:

1. Creation (slideInUp)
   Time: 0ms → 400ms
   Elements: Slide up + Fade in

2. Hover (lift + shadow)
   Time: 0ms → 200ms (on hover)
   Elements: translateY(-4px) + box-shadow

3. Click to Expand (expandForm)
   Time: 0ms → 400ms
   Elements: scaleY(0.95→1) + opacity

4. Form Sections (fadeInUp staggered)
   Time: 50ms → 450ms (staggered by 50ms)
   Elements: Each form section

5. Collapse (collapseContent)
   Time: 0ms → 400ms
   Elements: scaleY(1→0.95) + opacity

6. Save Indicator (slideInUp)
   Time: 0ms → 300ms
   Elements: Saved badge appears

7. Exit (fadeOut)
   Time: 0ms → 300ms (on delete)
   Elements: Fade out + slideOut
```

---

## Component Props & Events

```
ProgramCourseLessonsView
├── Props: None (uses route params)
├── Emits: None (internal state management)
└── Uses:
    ├── useLesson() composable
    ├── useRoute() for route params
    ├── useRouter() for navigation
    ├── RichTextEditor (child)
    └── FileUploadZone (child)

RichTextEditor.vue
├── Props:
│   ├── modelValue: string (HTML content)
│   └── placeholder?: string
├── Emits:
│   └── update:modelValue(value: string)
└── Features:
    ├── 4 formatting buttons
    ├── 2 list buttons
    └── Paste handling

FileUploadZone.vue
├── Props:
│   ├── accept?: string (file types)
│   ├── maxSize?: number (bytes)
│   └── multiple?: boolean
├── Emits:
│   └── files-selected(files: File[])
└── Features:
    ├── Drag & drop
    ├── Click to upload
    ├── File validation
    └── Visual feedback
```

---

## API Integration Points

```
useLesson.ts Composable
├── fetchLessons(courseId)
│   ├── Call: GET /lessons/course/:courseId
│   ├── Returns: Lesson[]
│   └── Updates: lessons state
│
├── saveLessons(courseId, data)
│   ├── Call: POST /lessons/course/:courseId
│   ├── Sends: { lessons: [...] }
│   └── Updates: lessons state
│
├── updateLesson(courseId, lesson)
│   ├── Call: PUT /lessons/course/:courseId
│   ├── Sends: lesson object
│   └── Updates: single lesson
│
└── deleteLesson(courseId, id)
    ├── Call: DELETE /lessons/course/:courseId/lesson/:id
    ├── Sends: ID in URL
    └── Updates: removes from state
```

---

## Error Handling Flow

```
Operation Attempted
       ↓
Try Block Executed
       ↓
Success?
├─ YES → Update State
│        └─ Show Success Message
│
└─ NO → Catch Error
        └─ Set error.value
        └─ Log to console
        └─ Show error message
        └─ State unchanged (safe)
```

---

## Form Validation Rules

```
Required Fields:
├─ title (required in UI, length > 0)
└─ description (required in UI, length > 0)

File Validations:
├─ PDFs: .pdf files only, max 10MB
├─ JSON: .json files only, max 10MB
└─ SVG: .svg files only, max 10MB

Date/Time Validations:
├─ Start date ≤ end date
├─ Time format: HH:mm (24-hour)
└─ Future dates allowed

Toggle States:
└─ Final lesson: Shows/hides fields conditionally
```

---

## Responsive Layout Grid

```
Desktop (1200px+)
┌─────────────────────────────────┐
│        HEADER                   │
├─────────────────────────────────┤
│                                 │
│  ┌──────────────────────────┐   │
│  │   LESSON CARDS (Main)    │   │
│  │   (Variable height)      │   │
│  └──────────────────────────┘   │
│                                 │
└─────────────────────────────────┘

Tablet (768px - 1199px)
┌──────────────────────────┐
│      HEADER              │
├──────────────────────────┤
│                          │
│  ┌──────────────────┐    │
│  │  LESSON CARDS    │    │
│  │  (2-col grid)    │    │
│  └──────────────────┘    │
│                          │
└──────────────────────────┘

Mobile (<768px)
┌──────────────┐
│    HEADER    │
├──────────────┤
│              │
│┌────────────┐│
││LESSON CARDS││
││(1-column)  ││
│└────────────┘│
│              │
└──────────────┘
```

---

## Performance Optimization Strategies

```
Rendering Optimization
├─ Vue 3 Reactivity System
├─ Computed properties where needed
├─ Scoped styles (no global pollution)
└─ Efficient event handling

Animation Performance
├─ Transform-based only (no top/left)
├─ Hardware acceleration via GPU
├─ Will-change hints
└─ Maintains 60fps

Network Optimization
├─ Debounced auto-save (2s)
├─ Batched updates
├─ Base64 encoding (no multipart)
└─ Minimal payload size

Bundle Size
├─ Tree-shakeable imports
├─ Component lazy loading ready
├─ Minimal dependencies
└─ ~37KB total (minified)
```

---

**Architecture Version**: 1.0
**Last Updated**: January 2024
