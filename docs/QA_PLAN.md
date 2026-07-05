# QA Plan - Release Candidate v0.1.0-alpha

**Release Version**: v0.1.0-alpha  
**QA Date**: July 5, 2026  
**Sprint**: Post-Sprint 7 (Pre-Sprint 8)  
**Status**: Release Candidate Validation  
**Tester Role**: QA Engineer

---

## Overview

This document outlines the comprehensive QA plan for Scan Chan Release Candidate v0.1.0-alpha. The application has completed Sprint 7 (Accessibility) and is undergoing pre-release validation before Sprint 8 (Performance Optimization).

**Scope**: All user-facing features implemented through Sprint 7.

**Out of Scope**: Features planned for Sprint 8+, performance optimization, Arashu mode (not yet implemented).

---

## Application State Assessment

### Implemented Features (Sprint 0-7)

- **Pet System**: Pet state tracking (hunger, mood, energy, affection, curiosity), stat decay, personality traits, memories, lifecycle stages
- **Home Hub**: Pet summary dashboard, stat cards, daily summary, recommended actions, mascot placeholder
- **Scanner System**: Camera adapter foundation, barcode decoder contracts, scan-to-feed flow, product lookup integration, feeding pipeline
- **Inventory System**: Item management, stackable items, sorting/filtering, gameplay actions (consume, use, inspect, favorite), capacity tracking
- **Achievement System**: 13 base achievements, progress tracking, unlock logic
- **Mission System**: Daily and weekly missions, progress tracking, completion logic
- **Game Progression**: XP system, level progression, scan history tracking
- **Persistence**: Guest mode localStorage persistence (Zustand), sync infrastructure ready (Arashu deferred)
- **Accessibility**: Keyboard navigation foundation, reduced motion, color contrast (WCAG AA), touch targets, screen reader ARIA markup, responsive design (320px-1024px+)

### Not Yet Implemented

- **Arashu Mode**: Server-side sync, authentication, Prisma database integration
- **Scanner Camera**: Live camera preview, real barcode decoding (adapters ready, UI integration incomplete)
- **Pet Rendering**: Visual pet sprite/animation (mascot runtime ready, renderer not attached)
- **Settings UI**: Settings page not implemented (store ready)
- **Onboarding**: First-time user flow, pet naming
- **Production Database**: Prisma schema defined, migrations not run

---

## Critical Gameplay Flows

### Flow 1: Application Launch (First-Time User)

**Preconditions**: Fresh browser, no localStorage data

**Steps**:
1. Navigate to application root (`/`)
2. Application redirects or displays landing page
3. User selects Guest mode (if modal present)
4. Application initializes pet state
5. User lands on Home Hub (`/home`)

**Expected Outcome**:
- Pet state initialized with default values
- Home Hub displays pet stats
- No errors in console

**Priority**: Critical

---

### Flow 2: Home Hub Navigation

**Preconditions**: Application loaded, pet initialized

**Steps**:
1. View Home Hub (`/home`)
2. Verify pet stats display (hunger, mood, energy, affection, curiosity)
3. Verify stat cards render
4. Verify mascot placeholder renders
5. Verify daily summary displays
6. Verify recommendation card displays
7. Verify status cards display

**Expected Outcome**:
- All UI components render
- Stats show values 0-100
- No layout breaks
- No errors in console

**Priority**: Critical

---

### Flow 3: Scanner Page Access

**Preconditions**: Application loaded

**Steps**:
1. Navigate to Scanner (`/scan`)
2. Verify page loads
3. Verify camera preview placeholder renders
4. Verify scan controls render
5. Click "Start Camera" button
6. Observe permission request behavior

**Expected Outcome**:
- Page loads without errors
- UI renders correctly
- Camera permission request triggers (browser-dependent)
- Controls accessible

**Priority**: High

---

### Flow 4: Collection/Inventory Access

**Preconditions**: Application loaded, inventory may be empty or have default items

**Steps**:
1. Navigate to Collection (`/collection`)
2. Verify page loads
3. Verify inventory grid renders
4. Verify metrics cards render (Total Items, Unique Stacks, Food & Care, Slot Capacity)
5. Verify filter/sort controls render
6. If items present: Select an item
7. Verify detail sidebar renders

**Expected Outcome**:
- Page loads without errors
- Empty state or item grid displays
- Metrics accurate
- Item selection updates sidebar
- Filters and sort work

**Priority**: High

---

### Flow 5: Achievements Page Access

**Preconditions**: Application loaded

**Steps**:
1. Navigate to Achievements (`/achievements`)
2. Verify page loads
3. Verify achievement list renders
4. Verify all 13 base achievements display
5. Verify progress indicators display
6. Verify lock/unlock status indicators

**Expected Outcome**:
- Page loads without errors
- All achievements render
- Progress accurately reflects game state
- UI matches design

**Priority**: Medium

---

### Flow 6: Missions Page Access

**Preconditions**: Application loaded

**Steps**:
1. Navigate to Missions (`/missions`)
2. Verify page loads
3. Verify active missions section renders
4. Verify completed missions section renders
5. Verify empty state if no missions

**Expected Outcome**:
- Page loads without errors
- Missions display correctly
- Progress bars accurate
- Empty state displays if applicable

**Priority**: Medium

---

### Flow 7: Navigation Between Pages

**Preconditions**: Application loaded

**Steps**:
1. Navigate from Home → Scanner
2. Navigate from Scanner → Collection
3. Navigate from Collection → Achievements
4. Navigate from Achievements → Missions
5. Navigate from Missions → Home

**Expected Outcome**:
- All navigations succeed
- No page reload (SPA behavior)
- State persists across navigation
- No console errors

**Priority**: Critical

---

### Flow 8: State Persistence (Reload)

**Preconditions**: Application loaded, some interaction occurred (e.g., item added to inventory via mock data)

**Steps**:
1. Interact with application (view pages, check stats)
2. Note current pet stats, XP, level
3. Hard refresh browser (F5 or Cmd+R)
4. Verify state restored

**Expected Outcome**:
- Pet stats restored from localStorage
- XP and level restored
- Inventory items restored
- Settings restored
- No data loss

**Priority**: Critical

---

### Flow 9: Responsive Layout (Mobile)

**Preconditions**: Browser DevTools or real mobile device

**Steps**:
1. Resize viewport to 375px width (iPhone 12/13/14)
2. Navigate to each page: Home, Scanner, Collection, Achievements, Missions
3. Verify layout adapts
4. Verify no horizontal overflow
5. Verify touch targets comfortable

**Expected Outcome**:
- All pages render correctly on mobile
- Single-column layouts on narrow screens
- Text readable
- Touch targets ≥44px

**Priority**: High

---

### Flow 10: Keyboard Navigation

**Preconditions**: Desktop browser, keyboard only (no mouse)

**Steps**:
1. Load Home Hub
2. Press Tab to navigate
3. Verify focus indicators visible
4. Verify focus order logical
5. Press Enter/Space to activate buttons/links
6. Navigate to other pages via Tab + Enter
7. Verify skip navigation link appears on first Tab

**Expected Outcome**:
- All interactive elements reachable via Tab
- Focus indicators visible (ring or outline)
- Focus order matches visual order
- Skip nav link works

**Priority**: High

---

## Happy Path Scenarios

### Scenario 1: New User Explores App

1. Launch app
2. Land on Home Hub
3. View pet stats
4. Click through all pages (Scanner, Collection, Achievements, Missions)
5. Return to Home Hub

**Expected**: Smooth navigation, all pages load, no errors

---

### Scenario 2: User Views Inventory

1. Navigate to Collection
2. View inventory grid
3. Select an item
4. View item details in sidebar
5. Click "Inspect" button
6. Verify feedback message

**Expected**: Item selection works, sidebar updates, inspect action succeeds

---

### Scenario 3: User Views Progress

1. Navigate to Achievements
2. Review achievement progress
3. Navigate to Missions
4. Review mission progress
5. Return to Home

**Expected**: Progress displays accurately, navigation smooth

---

## Edge Cases

### Edge Case 1: Empty Inventory

**Scenario**: User has zero items in inventory

**Steps**:
1. Navigate to Collection
2. Verify empty state displays

**Expected**: Empty state message displayed, no errors

---

### Edge Case 2: No Active Missions

**Scenario**: User has no active missions

**Steps**:
1. Navigate to Missions
2. Verify empty state displays

**Expected**: "No missions found" message displayed

---

### Edge Case 3: Maximum Stat Values

**Scenario**: Pet stats at 100 (maximum)

**Steps**:
1. Mock pet state with all stats at 100
2. Navigate to Home Hub
3. Verify stat cards display correctly
4. Verify progress bars at 100%

**Expected**: UI handles max values gracefully, no overflow

---

### Edge Case 4: Minimum Stat Values

**Scenario**: Pet stats at 0 (minimum)

**Steps**:
1. Mock pet state with all stats at 0
2. Navigate to Home Hub
3. Verify stat cards display correctly
4. Verify no visual glitches

**Expected**: UI handles min values gracefully, no negative values

---

### Edge Case 5: Very Long Pet Name

**Scenario**: Pet name exceeds typical length

**Steps**:
1. Mock pet with very long name (50+ characters)
2. Navigate to Home Hub
3. Verify name displays or truncates appropriately

**Expected**: Text truncates with ellipsis, no layout break

---

### Edge Case 6: Viewport Extremes

**Scenario**: Test at minimum width (320px)

**Steps**:
1. Resize viewport to 320px width
2. Navigate to each page
3. Verify layouts adapt

**Expected**: All pages readable at 320px, no horizontal scroll

---

## Failure Cases

### Failure Case 1: localStorage Quota Exceeded

**Scenario**: Browser localStorage limit reached

**Steps**:
1. Fill localStorage to near capacity (use DevTools)
2. Attempt to save state
3. Verify error handling

**Expected**: Graceful degradation, user informed, app continues functioning

---

### Failure Case 2: Invalid localStorage Data

**Scenario**: Corrupted localStorage data

**Steps**:
1. Manually corrupt localStorage JSON
2. Reload application
3. Verify recovery

**Expected**: App detects invalid data, resets to default state, continues functioning

---

### Failure Case 3: Camera Permission Denied

**Scenario**: User denies camera access

**Steps**:
1. Navigate to Scanner
2. Click "Start Camera"
3. Deny permission in browser prompt
4. Verify error message displays

**Expected**: Error message displayed, app remains functional, user can retry

---

### Failure Case 4: Network Offline

**Scenario**: User goes offline (future-proofing for Arashu mode)

**Steps**:
1. Load application online
2. Go offline (DevTools Network tab → Offline)
3. Navigate between pages
4. Verify app continues functioning

**Expected**: App works offline (Guest mode), sync deferred until online (Arashu mode future)

---

## Regression Checklist

After any bug fix or change, verify:

- [ ] Home Hub still renders correctly
- [ ] Scanner page still loads
- [ ] Collection page still loads
- [ ] Achievements page still loads
- [ ] Missions page still loads
- [ ] Navigation between pages works
- [ ] State persists on reload
- [ ] localStorage save/load works
- [ ] Responsive layouts intact (320px, 768px, 1024px)
- [ ] Keyboard navigation still functional
- [ ] ARIA labels still present
- [ ] Focus indicators visible
- [ ] No console errors
- [ ] Build succeeds
- [ ] All unit tests pass

---

## Browser Compatibility Checklist

### Desktop

- [ ] **Chrome** (latest): All features work
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest, macOS): All features work
- [ ] **Edge** (latest): All features work

### Mobile

- [ ] **Safari iOS** (latest): All features work, responsive layout correct
- [ ] **Chrome iOS** (latest): All features work, responsive layout correct
- [ ] **Chrome Android** (latest): All features work, responsive layout correct
- [ ] **Firefox Android** (latest): All features work, responsive layout correct

**Focus Areas**:
- localStorage persistence
- Responsive layout
- Touch interaction
- Camera access (scanner page)

---

## Mobile Checklist

- [ ] **Portrait orientation**: All pages render correctly
- [ ] **Landscape orientation**: All pages render correctly
- [ ] **Touch targets**: All buttons/links ≥44px, comfortable to tap
- [ ] **Text size**: Readable without zoom
- [ ] **Safe areas**: Content respects notch/home indicator
- [ ] **Scroll performance**: Smooth, no jank
- [ ] **Tap feedback**: Visual feedback on tap
- [ ] **Keyboard appears**: For input fields (if any)

---

## Accessibility Checklist

### Keyboard Navigation

- [ ] All pages navigable via Tab
- [ ] Focus indicators visible
- [ ] Focus order logical
- [ ] Enter/Space activates buttons/links
- [ ] Skip navigation link present and functional
- [ ] No keyboard traps

### Screen Reader

- [ ] Page titles announced
- [ ] Headings announced with correct level
- [ ] Landmarks identified (main, nav, aside, section)
- [ ] Buttons have descriptive labels
- [ ] Links have descriptive labels
- [ ] Images have alt text or aria-label
- [ ] Decorative images skipped (aria-hidden)
- [ ] Lists identified as lists
- [ ] Progress bars have aria-valuemin/max/now

### Reduced Motion

- [ ] `prefers-reduced-motion` respected
- [ ] Animations disabled when reduced motion active
- [ ] Meaning preserved without animation

### Color Contrast

- [ ] Text contrast ≥4.5:1 (WCAG AA)
- [ ] Non-text contrast ≥3:1 (WCAG AA)
- [ ] Focus indicators contrast ≥3:1

### Touch Targets

- [ ] All interactive elements ≥44×44px or within tolerance
- [ ] Adequate spacing between targets (≥8px)

---

## Persistence Checklist

### localStorage Save

- [ ] Pet stats saved on change
- [ ] XP and level saved on change
- [ ] Inventory items saved on change
- [ ] Settings saved on change
- [ ] Achievement progress saved on unlock
- [ ] Mission progress saved on update

### localStorage Load

- [ ] Pet stats restored on page load
- [ ] XP and level restored on page load
- [ ] Inventory items restored on page load
- [ ] Settings restored on page load
- [ ] Achievement progress restored on page load
- [ ] Mission progress restored on page load

### Persistence Edge Cases

- [ ] localStorage quota exceeded handled gracefully
- [ ] Corrupted data detected and reset
- [ ] Missing data initializes to defaults
- [ ] Version migration handles schema changes

---

## Offline Checklist

- [ ] Application loads offline (Guest mode)
- [ ] Navigation works offline
- [ ] State persists offline
- [ ] localStorage continues functioning offline
- [ ] No network errors break UI
- [ ] Sync deferred until online (Arashu mode future)

---

## Scanner Checklist

### Scanner UI

- [ ] Scanner page loads
- [ ] Camera preview placeholder renders
- [ ] Scan controls render
- [ ] Start Camera button functional
- [ ] Camera switch button visible (disabled if 1 camera)
- [ ] Flash button visible (disabled, placeholder)
- [ ] Scanner frame overlay renders

### Camera Access

- [ ] Permission request triggers on "Start Camera"
- [ ] Permission granted: Camera preview appears
- [ ] Permission denied: Error message displays
- [ ] Permission prompt: Loading state displays
- [ ] Camera unavailable: Error message displays

### Scanner State Management

- [ ] Scanner state persists in store
- [ ] Navigation away from scanner stops camera
- [ ] Return to scanner restores state
- [ ] Reset button clears state

**Note**: Live barcode decoding not yet fully integrated. Scanner UI and infrastructure ready, but end-to-end scan flow incomplete.

---

## Performance Checklist

### Load Time

- [ ] Initial page load <3s (3G)
- [ ] Subsequent page loads <1s (cached)
- [ ] Time to Interactive (TTI) <5s

### Runtime Performance

- [ ] No layout jank during scroll
- [ ] No frame drops during navigation
- [ ] Smooth animations (60fps)
- [ ] No memory leaks (long session)

### Bundle Size

- [ ] JavaScript bundle reasonable (<500KB gzipped for main bundle)
- [ ] Code splitting working (dynamic imports)
- [ ] Unused code tree-shaken

### Metrics (Lighthouse Mobile)

- [ ] Performance: ≥80
- [ ] Accessibility: ≥95
- [ ] Best Practices: ≥90
- [ ] SEO: ≥90

**Note**: Performance optimization is Sprint 8 focus. Baseline measurements only.

---

## Test Execution Order

1. **Automated Tests**: Run Playwright E2E suite
2. **Manual Smoke Tests**: Critical flows (launch, navigation, persistence)
3. **Browser Compatibility**: Chrome, Firefox, Safari, Edge
4. **Mobile Testing**: iOS Safari, Chrome Android
5. **Accessibility Testing**: Keyboard nav, screen reader spot check
6. **Edge Cases**: Empty states, extreme values
7. **Failure Cases**: Permission denied, offline, corrupted data
8. **Regression**: After any bug fixes

---

## Bug Severity Definitions

- **Critical**: Blocks core functionality, app unusable
- **High**: Major feature broken, workaround exists
- **Medium**: Feature partially broken or UX significantly degraded
- **Low**: Minor cosmetic issue, minimal impact
- **Enhancement**: Not a bug, improvement suggestion

---

## Pass/Fail Criteria

### Pass

- All critical flows complete successfully
- No Critical or High severity bugs in core flows
- Accessibility checklist ≥90% pass
- Responsive layouts work at all tested breakpoints
- State persistence works reliably
- No console errors during normal usage

### Fail

- Any critical flow blocked
- Critical severity bug discovered
- Accessibility checklist <80% pass
- Data loss on reload
- App crashes or becomes unresponsive

---

## QA Environment

- **Node Version**: 18.x or 20.x
- **Browser Versions**: Latest stable
- **Test Devices**: Chrome DevTools responsive mode, real devices if available
- **Test Data**: Default mock data, localStorage cleared between test runs

---

## Test Execution Commands

```bash
# Start development server
npm run dev

# Run unit tests
npm run test

# Run E2E tests (requires dev server running)
npm run test:e2e

# Run linting
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build
```

---

## Next Steps After QA

1. Document all discovered bugs in `QA_REPORT_v0.1.0-alpha.md`
2. Prioritize bug fixes
3. Fix Critical and High severity bugs
4. Re-run regression tests after fixes
5. Update QA report with fix verification
6. Approve for Sprint 8 or defer release

---

**QA Plan Version**: 1.0  
**Last Updated**: July 5, 2026  
**Status**: Ready for Execution
