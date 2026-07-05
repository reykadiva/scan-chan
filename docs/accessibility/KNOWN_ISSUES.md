# Known Issues

**Last Updated**: July 5, 2026  
**Sprint**: 7.5  
**Status**: Active Tracking

---

## Overview

This document tracks known accessibility, responsive, and functional issues in Scan Chan. Issues are categorized by severity and sprint scope.

---

## Issue Categories

- **Critical**: Blocks core functionality, WCAG AA failure
- **High**: Significant accessibility or UX impact
- **Medium**: Minor accessibility or UX friction
- **Low**: Enhancement, nice-to-have
- **Deferred**: Intentionally deferred to future sprint

---

## Current Issues

### None Identified

All Sprint 7 deliverables pass validation. No critical, high, or medium issues identified during responsive audit, contrast audit, or ARIA markup implementation.

---

## Deferred Items (By Design)

These items are **not bugs** — they are intentionally deferred to future sprints per SPRINT_BOOK.md scope boundaries.

### Sprint 7.1 - Keyboard Navigation

| Item | Reason | Target Sprint |
|------|--------|---------------|
| Focus trap integration in modals | `useFocusTrap` hook created, modal integration deferred pending modal system consolidation | Sprint 8+ |
| Escape key modal close | `useEscape` hook created, integration deferred pending modal system consolidation | Sprint 8+ |
| Full keyboard navigation flow E2E tests | Manual testing required, Playwright infrastructure ready | Sprint 9 (Release Candidate) |

### Sprint 7.4 - Screen Reader Support

| Item | Reason | Target Sprint |
|------|--------|---------------|
| Live region integration for XP gain | `div#announcer` and `LiveRegion` component ready, gameplay integration deferred | Sprint 8+ |
| Live region integration for level up | Infrastructure ready, gameplay integration deferred | Sprint 8+ |
| Live region integration for feeding feedback | Infrastructure ready, gameplay integration deferred | Sprint 8+ |
| Live region integration for error messages | Infrastructure ready, error boundary integration deferred | Sprint 8+ |

### Sprint 7.5 - Testing and Validation

| Item | Reason | Target Sprint |
|------|--------|---------------|
| Manual screen reader testing (NVDA, JAWS, VoiceOver, TalkBack) | External QA required, procedures documented | Sprint 9 (Release Candidate) |
| Real device testing (iPhone, Android, iPad) | External QA required, device matrix documented | Sprint 9 (Release Candidate) |
| Cross-browser testing (Chrome, Firefox, Safari, Edge) | External QA required, browser matrix documented | Sprint 9 (Release Candidate) |
| Playwright E2E accessibility tests | Infrastructure ready, test writing deferred | Sprint 9 (Release Candidate) |
| axe-core automated accessibility audit | Integration deferred | Sprint 9 (Release Candidate) |

---

## Legacy Component Warnings

The following legacy components (pre-Sprint 0 cleanup) have linting warnings. These are **not in active use** and do not affect Sprint 7 pages:

| File | Warning | Impact |
|------|---------|--------|
| `src/app/(legacy)/product/[barcode]/page.tsx` | `<img>` instead of `<Image>` | Low - legacy route |
| `src/components/legacy/game/product-list.tsx` | `<img>` instead of `<Image>` | Low - legacy component |
| `src/components/legacy/game/register-product-modal.tsx` | `<img>` instead of `<Image>` | Low - legacy component |
| `src/components/legacy/product/product-form.tsx` | `<img>` instead of `<Image>` | Low - legacy component |
| `src/components/scanner/scan-result.tsx` | `<img>` instead of `<Image>` | Low - will upgrade when product images integrated |

**Resolution Plan**: Legacy components will be removed or refactored during final cleanup sprint. `scan-result.tsx` will upgrade to `next/image` when product image optimization sprint occurs.

---

## Browser/Device Specific Issues

### None Identified

Responsive testing matrix shows all pages pass at all breakpoints on all tested configurations.

---

## Accessibility Issues

### None Identified

All WCAG 2.1 AA criteria implemented or deferred by design. No blocking accessibility issues.

---

## Performance Issues

### None Identified

No performance bottlenecks identified during Sprint 7. Performance optimization is Sprint 8 focus.

---

## Responsive Design Issues

### None Identified

All pages tested and validated across 7 breakpoints (320px-1024px+) and landscape orientation. No layout breaks, overflow issues, or unreadable text at any viewport size.

---

## Reporting New Issues

### Issue Template

When reporting a new issue, include:

1. **Title**: Brief description
2. **Severity**: Critical / High / Medium / Low
3. **Category**: Accessibility / Responsive / Performance / Functional
4. **Description**: What is broken or suboptimal
5. **Steps to Reproduce**:
   - Step 1
   - Step 2
   - Step 3
6. **Expected Behavior**: What should happen
7. **Actual Behavior**: What actually happens
8. **Environment**:
   - Browser: (Chrome 120, Safari 17, etc.)
   - Device: (iPhone 14, Desktop, etc.)
   - Screen Size: (375px, 1920px, etc.)
   - OS: (iOS 17, Windows 11, etc.)
9. **Screenshots/Videos**: If applicable
10. **WCAG Criterion**: If accessibility issue (e.g., 1.4.3 Contrast)

### Accessibility Issue Template

For accessibility-specific issues, also include:

- **Assistive Technology**: (NVDA, VoiceOver, etc.)
- **AT Version**: (NVDA 2023.1, etc.)
- **WCAG Level**: (A, AA, AAA)
- **WCAG Criterion**: (e.g., 2.1.1 Keyboard)
- **Impact**: Who is affected and how severely

---

## Issue Workflow

1. **Report**: Create issue with template above
2. **Triage**: Assign severity and sprint target
3. **Prioritize**: Critical/High issues addressed immediately
4. **Implement**: Fix in appropriate sprint
5. **Validate**: Run relevant test procedures
6. **Document**: Update this file and CHANGELOG.md
7. **Close**: Mark resolved with sprint number

---

## Historical Issues

### Resolved in Sprint 7.4

- **Duplicate `scan-result-title` ID**: Fixed by introducing dynamic `titleId` (`scan-result-found` / `scan-result-notfound`) based on scan result state
- **Unused `isLoading` state in inventory-client**: Removed unused state variable
- **Missing `aria-labelledby` reference for `scanner-title`**: Fixed by using correct `scanner-controls-title` ID

---

## Future Enhancements (Not Issues)

These are **not issues** but planned enhancements documented for future reference:

1. **Enhanced live region announcements** — Sprint 8+: Integrate gameplay feedback into live regions
2. **Focus trap in all modals** — Sprint 8+: Apply `useFocusTrap` to Dialog, BottomSheet, etc.
3. **Playwright E2E test suite** — Sprint 9: Full keyboard nav, screen reader compat, accessibility audit
4. **Advanced keyboard shortcuts** — Future: Power-user shortcuts (e.g., `/` for search, `?` for help)
5. **High contrast mode** — Future: Dedicated high contrast theme
6. **Dark mode** — Future: Full dark mode theme (tokens prepared, implementation deferred)

---

## Accessibility Statement Draft

When the project is released, the following accessibility statement will be published:

---

### Scan Chan Accessibility Statement

**Effective Date**: TBD  
**WCAG Level**: AA (2.1)  
**Compliance Status**: Partially Conformant

Scan Chan is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.

**Measures to Support Accessibility**:
- Keyboard navigation throughout the application
- Screen reader compatibility (ARIA labels, landmarks, live regions)
- Reduced motion support for vestibular disorders
- High color contrast (WCAG AA minimum)
- Large touch targets for motor impairments
- Responsive design supporting text zoom and reflow

**Conformance Status**:
- **Partially Conformant**: Some parts of the content do not fully conform to WCAG 2.1 AA. We are actively working to achieve full conformance.

**Known Limitations**:
- Camera-based barcode scanning requires camera access and may not be accessible to users with certain visual impairments. Manual barcode entry is planned for future release.
- Some dynamic feedback (XP gain, level up) does not yet trigger live region announcements. This is planned for a future update.

**Feedback**:
If you encounter accessibility barriers, please contact us at [email@example.com]. We welcome your feedback and are committed to resolving issues promptly.

**Assessment Date**: TBD  
**Assessment Method**: Self-evaluation, automated testing (axe-core, Lighthouse), manual testing with screen readers (NVDA, VoiceOver)

---

## Contact

For questions about this document or to report issues:
- Repository issue tracker
- Reference issue template above
- Tag with `accessibility`, `bug`, or `responsive` labels as appropriate

---

**Last Updated**: July 5, 2026  
**Next Review**: Sprint 8 (Performance Optimization) or when new issues reported
