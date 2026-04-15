# Alert System - Complete Implementation Guide

## 🚨 Overview

The alert system provides **production-grade monitoring alerts** with:

- ✅ **Email alerts** (SMTP-based, HTML formatted)
- ✅ **Slack alerts** (rich formatting via webhooks)
- ✅ **SMS alerts** (Twilio-based, optional)
- ✅ **Smart state tracking** (prevents duplicate alerts)
- ✅ **Cooldown enforcement** (configurable per monitor)
- ✅ **Alert history & audit trail** (every alert logged)
- ✅ **User preferences** (enable/disable per channel per monitor)
- ✅ **Global thresholds** (response time, consecutive failures, etc.)

---

## 📊 Architecture

```
Monitoring Engine (DNS→TCP→HTTP)
    ↓ CheckResult
    ↓
AlertService.send_alert()
    ├─ Load monitor state (previous status)
    ├─ Detect state changes (UP→DOWN, etc.)
    ├─ Apply business rules:
    │  ├─ User preferences (enable/disable alerts)
    │  ├─ Cooldown (don't spam same alert)
    │  └─ Thresholds (global config)
    ├─ Send notifications:
    │  ├─ EmailNotifier
    │  ├─ SlackNotifier
    │  └─ SMSNotifier
    └─ Update state & log history
```

---

## 🔧 Configuration

### 1. Email Alerts

Set in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASSWORD=your-app-password
ALERT_FROM_EMAIL=alerts@yourdomain.com
```

**Gmail-specific:**
- Use [App Password](https://support.google.com/accounts/answer/185833) (not your main password)
- Don't use 2FA directly in SMTP

**Other providers:**
- SendGrid: `SMTP_HOST=smtp.sendgrid.net`, `SMTP_USER=apikey`, `SMTP_PASSWORD=your-key`
- Office365: `SMTP_HOST=smtp.office365.com`, `SMTP_PORT=587`

### 2. Slack Alerts

Create a Slack Webhook:
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create New App → From scratch
3. Enable "Incoming Webhooks" → Add New Webhook to Workspace
4. Copy webhook URL

Set alert preferences via API:
```bash
POST /alerts/preferences
{
  "monitor_id": 1,
  "enable_slack": true,
  "slack_webhook_url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
}
```

### 3. SMS Alerts (Optional)

Install Twilio:
```bash
pip install twilio
```

Set in `.env`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_FROM=+1234567890
```

Set alert preferences via API:
```bash
PUT /alerts/preferences/1
{
  "enable_sms": true,
  "sms_phone_number": "+1987654321"
}
```

---

## 🎯 Alert Rules (Business Logic)

### When Alerts Are Sent

1. **Status Change Detected**: Previous ≠ Current
2. **User Preferences**: Enabled for this channel & status
3. **Cooldown Passed**: Enough time since last alert (default: 30 min)
4. **Global Alerts Enabled**: Not globally disabled

### Status Mapping

| Status | Alert Severity | Typical Message |
|--------|----------------|-----------------|
| UP ✅ | info | "Service has recovered" |
| DEGRADED ⚠️ | warning | "Response slow (>5s)" or "Invalid SSL cert" |
| DOWN 🚨 | critical | "All checks failed" |

### Example: Alert Lifecycle

```
Check Result: UP → DOWN
  ↓
State Check: Was UP, now DOWN? YES
  ↓
Preference Check: User enabled DOWN alerts? YES
  ↓
Cooldown Check: Last alert 45 mins ago? YES (cooldown is 30 mins)
  ↓
Global Check: Alerts not globally disabled? YES
  ↓
✅ SEND ALERT via all enabled channels
  ├─ Email sent ✅
  ├─ Slack sent ✅
  └─ SMS sent ✅
  ↓
Update state: last_alert_sent_at = now, last_alert_status = DOWN
```

---

## 🔗 Integration Points

### 1. In Scheduler (Automatic)

The scheduler automatically triggers alerts for every check:

```python
# app/scheduler.py
check_result = MonitoringEngine.run_full_check(monitor.url)
alert_sent = AlertService.send_alert(db, monitor.id, check_result)
```

30-second check interval by default (configurable in `app/scheduler.py`).

### 2. In Celery Tasks (Distributed)

For distributed/parallel monitoring:

```python
# app/worker/tasks.py
check_result = MonitoringEngine.run_full_check(monitor.url)
alert_sent = AlertService.send_alert(db, monitor.id, check_result)
```

Triggered by Celery Beat every 5 minutes (configurable in `app/worker/beat_schedule.py`).

### 3. Manual Alert (API)

Manually trigger an alert for testing:

```bash
POST /alerts/test-email/1
POST /alerts/test-slack/1
```

---

## 📡 API Endpoints

### Alert Preferences

```bash
# Get preferences for a monitor
GET /alerts/preferences/{monitor_id}

# Create preferences
POST /alerts/preferences
{
  "monitor_id": 1,
  "enable_email": true,
  "enable_slack": false,
  "email_address": "user@example.com",
  "alert_on_down": true,
  "alert_on_degraded": true,
  "alert_on_recovery": true,
  "alert_cooldown_seconds": 1800
}

# Update preferences
PUT /alerts/preferences/{monitor_id}
{
  "enable_slack": true,
  "slack_webhook_url": "https://hooks.slack.com/..."
}

# Delete preferences (revert to defaults)
DELETE /alerts/preferences/{monitor_id}
```

### Alert History

```bash
# Get all alerts
GET /alerts/history

# Get alerts for specific monitor
GET /alerts/history?monitor_id=1&limit=50

# Get specific alert
GET /alerts/history/{alert_id}

# Acknowledge alert
POST /alerts/acknowledge
{
  "alert_history_id": 42,
  "note": "Investigating issue"
}

# Resolve alert
POST /alerts/resolve/{alert_id}
```

### Global Thresholds

```bash
# Get thresholds
GET /alerts/thresholds

# Update thresholds
PUT /alerts/thresholds
{
  "response_time_threshold_ms": 5000,
  "consecutive_failures_threshold": 3,
  "alert_cooldown_seconds": 1800,
  "alerts_enabled": true
}
```

### Testing

```bash
# Send test email
POST /alerts/test-email/{monitor_id}

# Send test Slack message
POST /alerts/test-slack/{monitor_id}
```

---

## 💾 Database Schema

### `alert_preferences`
Stores user notification settings per monitor.

| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| monitor_id | int | Foreign key to monitor |
| enable_email | bool | Email enabled? |
| enable_slack | bool | Slack enabled? |
| enable_sms | bool | SMS enabled? |
| email_address | str | Recipient email |
| slack_webhook_url | str | Webhook URL |
| sms_phone_number | str | Phone number |
| alert_on_down | bool | Alert on DOWN? |
| alert_on_degraded | bool | Alert on DEGRADED? |
| alert_on_recovery | bool | Alert on UP/recovery? |
| alert_cooldown_seconds | int | Min time between alerts |

### `monitor_states`
Tracks current state for change detection.

| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| monitor_id | int | Foreign key to monitor |
| previous_status | str | Last known status |
| state_started_at | datetime | When state began |
| consecutive_failures | int | Failure count |
| last_alert_sent_at | datetime | Last alert timestamp |
| last_alert_status | str | What we last alerted about |

### `alert_history`
Audit log: every alert ever sent.

| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| monitor_id | int | Foreign key to monitor |
| previous_status | str | Status before change |
| current_status | str | Status after change |
| alert_status | str | triggered, acknowledged, resolved |
| message | str | Human-readable alert message |
| channels_triggered | json | ["email", "slack"] etc. |
| check_details | json | Error, response_time, etc. |
| triggered_at | datetime | When alert was sent |
| acknowledged_at | datetime | When user acknowledged |
| resolved_at | datetime | When issue resolved |

### `alert_thresholds`
Global alert configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | int | Primary key |
| response_time_threshold_ms | float | DEGRADED threshold (5000ms default) |
| consecutive_failures_threshold | int | Escalation threshold (3 default) |
| alert_cooldown_seconds | int | Global cooldown (1800s default) |
| alerts_enabled | bool | Master enable/disable |

---

## 🧪 Testing

### Send Test Email

```bash
curl -X POST http://localhost:8000/alerts/test-email/1
```

Response:
```json
{
  "message": "Test email sent to user@example.com"
}
```

### Send Test Slack

```bash
curl -X POST http://localhost:8000/alerts/test-slack/1
```

### Check Alert History

```bash
curl http://localhost:8000/alerts/history?monitor_id=1&limit=10
```

---

## 🛠️ Customization

### Modify Alert Messages

Edit `EmailNotifier._format_email_body()` in `app/alerts/notifiers.py` to customize:
- Email subject line
- HTML template
- Color scheme
- Footer text

### Modify Slack Formatting

Edit `SlackNotifier._format_slack_message()` to customize:
- Block structure
- Status colors
- Emoji
- Message fields

### Modify Alert Triggers

Edit `AlertService._should_send_alert()` to customize:
- Cooldown logic
- Preference checks
- Status mappings

### Add New Notification Channel

1. Create new notifier class in `notifiers.py`:
```python
class TelegramNotifier:
    @staticmethod
    def send(chat_id: str, ...):
        # Send to Telegram API
        pass
```

2. Add to `NotificationChannel` enum in `models.py`

3. Update `AlertService._send_notifications()` to call it

4. Add schema fields to `AlertPreference` model

---

## 📈 Monitoring the Alert System

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Emails not sending | SMTP creds wrong | Check `.env` settings, test with `/test-email` |
| Too many alerts | Cooldown too short | Increase `alert_cooldown_seconds` |
| No alerts sent | Preferences disabled | Check `GET /alerts/preferences/{id}` |
| Slack webhook error | Invalid URL | Regenerate webhook, test with `/test-slack` |

### Debug Logging

Enable debug logs:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

Production logs will show:
```
✅ Alert sent for monitor 1 | Channels: email, slack
⚠️  Email notifier: SMTP credentials not configured
💬 Slack notification sent for https://example.com
```

---

## 🚀 Performance Considerations

- **State queries**: O(1) per monitor (indexed by monitor_id)
- **Alert history**: Truncated to 50 most recent by default
- **Notification sending**: Non-blocking (runs in parallel via Celery)
- **Cooldown check**: In-memory, sub-millisecond

For 1000+ monitors in production:
- Store monitor_state in Redis for instant lookups
- Send notifications via Celery async tasks
- Archive old alert history weekly

---

## 📝 Example: Complete Alert Workflow

```python
# 1. Monitor is checked
check_result = MonitoringEngine.run_full_check("https://api.example.com")
# → CheckStatus.DOWN (DNS failed)

# 2. Alert service processes it
AlertService.send_alert(db, monitor_id=5, check_result=check_result)
# → Detects: Was UP, now DOWN
# → Loads preferences: email enabled, Slack disabled
# → Loads state: last alert 2 hours ago (within cooldown)
# → Decides: SEND
# → Sends email to user@example.com

# 3. User receives email
# Subject: 🚨 H.O.M.E Alert: DOWN — https://api.example.com
# Body: HTML with status change, error details, timestamps

# 4 User can acknowledge in API
POST /alerts/acknowledge
{ "alert_history_id": 42 }

# 5. Alert history shows entire lifecycle
GET /alerts/history/42
{
  "id": 42,
  "monitor_id": 5,
  "previous_status": "UP",
  "current_status": "DOWN",
  "alert_status": "acknowledged",
  "triggered_at": "2024-04-14T10:30:00Z",
  "acknowledged_at": "2024-04-14T10:35:00Z",
  "channels_triggered": ["email"]
}
```

---

## 🎓 Key Concepts

- **State Change**: Alert only on transitions (UP→DOWN, DOWN→UP, etc.)
- **Cooldown**: Prevent alert spam - don't resend same alert twice within window
- **Preferences**: User controls what channels + what status types trigger alerts
- **Thresholds**: Global config for when DEGRADED status is triggered
- **Channels**: Multiple ways to notify (email, Slack, SMS)
- **History**: Audit trail for compliance, debugging, analytics

---

## 🔗 Related Files

- `app/alerts/models.py` - Database schemas
- `app/alerts/schemas.py` - Pydantic validators
- `app/alerts/service.py` - Core alert logic
- `app/alerts/notifiers.py` - Email/Slack/SMS handlers
- `app/routes/alerts.py` - API endpoints
- `app/scheduler.py` - Integration with monitoring
- `app/worker/tasks.py` - Celery task integration

---

**Status**: ✅ Complete & production-ready
**Last Updated**: April 14, 2026
