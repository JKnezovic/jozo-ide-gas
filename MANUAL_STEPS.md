# Manual steps

Things the code changes can't do for you. Nothing here is needed until you're ready to
deploy — do it all in one go after the updates are finished.

---

## 1. Put the API key on the server  — REQUIRED, app breaks without it

The backend now rejects every write (`POST`/`PUT`/`PATCH`/`DELETE`) unless it carries a
matching `X-Api-Key` header. It **fails closed**: with no key configured, writes return
`503` and log `API_KEY is not configured`.

A key was already generated into `backend/jozo-ide-gas/src/main/resources/.env`. Read it
with:

```bash
grep API_KEY backend/jozo-ide-gas/src/main/resources/.env
```

**There is nothing to edit on the server.** This project ships its secrets *inside* the jar:
`.env` sits in `src/main/resources`, so Maven packages it to `BOOT-INF/classes/.env`, and
dotenv falls back to the classpath when no `.env` exists on disk. That is why EC2 has no
`.env` file next to the jar.

So the key travels with the build:

```bash
cd backend/jozo-ide-gas
./mvnw clean package -DskipTests
# then copy target/jozo-ide-gas-0.0.1-SNAPSHOT.jar to EC2 and restart the service
```

Confirm the key made it in, before uploading:

```bash
unzip -p target/jozo-ide-gas-0.0.1-SNAPSHOT.jar BOOT-INF/classes/.env | grep API_KEY
```

Two consequences worth knowing. The jar carries live credentials, so it should not be
shared or published anywhere. And a config change means a rebuild - there is no file on the
server to edit.

If you would rather set the key on the server instead, use a real environment variable in
whatever starts the service (a systemd `Environment=API_KEY=...` line, or an export before
`java -jar`). Spring reads OS environment variables too, and that sits alongside the jar's
bundled values. Do **not** drop a partial `.env` next to the jar: dotenv reads one file
only, so a filesystem `.env` replaces the bundled one wholesale and every other variable -
Mongo, SSL - would go missing.

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

## 5. Rebuild the website after the API URL change

The backend URL is no longer hardcoded in `src/api/axiosConfig.js`. It now comes from:

- `frontend/jozo-ide-gas/.env.development` -> `http://localhost:8080` (used by `npm start`)
- `frontend/jozo-ide-gas/.env.production` -> the live URL (used by `npm run build`)

The production value is identical to what was hardcoded, so nothing changes behaviourally,
but Create React App bakes these in **at build time**: the site must be rebuilt and
redeployed to pick the variable up. A production build was run locally to verify the URL
is embedded correctly, but `build/` is gitignored, so re-run `npm run build` on the
machine you deploy from and upload the result as usual.

If the backend ever moves, edit `.env.production` rather than the source. Neither file is
gitignored and neither holds a secret - only `.env*.local` is ignored, per CRA convention.

The mobile app works the same way via `JOZO_API_BASE_URL`, which defaults to the live URL
when unset, so you only need it to point a local build at your own machine.

## 6. Let the bucket serve videos publicly  — REQUIRED for video

Videos are stored under a new `VideosHQ/` prefix, alongside the existing `ImagesHQ/` and
`ImagesLQ/`. If the bucket policy grants public read per prefix rather than bucket-wide,
`VideosHQ/*` needs the same grant or every video will load as a 403 while photos keep
working. Check the bucket policy before concluding a video upload failed.

## 7. Check disk headroom on EC2 for large uploads

The upload limit moved from 200MB to 1GB per file (`application.properties`), because
phone video blows straight past 200MB. Spring buffers anything over 2KB to a temp file on
disk, so a 1GB upload needs ~1GB of free space on the instance while it is in flight. If
the instance has a small root volume, either keep videos short or lower
`spring.servlet.multipart.max-file-size` to something the disk can absorb.

Uploads also go to S3 in a single request rather than a multipart transfer, so a very large
video over a weak connection can be slow enough to time out. Short clips are the safer
shape here, especially uploading over carrier data mid-trip.

## 8. Only one trip may be ongoing

The new trip endpoints refuse to leave two trips in the `ongoing` state, because the
website renders the first ongoing trip it receives and a second one would silently become
invisible. If you have more than one ongoing trip in the database right now, the app will
report a conflict the first time you try to start a new one - mark the stale one done from
the Manage Trips screen and it clears.

To backfill an older trip while a current one is running, create it with status DONE.

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

### Check video playback end to end

Upload one short clip from the app, then open the trip on the website. The timeline tile
should show the first frame with a play badge, and clicking it should open a player. If the
tile is black and the player shows nothing, open the video url directly - a 403 means step
6, and a download prompt instead of playback means the object was stored with the wrong
content type.

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
