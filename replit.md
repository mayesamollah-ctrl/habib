# BADOL-BOT-V5

**Facebook Messenger Group Management Bot**
Developer: MOHAMMAD BADOL | Version: 5.2.1

## Project Overview

BADOL-BOT-V5 is a powerful Facebook Messenger bot built with Node.js and the `stfca` library. It supports 120+ commands and multiple events for group management, entertainment, AI, and more.

## Stack

- **Runtime:** Node.js 20.x
- **FB API:** stfca (Facebook login via appstate)
- **Web Server:** Express (for Render hosting + health checks)
- **Database:** file-based (database.json, data.json)

## Key Files

| ফাইল | কাজ |
|------|-----|
| `index.js` | Entry point — login + server start |
| `server.js` | Express web server (Render health check) |
| `BADOL-Main/badol.js` | Core bot logic, MQTT listener, command dispatcher |
| `BADOL-Main/logger.js` | Logging utility |
| `BADOL-Main/notick.js` | UI message templates |
| `Database.js` | File-based database |
| `config.json` | Bot configuration |
| `BADOL-Appstate.json` | Facebook session (DO NOT SHARE) |
| `MCS/Commands/` | 120+ command files |
| `MCS/Events/` | Event listener files |

## How to Run

```bash
node index.js
```

Requires `BADOL-Appstate.json` (Facebook session cookies) in the root folder.

## Hosting Options

### Render.com (Recommended for 24/7)
1. Push to GitHub
2. Connect GitHub repo on render.com → New Web Service
3. Build: `npm install` | Start: `node index.js`
4. Add env vars: `NODE_ENV=production`, `TZ=Asia/Dhaka`
5. Use UptimeRobot to ping `/ping` endpoint every 5 min

### Katabump
- Import repo, add `BADOL-Appstate.json`, run

### Replit (এখানে)
- Workflow: `BADOL-BOT-V5` → `node index.js`
- Bot চালু করতে workflow start করো

## Function Names (BADOL-BOT-V5)

| নতুন নাম | পুরনো নাম | কাজ |
|----------|----------|-----|
| `onStartBadol` | `onStart` | command execute |
| `onChatBadol` | `onChat` | প্রতিটা message |
| `onReplyBadol` | `onReply` | reply handler |
| `onReactionBadol` | `onReaction` | reaction handler |
| `onEventsBadol` | `onEvent` | group events |
| `onLoadBadol` | `onLoad` | initialization |

উভয় নামই কাজ করে — backward compatible।

## Creating New Commands

See `MCS/Commands/demo-command.js` for a full template with all functions explained in Bangla.

## Creating New Events

See `MCS/Events/demo-event.js` for a full event template.

## Important Notes

- `config.credit` must be `"MOHAMMAD BADOL"` — otherwise command won't load
- Owner ID hardcoded: `61591265887748` — do not change `OWNER_LOCK` in config.json
- `BADOL-Appstate.json` contains Facebook session — never share publicly
- GitHub token in `config.json` should be moved to environment variables

## User Preferences

- সব explanation বাংলায় দিতে হবে
- কোনো feature ভাঙা যাবে না
- Render + Katabump + GitHub তিনটাই support করতে হবে
