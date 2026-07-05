# Deployment Plan - v0.1.0-alpha

**Release Version**: v0.1.0-alpha  
**Date**: July 5, 2026  
**Status**: Infrastructure Intentionally Deferred

---

## Deployment Status

**Infrastructure Status**: Not defined for v0.1.0-alpha

**Rationale**: Alpha release focuses on Guest mode validation. Deployment infrastructure deferred to allow flexibility in hosting choice post-validation.

---

## Build Process

### Production Build

**Command**:
```bash
npm run build
```

**Output**: `.next/` directory (Next.js production build)

**Build Validation**:
- TypeScript compilation: ✅ 0 errors
- Production bundle created: ✅
- Build time: ~7-10 seconds
- Output size: Optimized (24 KB reduction from Sprint 8)

**Build Requirements**:
- Node.js 18+ 
- npm 9+
- 2GB RAM minimum
- ~500MB disk space for dependencies

---

## Environment Variables

### Required (None for v0.1.0-alpha Guest Mode)

Guest mode uses localStorage only. No environment variables required.

### Future (Arashu Mode v0.2.0+)

**Will Require**:
```env
# Database
DATABASE_URL=postgresql://...
ARASHU_DATABASE_URL=postgresql://...
GUEST_DATABASE_URL=postgresql://...

# Authentication (Supabase)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://...
```

**Security Note**: Service keys never exposed to client

---

## Hosting Options (Deferred)

### Option 1: Vercel (Recommended for Next.js)

**Pros**:
- Native Next.js support
- Zero config deployment
- Automatic HTTPS
- Global CDN
- Git integration
- Free tier available

**Cons**:
- Vendor lock-in
- Pricing scales with usage

**Deployment**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Option 2: Netlify

**Pros**:
- Simple deployment
- Free tier available
- Git integration
- Automatic HTTPS

**Cons**:
- Next.js SSR requires adapter
- Less optimized for Next.js than Vercel

### Option 3: Self-Hosted

**Pros**:
- Full control
- No vendor lock-in
- Custom infrastructure

**Cons**:
- Requires server management
- Manual SSL setup
- Manual scaling
- Higher maintenance

**Requirements**:
- Node.js 18+ server
- PM2 or similar process manager
- Nginx reverse proxy (recommended)
- SSL certificate (Let's Encrypt)

---

## Deployment Procedure (Generic)

**Status**: To be defined when hosting selected

**General Steps**:
1. Select hosting provider
2. Configure environment variables (if needed)
3. Connect repository
4. Configure build command: `npm run build`
5. Configure start command: `npm start`
6. Deploy
7. Verify deployment
8. Run smoke tests

---

## Production Checklist

### Pre-Deployment

- [ ] Hosting provider selected
- [ ] Domain configured (if applicable)
- [ ] SSL certificate configured
- [ ] Environment variables set
- [ ] Build tested locally (`npm run build && npm start`)
- [ ] Smoke test plan prepared

### Deployment

- [ ] Create git tag `v0.1.0-alpha`
- [ ] Deploy to hosting service
- [ ] Verify build succeeds
- [ ] Verify app loads
- [ ] Run smoke tests

### Post-Deployment

- [ ] Monitor error logs (if logging configured)
- [ ] Test on real devices (if available)
- [ ] Update README with deployment URL
- [ ] Document any deployment issues

---

## Smoke Tests (Post-Deployment)

**Manual Validation**:
1. Open deployed URL
2. Verify app loads without errors
3. Navigate to `/home` - verify Home Hub renders
4. Navigate to `/scan` - verify Scanner page renders
5. Navigate to `/collection` - verify Collection renders
6. Navigate to `/achievements` - verify Achievements render
7. Navigate to `/missions` - verify Missions render
8. Open browser DevTools - verify no console errors
9. Check localStorage - verify Guest state persists
10. Reload page - verify state restored

**Expected**: All pages load, no errors, localStorage works

---

## Monitoring (Deferred)

**Status**: No monitoring configured for v0.1.0-alpha

**Future Consideration**:
- Error tracking (Sentry, LogRocket)
- Analytics (privacy-focused)
- Uptime monitoring
- Performance monitoring (Lighthouse CI)

---

## Rollback Procedure

**If deployment fails or critical bug found**:

### Immediate Rollback

**Hosting with Git integration** (Vercel, Netlify):
1. Revert deployment in hosting dashboard
2. Or: redeploy previous git commit

**Self-hosted**:
1. Stop application
2. `git checkout <previous-stable-commit>`
3. `npm run build`
4. `npm start`
5. Restart process manager

### Git Rollback

```bash
# Remove tag
git tag -d v0.1.0-alpha
git push origin :refs/tags/v0.1.0-alpha

# Revert to previous commit
git revert <bad-commit>
# Or
git reset --hard <previous-stable-commit>

# Redeploy
```

### Communication

- Update users if applicable
- Document failure in issue tracker
- Prioritize fix
- Re-deploy after validation

---

## Database Migration (Future)

**Status**: Not applicable for v0.1.0-alpha (localStorage only)

**Future Arashu Mode**:
- Prisma migrations required
- Migration procedure: `npx prisma migrate deploy`
- Backup before migration
- Test migration on staging first
- Rollback plan: restore from backup

---

## SSL/HTTPS

**Required**: Yes

**Implementation**: Depends on hosting

**Vercel/Netlify**: Automatic HTTPS

**Self-hosted**:
- Let's Encrypt (free)
- Certbot for automation
- Nginx SSL configuration

---

## Performance Expectations

**Target Metrics**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: > 90

**Sprint 8 Optimizations**:
- Bundle reduced by 24 KB
- Product lookup cached (495ms saved)
- Lazy loading implemented

**Monitoring**: Not configured (deferred)

---

## Scaling (Future Consideration)

**v0.1.0-alpha**: Not applicable (static site, localStorage only)

**Future Arashu Mode**:
- Database connection pooling
- API rate limiting
- CDN for static assets
- Horizontal scaling if needed

---

## Backup & Recovery (Future)

**v0.1.0-alpha**: Not applicable (no server data)

**Future Arashu Mode**:
- Database backups (daily, retained 30 days)
- Point-in-time recovery
- Backup testing quarterly
- Disaster recovery plan

---

## Security Checklist

### Build Security

- [x] No secrets in repository
- [x] No API keys in client bundle
- [x] Dependencies audited (`npm audit`)
- [x] Production build optimized

### Deployment Security (Future)

- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Database credentials rotated
- [ ] Access logs monitored
- [ ] Rate limiting configured

---

## Known Deployment Limitations

### v0.1.0-alpha

1. **No deployment infrastructure defined**: Intentionally deferred
2. **No monitoring configured**: Error tracking not set up
3. **No database**: Guest mode only, localStorage
4. **No authentication**: Guest mode only
5. **No API endpoints active**: Scanner uses placeholder data

### Future Requirements (v0.2.0+)

1. Database hosting (PostgreSQL)
2. Authentication provider (Supabase)
3. Environment variable management
4. Error tracking
5. Performance monitoring

---

## Cost Estimates (Future)

**v0.1.0-alpha**: Free (static hosting available free on Vercel/Netlify)

**Future Arashu Mode**:
- Hosting: $0-20/month (Vercel/Netlify free tier → Pro tier)
- Database: $5-25/month (Supabase free tier → Pro tier)
- Monitoring: $0-29/month (Free tier → Sentry Team)
- Domain: $10-15/year

**Total Estimated**: $0/month (v0.1.0-alpha), $20-75/month (v0.2.0)

---

## Decision: Deployment Deferred

**Reasoning**:
1. v0.1.0-alpha is validation-focused alpha
2. Guest mode requires no server infrastructure
3. Hosting choice can be made post-validation
4. No deployment infrastructure built = no premature commitment

**When to Deploy**:
- When public alpha testing desired
- When hosting provider selected
- When domain acquired (if applicable)

**Deployment Readiness**:
- ✅ Production build works
- ✅ All tests pass
- ✅ Zero release blockers
- ⏸️ Infrastructure intentionally deferred

---

## Recommendations

### Immediate

1. Document deployment as intentionally deferred ✅
2. Keep deployment flexibility for hosting choice ✅
3. Maintain production build capability ✅

### Before Public Release

1. Select hosting provider
2. Configure domain (if applicable)
3. Set up monitoring
4. Define rollback procedure specific to chosen host
5. Test deployment on staging environment
6. Document deployment steps specific to chosen host

---

**Document Version**: 1.0  
**Last Updated**: July 5, 2026  
**Status**: Infrastructure Intentionally Deferred  
**Next Action**: Select hosting provider when public deployment desired
