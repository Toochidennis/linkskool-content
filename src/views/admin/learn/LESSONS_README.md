# Program Course Lessons Management

A stunning, feature-rich lesson management interface for creating and managing comprehensive course lessons with smooth animations and polished UI.

## 🎨 Features

### ✨ Beautiful UI Design

- **Smooth Transitions**: All interactions have beautiful cubic-bezier animations
- **Responsive Layout**: Fully responsive from mobile to desktop
- **Dark-aware**: Clean gradients and modern color scheme
- **Accessibility**: Keyboard navigation and semantic HTML

### 📚 Lesson Management

- **Collapsible Lesson Cards**: Accordion-style cards with smooth expand/collapse animations
- **Preview Mode**: See lesson overview without opening the full form
- **Duplicate Lessons**: Quickly duplicate existing lessons with all content
- **Delete Lessons**: Safe deletion with confirmation dialog
- **Live Status Indicators**: See saved/editing status in real-time

### 🎯 Comprehensive Lesson Fields

#### Basic Information

- **Title**: Lesson name
- **Description**: Brief overview
- **Goal**: Main learning objective
- **Objectives**: Rich text editor for detailed learning outcomes

#### Video & Materials

- **Video URL**: Link to YouTube, Vimeo, or other platforms
- **Recorded Video URL**: Optional recorded session link
- **Material Files**: Upload PDFs (max 10MB)
- **Write-up Files**: Alternative to videos - slides, notes, readings

#### Assignments

- **Instructions**: Rich text editor for detailed instructions
- **Upload Files**: PDF submission area
- **Schedule**: Start/end date and time configuration

#### Quizzes

- **JSON Upload**: Upload quiz in structured JSON format only

#### Final Lesson Configuration

- **Final Lesson Toggle**: Special mode for completion
- **Certificate Template**: SVG certificates (max 10MB) for final lessons
- **Completion Date**: When course ends

### 🎬 Rich Text Editing

- **Bold, Italic, Underline, Strikethrough** formatting
- **Bullet Lists**: Create unordered lists easily
- **Numbered Lists**: Create ordered lists
- **Paste Support**: Copy/paste formatted content
- **Live Preview**: See formatting in real-time

### 📁 File Management

- **Drag & Drop**: Intuitive drag-and-drop interface
- **Click Upload**: Click to browse and upload files
- **File Validation**: Automatic type and size checking
- **Visual Feedback**: Clear indication of upload zones
- **File List**: View and remove uploaded files

### 💾 Auto-Save

- **Debounced Saving**: Auto-saves after 2 seconds of inactivity
- **Visual Indicators**: See when saving/saved status
- **Conflict Prevention**: Never lose unsaved changes

## 📖 API Integration

The lesson system integrates with your backend via RESTful API:

```typescript
// Endpoints
GET /lessons/course/:courseId              // Fetch all lessons for a course
POST /lessons/course/:courseId              // Create/save lessons
PUT /lessons/course/:courseId               // Update lessons
DELETE /lessons/course/:courseId/lesson/:id // Delete a lesson
```

## 🎯 Data Structure

### Lesson Interface

```typescript
interface Lesson {
  lessonId?: number | string // Unique identifier
  courseId: number // Parent course ID
  title: string // Lesson title
  description: string // Short description
  goal: string // Learning goal
  objectives: string // Rich text HTML
  videoUrl: string // Video platform URL
  recordedVideoUrl: string // Optional recorded session
  materialFiles: LessonFile[] // PDFs max 10MB
  writeupFiles: LessonFile[] // Alternative content
  assignment: {
    instructions: string // Rich text
    files: LessonFile[] // Submission files
    schedule: {
      startDate: string // YYYY-MM-DD
      endDate: string // YYYY-MM-DD
      startTime: string // HH:mm
      endTime: string // HH:mm
      isFinalLesson: boolean // Toggle for final
    }
  }
  quiz: {
    jsonFile: LessonFile | null // JSON quiz
  }
  certificateFile?: LessonFile // SVG only, for final lesson
  schedule: LessonSchedule // Overall lesson dates
}

interface LessonFile {
  file_name: string // Original filename
  old_file_name?: string // Previous name if replacing
  type: string // 'pdf', 'svg', 'json'
  file: string // Base64 encoded content
}
```

## 🛠️ Components

### ProgramCourseLessonsView.vue

Main lesson management page. Handles:

- Lesson loading and saving
- Card management (collapse/expand)
- Form interactions
- Auto-save logic

**Route**: `/dashboard/learn-courses-lessons/:slug`

### RichTextEditor.vue

Reusable rich text editor component with:

- Formatting toolbar (bold, italic, underline, strikethrough)
- List support (ordered/unordered)
- Paste handling
- Placeholder support

### FileUploadZone.vue

Reusable file upload component with:

- Drag & drop support
- Click-to-upload
- File type validation
- Size limit checking
- Visual feedback

## 🎨 Styling

All styles are scoped and use:

- **CSS Grid** for responsive layouts
- **CSS Variables** for theming
- **Cubic-bezier animations** for smooth transitions
- **Gradient backgrounds** for modern look
- **Tailwind-compatible colors** (#667eea primary, #ef4444 danger, etc.)

Key color scheme:

```css
--primary: #667eea --primary-dark: #5568d3 --success: #10b981 --warning: #f59e0b --danger: #ef4444
  --secondary: #8b5cf6;
```

## 📱 Responsive Design

- **Desktop**: Full multi-column layout
- **Tablet**: 2-column grid, optimized spacing
- **Mobile**: Single column, adjusted padding, hidden non-essential UI

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast ratios meet WCAG AA
- Focus states on all interactive elements

## 🚀 Performance

- Debounced auto-save (2-second delay)
- Efficient re-renders with Vue 3 reactivity
- CSS animations use `transform` and `opacity` for 60fps
- Lazy-loaded components
- Optimized bundle size

## 📝 File Upload Limits

- **PDFs**: Max 10MB
- **JSON (Quiz)**: Max 10MB
- **SVG (Certificate)**: Max 10MB

## 🔄 Workflow

1. **Navigate** to course lessons page
2. **View** existing lessons in collapsed preview mode
3. **Expand** a lesson to see full form
4. **Edit** any field - auto-saves after 2 seconds
5. **Add Files** via drag-and-drop or click upload
6. **Save Status** shown at top - green checkmark when saved
7. **Duplicate** lessons for quick content creation
8. **Delete** lessons with confirmation

## 🎓 Final Lesson Configuration

When "Mark as Final Lesson" is toggled:

- ✅ Title, Description, Video URL, Date stay visible
- ❌ Goal, Objectives, Assignment, Quiz hidden
- ✨ Certificate field appears (SVG only, 10MB max)
- 🎖️ Special styling with purple accent

## 🔍 Form Validation

- Required fields marked with red asterisk (\*)
- Real-time format validation
- File type checking before upload
- Size limit enforcement
- Date/time validation

## 🌟 UI Polish

- **Skeleton Loaders**: While fetching (can be added)
- **Floating Action Cards**: Quick actions on hover
- **Empty States**: Helpful messages when no lessons
- **Loading States**: Visual feedback during operations
- **Success Animations**: Confirmation when saved
- **Error Messages**: Clear error handling

## 📦 Dependencies

- **Vue 3**: Framework
- **Vue Router**: Navigation
- **@tiptap/vue-3**: Rich text editor (optional enhancement)
- **Tailwind CSS**: Utilities (if using)

## 🎯 Future Enhancements

- [ ] Batch operations (multi-select delete)
- [ ] Lesson reordering (drag-and-drop)
- [ ] Template system for common lesson structures
- [ ] Conditional logic for lesson visibility
- [ ] Student progress tracking
- [ ] Lesson analytics and engagement metrics
- [ ] Video embed preview
- [ ] Content versioning and restore

## 🤝 Contributing

When modifying this component:

1. Keep animations smooth (use cubic-bezier)
2. Maintain accessibility standards
3. Test on mobile/tablet/desktop
4. Update API structure if needed
5. Document any new fields

## 📚 Learning Resources

- Vue 3 Docs: https://vuejs.org
- Vue Router: https://router.vuejs.org
- Tiptap Editor: https://tiptap.dev
- CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations

---

**Created with ❤️ for LinkSkool**
