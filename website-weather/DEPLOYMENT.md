# Deployment Guide - Cigar Info Landing Page

## 🚀 One-Click Deployments

### Vercel (Recommended)

**Why Vercel?**
- ✅ Free tier (perfect for landing pages)
- ✅ Automatic HTTPS
- ✅ Global CDN (fast worldwide)
- ✅ Instant deployments (< 1 minute)
- ✅ Custom domain support

**Deploy Now:**
```bash
cd cigar-website
npx vercel deploy --prod
```

**First Time Setup:**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel deploy --prod`
4. Follow prompts to configure project

**Custom Domain:**
```bash
vercel domains add yourdomain.com
# Follow DNS instructions
```

---

### Netlify

**Why Netlify?**
- ✅ Free tier with generous limits
- ✅ Easy drag-and-drop deployment
- ✅ Form handling built-in
- ✅ Split testing (A/B tests)
- ✅ Analytics included

**Deploy Now:**
```bash
cd cigar-website
npm install -g netlify-cli
netlify deploy --prod
```

**Drag & Drop:**
1. Visit https://app.netlify.com
2. Drag `cigar-website` folder to deploy zone
3. Configure custom domain in settings

---

### GitHub Pages

**Why GitHub Pages?**
- ✅ Free with GitHub account
- ✅ Simple setup
- ✅ Version control integration
- ✅ Jekyll support (optional)

**Setup:**
1. Push to GitHub repo
2. Repository Settings → Pages
3. Source: Select branch and folder
4. Custom domain: Add CNAME record

**Custom Domain Configuration:**
```bash
# In GitHub Pages settings:
# 1. Add custom domain: cigarinfo.app
# 2. Add DNS records at your domain registrar:
#
# Type    Name    Value
# A       @       185.199.108.153
# A       @       185.199.109.153
# A       @       185.199.110.153
# A       @       185.199.111.153
# CNAME   www     yourusername.github.io
```

---

### Cloudflare Pages

**Why Cloudflare Pages?**
- ✅ Free unlimited bandwidth
- ✅ Global CDN (Cloudflare's network)
- ✅ Web Analytics included
- ✅ DDoS protection
- ✅ Built-in redirects/headers

**Deploy:**
1. Visit https://pages.cloudflare.com
2. Connect GitHub repo
3. Configure build settings:
   - Build command: (leave empty)
   - Build output directory: `cigar-website`
4. Deploy

---

## 📋 Pre-Deployment Checklist

### Critical Items
- [ ] Update App Store URL (line 675 in index.html)
- [ ] Add real App Store link (replace placeholder)
- [ ] Test all CTAs and buttons
- [ ] Verify all images load correctly
- [ ] Test mobile responsiveness (iOS Safari, Android Chrome)

### Performance Testing
- [ ] Run Lighthouse audit (target: 95+)
  ```bash
  # Chrome DevTools → Lighthouse → Generate Report
  ```
- [ ] Test Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Test on slow 3G connection
- [ ] Verify image optimization

### SEO & Analytics
- [ ] Add Google Analytics tracking ID
  ```html
  <!-- Add before </head> -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>
  ```
- [ ] Submit sitemap to Google Search Console
- [ ] Verify Open Graph tags
- [ ] Test social media previews (Facebook, Twitter, LinkedIn)

### Accessibility
- [ ] Test with VoiceOver (iOS)
- [ ] Test with TalkBack (Android)
- [ ] Verify keyboard navigation
- [ ] Check color contrast ratios (WCAG AA)
- [ ] Validate HTML (https://validator.w3.org)

### Browser Testing
- [ ] Chrome (desktop & mobile)
- [ ] Safari (desktop & iOS)
- [ ] Firefox
- [ ] Edge
- [ ] Samsung Internet (Android)

---

## 🎯 Post-Deployment Tasks

### Immediate (Day 1)
1. **Verify deployment**
   - Visit live URL
   - Test all CTAs
   - Verify images load
   - Check mobile view

2. **Set up monitoring**
   - Google Analytics
   - Google Search Console
   - Uptime monitoring (UptimeRobot, Pingdom)

3. **Test conversions**
   - Click App Store buttons
   - Verify download tracking
   - Test form submissions (if any)

### Week 1
1. **SEO Setup**
   - Submit sitemap to Google
   - Add site to Bing Webmaster Tools
   - Create Google My Business listing

2. **Social Media**
   - Share on Twitter
   - Post on Product Hunt
   - LinkedIn announcement
   - Reddit (r/cigars, r/SideProject)

3. **Analytics Review**
   - Check traffic sources
   - Review bounce rate
   - Analyze conversion funnel
   - Identify drop-off points

### Ongoing
1. **A/B Testing**
   - Test different headlines
   - Try alternative CTAs
   - Experiment with screenshot order
   - Test pricing/positioning

2. **Performance Monitoring**
   - Weekly Lighthouse audits
   - Monitor Core Web Vitals
   - Track page load times
   - Review error logs

3. **Content Updates**
   - Update testimonials
   - Add new screenshots
   - Refresh seasonal messaging
   - Update stats/metrics

---

## 🔧 Troubleshooting

### Images Not Loading
**Problem:** Screenshots don't appear after deployment

**Solution:**
- Check file paths are relative (`assets/images/` not `/assets/images/`)
- Verify filenames match exactly (case-sensitive)
- Check image files were uploaded to deployment

### Slow Page Load
**Problem:** LCP > 2.5s

**Solutions:**
- Compress images (use TinyPNG, ImageOptim)
- Add `loading="lazy"` to images below fold
- Inline critical CSS (already done)
- Remove unused CSS/JS

### Mobile Layout Broken
**Problem:** Design breaks on mobile

**Solutions:**
- Test with Chrome DevTools mobile emulator
- Add viewport meta tag (already included)
- Check media queries (already responsive)
- Test on real devices

### App Store Button Not Working
**Problem:** Download button doesn't work

**Solutions:**
- Update placeholder URL on line 675
- Verify App Store link is correct format
- Test on iOS device (App Store opens in-app)
- Check for typos in URL

---

## 📊 Analytics Setup

### Google Analytics 4

1. **Create Property**
   - Visit https://analytics.google.com
   - Create new GA4 property
   - Get Measurement ID (G-XXXXXXXXXX)

2. **Add Tracking Code**
   ```html
   <!-- Add before </head> in index.html -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

3. **Track Events**
   ```javascript
   // Track CTA clicks
   document.querySelectorAll('.btn-primary').forEach(btn => {
     btn.addEventListener('click', () => {
       gtag('event', 'cta_click', {
         'event_category': 'engagement',
         'event_label': btn.textContent
       });
     });
   });
   ```

### Google Search Console

1. **Add Property**
   - Visit https://search.google.com/search-console
   - Add property with domain
   - Verify ownership (DNS TXT record or HTML file)

2. **Submit Sitemap**
   ```bash
   # Create simple sitemap.xml
   https://yourdomain.com/
   ```

3. **Monitor**
   - Check indexing status
   - Review search queries
   - Analyze click-through rates
   - Fix crawl errors

---

## 🎨 Brand Assets

### Download Badges

**Apple App Store:**
```html
<a href="YOUR_APP_STORE_URL">
  <img src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us"
       alt="Download on the App Store" />
</a>
```

**Google Play (Future):**
```html
<a href="YOUR_PLAY_STORE_URL">
  <img src="https://play.google.com/intl/en_us/badges/images/generic/en_badge_web_generic.png"
       alt="Get it on Google Play" />
</a>
```

### Social Media

**Facebook/LinkedIn OG Image:**
- Dimensions: 1200x630px
- Format: JPG or PNG
- Max file size: 8MB
- Location: `/assets/og-image.jpg`

**Twitter Card:**
- Dimensions: 1200x675px
- Format: JPG or PNG
- Max file size: 5MB

---

## 📈 Growth Hacks

### 1. Product Hunt Launch
- Schedule for Tuesday-Thursday (best traffic)
- Prepare hunter or hunt yourself
- Create compelling tagline
- Engage with comments all day
- Offer launch discount/deal

### 2. Reddit Strategy
- r/cigars - Share app authentically
- r/SideProject - Indie maker story
- r/iOSBeta - Beta testers wanted
- r/apps - App showcase

**Rules:**
- Don't spam
- Provide value first
- Be authentic
- Respond to comments
- Follow subreddit rules

### 3. Email Outreach
Target tech bloggers and cigar publications:
- TechCrunch
- The Verge
- Cigar Aficionado
- Cigar Journal

**Template:**
```
Subject: First AI cigar authenticity app launches

Hi [Name],

I'm reaching out because I built something your readers might find interesting:
the first AI-powered cigar app that verifies authenticity.

The counterfeit cigar market is $1B+, and collectors have no way to verify
what they're buying. Cigar Info uses GPT-5 and Gemini 2.5 to analyze visual
markers and detect fakes.

Would you be interested in covering this? Happy to provide beta access,
screenshots, or answer questions.

Best,
[Your Name]
```

---

## 🔐 Security Headers

Already configured in `vercel.json` and `netlify.toml`:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### SSL/HTTPS
- Vercel/Netlify provide free SSL automatically
- GitHub Pages provides free SSL for custom domains
- Cloudflare Pages includes SSL by default

---

## 💰 Costs

### Free Tier Limits

| Platform | Free Limits | Upgrade Cost |
|----------|-------------|--------------|
| **Vercel** | 100GB bandwidth/month | $20/mo (Pro) |
| **Netlify** | 100GB bandwidth/month | $19/mo (Pro) |
| **GitHub Pages** | 100GB/month, 10 builds/hr | Free (with GitHub) |
| **Cloudflare Pages** | Unlimited bandwidth | $0 (always free) |

**Recommendation:** Start with Vercel or Cloudflare Pages (both free, excellent performance).

---

## 📞 Support

### Deployment Issues
- **Vercel:** https://vercel.com/docs
- **Netlify:** https://docs.netlify.com
- **GitHub Pages:** https://docs.github.com/pages

### Questions?
Email: support@cigarinfo.app

---

**Ready to deploy?** Run:
```bash
cd cigar-website
npx vercel deploy --prod
```

🎉 **Your landing page will be live in < 1 minute!**
