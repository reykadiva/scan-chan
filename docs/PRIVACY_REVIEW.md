# Privacy Review - v0.1.0-alpha

**Release Version**: v0.1.0-alpha  
**Review Date**: July 5, 2026  
**Reviewer**: Release Documentation  
**Status**: Complete

---

## Privacy Policy Summary

Scan Chan v0.1.0-alpha (Guest mode) collects **no personal data** and transmits **no user data** to external servers.

---

## Data Collection

### Guest Mode (v0.1.0-alpha)

**Data Stored Locally** (localStorage only):
- Pet stats (hunger, mood, energy, affection, curiosity)
- Pet name (if user provides)
- Game progress (XP, level)
- Achievement unlock status
- Mission progress
- Inventory items
- Settings preferences (reduced motion, etc.)
- Scan history (barcode values, timestamps)

**Storage Location**: Browser localStorage (device-only)

**Data Transmission**: None - all data stays on user's device

**Data Retention**: Until user clears browser data or uninstalls

**User Control**: User can clear localStorage at any time (browser settings)

### Arashu Mode (Not in v0.1.0-alpha)

**Status**: Deferred to v0.2.0

**Future Data Collection** (documented for transparency):
- Email address (for authentication)
- Password hash (never plaintext)
- Server-synced game state
- Account creation timestamp
- Last sync timestamp

**Note**: Arashu mode not implemented in v0.1.0-alpha

---

## Third-Party Services

### Analytics

**Status**: None implemented

**Future Consideration**: If analytics added, will be:
- Optional
- Privacy-focused (no PII)
- Documented in privacy policy
- Opt-out available

### External APIs

**Status**: None used in v0.1.0-alpha (Guest mode)

**Future Consideration**: Product lookup API for barcode scanning (v0.2.0+)

---

## Data Security

### Guest Mode

**Encryption**: Not applicable (localStorage is local-only)

**Access Control**: Browser-level (same-origin policy)

**Data Transmission**: None

**Data Backup**: User responsibility (browser backup tools)

### Arashu Mode (Future)

**Encryption**: HTTPS for all API calls

**Authentication**: Supabase Auth (JWT tokens)

**Password Storage**: Bcrypt hashes only

**API Security**: Server-side validation, rate limiting

---

## User Rights

### Guest Mode

**Right to Access**: User owns localStorage, accessible via browser DevTools

**Right to Delete**: Clear browser data at any time

**Right to Export**: Not implemented (data stored locally, accessible via DevTools)

**Right to Portability**: Not applicable (no server data)

### Data Deletion

**How**: Clear browser localStorage via browser settings

**Effect**: All game progress deleted permanently

**Recovery**: Not possible (no server backup in Guest mode)

---

## GDPR Compliance (Future Consideration)

**Applicability**: GDPR applies if:
- Users are in EU
- Data is collected and processed

**v0.1.0-alpha Status**: Not applicable (no data collection)

**Future Arashu Mode**: Will require:
- Privacy policy
- Terms of service
- Cookie consent (if applicable)
- Data processing agreement
- Right to deletion implementation
- Data export implementation

---

## COPPA Compliance (Future Consideration)

**Applicability**: COPPA applies to services directed at children under 13

**v0.1.0-alpha Status**: Not applicable (no data collection)

**Recommendation**: Add age gate if user accounts implemented

---

## Privacy Policy Requirements

### Guest Mode (v0.1.0-alpha)

**Privacy Policy**: Not required (no data collection or transmission)

**Recommendation**: Add simple privacy statement:
- "Guest mode stores data locally on your device only"
- "No personal data collected"
- "No data transmitted to servers"
- "Clear browser data to delete progress"

### Arashu Mode (Future)

**Privacy Policy**: Required before launch

**Must Include**:
- What data is collected
- How data is used
- How data is stored
- How data is secured
- User rights (access, deletion, export)
- Contact information
- Policy update process

---

## Data Breach Procedure (Future)

**v0.1.0-alpha**: Not applicable (no server data)

**Future Arashu Mode**:
1. **Detection**: Monitor logs for unauthorized access
2. **Assessment**: Determine scope (what data, how many users)
3. **Containment**: Stop breach, secure systems
4. **Notification**: Notify affected users within 72 hours (GDPR requirement)
5. **Remediation**: Fix vulnerability, document lessons learned
6. **Reporting**: Report to authorities if required by law

---

## Privacy Review Checklist

### Data Collection

- [x] No personal data collected in v0.1.0-alpha
- [x] localStorage usage documented
- [x] No external data transmission
- [x] User control over data (browser settings)

### Security

- [x] No server-side data storage
- [x] No authentication in Guest mode
- [x] No API keys in client code
- [x] No secrets in repository

### Compliance

- [x] GDPR not applicable (no data collection)
- [x] COPPA not applicable (no data collection)
- [x] Privacy policy not required for v0.1.0-alpha
- [x] Terms of service not required for v0.1.0-alpha

### Future Considerations

- [ ] Privacy policy required for Arashu mode (v0.2.0)
- [ ] Terms of service required for Arashu mode (v0.2.0)
- [ ] Cookie consent if cookies used (v0.2.0)
- [ ] Age gate consideration for child safety

---

## Privacy Risks

### Low Risk

**Guest Mode localStorage**:
- Risk: Data visible in browser DevTools
- Mitigation: No sensitive personal data stored
- Severity: Low

**No Data Encryption**:
- Risk: localStorage unencrypted
- Mitigation: No sensitive data, device-only storage
- Severity: Low

### Future Risks (Arashu Mode)

**Server Data Storage**:
- Risk: Server breach exposes user data
- Mitigation: Encryption, access control, monitoring
- Severity: Medium

**Authentication**:
- Risk: Weak passwords, credential leaks
- Mitigation: Password strength requirements, bcrypt hashing, rate limiting
- Severity: Medium

---

## Recommendations

### Immediate (v0.1.0-alpha)

1. ✅ Document localStorage usage clearly
2. ✅ No personal data collection
3. ✅ No external data transmission

### Before Arashu Launch (v0.2.0)

1. Write privacy policy
2. Write terms of service
3. Implement data export
4. Implement data deletion
5. Add cookie consent if needed
6. Add age gate if targeting children
7. Legal review if operating in EU
8. Implement breach notification procedure

---

## Sign-Off

**Reviewer**: Release Documentation  
**Date**: July 5, 2026  
**Status**: ✅ Approved for v0.1.0-alpha (Guest Mode)

**Notes**:
- Guest mode collects no personal data
- localStorage usage clearly documented
- No privacy policy required for v0.1.0-alpha
- Privacy policy required before Arashu mode launch

---

**Document Version**: 1.0  
**Last Updated**: July 5, 2026  
**Next Review**: Before v0.2.0 (Arashu mode implementation)
