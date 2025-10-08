# 🚀 Quick Deploy to Hostinger VPS
## Target: https://conhecendotudo.online/cigarinfoai

---

## ⚡ Fastest Method: Automated Script (Recommended)

```bash
cd cigar-website
./deploy-hostinger.sh
```

**What it does:**
1. Packages all files
2. Uploads to your VPS
3. Extracts to correct location
4. Sets permissions
5. Tests deployment

**You'll be asked for:**
- VPS IP address
- SSH username (usually `root`)
- Password

**That's it!** Your site will be live in < 2 minutes.

---

## 📁 Manual Method: SFTP (FileZilla)

### Step 1: Connect to VPS

**FileZilla Settings:**
- **Host:** `sftp://YOUR_VPS_IP`
- **Username:** Your Hostinger username
- **Password:** Your VPS password
- **Port:** 22

### Step 2: Navigate to Directory

Remote side (right panel):
```
/home/YOUR_USERNAME/public_html/
```

Create folder: **`cigarinfoai`**

### Step 3: Upload Files

**Local side** (left panel): Navigate to `cigar-website/`

**Drag and drop** these files to remote `cigarinfoai/` folder:
- ✅ `index.html`
- ✅ `.htaccess`
- ✅ `assets/` (entire folder)

### Step 4: Set Permissions

Right-click each → **File permissions**:
- Files: **644**
- Folders: **755**

### Step 5: Test

Visit: **https://conhecendotudo.online/cigarinfoai**

---

## 🔧 SSH Method (Command Line)

```bash
# 1. Package files
cd /Users/mvneves/dev/MOBILE/new-cigar-info-app
tar -czf cigar.tar.gz cigar-website/

# 2. Upload to VPS
scp cigar.tar.gz YOUR_USERNAME@YOUR_VPS_IP:/tmp/

# 3. SSH into VPS
ssh YOUR_USERNAME@YOUR_VPS_IP

# 4. Extract files
cd /home/YOUR_USERNAME/public_html/
mkdir -p cigarinfoai
cd cigarinfoai
tar -xzf /tmp/cigar.tar.gz --strip-components=1
rm /tmp/cigar.tar.gz

# 5. Set permissions
chmod 644 index.html .htaccess
chmod 755 assets assets/images
chmod 644 assets/images/*

# 6. Test
curl https://conhecendotudo.online/cigarinfoai/
```

---

## ✅ Post-Deployment Checklist

After uploading, verify:

- [ ] Visit: `https://conhecendotudo.online/cigarinfoai`
- [ ] All images load correctly
- [ ] Page is mobile-responsive
- [ ] HTTPS is working (green padlock)
- [ ] No broken links

---

## 🐛 Quick Troubleshooting

### Images Not Loading?
```bash
ssh YOUR_USERNAME@YOUR_VPS_IP
cd /home/YOUR_USERNAME/public_html/cigarinfoai
chmod 644 assets/images/*
```

### 404 Error?
```bash
# Check if files exist
ls -la /home/YOUR_USERNAME/public_html/cigarinfoai/
```

### .htaccess Not Working?
```bash
# Enable mod_rewrite
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## 📝 Important Notes

1. **Update App Store URL** after deployment:
   - Edit `index.html` line 675
   - Replace placeholder with real App Store link

2. **Web root path** varies by Hostinger plan:
   - Most common: `/home/USERNAME/public_html/`
   - Alternative: `/var/www/html/`

3. **Permissions** matter:
   - Files: 644 (read by everyone, write by owner)
   - Folders: 755 (executable by everyone)

---

## 🎯 Your Live URL

Once deployed, your landing page will be at:

**https://conhecendotudo.online/cigarinfoai**

---

**Need detailed instructions?** See `HOSTINGER_DEPLOY.md`

**Ready to deploy?** Run: `./deploy-hostinger.sh`
