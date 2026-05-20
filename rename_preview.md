# Rename Preview — Proposed Asset Renames and Doc Updates

This file previews the exact renames and documentation updates I will apply if you approve. No files will be changed by this preview.

1) File rename commands (Windows PowerShell):

```
Rename-Item "Couple Dashboard\200.png" "couple-overview.png"
Rename-Item "Couple Dashboard\201.png" "couple-guests-list.png"
Rename-Item "Couple Dashboard\202.png" "couple-guest-card.png"
Rename-Item "Couple Dashboard\203.png" "couple-invitation-editor.png"
Rename-Item "Couple Dashboard\204.png" "couple-invitation-preview.png"
Rename-Item "Couple Dashboard\205.png" "couple-theme-controls.png"
Rename-Item "Couple Dashboard\206.png" "couple-tables-seating.png"
Rename-Item "Couple Dashboard\207.png" "couple-budget.png"
Rename-Item "Couple Dashboard\208.png" "couple-checklist.png"
Rename-Item "Couple Dashboard\209.png" "couple-gallery-manager.png"
Rename-Item "Couple Dashboard\210.png" "couple-notifications.png"
Rename-Item "Couple Dashboard\211.png" "couple-settings.png"
Rename-Item "Couple Dashboard\212.png" "couple-agenda.png"
Rename-Item "Couple Dashboard\213.png" "couple-seating-assistant.png"
Rename-Item "Couple Dashboard\214.png" "couple-advanced-views.png"

Rename-Item "invitation Page\Invitation 1st Loading.png" "invitation-loading-cover.png"
Rename-Item "invitation Page\40.png" "invitation-sample-layout.png"

Rename-Item "Super Admin\100.png" "super-overview.png"
Rename-Item "Super Admin\101.png" "super-couple-management.png"
Rename-Item "Super Admin\102.png" "super-couple-details.png"
Rename-Item "Super Admin\103.png" "super-vendor-management.png"
Rename-Item "Super Admin\104.png" "super-vendor-details.png"
Rename-Item "Super Admin\105.png" "super-template-management.png"
Rename-Item "Super Admin\106.png" "super-template-preview.png"
Rename-Item "Super Admin\107.png" "super-plan-management.png"
Rename-Item "Super Admin\108.png" "super-reports.png"
Rename-Item "Super Admin\109.png" "super-logs.png"
Rename-Item "Super Admin\110.png" "super-user-actions.png"
Rename-Item "Super Admin\111.png" "super-settings.png"
Rename-Item "Super Admin\112.png" "super-support.png"
Rename-Item "Super Admin\113.png" "super-data-cleanup.png"
Rename-Item "Super Admin\114.png" "super-templates-list.png"
Rename-Item "Super Admin\115.png" "super-usage-metrics.png"
Rename-Item "Super Admin\116.png" "super-audit-trail.png"
Rename-Item "Super Admin\117.png" "super-additional.png"

Rename-Item "Vendor Portal\108.png" "vendor-legacy-108.png"
Rename-Item "Vendor Portal\300.png" "vendor-overview.png"
Rename-Item "Vendor Portal\301.png" "vendor-profile.png"
Rename-Item "Vendor Portal\302.png" "vendor-listing-editor.png"
Rename-Item "Vendor Portal\303.png" "vendor-booking-requests.png"
Rename-Item "Vendor Portal\304.png" "vendor-calendar.png"
Rename-Item "Vendor Portal\305.png" "vendor-messages.png"
Rename-Item "Vendor Portal\306.png" "vendor-analytics.png"
Rename-Item "Vendor Portal\307.png" "vendor-settings.png"
Rename-Item "Vendor Portal\308.png" "vendor-pricing.png"
Rename-Item "Vendor Portal\309.png" "vendor-photos-manager.png"
Rename-Item "Vendor Portal\310.png" "vendor-availability-rules.png"
Rename-Item "Vendor Portal\311.png" "vendor-inbox-detail.png"
Rename-Item "Vendor Portal\312.png" "vendor-booking-detail.png"
Rename-Item "Vendor Portal\313.png" "vendor-payouts.png"
Rename-Item "Vendor Portal\314.png" "vendor-onboarding-steps.png"
Rename-Item "Vendor Portal\315.png" "vendor-additional.png"
```

2) Documentation updates to apply after renaming:

- Update `coupleadmin.md` Assets list to reference `Couple Dashboard/couple-overview.png`, etc.
- Update `invitation.md` Assets list to reference `invitation Page/invitation-loading-cover.png`, etc.
- Update `superadmin.md` Assets list to reference `Super Admin/super-overview.png`, etc.
- Update `vendorportal.md` embedded image links to `Vendor Portal/vendor-overview.png`, etc.
- Update README files inside each folder to list new filenames.

3) Safety notes

- I will not perform any renames until you confirm. This preview only shows the exact commands and doc edits I will run if approved.
- If you want a backup, I can create a ZIP of the current `Vendor Portal/`, `Couple Dashboard/`, `Super Admin/`, and `invitation Page/` folders before renaming.

Approve one of the options below:

- `apply` — perform renames and update docs/READMEs.
- `preview` — produce a patch showing the exact file edits to docs (no file renames yet).
- `zip` — create a ZIP backup of all asset folders, then apply renames.
- `cancel` — do nothing further.
