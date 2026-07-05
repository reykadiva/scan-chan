# Sprint 9 - Release Candidate Analysis

**Date**: July 5, 2026  
**Status**: Pre-Implementation Analysis  
**Sprint**: 9 - Release Candidate  

---

## 1. Sprint 9 Objectives

Sprint 9 prepares Scan Chan for public trust. Per SPRINT_BOOK.md Section 13:

**Primary Objective**: Prepare a release candidate that is stable, documented, tested, emotionally consistent, brand-safe, accessible, performant, and ready for external players.

**Not Objectives**:
- Adding new features
- Major refactoring
- Building future sprint systems
- Performance optimization beyond Sprint 8 work

---

## 2. Deliverables

### 2.1 QA Coverage

**Mandatory QA Areas** (SPRINT_BOOK.md 13.2):
- First launch
- Mode selection (Guest/Arashu)
- Guest flow
- Arashu flow (deferred - not implemented)
- Home Hub
- Scanner
- Feeding
- Missions
- Achievements
- Collection
- Persistence
- Offline behavior
- Error recovery
- Accessibility
- Performance
- Responsive layouts

**Current QA State**:
- ✅ QA_PLAN.md exists (735 lines, comprehensive)
- ✅ QA_REPORT_v0.1.0-alpha.md exists (407 lines, runtime QA complete)
- ✅ E2E test suite: 82/82 passing (100%)
- ✅ Unit tests: 136/136 passing (100%)
- ✅ Build: passing
- ✅ TypeScript: 0 errors
- ✅ Lint: passing (5 legacy warnings, documented as acceptable)

### 2.2 Bug Fixing

**Current Known Issues**:
- Legacy component warnings (5 ESLint warnings, documented as acceptable)
- Accessibility gaps (focus trap integration, live region integration deferred per Sprint 7.5)
- Build hydration warnings (pet-store, settings-store - non-blocking, SSR environment only)

**Bug Fixing Rules** (SPRINT_BOOK.md 13.3):
- Fix release blockers first
- Do not refactor unless required for safe fix
- Do not introduce new systems
- Add regression tests or manual QA notes
- Update docs if fix changes behavior

### 2.3 Regression Testing

**Must Prove** (SPRINT_BOOK.md 13.4):
- Sprint 1 foundation still holds
- Sprint 2 scanning flow still works
- Sprint 3 pet systems still behave correctly
- Sprint 4 UI polish has not regressed
- Sprint 5 content remains balanced
- Sprint 6 persistence is safe
- Sprint 7 accessibility still passes
- Sprint 8 performance targets still hold

**Current State**:
- Unit tests: 136/136 passing ✅
- E2E tests: 82/82 passing (100%) ✅
- Regression suite: Complete (all automated tests passing)

### 2.4 Store Assets

**Required** (SPRINT_BOOK.md 13.5):
- App icon
- Hero screenshot
- Home Hub screenshot
- Scanner screenshot
- Feeding screenshot
- Achievement or evolution screenshot
- Short description
- Long description
- Trailer or preview video (if required)

**Must Follow**:
- Brand Book
- Screenshot Guidelines
- Character Bible
- Mascot Production Guide
- UI Production Guide

**Current State**: None exist

### 2.5 Steam Checklist (if applicable)

**Required** (SPRINT_BOOK.md 13.6):
- Capsule artwork
- Library artwork
- Store screenshots
- Trailer (if required)
- Short description
- About section
- System requirements
- Controller/keyboard claims only if tested
- Privacy/disclosure text
- Release build
- Depot/package validation

**Current State**: Steam release not indicated in project

### 2.6 Release Checklist

**Required** (SPRINT_BOOK.md 13.7):
- Version number
- Changelog
- Known issues
- Deployment target
- Rollback plan
- Database migration plan
- Monitoring plan
- Privacy review
- Accessibility notes
- Performance notes
- Final documentation review

**Current State**: Partial (changelog exists, others missing)

### 2.7 Launch Preparation

**Philosophy** (SPRINT_BOOK.md 13.8): No countdown pressure, no FOMO, no aggressive CTA. Launch feels like opening door to warm room.

**Deliverables**: Marketing copy, social media assets, press kit (if applicable)

**Current State**: None exist

---

## 3. Dependencies on Previous Sprints

### Sprint 1-7: Foundation through Accessibility
- ✅ Complete
- ✅ All validation passing
- ✅ Documentation synchronized

### Sprint 8: Performance Optimization
- ✅ Phase 1 complete (audit)
- ✅ Phase 2 complete (implementation)
- ✅ Validation passing (lint, typecheck, test, build)

**Dependencies Met**: All previous sprints complete and stable.

---

## 4. Complexity Assessment

### Low Complexity
- Fixing E2E test failures (mostly selector/timing issues)
- Writing short/long descriptions
- Creating release checklist document
- Documenting known issues
- Version number assignment

### Medium Complexity
- Manual QA execution and documentation
- Bug fixing for test failures (may uncover new issues)
- Screenshot production (requires working features + design review)
- Regression test suite documentation
- Privacy review documentation
- Accessibility validation notes

### High Complexity
- Store assets production (requires design work, brand alignment, screenshot guidelines adherence)
- Trailer/video production (if required)
- Database migration plan (Prisma schema exists but migrations not run)
- Deployment target definition (infrastructure not documented)
- Monitoring plan (no monitoring infrastructure exists)
- Rollback plan (deployment architecture not defined)

### Unknown Complexity
- Arashu mode validation (not implemented, marked as future work)
- Camera/scanner validation (adapters exist but UI integration incomplete per QA_PLAN.md)
- Pet rendering validation (mascot runtime ready but renderer not attached per QA_PLAN.md)

---

## 5. Risks

### 5.1 Technical Risks

**RESOLVED**: E2E test failures fixed
- 82/82 tests passing ✅
- All automated validation passing
- Runtime QA complete per QA_REPORT_v0.1.0-alpha.md

**MEDIUM**: Incomplete feature implementations
- Scanner camera UI integration incomplete
- Pet rendering not attached
- Settings page not implemented
- May create confusion about "release candidate" scope

**MEDIUM**: No deployment infrastructure documented
- Deployment target unknown
- Rollback plan cannot be written without deployment architecture
- Monitoring plan cannot be written without monitoring infrastructure
- Database migration plan incomplete (schema exists, migrations not run)

**LOW**: Build hydration warnings
- pet-store and settings-store hydration warnings during SSR build
- Non-blocking (expected behavior with localStorage in SSR environment)
- Does not affect runtime

**LOW**: Legacy component warnings
- 5 ESLint warnings documented as acceptable
- All in legacy components
- Not blocking

### 5.2 Process Risks

**HIGH**: Store assets production requires design work
- No assets exist
- Requires Brand Book adherence
- Requires Screenshot Guidelines (not found in docs/)
- Requires design review
- High effort, high quality bar

**MEDIUM**: Manual QA not documented
- QA_PLAN.md defines what to test
- QA_REPORT.md documents automated results
- No manual QA execution documented
- May uncover new issues

**MEDIUM**: Scope creep potential
- Sprint 9 must not add features
- Fixing bugs may tempt "while we're here" improvements
- Store assets may tempt UI polish
- Must enforce strict boundaries

**LOW**: Documentation drift
- Changelog, QA docs exist
- Release checklist, known issues, privacy review missing
- Manageable scope

### 5.3 Quality Risks

**MEDIUM**: Arashu mode untested
- Authentication not implemented
- Server sync not implemented
- Prisma database not deployed
- Marked as "deferred" but appears in release scope

**LOW**: Accessibility gaps
- Sprint 7 complete with documented deferred items (focus trap integration, live region integration)
- E2E accessibility tests passing (82/82)
- Gaps are intentional deferrals, not bugs

---

## 6. Files Likely to Change

### Bug Fixes
- No known bugs requiring code changes
- All automated tests passing (unit 136/136, E2E 82/82)

### Documentation
- `docs/RELEASE_CHECKLIST.md` (new)
- `docs/KNOWN_ISSUES.md` (new or update existing)
- `docs/PRIVACY_REVIEW.md` (new)
- `docs/DEPLOYMENT_PLAN.md` (new)
- `docs/CHANGELOG.md` (add Sprint 9 entry)
- `docs/QA_REPORT_v0.1.0-alpha.md` (update with final results)
- `package.json` (version bump)

### Store Assets
- `public/store-assets/` (new directory)
  - `icon.png`
  - `hero.png`
  - `screenshots/` (multiple)
  - `description-short.txt`
  - `description-long.txt`
  - `trailer.mp4` (if required)

### Regression Tests
- Potentially new test files or updates to existing E2E tests

---

## 7. Estimated Implementation Effort

### Sub-Sprint 9.1: Regression Validation & Bug Triage
**Effort**: 1 day
- ~~Fix 23 failing E2E tests~~ ✅ COMPLETE (82/82 passing)
- Validate all automated tests still pass
- Triage any bugs found during manual QA
- Fix release-blocking bugs only
- Document any fixes in changelog

### Sub-Sprint 9.2: QA & Testing
**Effort**: 2-3 days
- Execute manual QA per QA_PLAN.md
- Document manual QA results
- Create regression test suite documentation
- Update QA_REPORT.md with final results
- Create KNOWN_ISSUES.md

### Sub-Sprint 9.3: Release Documentation
**Effort**: 1-2 days
- Create RELEASE_CHECKLIST.md
- Create PRIVACY_REVIEW.md
- Create DEPLOYMENT_PLAN.md (or document deferred)
- Update CHANGELOG.md
- Bump version in package.json
- Final documentation review

### Sub-Sprint 9.4: Store Assets
**Effort**: 3-5 days (includes design review)
- Capture screenshots per guidelines
- Write short/long descriptions
- Design app icon (if not exists)
- Create hero image
- Design Director review
- Brand Book compliance validation
- Produce trailer (if required)

**Total Estimated Effort**: 7-11 days (reduced from 8-13 due to completed E2E fixes)

---

## 8. Decomposition Recommendation

**Recommendation**: YES - Decompose Sprint 9 into 4 sub-sprints

**Rationale**:
1. **Clear separation of concerns**: Bug fixing, QA, documentation, and store assets are distinct activities with different skill requirements
2. **Risk management**: Sub-sprints allow validation gates between activities (e.g., fix bugs before final QA, complete QA before store assets)
3. **Manageable scope**: Each sub-sprint is 1-5 days, reducing complexity per phase
4. **Incremental validation**: Each sub-sprint has clear Definition of Done
5. **Parallel work potential**: Some sub-sprints can overlap (documentation while QA running)
6. **Follows Sprint Book philosophy**: "Single-focus sprints give every decision a clear priority" (Section 1.2)

---

## 9. Proposed Sub-Sprints

### Sprint 9.1: Regression Validation & Bug Triage
**Focus**: Stability

**Scope**:
- ~~Fix failing E2E tests~~ ✅ COMPLETE (82/82 passing)
- Validate all automated tests still pass (no regressions from Sprint 8)
- Triage bugs found during Sprint 9.2 manual QA
- Fix release-blocking bugs only (if any found)
- Document any fixes in CHANGELOG.md

**Out of Scope**:
- New features
- UI polish
- Refactoring unless required for safe fix
- Store assets
- Manual QA execution

**Validation**:
- All E2E tests pass (82/82) ✅
- All unit tests pass (136/136) ✅
- TypeScript passes ✅
- Lint passes ✅
- Build succeeds ✅

**Estimated Effort**: 1 day (reduced from 2-3 days, automated tests already passing)

---

### Sprint 9.2: QA & Testing
**Focus**: Validation

**Scope**:
- Execute manual QA per QA_PLAN.md
- Test all critical flows on real devices
- Test accessibility with assistive technologies
- Test responsive layouts on real devices
- Document manual QA results in QA_REPORT.md
- Create KNOWN_ISSUES.md
- Create regression test suite documentation
- Validate Sprint 1-8 systems have not regressed

**Out of Scope**:
- Bug fixes (bugs found go to Sprint 9.1 or known issues)
- Store assets
- Release documentation
- New features

**Validation**:
- Manual QA executed for all critical flows
- QA_REPORT.md updated with final results
- KNOWN_ISSUES.md complete
- Regression suite documented
- No release-blocking bugs remain

**Estimated Effort**: 2-3 days

**Dependency**: Sprint 9.1 complete (regression validation passed)

---

### Sprint 9.3: Release Documentation
**Focus**: Release Preparation

**Scope**:
- Create RELEASE_CHECKLIST.md
- Create PRIVACY_REVIEW.md
- Create DEPLOYMENT_PLAN.md (or document as deferred)
- Create DATABASE_MIGRATION_PLAN.md (or document as deferred)
- Update CHANGELOG.md with Sprint 9 entry
- Bump version in package.json to v0.1.0-alpha
- Final documentation review (verify all Sprint 1-9 docs synchronized)
- Create accessibility validation notes
- Create performance validation notes

**Out of Scope**:
- Bug fixes
- Store assets
- Manual QA execution
- New features

**Validation**:
- RELEASE_CHECKLIST.md complete
- PRIVACY_REVIEW.md complete
- Deployment plan documented or deferred status documented
- Database migration plan documented or deferred status documented
- CHANGELOG.md updated
- package.json version bumped
- All mandatory docs synchronized
- Accessibility notes complete
- Performance notes complete

**Estimated Effort**: 1-2 days

**Dependency**: Sprint 9.2 complete (QA results finalized)

---

### Sprint 9.4: Store Assets
**Focus**: Marketing Preparation

**Scope**:
- Capture screenshots per Brand Book and UI Production Guide
- Write short description (150 characters, warm, companion-focused)
- Write long description (500 words, Brand Book voice)
- Design or validate app icon (if not exists)
- Create hero screenshot
- Design Director review for all assets
- Brand Book compliance validation
- Produce trailer (if required by release channel)
- Organize assets in `public/store-assets/`

**Out of Scope**:
- Bug fixes
- Code changes
- QA execution
- New features
- UI polish beyond screenshot composition

**Validation**:
- All required screenshots captured
- Short description written and reviewed
- Long description written and reviewed
- App icon ready
- Hero image ready
- Design Director review passed
- Brand Book checklist passed
- Trailer produced (if required)
- All assets organized and committed

**Estimated Effort**: 3-5 days (includes design review iterations)

**Dependency**: Sprint 9.2 complete (app is stable for screenshots)

---

## 10. Implementation Order

**Recommended Order**: Sequential with limited overlap

```
Sprint 9.1: Regression Validation (Day 1)
    ↓
Sprint 9.2: QA & Testing (Days 2-4, can overlap with 9.3)
    ↓
Sprint 9.3: Release Documentation (Days 3-5, can overlap with 9.2)
    ↓
Sprint 9.4: Store Assets (Days 5-10)
```

**Rationale**:
1. **9.1 is minimal**: All automated tests already passing, just validate no regressions
2. **9.2 and 9.3 can overlap**: Documentation can be written while QA runs
3. **9.4 must wait for 9.2**: Screenshots require stable app
4. **Sequential validation gates**: Each phase validates previous phase before proceeding

---

## 11. Open Questions

### 11.1 Scope Clarification

**Q1**: Is Arashu mode in scope for v0.1.0-alpha release?
- QA_PLAN.md marks Arashu as "not yet implemented"
- SPRINT_BOOK.md includes "Arashu flow" in Sprint 9 QA scope
- Guest mode is functional, Arashu requires authentication + server sync
- **Recommendation**: Defer Arashu to v0.2.0, release as Guest-only alpha

**Q2**: Is live camera scanning in scope for v0.1.0-alpha?
- Scanner adapters exist, UI integration incomplete per QA_PLAN.md
- E2E tests for scanner exist but may be testing placeholders
- **Recommendation**: Clarify scanner scope before Sprint 9.1

**Q3**: Is pet rendering in scope for v0.1.0-alpha?
- Mascot runtime exists, renderer not attached per QA_PLAN.md
- Home Hub shows "mascot placeholder"
- **Recommendation**: Clarify mascot rendering scope

### 11.2 Infrastructure Questions

**Q4**: What is deployment target?
- Vercel? Netlify? Self-hosted? Steam?
- Required for DEPLOYMENT_PLAN.md
- **Recommendation**: Document deployment target or mark as deferred

**Q5**: Are database migrations in scope?
- Prisma schema exists, migrations not run per QA_PLAN.md
- Guest mode uses localStorage (no DB needed)
- Arashu mode needs DB (but Arashu deferred)
- **Recommendation**: Defer database migrations to Arashu release

**Q6**: Is monitoring infrastructure in scope?
- No monitoring documented
- Required for RELEASE_CHECKLIST.md
- **Recommendation**: Mark monitoring as post-v0.1.0 work

### 11.3 Asset Questions

**Q7**: Does release channel require trailer?
- Depends on deployment target
- High effort (3-5 days additional)
- **Recommendation**: Defer trailer unless required

**Q8**: Do Screenshot Guidelines exist?
- Referenced in SPRINT_BOOK.md 13.5
- Not found in docs/
- **Recommendation**: Use Brand Book + UI Production Guide as guidelines

---

## 12. Risks Requiring User Decisions

### Risk 1: ~~E2E Test Failures~~ RESOLVED
**Status**: ✅ RESOLVED - All E2E tests passing (82/82)
**Impact**: None - all automated validation complete

### Risk 2: Incomplete Features (Scanner, Pet Rendering, Settings)
**Impact**: Users may expect features that don't work
**Decision Required**: Release with incomplete features documented, or complete features first?
**Recommendation**: Document as "coming soon" if UI exists but non-functional, or hide UI entirely

### Risk 3: No Deployment Infrastructure
**Impact**: Cannot write deployment plan, rollback plan, monitoring plan
**Decision Required**: Define infrastructure now, or defer to post-release?
**Recommendation**: Defer infrastructure docs if deploying to simple static host (Vercel/Netlify)

### Risk 4: Store Assets High Effort
**Impact**: 3-5 days for design work, may extend timeline
**Decision Required**: Simplify asset requirements, or allocate full time?
**Recommendation**: Start with minimal asset set (icon, 3 screenshots, short/long description), expand later

---

## 13. Recommended Next Steps

1. **User Decision**: Clarify Sprint 9 scope (Arashu, scanner, pet rendering, deployment target)
2. **Approval**: Approve 4-sub-sprint decomposition
3. **Start Sprint 9.1**: Fix E2E test failures, validate stability
4. **Iterate**: Proceed sequentially through 9.2, 9.3, 9.4 after each validation gate

---

**Analysis Complete - Awaiting Approval to Proceed**
