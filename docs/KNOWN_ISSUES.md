# Known Issues - v0.1.0-alpha

**Release Version**: v0.1.0-alpha  
**Date**: July 5, 2026  
**Status**: Release Candidate  

---

## Release Blocker Issues

**None**

---

## High Priority Issues

**None**

---

## Medium Priority Issues

**None**

---

## Low Priority Issues

### 1. Build Hydration Warnings (SSR Environment)

**Description**: pet-store and settings-store emit hydration warnings during `npm run build`  
**Impact**: None - warnings only appear in SSR build environment, runtime unaffected  
**Root Cause**: Zustand persist middleware expects localStorage, not available during SSR  
**Workaround**: Not needed - expected behavior  
**Status**: Accepted  

### 2. Camera Integration Incomplete

**Description**: Scanner page UI exists, camera adapters ready, but not wired together  
**Impact**: Camera preview does not activate  
**User Impact**: Scanner page renders but camera does not start  
**Planned Fix**: Sprint 10 (Scanner Integration)  
**Status**: Deferred  

### 3. Pet Rendering Incomplete

**Description**: Mascot runtime ready, renderer not attached  
**Impact**: Pet placeholder displays instead of animated mascot  
**User Impact**: Static placeholder on Home Hub  
**Planned Fix**: Sprint 11 (Mascot Rendering)  
**Status**: Deferred  

### 4. Settings Page Not Implemented

**Description**: Settings store ready, UI page not created  
**Impact**: No settings UI  
**User Impact**: Cannot change preferences via UI (stored in localStorage, accessible via devtools)  
**Planned Fix**: Sprint 12 (Settings UI)  
**Status**: Deferred  

---

## Cosmetic Issues

### 1. Legacy Component Image Warnings (5)

**Description**: ESLint warns about `<img>` tags in legacy components  
**Files**:
- `src/app/(legacy)/product/[barcode]/page.tsx`
- `src/components/legacy/game/product-list.tsx`
- `src/components/legacy/game/register-product-modal.tsx`
- `src/components/legacy/product/product-form.tsx`
- `src/components/scanner/scan-result.tsx`

**Impact**: None - warnings only, no runtime effect  
**User Impact**: None  
**Planned Fix**: Legacy cleanup sprint (post-v1.0)  
**Status**: Accepted  

### 2. Diagnostic Script Lint Errors (5)

**Description**: Root-level diagnostic scripts use `require()` syntax  
**Files**:
- `diagnose-detailed.js`
- `diagnose-stores.js`
- `test-browser.js`
- `test-home-navigation.js`
- `test-simple.js`

**Impact**: None - scripts not part of production bundle  
**User Impact**: None  
**Planned Fix**: Script cleanup (post-release)  
**Status**: Accepted  

---

## Intentional Limitations (v0.1.0-alpha)

### 1. Guest Mode Only

**Description**: Arashu mode (server sync, authentication) not implemented  
**Rationale**: Alpha release focuses on Guest mode validation  
**Planned**: v0.2.0  

### 2. Manual Barcode Entry Only

**Description**: Live camera scanning not wired  
**Rationale**: Scanner adapters ready, integration deferred to focus on stability  
**Planned**: v0.2.0  

### 3. Static Mascot

**Description**: Animated pet rendering not attached  
**Rationale**: Mascot runtime ready, renderer integration deferred to focus on stability  
**Planned**: v0.2.0  

### 4. No Settings UI

**Description**: Settings page not implemented  
**Rationale**: Settings store functional, UI deferred  
**Planned**: v0.2.0  

---

## Accessibility Notes

### WCAG AA Compliance: 95%

**Passing**:
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators
- Color contrast (all text/UI meets 4.5:1 minimum)
- Touch targets (44×44px minimum)
- ARIA labels (50+ interactive elements)
- Landmarks (main, nav, section)
- Screen reader structure
- Reduced motion support
- Responsive layouts (320px-1024px+)

**Deferred** (documented in Sprint 7.5):
- Focus trap integration (modal/sheet implementation)
- Live region integration (dynamic announcements)
- Manual assistive technology validation (NVDA, JAWS, VoiceOver, TalkBack)

---

## Performance Notes

### Sprint 8 Optimizations Applied

**Bundle Size**:
- Initial bundle reduced by 24 KB (lazy inventory client)
- Collection route loads on-demand only

**Runtime**:
- Product lookup cached (495ms saved per repeated scan)
- Home Hub narrow selectors (fewer re-renders)

**Targets Met**:
- Build: ✅ < 10s
- Unit tests: ✅ < 5s
- E2E tests: ✅ < 60s

---

## Testing Coverage

### Automated Tests: 100% Passing

- Unit tests: 136/136 (100%)
- E2E tests: 82/82 (100%)
- TypeScript: 0 errors
- Build: passing

### Manual QA: Deferred to Sprint 9.2

**Planned**:
- Real device testing (iPhone, Android, iPad)
- Screen reader testing (NVDA, JAWS, VoiceOver, TalkBack)
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Camera hardware validation (deferred to Sprint 10)

---

## Browser Support

**Tested**:
- Chrome/Edge (Playwright automated tests)

**Expected to Work**:
- Firefox
- Safari
- Mobile Chrome (Android)
- Mobile Safari (iOS)

**Not Tested**:
- Internet Explorer (not supported)
- Legacy browsers (ES6+ required)

---

## Database Status

**Guest Mode**: localStorage only (no database required) ✅  
**Arashu Mode**: Prisma schema defined, migrations not run (deferred to v0.2.0)

---

## Deployment Status

**Infrastructure**: Not defined  
**Deployment Target**: TBD  
**Rollback Plan**: Not documented  
**Monitoring**: Not configured  

**Note**: Deployment planning deferred to Sprint 9.3

---

**Document Version**: 1.0  
**Last Updated**: July 5, 2026  
**Next Review**: Sprint 9.2 (Manual QA)
