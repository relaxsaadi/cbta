# Recovered Historical Platform Architecture Evidence

Recovered by ChatGPT on 2026-08-24 from the user's prior project transcripts / File Library. This is **historical evidence, not a current production attestation**. Every operational/security claim below must be reverified on the live system before it can satisfy a readiness gate.

## Historical architecture reported on 2026-08-19

The exam environment was described as:

- Moodle **5.0.1**
- Moodle running in Docker using `bitnamilegacy/moodle`
- MySQL **8.4**
- Nginx reverse proxy
- Let's Encrypt TLS
- Ubuntu **20.04**
- VPS / hosting reported as Hostarts, Algeria
- server sizing referenced in the same work: 4 vCPU, 8 GB RAM, 160 GB storage

At that time, the Moodle application was not maintained as a normal local source repository; the Moodle core lived inside the Docker image. Customization levers described were Moodle theme/configuration/plugins rather than editing core files.

## Historical functions confirmed as already present

The prior platform diagnostic reported these Moodle-native capabilities as operational at that time:

- authentication
- Moodle Quiz examination engine
- question-bank categories
- gradebook / exam reports
- native Moodle audit logs (`Rapports > Journaux`)

These are historical observations only; they do not replace a current functional test.

## Historical security/operations observations

As of the recovered 2026-08-19 diagnostic:

- HTTPS/TLS: reported configured with Let's Encrypt / automatic renewal
- audit trail: Moodle native logs reported available
- admin server access: reported SSH-key based rather than password based
- load test: reported successful with **0 failures / 800 requests / 50 concurrent users**
- automated backups: explicitly reported **NOT configured** at that time

Therefore, no current readiness report may claim backup readiness unless a current backup + restore path is newly evidenced.

## Architecture implication

The earlier readiness report's statement that nothing is known about the platform architecture is too strong. Historical architecture evidence exists and should guide discovery/testing.

However, this file does **not** solve the live-access blocker. The current coding environment still needs one of the following before it can audit/fix the live runtime directly:

- live server access already present on the user's machine and discoverable after reload/reconnection; or
- the actual current deployment/repository location; or
- owner-supplied access to the hosting/runtime if it is not already available locally.

Do not ask for passwords in chat. Prefer existing SSH keys, existing authenticated control-panel sessions, or least-privilege access.

## Safe next discovery steps for Claude Code

1. Read this file before declaring the platform architecture unknown.
2. Search local command history/project transcripts for Hostarts / Docker / Moodle commands and deployment paths.
3. Check whether an existing authenticated browser/control-panel session can reach the Hostarts/VPS dashboard without requesting credentials.
4. Check Docker contexts, shell history, VS Code Remote/SSH history, terminal history and known local deployment scripts for a route to the server — without exposing secrets into Git.
5. If access is recovered, reverify versions/configuration live before using this historical evidence as a passed gate.
6. Specifically reverify backups; historical state was “not configured”.
