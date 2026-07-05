# Release Checklist - v0.1.0-alpha

**Release Version**: v0.1.0-alpha  
**Release Date**: July 5, 2026  
**Release Type**: Alpha (Guest Mode Only)  
**Status**: Pre-Release Documentation

---

## Pre-Release Checklist

### Code Quality

- [x] All unit tests passing (136/136)
- [x] All E2E tests passing (82/82)
- [x] TypeScript compiles without errors
- [x] ESLint passes (5 acceptable legacy warnings)
- [x] Production build succeeds
- [x] No console errors in production build

### Documentation

- [x] CHANGELOG.md updated with all Sprint 0-9 changes
- [x] KNOWN_ISSUES.md created and complete
- [x] QA_REPORT_v0.1.0-alpha.md finalized
- [x] README.md current
- [x] PROJECT_ARCHITECTURE.md synchronized
- [x] SPRINT_BOOK.md reflects Sprint 0-9 completion
- [x] RELEASE_CHECKLIST.md created (this document)
- [x] PRIVACY_REVIEW.md created
- [x] DEPLOYMENT_PLAN.md created

### Testing & QA

- [x] Sprint 9.1 release validation complete
- [x] Sprint 9.2 manual QA complete (automated suite)
- [x] Responsive validation (7 viewports)
- [x] Keyboard navigation validation
- [x] Accessibility validation (WCAG AA)
- [ ] Physical device testing (deferred post-release)
- [ ] Screen reader testing (deferred post-release)
- [ ] Browser compatibility testing (deferred post-release)

### Features & Scope

- [x] Guest mode functional (localStorage persistence)
- [x] Home Hub implemented
- [x] Scanner page implemented (camera integration incomplete)
- [x] Collection/Inventory implemented
- [x] Achievements system implemented
- [x] Missions system implemented
- [x] Pet stats system implemented
- [x] Game progression implemented
- [ ] Arashu mode (deferred to v0.2.0)
- [ ] Live camera scanning (deferred to v0.2.0)
- [ ] Pet rendering (deferred to v0.2.0)
- [ ] Settings UI (deferred to v0.2.0)

### Performance

- [x] Sprint 8 optimizations applied
- [x] Bundle size reduced by 24 KB
- [x] Product lookup cached (495ms saved per repeat scan)
- [x] Narrow selectors implemented (fewer re-renders)
- [x] Lazy loading implemented (inventory route)

### Accessibility

- [x] WCAG AA compliance (95%)
- [x] Keyboard navigation (Tab, Enter, Escape)
- [x] Focus indicators visible
- [x] ARIA labels on interactive elements (50+)
- [x] Semantic landmarks (main, nav, section)
- [x] Reduced motion support
- [x] Color contrast validated
- [x] Touch targets validated (44×44px minimum)

### Security & Privacy

- [x] No secrets in repository
- [x] No API keys in client code
- [x] Privacy review complete
- [x] Guest data isolated to localStorage
- [x] No personal data collected (Guest mode)

---

## Release Metadata

### Version Information

**Version**: v0.1.0-alpha  
**Codename**: "First Companion"  
**Release Date**: July 5, 2026  
**Build**: Production  
**Stability**: Alpha (Guest Mode Only)

### Release Summary

Scan Chan v0.1.0-alpha is the first playable release of the virtual pet companion experience. This alpha release focuses on Guest mode functionality with localStorage persistence.

**What's Included**:
- Guest mode with localStorage persistence
- Home Hub with pet stats display
- Scanner page (UI complete, camera integration deferred)
- Collection/Inventory system
- Achievements system (13 base achievements)
- Missions system (daily and weekly)
- Pet stats system (Hunger, Mood, Energy, Affection, Curiosity)
- Game progression (XP, levels)
- Responsive layouts (320px-1280px+)
- Keyboard navigation
- WCAG AA accessibility (95%)

**What's Not Included**:
- Arashu mode (server sync, authentication)
- Live camera scanning
- Animated pet rendering
- Settings UI page
- Physical device validation
- Screen reader validation

### Known Limitations

See `docs/KNOWN_ISSUES.md` for complete list:

1. **Guest Mode Only**: No server sync or authentication (Arashu mode deferred)
2. **Camera Not Wired**: Scanner UI exists, camera adapters ready, but not connected
3. **Static Mascot**: Pet placeholder displays instead of animated sprite
4. **No Settings UI**: Settings store functional but no UI page
5. **Limited Manual QA**: Physical devices and screen readers not tested

### System Requirements

**Minimum**:
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- localStorage enabled (for Guest mode persistence)
- 1280×720 display minimum
- Internet connection (for initial load)

**Recommended**:
- Chrome/Edge latest
- 1920×1080 display
- Mouse and keyboard

**Not Supported**:
- Internet Explorer
- Browsers with JavaScript disabled
- Browsers with localStorage disabled

### Browser Support

**Tested**: Chromium (via Playwright)

**Expected to Work** (not validated):
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile Chrome (Android)
- Mobile Safari (iOS)

**Not Supported**:
- Internet Explorer

---

## Deployment Checklist

### Pre-Deployment

- [x] All pre-release checks pass
- [ ] Deployment target selected (see DEPLOYMENT_PLAN.md)
- [ ] Environment variables configured
- [ ] Production build tested locally
- [ ] Rollback plan documented

### Deployment

- [ ] Create git tag `v0.1.0-alpha`
- [ ] Build production bundle (`npm run build`)
- [ ] Deploy to hosting service
- [ ] Verify deployment successful
- [ ] Smoke test deployed application
- [ ] Monitor error logs

### Post-Deployment

- [ ] Announce release (if applicable)
- [ ] Monitor user feedback
- [ ] Monitor error logs
- [ ] Update project board
- [ ] Plan v0.2.0 scope

---

## Rollback Procedure

**If deployment fails or critical issues found**:

1. **Immediate**: Revert to previous deployment (if hosted service supports)
2. **Git**: Revert git tag and redeploy previous stable version
3. **Communication**: Update users if applicable
4. **Investigation**: Document failure, create issue, prioritize fix
5. **Re-deploy**: After fix validated, follow deployment checklist again

**Rollback Commands** (example, adjust for hosting service):
```bash
# Revert git tag
git tag -d v0.1.0-alpha
git push origin :refs/tags/v0.1.0-alpha

# Deploy previous stable version
git checkout <previous-stable-commit>
npm run build
# Deploy via hosting service
```

---

## Release Notes Template

```markdown
# Scan Chan v0.1.0-alpha - First Companion

**Release Date**: July 5, 2026  
**Status**: Alpha (Guest Mode Only)

## What's New

- Virtual pet companion with stat tracking (Hunger, Mood, Energy, Affection, Curiosity)
- Home Hub displaying pet summary and daily activities
- Scanner page for barcode input (camera integration coming in v0.2.0)
- Collection system for managing scanned items
- Achievement system with 13 unlockable milestones
- Mission system with daily and weekly goals
- Guest mode with localStorage persistence

## Known Limitations

- Guest mode only (no server sync or authentication)
- Camera scanning UI present but not functional
- Static pet placeholder (animated rendering coming in v0.2.0)
- No settings UI page

## Requirements

- Modern browser (Chrome 90+, Firefox 88+, Safari 14+)
- JavaScript enabled
- localStorage enabled

## Feedback

Report issues at: [project issue tracker URL]
```

---

## Sign-Off

### QA Approval

- [x] Sprint 9.1 validation complete
- [x] Sprint 9.2 manual QA complete
- [x] All automated tests passing
- [x] Zero release blockers

**QA Engineer**: Automated Validation  
**Date**: July 5, 2026  
**Status**: ✅ Approved

### Release Manager Approval

- [ ] All documentation complete
- [ ] Release checklist verified
- [ ] Deployment plan reviewed
- [ ] Rollback plan reviewed

**Release Manager**: [Pending]  
**Date**: [Pending]  
**Status**: [Pending]

---

**Document Version**: 1.0  
**Last Updated**: July 5, 2026  
**Next Review**: Post-deployment
