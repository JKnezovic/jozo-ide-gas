# Manual steps

Things the code changes can't do for you. Nothing here is needed until you're ready to
deploy — do it all in one go after the updates are finished.

---

## 1. Put the API key on the server  — REQUIRED, app breaks without it

The backend now rejects every write (`POST`/`PUT`/`PATCH`/`DELETE`) unless it carries a
matching `X-Api-Key` header. It **fails closed**: with no key configured, writes return
`503` and log `API_KEY is not configured`.

A key was generated into the local gitignored env file. Read it:

```bash
grep API_KEY backend/jozo-ide-gas/src/main/resources/.env
```

Add that same `API_KEY = <value>` line to the `.env` on EC2, then restart the service.

## 2. Put the same key in the Android build  — REQUIRED

```bash
cd mobileapp/jozo-ide-gas
eas secret:create --scope project --name JOZO_API_KEY --value <the key from step 1>
```

Then rebuild and sideload the APK as usual. For local `expo start`, a gitignored
`mobileapp/jozo-ide-gas/.env` containing `JOZO_API_KEY=<the key>` works instead.

If a build ends up with no key, the app logs `No API key in this build` on startup and
every upload/delete will come back `401`.

## 3. Deploy backend and APK together

The old APK sends no header, so it starts failing the moment the new backend is live.
Don't deploy the backend and leave the phone on the old build.

The public website is unaffected either way — it only ever issues `GET`s, and reads are
not guarded.

## 4. Lock the MongoDB Atlas allowlist to EC2

Separate from the API key, and worth doing regardless. In Atlas → Network Access, the
allowlist is often left at `0.0.0.0/0` (open to the internet), leaving your Mongo password
as the only thing protecting the data. Restrict it to the EC2 elastic IP, which is stable.

Do **not** try to allowlist your phone's IP anywhere — carrier IPs rotate constantly, are
shared across thousands of subscribers via CGNAT, and change country to country while
you're actually on a trip.

---

## Verification after deploying

```bash
# 1. Reads still work with no key at all -> expect 200
curl -i https://ec2.jozoidegas.ovh:8443/api/v1/trips/ongoing

# 2. Writes with no key are rejected -> expect 401
curl -i -X DELETE https://ec2.jozoidegas.ovh:8443/api/v1/rides/000000000000000000000000

# 3. Writes with the key get through -> expect 404, NOT 401
curl -i -X DELETE -H "X-Api-Key: <the key>" \
  https://ec2.jozoidegas.ovh:8443/api/v1/rides/000000000000000000000000
```

A `503` on steps 2–3 means the server has no `API_KEY` set — step 1 didn't take.

### Check the ride-delete fix against real data

Deleting a ride now also pulls its reference out of `TripData.rideIds`. This is the one
change that couldn't be verified locally, because it needs a live database. After
deploying, delete one ride from the app, then confirm in Atlas that the trip's `rideIds`
array shrank by one and holds no leftover entry for the deleted ride.

If the array is unchanged, the reference is being stored in a different shape than the
`$pull` expects — say so and it's a one-line fix.

---

## Known limits — existing data is not migrated

- **Descriptions already truncated at a comma stay truncated.** The text never reached the
  server, so there's nothing to recover. Re-enter those by hand if you want them back.
- **Photos uploaded before the S3 fix keep their old colliding keys.** New uploads get a
  unique prefix, but two *old* rides that share a filename like `IMG_0042.jpg` still share
  one S3 object — deleting either will still remove the other's photo. Only affects rides
  created before this deploy.
