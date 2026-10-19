# Current review: A5, 16 pages

The current `npm run brochure` generates **canny-heads-brochure-A5-screen.pdf** and **canny-heads-brochure-A5-print.pdf**, plus page-01.png through page-16.png. A3 generation is archived as `brochure/build-A3-archive.mjs` and is not the current deliverable.

A private owner photo uploader is running at the password-protected review URL plus `upload.html`. The isolated `cannyheads-review-upload.service` serves only the private photo inbox on localhost:4183. It imports no GetJobMe server or models, uses no MongoDB and sends no notifications. It reuses the existing pure upload validator and sharp image processing. New photos remain private under `review-inbox/`, excluded from git. Metadata is backed up before changes. Permanent GetJobMe gallery admin still requires its separately approved deployment.

The A5 brochure rebuild prioritises active private-inbox photos and published public gallery photos, then fills remaining slots with clearly labelled business illustrations/placeholders. Uploading does not itself publish or automatically rebuild the PDF; run the brochure build and review/update the proofs after selecting photos.

Updated name and number policy: PrimeGold – Gold Loan Software Solutions. As explicitly requested on 19 October, 93456 24009 is permitted for VENDOR enquiries in BigShopes/contact material only. Do not use it elsewhere or claim an automated VENDOR bot exists.

The older preparation notes below describe the original A3 version and remain useful for deployment safeguards.

---

# Canny Heads redesign — preview, not deployed

All new work is under this folder. GetJobMe gallery source is in `/root/getjobme-wt-gallery`, branch `feature/cannyheads-gallery`, based on `fa6afcd`. Do not start GetJobMe server.js here or in that worktree.

## Build and review

```sh
cd /root/cannyheads-redesign
npm ci
npm run build
npm run brochure
npm test
node review/check-admin.mjs
```

`npm test` starts and stops the isolated Canny Heads server itself on 127.0.0.1:4181. It blocks external network requests and mocks training/gallery APIs; no production data or messages.

Brochure output: `brochure/out/` (screen PDF, print proof, page-01.png … page-12.png). The brochure reuses `site/src/lib/content.mjs` and a dated tariff snapshot. Compare/update the snapshot from the live tariff source before future price edits. Counts are in `review/counts.json`; refresh with an explicitly read-only query before approval. Do not advertise raw employer-profile counts.

Latest published gallery images are fetched through the read-only API during `npm run brochure`. Until the new API is deployed, explicitly labelled illustrative layouts are used. To select published photos:

```sh
npm run brochure -- --photos=PHOTO_ID_1,PHOTO_ID_2
```

The brochure can be rebuilt after the owner publishes event photos. Review photo DPI before printing. An image chosen at an oversized crop can be insufficient even if its nominal dimensions look large.

## Private website preview

DNS `preview.cannyheads.com` did not resolve when checked. Required A record: `72.61.169.147`. Until ready, use screenshots under `review/`. A production-domain switch is NOT authorised.

When DNS resolves, install only a new preview nginx virtual host with Basic Auth, a Let's Encrypt certificate and X-Robots-Tag noindex. Templates are under `ops/`; do not overwrite the production nginx configuration. Keep preview bound to localhost:4181 behind nginx. Do not put credentials in git or public files. The preview requires GET access to existing legal HTML under `/var/www/cannyheads-legal`.

The static Node server preserves the current GTM-PXSZPNGN injection and original training CSS/JS injection. The existing two training asset files have identical SHA-256 hashes to production. Training mock checks stop at opening a fake checkout, not a real Razorpay transaction.

## Gallery verification

```sh
cd /root/getjobme-wt-gallery/backend
node --test tests/cannyHeadsGallery.test.js tests/cannyHeadsGalleryRoutes.test.js
cd ../frontend
npm run build
```

Route tests use only mocks and temporary files; no Mongo connection. Actual upload tests reuse `/api/upload` validation and re-encode gallery images to WebP ≤2000px, strip metadata, enforce Admin and ≤10MB. Draft by default. Published-only public metadata. Metadata edits/deletes back up full prior records as EJSON under `/root/backups` before mutation; image originals are retained on gallery deletion.

Ordering: newest event date first, display-order number ascending within that event date. Owner can edit dates/order in the admin form. The first admin list is capped at 500 records; extend with pagination if the gallery grows beyond that.

## Upload instructions (after approved gallery deployment)

1. Log in to GetJobMe Admin.
2. Open **Canny Heads Gallery**.
3. Add a title, optional caption, event date and business.
4. Choose one or several JPG/PNG/WebP photos, each under 10MB.
5. Leave Publish unchecked to save drafts; tick it to show them publicly.
6. Press Upload photos and wait for confirmation. Multiple photos get numbered titles; edit them individually afterwards if needed.
7. Use Edit / publish / reorder to change captions, publish/unpublish, date or display order. Lower order numbers come first within the same event date.
8. Remove takes a photo out of the gallery after a backup; its original image remains stored. Public changes can take about a minute to appear.
9. For privacy, publish only images you have permission to share. Gallery files are public images; unpublishing removes them from listings, not a previously copied direct image URL.

## Deployment — only after owner approval

Canny Heads: build a new release containing `site/dist`, `site/server.mjs`, and `site/package.json` (Node server has no external runtime dependency). The release server defaults to **4180**, matching the existing service. Development/private preview explicitly uses PORT=4181 and PREVIEW=true. Verify the exact service configuration before switching. Back up/configure the release, then atomically switch current and restart only cannyheads.service after approval. Legal nginx locations remain unchanged.

GetJobMe: review/commit the worktree, merge to main and push only after approval; back up live frontend; build frontend; rsync dist without --delete and index.html last; restart getjobme-backend only after no WhatsApp conversation has been active for 60 seconds. Never deploy directly from a feature checkout in the live folder.

Rollback Canny Heads (only if deployment has occurred):

```sh
ln -s /var/www/cannyheads.com/releases/20260903-085447-training-form-navigation-fix /var/www/cannyheads.com/current.rollback
mv -Tf /var/www/cannyheads.com/current.rollback /var/www/cannyheads.com/current
systemctl restart cannyheads
```

Before using rollback, confirm current.rollback does not already exist. No rollback or deployment command has been run during preview preparation.

Private-preview safety: with PREVIEW=true, a notice and capture guard prevent real training form/payment submissions. Only the intercepted browser test sets CANNYHEADS_MOCK_FORM_TEST=true. Never set that variable on an owner-facing preview. The two preserved training assets remain byte-for-byte unchanged.
