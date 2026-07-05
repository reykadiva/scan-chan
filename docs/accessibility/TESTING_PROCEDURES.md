# Testing Procedures

**Last Updated**: July 5, 2026  
**Sprint**: 7.5  
**Status**: Documentation Complete

---

## Overview

This document outlines testing procedures for Scan Chan accessibility features, responsive design, and general quality assurance. It serves as a reference for manual QA, automated testing, and future CI/CD integration.

---

## 1. Automated Testing

### Unit Tests

**Command**: `npm run test`

**Coverage**:
- Pure functions in `src/lib/`
- Zustand store actions
- Utility functions
- Validation schemas
- Accessibility hook exports

**Current Tests** (136 passing):
- Content foundation (29 tests)
- Scanner pipeline (21 tests)
- Pet domain (12 tests)
- Inventory engine (10 tests)
- Inventory viewmodel (9 tests)
- Achievement engine (10 tests)
- Mission engine (9 tests)
- Balancing validation (7 tests)
- Product translation (6 tests)
- Mascot runtime (5 tests)
- Sync queue (5 tests)
- Home Hub viewmodel (4 tests)
- Keyboard hooks (2 tests)
- Touch targets (2 tests)
- Testing foundation (2 tests)
- Focus trap (1 test)
- Reduced motion (1 test)
- Inventory UI (1 test)

**Run Frequency**: Every commit (pre-commit hook recommended)

**Expected Output**: All tests pass, no warnings

---

### TypeScript Validation

**Command**: `npx tsc --noEmit`

**Purpose**: Type safety validation, catches type errors before runtime

**Run Frequency**: Every commit

**Expected Output**: No errors, clean compile

---

### Linting

**Command**: `npm run lint`

**Purpose**: Code quality, style consistency, potential bugs

**Current Warnings** (acceptable):
- 6 warnings for `<img>` tags in legacy components (pre-Sprint 0 code, not in active use)

**Run Frequency**: Every commit

**Expected Output**: 0 errors, existing warnings documented

---

### Build Validation

**Command**: `npm run build`

**Purpose**: Production build success, bundle optimization

**Run Frequency**: Before every PR merge

**Expected Output**: Build succeeds, TypeScript compilation passes

---

## 2. Responsive Design Testing

### Browser DevTools Method

**Tools**: Chrome DevTools, Firefox Responsive Design Mode, Safari Web Inspector

**Procedure**:
1. Open DevTools (F12 or Cmd+Opt+I)
2. Enable device toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Test each breakpoint from `RESPONSIVE_TESTING_MATRIX.md`:
   - 320px (iPhone SE)
   - 360px (Galaxy S8)
   - 375px (iPhone 12/13/14)
   - 390px (iPhone 14 Pro)
   - 428px (iPhone 14 Pro Max)
   - 768px (iPad Mini)
   - 1024px+ (Desktop)
4. Test landscape orientation for mobile sizes
5. Verify:
   - No horizontal overflow
   - Text remains readable
   - Touch targets remain usable
   - Layout adapts appropriately
   - Images/media scale correctly

**Pages to Test**:
- `/home` (Home Hub)
- `/scan` (Scanner)
- `/collection` (Inventory)
- `/achievements`
- `/missions`

**Documentation**: Record results in `RESPONSIVE_TESTING_MATRIX.md`

---

### Real Device Testing

**Recommended Devices**:
- iPhone SE (small screen, 320px width)
- iPhone 12/13/14 (standard mobile)
- iPhone 14 Pro Max (large mobile)
- iPad Mini (tablet)
- Android phone (360px-390px range)
- Android tablet

**Procedure**:
1. Access dev server or staging URL on device
2. Navigate through all pages
3. Test all interactive features
4. Test in both portrait and landscape
5. Verify camera access works (scanner page)
6. Verify touch targets feel comfortable
7. Test with large text accessibility setting enabled

**Focus Areas**:
- Scanner camera preview quality
- Touch target comfort (thumb-friendly)
- Scroll behavior smoothness
- Font legibility at default and large text sizes
- Safe area handling (notch, home indicator)

**Documentation**: Record device-specific issues in `KNOWN_ISSUES.md`

---

## 3. Keyboard Navigation Testing

### Manual Keyboard Testing

**Equipment**: Desktop/laptop with physical keyboard

**Procedure**:
1. Navigate to test page
2. **Do not use mouse** — keyboard only
3. Press `Tab` to navigate forward
4. Press `Shift+Tab` to navigate backward
5. Press `Enter` or `Space` to activate buttons/links
6. Press `Escape` to close modals/dialogs
7. Verify:
   - All interactive elements reachable via Tab
   - Focus order matches visual order
   - Focus indicators visible on all elements
   - Skip navigation link appears on first Tab
   - Modals trap focus appropriately
   - Focus restored when modal closes

**Pages to Test**:
- `/home`
- `/scan`
- `/collection`
- `/achievements`
- `/missions`

**Expected Behavior**:
- Logical tab order (top-to-bottom, left-to-right)
- All buttons, links, inputs reachable
- Focus visible on all interactive elements
- Skip nav link jumps to main content
- No keyboard traps (can Tab out of all elements)

**Documentation**: Record issues in `KNOWN_ISSUES.md`

---

### Screen Reader Testing

#### NVDA (Windows, Free)

**Setup**:
1. Download NVDA from https://www.nvaccess.org/
2. Install and launch
3. Press `NVDA+N` for NVDA menu
4. Navigate to Preferences > Settings > Speech to adjust verbosity

**Testing Procedure**:
1. Launch NVDA
2. Navigate to test page
3. Press `Insert+Down` to enter browse mode
4. Press `H` to jump between headings
5. Press `D` to jump between landmarks
6. Press `K` to jump between links
7. Press `B` to jump between buttons
8. Press `F` to jump between form fields
9. Verify all content announced correctly
10. Verify ARIA labels read appropriately
11. Verify landmarks identified correctly

**Key Commands**:
- `Insert+Down`: Toggle browse/focus mode
- `H`: Next heading
- `Shift+H`: Previous heading
- `D`: Next landmark
- `B`: Next button
- `K`: Next link
- `F`: Next form field
- `Insert+F7`: Elements list
- `Insert+T`: Read page title

---

#### JAWS (Windows, Commercial)

**Setup**: Install JAWS from Freedom Scientific

**Testing Procedure**: Similar to NVDA, key commands largely identical

---

#### VoiceOver (macOS/iOS, Built-in)

**Setup (macOS)**:
1. Enable: System Preferences > Accessibility > VoiceOver
2. Or press `Cmd+F5` to toggle

**Testing Procedure (macOS)**:
1. Enable VoiceOver (`Cmd+F5`)
2. Press `VO+A` to start reading (VO = `Ctrl+Opt`)
3. Press `VO+Right/Left` to navigate
4. Press `VO+Space` to activate
5. Press `VO+U` to open rotor (navigation menu)
6. Select Landmarks, Headings, Links, or Form Controls
7. Verify all content announced correctly

**Key Commands (macOS)**:
- `VO`: `Ctrl+Opt`
- `VO+A`: Read all
- `VO+Right/Left`: Navigate
- `VO+Space`: Activate
- `VO+U`: Rotor
- `VO+H`: Next heading
- `VO+Shift+H`: Previous heading

**Setup (iOS)**:
1. Settings > Accessibility > VoiceOver > Enable
2. Or triple-click side button if configured

**Testing Procedure (iOS)**:
1. Enable VoiceOver
2. Swipe right/left to navigate
3. Double-tap to activate
4. Rotor gestures: Two-finger rotate clockwise/counterclockwise
5. Verify all content announced correctly
6. Verify touch targets large enough for double-tap

---

#### TalkBack (Android, Built-in)

**Setup**:
1. Settings > Accessibility > TalkBack > Enable
2. Or volume key shortcut if configured

**Testing Procedure**:
1. Enable TalkBack
2. Swipe right/left to navigate
3. Double-tap to activate
4. Verify all content announced correctly
5. Verify navigation logical

---

### Screen Reader Test Checklist

For each page, verify:

- [ ] Page title announced
- [ ] All headings announced with correct level
- [ ] All landmarks identified (main, nav, aside, section)
- [ ] All buttons have descriptive labels
- [ ] All links have descriptive labels
- [ ] All form fields have associated labels
- [ ] All images have alt text or aria-label
- [ ] Decorative images skipped (aria-hidden)
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Status updates announced (when implemented)
- [ ] Modal focus trapped
- [ ] Modal title announced
- [ ] Lists identified as lists
- [ ] List item count announced
- [ ] Tables identified with headers (if applicable)

**Documentation**: Record screen reader issues in `KNOWN_ISSUES.md`

---

## 4. Reduced Motion Testing

### Browser Setting Method

**Chrome/Edge**:
1. Open DevTools (F12)
2. Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
3. Type "Emulate CSS prefers-reduced-motion"
4. Select "Emulate CSS prefers-reduced-motion: reduce"
5. Reload page
6. Verify animations significantly reduced or removed

**Firefox**:
1. Type `about:config` in address bar
2. Search for `ui.prefersReducedMotion`
3. Set to `1` (reduce motion)
4. Reload page

**Safari (macOS)**:
1. System Preferences > Accessibility > Display
2. Enable "Reduce motion"
3. Reload page

**Verification**:
- Page transitions fade instead of slide
- Particle effects static or disabled
- Loading spinners minimal
- Pet animations minimal (breathing only)
- Scan success feedback visible but not animated
- Meaning preserved (visual states remain)

---

### Manual Toggle Method

**Procedure**:
1. Navigate to Settings (when implemented)
2. Toggle "Reduce motion" setting
3. Navigate through app
4. Verify reduced motion active
5. Toggle setting off
6. Verify full motion restored

---

## 5. Color Contrast Testing

### Browser Extension Method

**Tools**:
- **WAVE** (WebAIM): https://wave.webaim.org/extension/
- **axe DevTools** (Deque): Browser extension
- **Lighthouse** (Chrome): Built into DevTools

**Procedure (WAVE)**:
1. Install WAVE browser extension
2. Navigate to test page
3. Click WAVE icon in toolbar
4. Review "Contrast Errors" section
5. Click flagged elements to see contrast ratio
6. Verify all text ≥4.5:1, all non-text ≥3:1

**Procedure (Lighthouse)**:
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Select "Accessibility" category
4. Click "Generate report"
5. Review contrast findings
6. Verify all pass or have documented exceptions

**Expected Results**:
- 0 contrast errors
- All text meets WCAG AA (4.5:1)
- All non-text meets WCAG AA (3:1)
- Focus indicators meet 3:1

**Documentation**: Results already audited in `docs/accessibility/CONTRAST_AUDIT.md`

---

## 6. Touch Target Testing

### Real Device Method

**Procedure**:
1. Load page on mobile device
2. Attempt to tap every interactive element
3. Verify comfortable tap without misclicks
4. Verify adequate spacing between targets
5. Test with thumb (primary mobile input)
6. Test in both portrait and landscape

**Focus Areas**:
- Bottom navigation (most critical for thumb reach)
- Scanner controls (large enough for camera context)
- Inventory grid items (tap without hitting adjacent items)
- Modal close buttons (reachable, not too close to edge)

**Expected Results**:
- All targets comfortable to tap
- No accidental misclicks on adjacent targets
- Thumb reach comfortable for primary actions

---

### Measurement Method (DevTools)

**Procedure**:
1. Open DevTools
2. Right-click element > Inspect
3. Check computed dimensions in Styles panel
4. Verify ≥44×44px or within 4px tolerance (40×40px acceptable)
5. Verify ≥8px spacing between adjacent targets

**Expected Results**: All measurements documented in `CONTRAST_AUDIT.md`

---

## 7. Browser Compatibility Testing

### Desktop Browsers

**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest, macOS only)
- Edge (latest)

**Test Matrix**:
| Browser | Windows | macOS | Linux |
|---------|---------|-------|-------|
| Chrome  | ✓       | ✓     | ✓     |
| Firefox | ✓       | ✓     | ✓     |
| Safari  | ✗       | ✓     | ✗     |
| Edge    | ✓       | ✓     | ✗     |

**Procedure**:
1. Open browser
2. Navigate to each page
3. Test all interactive features
4. Verify layout/styling correct
5. Check DevTools console for errors
6. Test camera access (scanner page)

**Expected Results**:
- No JavaScript errors
- Layout renders correctly
- All features functional
- Camera API works (where supported)

---

### Mobile Browsers

**Browsers to Test**:
- Safari (iOS, latest)
- Chrome (iOS, latest)
- Chrome (Android, latest)
- Firefox (Android, latest)

**Procedure**:
1. Open browser on device
2. Navigate to each page
3. Test all features
4. Verify responsive layout
5. Test camera access
6. Check for console errors (if remote debugging available)

**Expected Results**:
- Responsive layout works
- Touch interactions smooth
- Camera access works
- No visual glitches

---

## 8. Performance Testing

### Lighthouse Audit

**Procedure**:
1. Open Chrome DevTools
2. Navigate to Lighthouse tab
3. Select all categories: Performance, Accessibility, Best Practices, SEO
4. Select "Mobile" or "Desktop"
5. Click "Generate report"
6. Review scores and recommendations

**Target Scores** (Mobile):
- Performance: ≥90
- Accessibility: ≥95
- Best Practices: ≥90
- SEO: ≥90

**Focus Areas**:
- First Contentful Paint (FCP): <1.8s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Total Blocking Time (TBT): <200ms

---

### Network Throttling

**Procedure**:
1. Open DevTools > Network tab
2. Select throttling profile: "Slow 3G" or "Fast 3G"
3. Reload page
4. Verify:
   - Page loads within reasonable time
   - Loading states visible
   - No layout jank
   - Critical content prioritized

---

## 9. Camera/Scanner Testing

### Scanner Functionality

**Procedure**:
1. Navigate to `/scan`
2. Grant camera permissions
3. Point camera at barcode
4. Verify decode speed
5. Verify scan result modal appears
6. Test with various barcode types:
   - UPC-A (12 digits)
   - EAN-13 (13 digits)
   - QR codes
7. Test in various lighting conditions
8. Test with blurry/damaged barcodes

**Expected Results**:
- Camera preview appears
- Decoding happens within 1-3 seconds
- Scan result modal displays correctly
- Product lookup succeeds (if product exists)
- Error handling graceful for failed scans

---

## 10. End-to-End Testing (Future)

### Playwright Setup

**Installation**:
```bash
npm install -D @playwright/test
npx playwright install
```

**Test Structure**:
```
tests/e2e/
  ├── home.spec.ts
  ├── scanner.spec.ts
  ├── inventory.spec.ts
  ├── achievements.spec.ts
  └── missions.spec.ts
```

**Test Scenarios**:
- Home → Scanner → Scan barcode → Feed pet → XP gain
- Home → Inventory → Select item → Feed pet
- Home → Achievements → View progress
- Home → Missions → View active missions
- Keyboard navigation flows
- Screen reader compatibility

**Status**: Infrastructure ready, test implementation deferred

---

## 11. Regression Testing

### Pre-Release Checklist

Before any release, run:

1. **Automated Tests**:
   - [ ] `npm run lint` (0 errors)
   - [ ] `npx tsc --noEmit` (passes)
   - [ ] `npm run test` (all tests pass)
   - [ ] `npm run build` (succeeds)

2. **Manual Smoke Tests**:
   - [ ] Home Hub loads and displays pet state
   - [ ] Scanner opens camera and decodes barcodes
   - [ ] Inventory displays items and actions work
   - [ ] Achievements display correctly
   - [ ] Missions display correctly

3. **Accessibility Smoke Tests**:
   - [ ] Tab through Home Hub (focus visible)
   - [ ] Test reduced motion toggle
   - [ ] Test one page with screen reader
   - [ ] Verify responsive at 320px and 1024px

4. **Cross-Browser Smoke Tests**:
   - [ ] Chrome desktop
   - [ ] Safari iOS
   - [ ] Chrome Android

**Duration**: ~30 minutes for full smoke test suite

---

## 12. Known Issues and Limitations

See `KNOWN_ISSUES.md` for current list of known limitations and planned improvements.

---

## 13. Continuous Integration (Future)

### Recommended CI Pipeline

```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run test
      - run: npm run build
      # Future: Playwright E2E tests
      # - run: npx playwright test
```

**Status**: Recommended for future implementation

---

## Contact and Support

For testing questions or to report issues:
- Create issue in repository issue tracker
- Reference this document and relevant test procedures
- Include browser/device details for bugs

---

**Last Updated**: July 5, 2026  
**Next Review**: Sprint 8 (Performance Optimization)
