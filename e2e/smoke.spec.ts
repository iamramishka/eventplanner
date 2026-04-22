import { expect, test } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}@example.com`;
}

test("couple signup flows into onboarding and dashboard", async ({ page }) => {
  await page.goto("/auth?tab=signup");

  await page.getByLabel("Full name").fill("QA Couple");
  await page.getByLabel("Email").fill(uniqueEmail("qa-couple"));
  await page.getByLabel("Password", { exact: true }).fill("Welcome123!");
  await page.getByLabel("Confirm password").fill("Welcome123!");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page).toHaveURL(/\/onboarding\/wedding$/);

  await page.getByLabel("Partner one").fill("Asha");
  await page.getByLabel("Partner two").fill("Rohan");
  await page.getByRole("checkbox", { name: "Still deciding the venue" }).check();
  await page.getByRole("checkbox", { name: "Date still to be confirmed" }).check();
  await page.getByRole("checkbox", { name: "Still working out guest count" }).check();
  await page.getByRole("checkbox", { name: "Budget still to be confirmed" }).check();
  await page.getByRole("button", { name: "Create Wedding" }).click();

  await expect(page).toHaveURL(/\/couple-dashboard$/);
  await expect(
    page.getByRole("heading", { name: "A calm command center for your wedding" }),
  ).toBeVisible();
});

test("guest find-event opens the live invitation", async ({ page }) => {
  await page.goto("/auth?tab=find-event");

  await page.getByLabel("Invite code").fill("AMAYA2026");
  await page.getByRole("button", { name: "Find My Event" }).click();

  await expect(page).toHaveURL(/\/w\/amaya-kavin/);
  await page.getByRole("button", { name: "Open Invitation" }).click();
  await expect(page.getByRole("heading", { name: "Amaya & Kavin" })).toBeVisible();
});

test("direct RSVP link supports updating a response", async ({ page }) => {
  await page.goto("/rsvp/INV-RIV-001");

  await expect(page.getByRole("heading", { name: "RSVP" })).toBeVisible();
  await page.getByRole("button", { name: "Cannot attend" }).click();
  await page.getByLabel("Special note").fill("Updating my RSVP to decline for smoke coverage.");
  await page.getByRole("button", { name: "Save RSVP" }).click();

  await expect(
    page.getByText("Your RSVP has been saved. You can revisit this link anytime to update it."),
  ).toBeVisible();
  await expect(page.getByText("Latest response:").locator("..")).toContainText("declined");
});

test("vendor signup lands in the vendor dashboard", async ({ page }) => {
  await page.goto("/vendor-dashboard/login?mode=signup");

  await page.getByLabel("Full name").fill("QA Vendor");
  await page.getByLabel("Business name").fill("QA Floral House");
  await page.getByLabel("Email").fill(uniqueEmail("qa-vendor"));
  await page.getByLabel("Password", { exact: true }).fill("VendorPass1!");
  await page.getByLabel("Confirm password").fill("VendorPass1!");
  await page.getByRole("button", { name: "Create Vendor Account" }).click();

  await expect(page).toHaveURL(/\/vendor-dashboard$/);
  await expect(
    page.getByRole("heading", { name: "A calm view of your vendor presence" }),
  ).toBeVisible();
});

test("admin login lands in the admin dashboard", async ({ page }) => {
  await page.goto("/admin/login");

  await page.getByRole("button", { name: "Sign In To Admin" }).click();

  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("heading", { name: "Platform operations at a glance" }),
  ).toBeVisible();
});

test("direct table token shows explicit unavailable state when table finder is disabled", async ({
  page,
}) => {
  await page.goto("/table/INV-NAD-002");

  await expect(
    page.getByRole("heading", { name: "Table finder is not available yet" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Invitation" })).toHaveAttribute(
    "href",
    /\/w\/amaya-kavin\?guest=INV-NAD-002$/,
  );
});

test("protected routes redirect anonymous visitors to the correct entry points", async ({
  page,
}) => {
  await page.goto("/couple-dashboard");
  await expect(page).toHaveURL(/\/auth\?tab=signin$/);

  await page.goto("/vendor-dashboard");
  await expect(page).toHaveURL(/\/vendor-dashboard\/login/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
});
