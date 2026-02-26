<template>
  <div class="cohorts-page">
    <template v-if="!showModal">
      <header class="page-header">
      <div class="header-left">
        <button class="back-btn cursor-pointer" @click="goBack" aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M15 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div>
          <p class="page-title">{{ courseName }} · Cohorts</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="filter-btn" :class="{ active: statusFilter }" @click="showFilterModal = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span v-if="statusFilter" class="filter-badge">1</span>
        </button>
        <button class="primary-btn" @click="openCreateModal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14m-7-7h14" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span style="white-space: nowrap">New cohort</span>
        </button>
      </div>
    </header>

    <section class="top-stats">
      <div class="stat-card">
        <p class="label">Ongoing cohorts</p>
        <div class="stat-row">
          <span class="stat-number">{{ stats.ongoing }}</span>
          <span class="pill success">Live</span>
        </div>
        <p class="hint">{{ stats.ongoing }} currently teaching</p>
      </div>
      <div class="stat-card">
        <p class="label">Upcoming</p>
        <div class="stat-row">
          <span class="stat-number">{{ stats.upcoming }}</span>
          <span class="pill info">Scheduled</span>
        </div>
        <p class="hint">Starting soon</p>
      </div>
      <div class="stat-card">
        <p class="label">Completed</p>
        <div class="stat-row">
          <span class="stat-number">{{ stats.completed }}</span>
          <span class="pill muted">Wrapped</span>
        </div>
        <p class="hint">Archived for reporting</p>
      </div>
      <div class="stat-card wide">
        <div class="stat-row between">
          <div>
            <p class="label">Total learners</p>
            <p class="stat-number">{{ stats.totalLearners }}</p>
          </div>
          <div class="mini">
            <p class="label">Avg cohort size</p>
            <p class="stat-number sm">{{ stats.avgSize }}</p>
          </div>
          <div class="mini">
            <p class="label">Lessons ready</p>
            <p class="stat-number sm">{{ stats.lessonsReady }}%</p>
          </div>
        </div>
        <div class="progress">
          <div class="bar" :style="{ width: stats.lessonProgress + '%' }"></div>
        </div>
        <p class="hint">Lesson readiness across all cohorts</p>
      </div>
    </section>

    <section class="filters">
      <div class="search-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="7" stroke-width="2" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input v-model="search" type="search" placeholder="Search cohorts by name or code" />
      </div>
      <div class="toggle">
        <label>
          <input type="checkbox" v-model="showOnlyOngoing" />
          Show only ongoing
        </label>
      </div>
    </section>

    <section v-if="isLoading" class="loading-card">
      <div class="loading-spinner"></div>
      <p>Loading cohorts...</p>
    </section>

    <section class="cohort-stack" v-else-if="filteredCohorts.length">
      <article v-for="cohort in filteredCohorts" :key="cohort.id" class="cohort-card">
        <div class="cohort-header" @click="toggleExpanded(cohort.id)">
          <div class="title-block">
            <span class="pill" :class="cohort.status">{{ cohort.status }}</span>
            <div>
              <p class="cohort-name">{{ cohort.title }}</p>
              <p class="cohort-meta">
                {{ cohort.code }} · {{ renderDateRange(cohort.startDate, cohort.endDate) }}
              </p>
            </div>
          </div>
          <div class="header-right">
            <div class="spark">
              <span class="label">Enrolled</span>
              <p class="strong">
                {{ cohort.participants }}<span class="muted">/{{ cohort.capacity }}</span>
              </p>
            </div>
            <div class="spark">
              <span class="label">Lessons</span>
              <p class="strong">{{ cohort.lessonsReady }}/{{ cohort.totalLessons }}</p>
            </div>
            <div class="spark">
              <span class="label">Time left</span>
              <p class="strong">{{ daysLeft(cohort) }}</p>
            </div>
            <button class="collapse-btn" @click.stop="toggleExpanded(cohort.id)">
              <svg v-if="expanded.has(cohort.id)" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 15l6-6 6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 9l6 6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <transition name="fade-slide">
          <div v-if="expanded.has(cohort.id)" class="cohort-body">
            <div class="body-left">
              <div class="banner" :style="{ backgroundImage: `url(${loadImage(cohort.imageUrl)})` }">
                <div class="menu-container banner-menu-container">
                  <button class="menu-btn banner-menu-btn" @click.stop="toggleMenu(cohort.id, $event)"
                    aria-label="Options">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <circle cx="12" cy="19" r="2" />
                    </svg>
                  </button>
                  <transition name="fade">
                    <div v-if="activeMenu === cohort.id" class="menu-dropdown menu-dropdown-banner" @click.stop>
                      <div class="menu-section">
                        <p class="menu-label">Actions</p>
                        <button class="menu-item" @click="handleEdit(cohort, $event)">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L7.5 20.5 3 21l0.5-4.5 13.232-13.232z"
                              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                          <span>Edit cohort</span>
                        </button>
                      </div>
                      <div class="menu-divider"></div>
                      <div class="menu-section">
                        <p class="menu-label">Change Status</p>
                        <button v-for="status in statusLegend" :key="status.value" class="menu-item"
                          :class="{ active: cohort.status === status.value }" :disabled="cohort.status === status.value"
                          @click="changeStatus(cohort, status.value as CohortStatus, $event)">
                          <span class="dot" :class="status.value"></span>
                          <span>{{ status.label }}</span>
                          <svg v-if="cohort.status === status.value" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" class="check-icon">
                            <path d="M5 13l4 4L19 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </button>
                      </div>
                      <div class="menu-divider"></div>
                      <button class="menu-item danger" @click="confirmDelete(cohort, $event)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span>Delete Cohort</span>
                      </button>
                    </div>
                  </transition>

                  <!-- Delete Confirmation Modal -->
                  <transition name="modal">
                    <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
                      <div class="modal delete-modal">
                        <header class="modal-header">
                          <div>
                            <h3>Delete Cohort</h3>
                          </div>
                          <button class="icon" @click="cancelDelete" aria-label="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round" />
                            </svg>
                          </button>
                        </header>
                        <div class="modal-body">
                          <div class="warning-box">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="warning-icon">
                              <path
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                            <p class="warning-text">
                              Are you sure you want to delete
                              <strong>{{ cohortToDelete?.title }}</strong>?
                            </p>
                            <p class="warning-sub">
                              This action cannot be undone. All cohort data, including enrolled
                              students and progress, will be permanently removed.
                            </p>
                          </div>
                        </div>
                        <footer class="modal-footer">
                          <button class="ghost" @click="cancelDelete">Cancel</button>
                          <button class="danger-btn" @click="deleteCohort">Delete Cohort</button>
                        </footer>
                      </div>
                    </div>
                  </transition>
                </div>
                <div class="overlay">
                  <p class="overlay-title">{{ cohort.title }}</p>
                  <p class="overlay-sub">{{ cohort.description }}</p>
                </div>
              </div>
              <div class="row">
                <div class="metric">
                  <p class="label">Instruction team</p>
                  <div class="avatars">
                    <span v-for="person in cohort.instructors" :key="person" class="avatar">{{
                      initials(person)
                      }}</span>
                  </div>
                </div>
                <div class="metric">
                  <p class="label">Attendance</p>
                  <p class="strong">{{ cohort.attendance }}%</p>
                </div>
                <div class="metric">
                  <p class="label">Retention</p>
                  <p class="strong">{{ cohort.retention }}%</p>
                </div>
              </div>
              <div class="timeline">
                <div class="line">
                  <div class="cursor" :style="{ left: timelinePosition(cohort) + '%' }"></div>
                </div>
                <div class="timeline-meta">
                  <span>{{ formatDate(cohort.startDate) }}</span>
                  <span>{{ formatDate(cohort.endDate) }}</span>
                </div>
              </div>
            </div>
            <div class="body-right">
              <div class="info-grid">
                <div>
                  <p class="label">Status</p>
                  <p class="strong">{{ cohort.statusLabel }}</p>
                </div>
                <div>
                  <p class="label">Waitlist</p>
                  <p class="strong">{{ cohort.waitlist }}</p>
                </div>
                <div>
                  <p class="label">Start</p>
                  <p class="strong">{{ formatDate(cohort.startDate) }}</p>
                </div>
                <div>
                  <p class="label">End</p>
                  <p class="strong">{{ formatDate(cohort.endDate) }}</p>
                </div>
              </div>
              <div class="pill-row">
                <span class="pill subtle">{{ cohort.delivery }}</span>
                <!-- <span class="pill subtle">{{ cohort.timezone }}</span> -->
              </div>
              <div class="cta-row">
                <button class="primary-btn" @click="openLessons(cohort)">Go to lessons</button>
              </div>
            </div>
          </div>
        </transition>
      </article>
    </section>

      <div v-else class="empty">
        <p class="empty-title">No cohorts yet</p>
        <p class="empty-sub">Create your first cohort to start scheduling lessons.</p>
        <button class="primary-btn" @click="openCreateModal">Create a cohort</button>
      </div>
    </template>

    <transition name="page">
      <div v-if="showModal" class="cohort-page">
        <div class="page-panel">
          <header class="modal-header">
            <div>
              <p class="label">New cohort</p>
              <h3>Create a cohort for {{ courseName }}</h3>
            </div>
            <button class="icon close-btn" @click="closeModal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="modal-body">
            <div class="field" :class="{ 'has-error': fieldErrors.title }">
              <label>Title<span class="required">*</span></label>
              <input v-model="form.title" type="text" placeholder="Cohort name" @blur="handleBlur('title')"
                @input="handleInput('title')" />
              <span v-if="fieldErrors.title" class="error-message">{{ fieldErrors.title }}</span>
            </div>
            <div class="field inline">
              <div>
                <label>Code</label>
                <input v-model="form.code" type="text" placeholder="e.g. SPR-2026" />
              </div>
              <div>
                <label>Status</label>
                <select v-model="form.status">
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div class="field inline">
              <div :class="{ 'has-error': fieldErrors.startDate }">
                <label>Start date<span class="required">*</span></label>
                <input v-model="form.startDate" type="date" @blur="handleBlur('startDate')" @change="
                  () => {
                    handleInput('startDate')
                    handleBlur('endDate')
                  }
                " />
                <span v-if="fieldErrors.startDate" class="error-message">{{
                  fieldErrors.startDate
                  }}</span>
              </div>
              <div :class="{ 'has-error': fieldErrors.endDate }">
                <label>End date<span class="required">*</span></label>
                <input v-model="form.endDate" type="date" @blur="handleBlur('endDate')"
                  @change="handleInput('endDate')" />
                <span v-if="fieldErrors.endDate" class="error-message">{{
                  fieldErrors.endDate
                  }}</span>
              </div>
            </div>
            <div class="field inline">
              <div>
                <label>Capacity</label>
                <input v-model.number="form.capacity" type="number" min="1" placeholder="50" />
              </div>
              <div>
                <label>Delivery</label>
                <select v-model="form.delivery">
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label>Description</label>
              <textarea v-model="form.description" rows="3" placeholder="What makes this cohort unique?" />
            </div>
            <div class="field" :class="{ 'has-error': fieldErrors.whatYouWillLearn }">
              <label>What You Will Learn<span class="required">*</span></label>
              <div class="rich-editor-wrapper">
                <RichTextEditor :model-value="form.whatYouWillLearn"
                  placeholder="Add learning points as a bulleted list. Press Enter to add each new point..."
                  @update:model-value="
                    (value) => {
                      form.whatYouWillLearn = value
                      handleInput('whatYouWillLearn')
                    }
                  " @blur="handleBlur('whatYouWillLearn')" />
              </div>
              <span v-if="fieldErrors.whatYouWillLearn" class="error-message">{{
                fieldErrors.whatYouWillLearn
                }}</span>
              <p v-else class="field-hint">
                Use bullet points (•) for each learning outcome. Each point will be displayed with a
                checkmark on the frontend.
              </p>
            </div>
            <div class="field" :class="{ 'has-error': fieldErrors.zoomLink }">
              <label>Zoom Link</label>
              <input v-model="form.zoomLink" type="url" placeholder="https://zoom.us/j/..."
                @blur="handleBlur('zoomLink')" @input="handleInput('zoomLink')" />
              <span v-if="fieldErrors.zoomLink" class="error-message">{{
                fieldErrors.zoomLink
                }}</span>
            </div>
            <div class="field">
              <label>Link to Next Cohort</label>
              <select v-model.number="form.nextCohortId">
                <option :value="0">Link cohort</option>
                <option v-for="cohortOption in linkableCohorts" :key="cohortOption.id" :value="cohortOption.id">
                  {{ cohortOption.title }}
                </option>
              </select>
              <p class="field-hint">
                Select the cohort learners should progress to next.
              </p>
            </div>
            <div class="field" :class="{ 'has-error': fieldErrors.image }">
              <label>Cover image<span class="required">*</span></label>
              <div v-if="!imagePreview" class="upload upload-large" @click="triggerUpload" @dragover.prevent
                @drop.prevent="handleDrop">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFile" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  style="width: 48px; height: 48px; margin: 0 auto 12px; color: #94a3b8">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p style="font-weight: 600; margin: 0 0 4px 0">Drop an image or click to upload</p>
                <p class="hint" style="margin: 0">PNG, JPG, or GIF up to 2MB (recommended: 1200x600px)</p>
              </div>
              <div v-else class="image-preview-container">
                <img :src="imagePreview" alt="Cover preview" class="preview-image" />
                <button type="button" @click="removeImage" class="remove-image-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Remove
                </button>
              </div>
              <span v-if="fieldErrors.image" class="error-message">{{ fieldErrors.image }}</span>
            </div>

            <!-- Pricing & Access Section -->
            <div style="border-top: 1px solid var(--theme-border); padding-top: 1rem; margin-top: 1rem">
              <p style="font-weight: 700; margin-bottom: 1rem; color: #0f172a">Pricing & Access</p>

              <!-- Free/Paid Toggle -->
              <div class="field">
                <label>Access Type</label>
                <div style="display: flex; align-items: center; gap: 1rem">
                  <button type="button"
                  @click="form.isFree = !form.isFree; handleAccessTypeChange()"
                    style="
                      position: relative;
                      width: 3.5rem;
                      height: 2rem;
                      background: currentColor;
                      border-radius: 999px;
                      border: none;
                      cursor: pointer;
                    " :style="form.isFree ? 'background: #10b981;' : 'background: #d1d5db;'">
                    <span style="
                        position: absolute;
                        top: 0.25rem;
                        left: 0.25rem;
                        width: 1.5rem;
                        height: 1.5rem;
                        background: var(--theme-surface);
                        border-radius: 999px;
                        transition: transform 0.3s;
                      " :style="form.isFree ? 'transform: translateX(1.5rem);' : 'transform: translateX(0);'
                        "></span>
                  </button>
                  <span style="font-size: 0.875rem; color: var(--theme-text-muted); font-weight: 500">
                    {{ form.isFree ? 'Free Cohort' : 'Paid Cohort' }}
                  </span>
                </div>
              </div>

              <!-- Cost Input (Only if Paid) -->
              <div v-if="!form.isFree" class="field" :class="{ 'has-error': fieldErrors.cost }">
                <label>Cost/Amount<span class="required">*</span></label>
                <div style="position: relative; display: flex; align-items: center">
                  <span style="
                      position: absolute;
                      left: 0.75rem;
                      font-weight: 600;
                      color: var(--theme-text-muted);
                      pointer-events: none;
                    ">₦</span>
                  <input v-model.number="form.cost" type="number" min="0" step="0.01" style="padding-left: 2rem"
                    placeholder="0.00" @blur="handleBlur('cost')" @input="handleInput('cost')" />
                </div>
                <span v-if="fieldErrors.cost" class="error-message">{{ fieldErrors.cost }}</span>
                <p v-else style="font-size: 0.75rem; color: var(--theme-text-subtle); margin-top: 0.25rem">
                  Enter the price for this cohort
                </p>
              </div>

              <!-- Trial Settings (Only if Paid) -->
              <div v-if="!form.isFree" style="margin-top: 1rem">
                <label style="font-weight: 700; color: var(--theme-text-muted); display: block; margin-bottom: 0.75rem">
                  Free Trial Setup<span class="required">*</span>
                </label>

                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                  " :class="{ 'has-error': fieldErrors.trialType }">
                  <label style="position: relative; cursor: pointer">
                    <input type="radio" v-model="form.trialType" value="views" name="trial-type"
                      style="position: absolute; opacity: 0" @change="
                        () => {
                          handleInput('trialType')
                          handleBlur('trialValue')
                        }
                      " />
                    <span style="
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1rem;
                        border: 2px solid #d1d5db;
                        border-radius: 0.5rem;
                        background: var(--theme-surface);
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: var(--theme-text-muted);
                        transition: all 0.2s;
                      " :style="form.trialType === 'views'
                          ? 'border-color: #6366f1; background: #eef2ff; color: #6366f1;'
                          : ''
                        ">
                      By Views
                    </span>
                  </label>

                  <label style="position: relative; cursor: pointer">
                    <input type="radio" v-model="form.trialType" value="days" name="trial-type"
                      style="position: absolute; opacity: 0" @change="
                        () => {
                          handleInput('trialType')
                          handleBlur('trialValue')
                        }
                      " />
                    <span style="
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.75rem 1rem;
                        border: 2px solid #d1d5db;
                        border-radius: 0.5rem;
                        background: var(--theme-surface);
                        font-size: 0.875rem;
                        font-weight: 600;
                        color: var(--theme-text-muted);
                        transition: all 0.2s;
                      " :style="form.trialType === 'days'
                          ? 'border-color: #6366f1; background: #eef2ff; color: #6366f1;'
                          : ''
                        ">
                      By Days
                    </span>
                  </label>
                </div>
                <span v-if="fieldErrors.trialType" class="error-message" style="margin-top: -0.5rem; display: block">
                  {{ fieldErrors.trialType }}
                </span>

                <div v-if="form.trialType" class="field" :class="{ 'has-error': fieldErrors.trialValue }">
                  <label>{{
                    form.trialType === 'views' ? 'Number of Free Views' : 'Number of Trial Days'
                  }}<span class="required">*</span></label>
                  <input v-model.number="form.trialValue" type="number" min="1"
                    :placeholder="form.trialType === 'views' ? 'e.g., 5 videos' : 'e.g., 7 days'"
                    @blur="handleBlur('trialValue')" @input="handleInput('trialValue')" />
                  <span v-if="fieldErrors.trialValue" class="error-message">{{
                    fieldErrors.trialValue
                    }}</span>
                </div>
              </div>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="ghost" @click="closeModal">Cancel</button>
            <button class="primary-btn" :disabled="!isFormValid || isSubmitting" @click="saveCohort">
              {{ isSubmitting ? 'Saving...' : 'Save cohort' }}
            </button>
          </footer>
        </div>
      </div>
    </transition>

    <!-- Filter Modal -->
    <transition name="modal">
      <div v-if="showFilterModal" class="modal-overlay" @click.self="closeFilterModal">
        <div class="modal filter-modal">
          <header class="modal-header">
            <div>
              <p class="label">Filter Cohorts</p>
              <h3>Filter by status</h3>
            </div>
            <button class="icon" @click="closeFilterModal" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 6l12 12M6 18L18 6" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </header>
          <div class="modal-body">
            <div class="filter-options">
              <label class="filter-option" :class="{ active: statusFilter === '' }">
                <input type="radio" v-model="statusFilter" value="" name="status-filter" />
                <span class="radio-custom"></span>
                <span>All Status</span>
              </label>
              <label v-for="item in statusLegend" :key="item.value" class="filter-option"
                :class="{ active: statusFilter === item.value }">
                <input type="radio" v-model="statusFilter" :value="item.value" name="status-filter" />
                <span class="radio-custom"></span>
                <span class="dot" :class="item.value"></span>
                <span>{{ item.label }}</span>
              </label>
            </div>
          </div>
          <footer class="modal-footer">
            <button class="ghost" @click="clearFilter">Clear</button>
            <button class="primary-btn" @click="closeFilterModal">Apply</button>
          </footer>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RichTextEditor from '@/components/RichTextEditor.vue'
import { useCohorts, type Cohort, type CohortStatus } from '@/composables/useCohorts'

const formatTitle = (slug?: string) => {
  if (!slug) return 'Course'
  const spaced = slug.replace(/-/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

const route = useRoute()
const router = useRouter()

// Use cohorts composable
const {
  cohorts,
  isLoading,
  isSubmitting,
  linkableCohorts,
  form,
  isFormValid,
  fieldErrors,
  fetchCohorts: _fetchCohorts,
  fetchLinkableCohorts: _fetchLinkableCohorts,
  saveCohort: _saveCohort,
  deleteCohort: _deleteCohort,
  updateCohortStatus: _updateCohortStatus,
  resetForm,
  startEditCohort: _startEditCohort,
  validateField,
  clearFieldError,
} = useCohorts()

const programId = computed(() => Number(route.query.programId) || 0)
const courseSlug = computed(() => route.params.courseSlug as string)
const courseId = computed(() => Number(route.query.courseId) || 0)
const courseName = computed(
  () => (route.query.courseName as string) || formatTitle(courseSlug.value),
)

const search = ref('')
const statusFilter = ref<CohortStatus | ''>('')
const showOnlyOngoing = ref(false)
const expanded = ref<Set<number>>(new Set())

const showModal = ref(false)
const showFilterModal = ref(false)
const activeMenu = ref<number | null>(null)
const showDeleteModal = ref(false)
const cohortToDelete = ref<Cohort | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string>('')

const statusLegend = [
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Completed' },
]

const filteredCohorts = computed(() => {
  const term = search.value.toLowerCase()
  return cohorts.value.filter((c) => {
    const matchesTerm =
      !term || c.title?.toLowerCase().includes(term) || c.code?.toLowerCase().includes(term)
    const matchesStatus = !statusFilter.value || c.status === statusFilter.value
    const matchesOngoing = !showOnlyOngoing.value || c.status === 'ongoing'
    return matchesTerm && matchesStatus && matchesOngoing
  })
})

const stats = computed(() => {
  const ongoing = cohorts.value.filter((c) => c.status === 'ongoing').length
  const upcoming = cohorts.value.filter((c) => c.status === 'upcoming').length
  const completed = cohorts.value.filter((c) => c.status === 'completed').length
  const totalLearners = cohorts.value.reduce((acc, c) => acc + (c.participants ?? 0), 0)
  const avgSize = cohorts.value.length ? Math.round(totalLearners / cohorts.value.length) : 0
  const lessonsReady = cohorts.value.reduce(
    (acc, c) => acc + ((c.lessonsReady ?? 0) / (c.totalLessons ?? 1) || 0),
    0,
  )
  const lessonProgress = cohorts.value.length
    ? Math.round((lessonsReady / cohorts.value.length) * 100)
    : 0
  return {
    ongoing,
    upcoming,
    completed,
    totalLearners,
    avgSize,
    lessonProgress,
    lessonsReady: lessonProgress,
  }
})

const toggleExpanded = (id: number) => {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

const goBack = () => router.back()

const formatDate = (date?: string) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const renderDateRange = (start?: string, end?: string) => {
  if (!start || !end) return '—'
  return `${formatDate(start)} → ${formatDate(end)}`
}

const daysLeft = (cohort: Cohort) => {
  if (!cohort.endDate) return '—'
  const today = new Date()
  const end = new Date(cohort.endDate)
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (cohort.status === 'completed') return 'Done'
  if (diff <= 0) return 'Ends today'
  return `${diff} days`
}

const timelinePosition = (cohort: Cohort) => {
  if (!cohort.startDate || !cohort.endDate) return 4
  const start = new Date(cohort.startDate).getTime()
  const end = new Date(cohort.endDate).getTime()
  const today = Date.now()
  if (Number.isNaN(start) || Number.isNaN(end) || start === end) return 4
  if (today <= start) return 4
  if (today >= end) return 96
  return Math.min(96, Math.max(4, ((today - start) / (end - start)) * 100))
}

const loadImage = (src?: string) => {
  if (!src) return 'https://via.placeholder.com/1200x600?text=Cohort'
  if (src.startsWith('http') || src.startsWith('data:')) return src
  return import.meta.env.VITE_ASSETS_BASE_URL + '/' + src
}

const initials = (name: string) => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase())
    .join('')
    .slice(0, 2)
}

const openLessons = (cohort: Cohort) => {
  router.push({
    name: 'Program Course Lessons',
    params: { courseSlug: courseSlug.value },
    query: {
      courseName: courseName.value,
      courseId: courseId.value,
      cohortId: cohort.id,
      programId: programId.value,
    },
  })
}

const startEditCohort = async (cohort: Cohort) => {
  if (programId.value) {
    await _fetchLinkableCohorts(programId.value, cohort.id)
  }
  _startEditCohort(cohort)
  imagePreview.value = cohort.imageUrl ? loadImage(cohort.imageUrl) : ''
  showModal.value = true
}

const openCreateModal = async () => {
  if (programId.value) {
    await _fetchLinkableCohorts(programId.value)
  }
  resetForm()
  imagePreview.value = ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  imagePreview.value = ''
}

const saveCohort = async () => {
  const success = await _saveCohort(programId.value, courseId.value, courseName.value)
  if (success) {
    closeModal()
    // Refresh expanded state after fetch
    expanded.value = cohorts.value.length ? new Set([cohorts.value[0]?.id ?? 0]) : new Set()
  }
}

const fetchCohorts = async () => {
  await _fetchCohorts(programId.value, courseId.value)
  expanded.value = cohorts.value.length ? new Set([cohorts.value[0]?.id ?? 0]) : new Set()
}

const closeFilterModal = () => {
  showFilterModal.value = false
}

const clearFilter = () => {
  statusFilter.value = ''
  showFilterModal.value = false
}

const toggleMenu = (cohortId: number, event: Event) => {
  event.stopPropagation()
  activeMenu.value = activeMenu.value === cohortId ? null : cohortId
}

const closeMenu = () => {
  activeMenu.value = null
}

const confirmDelete = (cohort: Cohort, event: Event) => {
  event.stopPropagation()
  cohortToDelete.value = cohort
  showDeleteModal.value = true
  closeMenu()
}

const handleEdit = (cohort: Cohort, event: Event) => {
  event.stopPropagation()
  startEditCohort(cohort)
  closeMenu()
}

const deleteCohort = async () => {
  if (!cohortToDelete.value) return
  const success = await _deleteCohort(programId.value, courseId.value, cohortToDelete.value.id)
  if (success) {
    showDeleteModal.value = false
    cohortToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  cohortToDelete.value = null
}

const changeStatus = async (cohort: Cohort, newStatus: CohortStatus, event: Event) => {
  event.stopPropagation()
  await _updateCohortStatus(programId.value, courseId.value, cohort.id, newStatus)
  closeMenu()
}

const triggerUpload = () => fileInput.value?.click()

const handleFile = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    clearFieldError('image')
  }
}

const handleDrop = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (ev) => {
      imagePreview.value = ev.target?.result as string
    }
    reader.readAsDataURL(file)
    clearFieldError('image')
  }
}

const removeImage = () => {
  form.value.image = ''
  imagePreview.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  clearFieldError('image')
}

const handleBlur = (fieldName: string) => {
  const error = validateField(fieldName)
  if (error) {
    fieldErrors.value[fieldName] = error
  } else {
    clearFieldError(fieldName)
  }
}

const handleInput = (fieldName: string) => {
  clearFieldError(fieldName)
}

const handleAccessTypeChange = () => {
  // Clear pricing-related errors when toggling between free/paid
  clearFieldError('cost')
  clearFieldError('trialType')
  clearFieldError('trialValue')
}

onMounted(() => {
  fetchCohorts()
  if (programId.value) {
    _fetchLinkableCohorts(programId.value)
  }
  document.addEventListener('click', closeMenu)

  onUnmounted(() => {
    document.removeEventListener('click', closeMenu)
  })
})
</script>

<style scoped>
.cohorts-page {
  min-height: 100vh;
  padding: 2rem 0 3rem;
  color: var(--theme-text);
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.header-left {
  display: flex;
  gap: 1rem;
}

.back-btn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  display: grid;
  place-items: center;
  color: var(--theme-text-muted);
  transition: all 0.2s ease;
}

.back-btn:hover {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  transform: translateX(-2px);
}

.eyebrow {
  margin: 0;
  color: var(--theme-text-muted);
  font-weight: 600;
  font-size: 0.85rem;
}

.page-title {
  margin: 0.2rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.page-subtitle {
  margin: 0;
  color: var(--theme-text-muted);
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  border-color: #6366f1;
  color: #6366f1;
}

.filter-btn.active {
  background: #e0e7ff;
  border-color: #6366f1;
  color: #6366f1;
}

.filter-btn svg {
  width: 20px;
  height: 20px;
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #6366f1;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #cbd5e1;
}

.dot.active {
  background: #22c55e;
}

.dot.upcoming {
  background: #f59e0b;
}

.dot.paused {
  background: #94a3b8;
}

.dot.completed {
  background: #10b981;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(99, 102, 241, 0.25);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.top-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 1rem;
  padding: 1rem 1.25rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.stat-card.wide {
  grid-column: span 2;
}

.label {
  font-size: 0.85rem;
  color: var(--theme-text-muted);
  margin: 0;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.35rem 0;
}

.stat-row.between {
  justify-content: space-between;
  gap: 1rem;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  color: var(--theme-text);
}

.stat-number.sm {
  font-size: 1.3rem;
}

.hint {
  color: var(--theme-text-subtle);
  margin: 0;
  font-size: 0.9rem;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  font-weight: 700;
  text-transform: capitalize;
  border: 1px solid transparent;
}

.pill.success {
  background: #ecfdf3;
  color: #15803d;
  border-color: #bbf7d0;
}

.pill.info {
  background: #eef2ff;
  color: #4338ca;
  border-color: #c7d2fe;
}

.pill.muted {
  background: #f1f5f9;
  color: var(--theme-text-muted);
  border-color: #e2e8f0;
}

.pill.ongoing,
.pill.active {
  background: #ecfdf3;
  color: #166534;
  border-color: #bbf7d0;
}

.pill.upcoming {
  background: #fef9c3;
  color: #92400e;
  border-color: #fde68a;
}

.pill.paused {
  background: var(--theme-bg);
  color: var(--theme-text-muted);
  border-color: #e2e8f0;
}

.pill.completed {
  background: #e0f2fe;
  color: #075985;
  border-color: #bae6fd;
}

.pill.subtle {
  background: var(--theme-bg);
  color: var(--theme-text-muted);
  border-color: #e2e8f0;
}

.progress {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: linear-gradient(135deg, #6366f1, #22c55e);
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;

  .dot.ongoing {
    background: #22c55e;
  }

  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  background: var(--theme-surface);
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
}

.search-box svg {
  width: 18px;
  height: 18px;
  color: var(--theme-text-subtle);
}

.toggle input {
  accent-color: #6366f1;
}

.toggle label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--theme-text-muted);
  font-weight: 600;
}

.cohort-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cohort-card {
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  background: var(--theme-surface);
  overflow: visible;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.cohort-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  align-items: center;
  cursor: pointer;
}

.title-block {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.cohort-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
}

.cohort-meta {
  margin: 0.1rem 0 0;
  color: var(--theme-text-muted);
}

.header-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.spark {
  background: var(--theme-bg);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 0.55rem 0.85rem;
  min-width: 110px;
}

.spark .strong {
  margin: 0.1rem 0 0;
  font-weight: 800;
  color: var(--theme-text);
}

.spark .muted {
  color: var(--theme-text-subtle);
  font-weight: 600;
  margin-left: 0.15rem;
}

.collapse-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  display: grid;
  place-items: center;
  color: var(--theme-text-muted);
}

.menu-container {
  position: relative;
}

.menu-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--theme-border);
  background: var(--theme-surface);
  display: grid;
  place-items: center;
  color: var(--theme-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.menu-btn:hover {
  background: var(--theme-bg);
  border-color: #cbd5e1;
  color: var(--theme-text);
}

.menu-btn svg {
  width: 20px;
  height: 20px;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(15, 23, 42, 0.15);
  z-index: 100;
  overflow: hidden;
}

.menu-section {
  padding: 0.5rem;
}

.menu-label {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--theme-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--theme-text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  text-align: left;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.menu-item:hover:not(:disabled) {
  background: var(--theme-bg);
  color: var(--theme-text);
}

.menu-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-item.active {
  background: #eef2ff;
  color: #6366f1;
}

.menu-item.danger {
  color: #dc2626;
}

.menu-item.danger:hover {
  background: #fef2f2;
  color: #b91c1c;
}

.menu-item svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.menu-item .check-icon {
  margin-left: auto;
  color: #6366f1;
  width: 16px;
  height: 16px;
}

.menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.delete-modal {
  max-width: 480px;
}

.warning-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
}

.warning-icon {
  width: 48px;
  height: 48px;
  color: #dc2626;
  margin: 0 auto;
}

.warning-text {
  margin: 0;
  font-size: 1rem;
  color: var(--theme-text);
  text-align: center;
}

.warning-text strong {
  font-weight: 800;
  color: #dc2626;
}

.warning-sub {
  margin: 0;
  font-size: 0.875rem;
  color: var(--theme-text-muted);
  text-align: center;
  line-height: 1.5;
}

.danger-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.2rem;
  border-radius: 10px;
  background: #dc2626;
  color: #fff;
  border: none;
  font-weight: 700;
  box-shadow: 0 12px 30px rgba(220, 38, 38, 0.25);
  cursor: pointer;
  transition: all 0.2s ease;
}

.danger-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.cohort-body {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  padding: 0 1.25rem 1.25rem;
}

.body-left {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.banner {
  position: relative;
  border-radius: 12px;
  overflow: visible;
  height: 180px;
  background-size: cover;
  background-position: center;
}

.banner-menu-container {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.banner-menu-btn {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #0f172a !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.banner-menu-btn:hover {
  background: #fff !important;
}

.menu-dropdown-banner {
  right: 0;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.75));
  color: #e2e8f0;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.25rem;
}

.overlay-title {
  margin: 0;
  font-weight: 800;
  color: #fff;
}

.overlay-sub {
  margin: 0;
  color: #cbd5e1;
  max-width: 80%;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.75rem;
}

.metric {
  background: var(--theme-bg);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 0.75rem;
}

.metric .strong {
  margin: 0.1rem 0 0;
  font-weight: 800;
}

.avatars {
  display: flex;
  gap: 0.35rem;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #6366f1;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.timeline {
  margin-top: 0.25rem;
}

.line {
  position: relative;
  height: 6px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}

.cursor {
  position: absolute;
  top: -4px;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.35);
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  color: var(--theme-text-subtle);
  font-weight: 600;
  margin-top: 0.35rem;
}

.body-right {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.info-grid .strong {
  margin: 0.15rem 0 0;
  font-weight: 800;
}

.pill-row {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.cta-row {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.ghost {
  border: 1px solid #334155;
  background: transparent;
  color: #e2e8f0;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.loading-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1.25rem;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  color: var(--theme-text-subtle);
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 3px solid #dbeafe;
  border-top-color: #0284c7;
  animation: cohorts-spin 0.8s linear infinite;
}

.empty {
  text-align: center;
  padding: 3rem 1rem;
  background: var(--theme-surface);
  border: 1px dashed #e2e8f0;
  border-radius: 16px;
}

.empty-title {
  margin: 0 0 0.35rem;
  font-size: 1.5rem;
  font-weight: 800;
}

.empty-sub {
  margin: 0 0 1rem;
  color: var(--theme-text-muted);
}

.cohort-page {
  width: 100%;
}

.page-panel {
  width: 100%;
  background: var(--theme-surface);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

@keyframes cohorts-spin {
  to {
    transform: rotate(360deg);
  }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  display: grid;
  place-items: center;
  z-index: 50;
  padding: 1rem;
}

.modal {
  background: var(--theme-surface);
  border-radius: 16px;
  width: min(720px, 100%);
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.18);
}

.modal.filter-modal {
  width: min(480px, 100%);
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border: 2px solid var(--theme-border);
  border-radius: 10px;
  background: var(--theme-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.filter-option:hover {
  border-color: #cbd5e1;
  background: var(--theme-surface);
}

.filter-option.active {
  border-color: #6366f1;
  background: #eef2ff;
}

.filter-option input[type='radio'] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e1;
  border-radius: 999px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.filter-option.active .radio-custom {
  border-color: #6366f1;
  background: #6366f1;
  box-shadow: inset 0 0 0 4px #fff;
}

.filter-option span {
  font-weight: 600;
  color: var(--theme-text-muted);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--theme-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--theme-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field.inline {
  flex-direction: row;
  gap: 1rem;
}

.field.inline>div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field label {
  font-weight: 700;
  color: var(--theme-text-muted);
}

.field input,
.field select,
.field textarea {
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
  font-size: 1rem;
  background: var(--theme-bg);
}

.field textarea {
  resize: vertical;
}

.rich-editor-wrapper {
  border: 1px solid var(--theme-border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--theme-bg);
  transition: all 0.2s ease;
}

.rich-editor-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: var(--theme-surface);
}

.field-hint {
  font-size: 0.8rem;
  color: var(--theme-text-muted);
  margin: 0.35rem 0 0 0;
  line-height: 1.4;
}

.upload {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  color: var(--theme-text-muted);
  cursor: pointer;
  background: var(--theme-bg);
  transition: all 0.2s ease;
}

.upload:hover {
  border-color: var(--theme-text-subtle);
  background: #f1f5f9;
}

.upload-large {
  padding: 2.5rem 1.5rem;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-preview-container {
  position: relative;
  border: 2px solid var(--theme-border);
  border-radius: 12px;
  overflow: hidden;
  background: var(--theme-bg);
}

.preview-image {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(239, 68, 68, 0.95);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(4px);
}

.remove-image-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.remove-image-btn svg {
  width: 16px;
  height: 16px;
  stroke-width: 2.5;
}

.hidden {
  display: none;
}

.icon {
  border: none;
  background: transparent;
  color: var(--theme-text-muted);
  cursor: pointer;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--theme-border);
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--theme-bg);
  color: var(--theme-text);
  border-color: #cbd5e1;
}

/* Required field indicator */
.required {
  color: #ef4444;
  margin-left: 0.15rem;
  font-weight: 700;
}

/* Error states */
.field.has-error input,
.field.has-error select,
.field.has-error textarea,
.field.has-error .rich-editor-wrapper {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.field.has-error input:focus,
.field.has-error select:focus,
.field.has-error textarea:focus,
.field.has-error .rich-editor-wrapper:focus-within {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
}

.field.has-error .upload {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.error-message {
  display: block;
  color: #dc2626;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.35rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.error-message::before {
  content: '⚠';
  font-size: 0.9rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.page-enter-active .page-panel,
.page-leave-active .page-panel {
  transition: transform 0.3s ease;
}

.page-enter-from .page-panel,
.page-leave-to .page-panel {
  transform: translateX(6%);
}

@media (max-width: 1024px) {
  .cohort-body {
    grid-template-columns: 1fr;
  }

  .header-right {
    flex-wrap: wrap;
  }

  .stat-card.wide {
    grid-column: span 1;
  }
}

@media (max-width: 720px) {
  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-start;
  }

  .cohort-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .spark {
    width: 100%;
  }

  .field.inline {
    flex-direction: column;
  }
}
</style>
