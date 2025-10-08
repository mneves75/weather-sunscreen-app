# SSH Connection Troubleshooting

## Current Status
- ✅ Server is reachable (ping works)
- ❌ SSH connection timing out on port 22
- ✅ SSH config found: `megasena-vps` alias

## Test SSH Connection First

Open your terminal and run:

```bash
ssh megasena-vps
```

**If it connects:** Great! Then run the deployment script.

**If it times out:** See troubleshooting below.

---

## Quick Deployment (If SSH Works)

```bash
cd /Users/mvneves/dev/MOBILE/new-cigar-info-app/cigar-website
./DEPLOY_SSH_TEST.sh
```

This will:
1. Test SSH connection
2. Upload files via SSH pipe (no SCP needed)
3. Set permissions
4. Verify deployment

---

## Troubleshooting SSH Timeout

### 1. Check VPS Status
Login to Hostinger hPanel and verify:
- VPS is running
- SSH service is active

### 2. Check SSH Port
SSH might be on a custom port. Check Hostinger settings:
```bash
# If SSH uses port 2222 (example):
ssh -p 2222 megasena-vps
```

### 3. Check Firewall
Your VPS firewall might be blocking connections:
```bash
# Once connected via Hostinger panel:
sudo ufw status
sudo ufw allow 22/tcp
```

### 4. Alternative: Use Hostinger File Manager
If SSH doesn't work, use Hostinger's built-in file manager:

1. Login to Hostinger hPanel
2. Go to **File Manager**
3. Navigate to `/home/claude/public_html/`
4. Create folder: `cigarinfoai`
5. Upload these files:
   - `index.html`
   - `.htaccess`
   - `assets/` (folder with images)

---

## Manual Upload via SFTP (Alternative)

If SSH terminal doesn't work, try SFTP with FileZilla:

**Connection Settings:**
```
Protocol: SFTP
Host: 212.85.2.24
Port: 22 (or check Hostinger for custom port)
Username: claude
Key file: ~/.ssh/id_megasena_vps
```

---

## Deployment Archive Ready

If you need to upload manually, the archive is ready:

```bash
# Archive location:
/tmp/cigar-deploy.tar.gz (1.0MB)

# Contains:
- index.html
- .htaccess
- assets/ (all images)
```

---

## Next Steps

1. **Test SSH manually:**
   ```bash
   ssh megasena-vps
   ```

2. **If SSH works, run deployment:**
   ```bash
   cd /Users/mvneves/dev/MOBILE/new-cigar-info-app/cigar-website
   ./DEPLOY_SSH_TEST.sh
   ```

3. **If SSH doesn't work:**
   - Check SSH port in Hostinger
   - Use Hostinger File Manager
   - Use FileZilla SFTP

---

**Need immediate deployment?** Use Hostinger File Manager and upload the files manually. It's quick and reliable.
