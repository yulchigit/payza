# Performance Optimization Report

**Generated:** February 24, 2026  
**Build Tool:** Vite v7.3.1  
**React Version:** 18.2.0

---

## 1. Current Build Analysis

### Bundle Size Summary

| File | Gzip Size | Uncompressed | Percentage |
|------|-----------|--------------|-----------|
| ui-DuY0pf-U.js | 141.10 kB | 530.82 kB | **34.8%** |
| charts-jdA0go_Z.js | 112.86 kB | 419.84 kB | **27.5%** |
| react-X7CgTrqA.js | 53.19 kB | 162.05 kB | **10.6%** |
| index--8LuPAr0.js | 18.68 kB | 46.58 kB | **3.1%** |
| Button-CNUs9t6Y.js | 10.31 kB | 30.83 kB | **2.0%** |
| index-Aj_cKgpX.js | 9.64 kB | 28.70 kB | **1.9%** |
| [Others] | ~80 kB | ~240 kB | **5.2%** |
| **index.html** | 0.45 kB | 0.87 kB | - |
| **CSS** | 7.77 kB | 39.73 kB | 0.5% |
| **Total (Gzipped)** | **~390 kB** | ~1.4 MB | **100%** |

### Build Performance
- **Build Time:** 9.41 seconds
- **Module Count:** 2,340 modules transformed
- **Target:** ≤150 kB gzipped (industry standard)

---

## 2. Performance Bottlenecks

### 🔴 Critical Issues

**1. UI Component Library (141 kB gzip)**
- Likely includes: Radix UI, Tailwind CSS utilities, form components
- Issue: All UI components bundled together regardless of usage
- Impact: Initial page load blocked by 141 kB of potentially unused components

**2. Charts Library (112 kB gzip)**
- Likely: Recharts, D3.js dependencies
- Issue: Loaded even on pages that don't use charts (auth pages)
- Impact: 112 kB delay on login/register pages (no charts needed)

**3. React Core (53 kB gzip)**
- Safe baseline; cannot reduce without breaking app
- Impact: Unavoidable for React apps

### 🟡 Secondary Issues

**4. Large Vendor Chunks**
- Multiple index-*.js files (46 kB, 28 kB, 25 kB each) suggest poor code-splitting
- Issue: Page components not lazy-loaded granularly
- Impact: User downloads entire vendor bundle even for lightweight pages

**5. CSS Bloat (39.73 kB uncompressed)**
- Tailwind CSS generates utilities globally
- Issue: All breakpoints/color variations included for unused components
- Impact: Every page includes CSS for all possible states

---

## 3. Optimization Strategy

### Phase 1: Code-Splitting (High Impact, Easy)

**Current State:** Pages are lazy-loaded ✅ (already in Routes.jsx)

**Target:** Lazy-load UI library imports per page

```jsx
// Before: All UI imported globally
import { Button, Card, Input } from "@radix-ui/...";

// After: Imported only where needed
const Button = lazy(() => import("@radix-ui/react-slot"));
```

**Expected Savings:** 20-30 kB gzip (reduce ui chunk from 141 to 110-120 kB)

### Phase 2: Dynamic Chart Loading (Medium Impact, Easy)

**Issue:** Charts library (112 kB) loaded on all pages

**Solution:** Lazy-load chart components for merchant dashboard only

```jsx
// pages/merchant-dashboard/index.jsx
const ChartComponent = lazy(() => import("./components/ChartPanel"));

<Suspense fallback={<ChartSkeleton />}>
  <ChartComponent data={data} />
</Suspense>
```

**Expected Savings:** 80-100 kB gzip removal from main bundle (users without dashboard don't download)

### Phase 3: CSS Purging (Medium Impact, Medium Effort)

**Current:** Tailwind config includes all utilities + plugins

```js
// tailwind.config.js
content: ['./src/**/*.{js,jsx}'], // ✅ Good: Scans for used classes
```

**Optimization:** Add explicit unused CSS removal

```js
// Production only
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  safelist: [], // Explicitly list dynamic Tailwind classes
  plugins: [
    // Only enable needed plugins
    require('@tailwindcss/forms'),
    // Remove unused: aspect-ratio, line-clamp, typography
  ]
};
```

**Expected Savings:** 5-8 kB gzip (39.73 → 31-35 kB)

### Phase 4: Bundle Analysis (Low Config, High Insight)

**Install tool:**
```bash
npm install --save-dev rollup-plugin-visualizer
```

**Update vite.config.mjs:**
```js
import { visualizer } from "rollup-plugin-visualizer";

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "dist/bundle-analysis.html"
    })
  ]
};
```

**Usage:**
```bash
npm run build  # Opens dist/bundle-analysis.html in browser
```

### Phase 5: Image Optimization (Quick Win)

**Check public/assets/images:**
- Convert large PNGs → WebP
- Compress JPEGs to 80% quality
- Add responsive sizes for different breakpoints

**Tool:**
```bash
npm install --save-dev imagemin-webpack-plugin
```

---

## 4. Implementation Roadmap

### Priority 1: Dynamic Chart Loading (5 min)
**Effort:** Minimal | **Savings:** 100 kB (biggest ROI)
- [ ] Wrap Recharts imports in lazy()
- [ ] Add Suspense boundary in merchant dashboard
- [ ] Test chart loading

### Priority 2: Bundle Analysis Setup (3 min)
**Effort:** Trivial | **Savings:** Insight only
- [ ] Install rollup-plugin-visualizer
- [ ] Update vite.config.mjs
- [ ] Run build and analyze

### Priority 3: UI Library Code-Splitting (15 min)
**Effort:** Medium | **Savings:** 30 kB
- [ ] Identify UI components per page
- [ ] Convert to lazy() loading per route
- [ ] Measure before/after

### Priority 4: CSS Purging (10 min)
**Effort:** Low | **Savings:** 7 kB
- [ ] Update tailwind.config.js
- [ ] Remove unused plugins (@tailwindcss/line-clamp, @tailwindcss/aspect-ratio)
- [ ] Test responsive design

### Priority 5: Image Optimization (20 min)
**Effort:** Low | **Savings:** 20-50 kB depending on images
- [ ] Audit assets/ folder
- [ ] Convert to WebP
- [ ] Add srcset for responsive images

---

## 5. Optimization Targets by Page

### Auth Pages (Login/Register)
- **Current:** Download full app bundle (charts + UI library)
- **Optimize:** Lazy-load dashboard components
- **Impact:** 80-120 kB reduction for new users

### Dashboard (User Wallet)
- **Current:** All charts + UI loaded upfront
- **Optimize:** Progressive load of chart components
- **Impact:** 20-30 kB initial, stream rest as needed

### Payment Flows
- **Current:** Full store + form library loaded
- **Optimize:** Code-split form pages per flow
- **Impact:** 15-20 kB reduction

---

## 6. Monitoring & Metrics

### Before Optimization
- **Total Gzipped:** ~390 kB
- **First Contentful Paint (FCP):** ~2-3s (estimate)
- **Largest Contentful Paint (LCP):** ~4-5s (estimate)
- **Time to Interactive (TTI):** ~5-6s (estimate)

### After Optimization (Target)
- **Total Gzipped:** ≤280 kB (28% reduction)
- **FCP:** ~1.2-1.5s
- **LCP:** ~2.5-3s
- **TTI:** ~3-4s

### Measurement Commands

**Build size:**
```bash
npm run build
du -sh dist/
```

**Measure page load times (Chrome DevTools):**
- Open Performance tab
- Reload page
- Check FCP, LCP, TTI metrics

**Track over time:**
```bash
# After each optimization
date >> performance.log
du -sh dist/ >> performance.log
```

---

## 7. Recommended Implementation Order

1. **Dynamic Chart Loading** → 100 kB savings (5 min) ⭐ START HERE
2. **Bundle Analysis Setup** → Visualize remaining opportunities (3 min)
3. **UI Code-Splitting** → 30 kB savings (15 min)
4. **CSS Purging** → 7 kB savings (10 min)
5. **Image Optimization** → 20-50 kB savings (20 min)

**Total Time:** ~50 minutes  
**Total Savings:** ~150-200 kB gzipped (40-50% reduction)

---

## 8. Future Considerations

- **HTTP/2 Server Push** → Preload critical resources
- **Service Worker** → Cache assets for instant repeat visits
- **Dynamic Imports** → Load localization, themes on-demand
- **Compression:** Brotli instead of gzip (saves ~20%)
- **CDN + Edge Caching** → Reduce latency (Vercel already does this)

---

**Next Step:** Start with Priority 1 (Dynamic Chart Loading) for quick wins.
