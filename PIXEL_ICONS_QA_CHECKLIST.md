# 🎨 Pixel Icons & Dynamic Calendar - QA Testing Checklist

## Test Date: _______
## Tester: _______
## Environment: localhost:3001 / Production

---

## ✅ 1. Pixel Art Icons Display

### 1.1 Streak Counter Icons
- [ ] **PixelFlame** icon shows in streak display (static, no animation)
- [ ] Flame icon shows in player name area (top) with streak number
- [ ] Flame icon shows in login calendar streak badge
- [ ] Milestone badges (7-day, 30-day, 100-day) show PixelFlame icons

**Expected**: All 🔥 emoji replaced with pixel art flame SVG

### 1.2 Login Calendar Icons  
- [ ] Day 1-4: Yellow/amber star icons (⭐)
- [ ] Day 5-6: Pink heart icons (💖)
- [ ] Day 7: Gold crown icon (👑)
- [ ] Completed days: Pink checkmark icon (✅)
- [ ] No emoji visible, only pixel art SVGs

**Expected**: 7x7 grid with pixel art icons, no emoji

### 1.3 Category Badge Icons
- [ ] Snack: Orange chip bag icon
- [ ] Drink: Cyan juice box icon
- [ ] Candy: Pink wrapped candy icon
- [ ] Dairy: Green milk bottle icon
- [ ] Biscuit: Yellow cookie icon
- [ ] Night: Moon emoji (keep as is)

**Expected**: Pixel art icons in circular badges, matching gradient colors

### 1.4 Bounty Hunt Icons
- [ ] "New Bounty" button has black barcode icon
- [ ] Button background is cyan (#22d3ee - #06b6d4)
- [ ] "Cat Request" label has barcode icon
- [ ] Card background is cyan gradient
- [ ] "Generate New Bounty" button has barcode icon

**Expected**: Cyan theme, black pixel barcode icons

### 1.5 Product List Icons
- [ ] Category badges show matching pixel icons
- [ ] Icons appear next to category name (Snack, Drink, etc.)
- [ ] Size is appropriate (12px)

---

## ✅ 2. Dynamic Login Calendar (365 Days)

### 2.1 Week 1 Display
- [ ] Initial view shows Day 1-7
- [ ] Title: "Daily Login Calendar" (no week number)
- [ ] Can claim Day 1 reward
- [ ] After claim, Day 1 shows pink checkmark
- [ ] Claim button changes to "Reward claimed!"

### 2.2 Week Progression
- [ ] After claiming Day 7, calendar still shows Day 1-7
- [ ] When Day 8 becomes today, calendar shows Day 8-14
- [ ] Title changes to "Daily Login Calendar (Week 2)"
- [ ] After Day 14, calendar shows Day 15-21 (Week 3)

**Test by simulating dates in localStorage:**
```javascript
// In browser console:
const storage = JSON.parse(localStorage.getItem('player-store'));
const calendar = [];
for (let i = 0; i < 7; i++) {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  calendar.push(date.toLocaleDateString('en-CA'));
}
storage.state.loginCalendar = calendar;
storage.state.streak = 7;
localStorage.setItem('player-store', JSON.stringify(storage));
location.reload();
```

### 2.3 Special Milestones
- [ ] Day 7: Crown icon, "Week Complete!"
- [ ] Day 30: Crown icon, "30-Day Legend!" (+100 XP)
- [ ] Day 100: Crown icon, "100-Day Master!" (+200 XP)
- [ ] Day 365: Crown icon, "Year Champion!" (+500 XP)

---

## ✅ 3. Streak Counter Sync

### 3.1 Login Reward Claim
- [ ] Initial state: streak = 0 or not visible
- [ ] Claim Day 1 reward → streak = 1
- [ ] Claim Day 2 reward (next day) → streak = 2
- [ ] Streak badge updates immediately

### 3.2 Scan Product
- [ ] Scan first product → updates lastActiveDate
- [ ] Streak increments if consecutive day
- [ ] Streak resets if day skipped

### 3.3 Consistency Check
- [ ] Login calendar consecutive days matches streak number
- [ ] Skipping a day resets both calendar and streak
- [ ] Both update together (no desync)

---

## ✅ 4. Multi-User Data Isolation

### 4.1 Test Setup
- [ ] Open browser 1 (Chrome): User A - `TestUserA_${timestamp}`
- [ ] Open browser 2 (Firefox/Incognito): User B - `TestUserB_${timestamp}`

### 4.2 User A Actions
- [ ] Register with nickname "TestUserA"
- [ ] Claim login reward Day 1
- [ ] Streak = 1, XP increases
- [ ] Scan a product (Snack category)

### 4.3 User B Actions  
- [ ] Register with nickname "TestUserB"
- [ ] Should NOT see User A's data
- [ ] Streak = 0 initially
- [ ] Claim login reward Day 1
- [ ] Streak = 1 (independent from User A)
- [ ] Scan a product (Drink category)

### 4.4 Verification
- [ ] User A still has streak = 1, Snack in history
- [ ] User B has streak = 1, Drink in history
- [ ] No data collision between users
- [ ] Each user's localStorage is separate

---

## ✅ 5. Data Persistence

### 5.1 After Page Reload
- [ ] Refresh page (F5)
- [ ] User nickname still displayed
- [ ] Streak counter persists
- [ ] Login calendar state persists (claimed days still pink)
- [ ] Product history persists
- [ ] Category badges progress persists

### 5.2 After Browser Close/Reopen
- [ ] Close browser tab completely
- [ ] Reopen http://localhost:3001/play
- [ ] All data still present
- [ ] Can continue from where left off

### 5.3 After Clear Cache (localStorage)
- [ ] Clear cache/localStorage
- [ ] Data should reset
- [ ] Can register new user fresh

---

## ✅ 6. Visual Regression Checks

### 6.1 Pixel Art Quality
- [ ] All SVG icons render sharply (not blurry)
- [ ] Icons have proper `pixelated` class for crisp edges
- [ ] Colors match design (no color bleeding)
- [ ] Icon sizes appropriate for context (16px, 20px, 24px, 40px)

### 6.2 Animation Check
- [ ] PixelFlame is STATIC (no pulse/float animation)
- [ ] Login calendar cards don't animate on load (only transition delay)
- [ ] No janky animations
- [ ] Smooth transitions on hover/click

### 6.3 Layout
- [ ] Calendar grid 7 columns, responsive
- [ ] Icons centered in cards
- [ ] Text not overlapping icons
- [ ] Mobile view: icons still visible and clear

---

## ✅ 7. Edge Cases & Error Handling

### 7.1 Time Edge Cases
- [ ] Test claiming reward at 11:59 PM
- [ ] Test claiming reward at 12:00 AM (next day)
- [ ] Test timezone handling
- [ ] Test skipping multiple days (streak reset)

### 7.2 Data Edge Cases
- [ ] Test with 0 products scanned
- [ ] Test with 100+ products scanned
- [ ] Test with all category badges unlocked
- [ ] Test with streak = 365 days

### 7.3 Error States
- [ ] Already claimed today → button disabled
- [ ] Network error on claim → shows error toast
- [ ] Invalid date format → graceful fallback
- [ ] Missing icon → fallback to placeholder

---

## ✅ 8. Performance & Browser Compatibility

### 8.1 Performance
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] No memory leaks (check DevTools)
- [ ] Smooth scrolling/interaction

### 8.2 Browser Testing
- [ ] ✅ Chrome (latest)
- [ ] ✅ Firefox (latest)
- [ ] ✅ Safari (macOS)
- [ ] ✅ Edge (latest)
- [ ] ✅ Mobile Chrome (Android)
- [ ] ✅ Mobile Safari (iOS)

### 8.3 Screen Sizes
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## 📋 Final Verification

### Pre-Deployment Checklist
- [ ] All pixel icons display correctly (no emoji fallbacks)
- [ ] Dynamic calendar shows correct week based on progress
- [ ] Streak syncs with login calendar claims
- [ ] Multi-user data is isolated (no collision)
- [ ] Data persists across reloads and sessions
- [ ] No console errors in production build
- [ ] Build succeeds without warnings
- [ ] All critical user flows work end-to-end

### Known Issues
List any issues found:
1. _______________________________________
2. _______________________________________
3. _______________________________________

### Recommended Actions
- [ ] Fix critical bugs before deploy
- [ ] Document workarounds for minor issues
- [ ] Update user documentation if needed
- [ ] Monitor after deployment for user reports

---

## 🎯 Sign-Off

**QA Tester**: _________________ Date: _______
**Developer**: _________________ Date: _______
**Product Owner**: _____________ Date: _______

**Status**: [ ] PASS - Ready to deploy | [ ] FAIL - Needs fixes

