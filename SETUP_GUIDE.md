# IAYO App — Local Testing Guide (this version)

This is your latest export (with the new Public Contributions feature from
ChatGPT) with the same connection fixes applied as before. The `.env` files
are already pre-filled for **local testing on your own PC** — you shouldn't
need to edit them for now.

Note: this export does **not** include your old database (`pb_data`), so
PocketBase will start completely fresh — that's expected, not a bug.

## Every time you want to test the app, open 3 terminal windows:

**Terminal 1 — PocketBase (the database)**
```
cd apps\pocketbase
pocketbase.exe serve
```
(Remember: you need the Windows pocketbase.exe here, not the Linux file that
came in the zip — same as before.)

First time only: open http://127.0.0.1:8090/_/ and create your superuser
account (email + password). Then open `apps/api/.env` and fill in:
```
PB_SUPERUSER_EMAIL=<the email you just used>
PB_SUPERUSER_PASSWORD=<the password you just used>
```

**Terminal 2 — API**
```
cd apps\api
npm install
npm run dev
```

**Terminal 3 — Website**
```
cd apps\web
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

## Note on the `vault` folder
There's an empty `vault` folder at the top level — safe to ignore, it's not
used by anything yet.
