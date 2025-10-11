# Weather Sunscreen Deployment Fix

## Problem Identified

The deployment is failing with **HTTP 404** because the **Caddyfile is missing handlers** for `/weathersunscreen/` and `/weathersuncreen/` (typo alias).

The files are correctly uploaded to `/home/claude/public_html/weathersunscreen/` by the deployment script, but Caddy doesn't know to serve them because there's no route configuration.

## Solution

The updated `Caddyfile.new` in this directory now includes the necessary handlers. You need to:

1. Upload the new Caddyfile to the VPS
2. Reload the Caddy service

## Step-by-Step Fix

### Option 1: Automated Fix (Recommended)

Run this command from your local machine:

```bash
# Upload updated Caddyfile
scp website-weather/Caddyfile.new megasena-vps:/etc/caddy/Caddyfile

# Reload Caddy (method 1 - reload config without downtime)
ssh megasena-vps "sudo caddy reload --config /etc/caddy/Caddyfile"

# OR method 2 - restart service (brief downtime)
ssh megasena-vps "sudo systemctl reload caddy"
```

### Option 2: Manual Fix (if SSH from this machine fails)

1. **Copy the Caddyfile content** from `website-weather/Caddyfile.new`

2. **SSH into the VPS** from another terminal:
   ```bash
   ssh claude@212.85.2.24
   # OR
   ssh megasena-vps
   ```

3. **Edit the Caddyfile**:
   ```bash
   sudo nano /etc/caddy/Caddyfile
   ```

4. **Add these handlers** after the `/cigarinfoai` section (around line 106):

   ```caddyfile
   # Weather Sunscreen App - Landing page
   handle /weathersunscreen/* {
       root * /home/claude/public_html/weathersunscreen
       uri strip_prefix /weathersunscreen
       file_server
   }

   handle_path /weathersunscreen {
       redir * /weathersunscreen/
   }

   # Weather Sunscreen App - Typo alias (weathersuncreen)
   handle /weathersuncreen/* {
       root * /home/claude/public_html/weathersuncreen
       uri strip_prefix /weathersuncreen
       file_server
   }

   handle_path /weathersuncreen {
       redir * /weathersuncreen/
   }
   ```

5. **Save and exit** (Ctrl+O, Enter, Ctrl+X)

6. **Reload Caddy**:
   ```bash
   sudo caddy reload --config /etc/caddy/Caddyfile
   # OR
   sudo systemctl reload caddy
   ```

### Option 3: Complete Redeploy (if files are missing)

If the files weren't uploaded properly, run the deployment script again AFTER fixing the Caddyfile:

```bash
cd website-weather
./deploy-weathersunscreen-auto.sh
```

## Verification

After applying the fix, test these URLs:

1. **Main URL**: https://conhecendotudo.online/weathersunscreen/
2. **Typo alias**: https://conhecendotudo.online/weathersuncreen/

Both should return **HTTP 200** and display the landing page.

### Quick verification commands:

```bash
# Check HTTP status
curl -I https://conhecendotudo.online/weathersunscreen/

# View full page
curl https://conhecendotudo.online/weathersunscreen/
```

## What Changed

### Added to Caddyfile (lines 108-128):

```caddyfile
# Weather Sunscreen App - Landing page
handle /weathersunscreen/* {
    root * /home/claude/public_html/weathersunscreen
    uri strip_prefix /weathersunscreen
    file_server
}

handle_path /weathersunscreen {
    redir * /weathersunscreen/
}

# Weather Sunscreen App - Typo alias (weathersuncreen)
handle /weathersuncreen/* {
    root * /home/claude/public_html/weathersuncreen
    uri strip_prefix /weathersuncreen
    file_server
}

handle_path /weathersuncreen {
    redir * /weathersuncreen/
}
```

This configuration:
- Serves files from `/home/claude/public_html/weathersunscreen/`
- Strips `/weathersunscreen` from the URL path
- Redirects `/weathersunscreen` (no trailing slash) to `/weathersunscreen/`
- Includes typo alias handling for common misspelling

## Troubleshooting

### If still getting 404:

1. **Verify files exist**:
   ```bash
   ssh megasena-vps "ls -la /home/claude/public_html/weathersunscreen/"
   ```

2. **Check Caddy logs**:
   ```bash
   ssh megasena-vps "sudo tail -f /var/log/caddy/conhecendotudo.log"
   ```

3. **Verify Caddy config syntax**:
   ```bash
   ssh megasena-vps "sudo caddy validate --config /etc/caddy/Caddyfile"
   ```

4. **Check Caddy service status**:
   ```bash
   ssh megasena-vps "sudo systemctl status caddy"
   ```

### If files are missing:

Re-run the deployment script:
```bash
cd website-weather
./deploy-weathersunscreen-auto.sh
```

## Current Status

- **Caddyfile.new**: Updated with handlers (ready to deploy)
- **Deployment script**: Working correctly (uploads files successfully)
- **Issue**: Caddy configuration on VPS needs update

## Next Steps

1. Apply one of the fix options above
2. Verify the site is accessible
3. Test all links and assets on the live page
4. Consider setting up automated Caddyfile deployment in the future
