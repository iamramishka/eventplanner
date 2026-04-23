import { expect, test, type Page } from "@playwright/test";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}@example.com`;
}

function uniqueLabel(prefix: string) {
  return `${prefix} ${Date.now()}`;
}

function tinyPngFile(name: string) {
  return {
    name,
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlAb9sAAAAASUVORK5CYII=",
      "base64",
    ),
  };
}

async function signInAsSeededCouple(page: Page) {
  await page.goto("/auth?tab=signin");
  await page.getByLabel("Email").fill("amaya@vinyup.com");
  await page.getByLabel("Password", { exact: true }).fill("Welcome123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/couple-dashboard$/);
}

async function signInAsSeededVendor(page: Page) {
  await page.goto("/vendor-dashboard/login");
  await page.getByLabel("Email").fill("studio@vinyup.com");
  await page.getByLabel("Password", { exact: true }).fill("Vendor123!");
  await page.locator("form").getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/vendor-dashboard$/);
}

async function signInAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Admin email").fill("ops@vinyup.com");
  await page.getByLabel("Password").fill("Admin123!");
  await page.getByRole("button", { name: "Sign In To Admin" }).click();
  await expect(page).toHaveURL(/\/admin$/);
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

test("vendor profile edits persist after reload and approved edits trigger re-review", async ({
  page,
}) => {
  const tagline = uniqueLabel("Warm documentary coverage");

  await signInAsSeededVendor(page);
  await page.goto("/vendor-dashboard/profile");

  await page.getByLabel("Tagline").fill(tagline);
  await page.getByRole("button", { name: "Save Profile" }).click();

  await expect(page.getByText("Vendor profile updated.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Tagline")).toHaveValue(tagline);

  await page.goto("/vendor-dashboard/visibility");
  await expect(
    page.getByText(
      "Your latest changes are pending admin review before your profile can go live again.",
    ),
  ).toBeVisible();
  await expect(page.getByText("pending").first()).toBeVisible();
  await expect(page.getByRole("button", { name: "Make Public" })).toBeVisible();
});

test("vendor gallery uploads persist after reload", async ({ page }) => {
  const fileName = `${uniqueLabel("vendor-portfolio")}.png`;
  const altText = fileName.replace(/\.png$/, "");

  await signInAsSeededVendor(page);
  await page.goto("/vendor-dashboard/gallery");

  await page.getByLabel("Upload image").setInputFiles(tinyPngFile(fileName));
  await expect(page.getByText("Portfolio image uploaded.")).toBeVisible();
  await page.reload();
  await expect(page.getByText(altText)).toBeVisible();
});

test("vendor services and contact info survive reload", async ({ page }) => {
  const serviceTitle = uniqueLabel("Vendor Service");
  const packageName = uniqueLabel("Vendor Package");
  const website = `https://vendor.example.com/${Date.now()}`;

  await signInAsSeededVendor(page);

  await page.goto("/vendor-dashboard/services");
  await page.getByLabel("Service title").fill(serviceTitle);
  await page.getByLabel("Service description").fill(
    "A focused coverage offering for couples who want a clear starting point.",
  );
  await page.getByRole("button", { name: "Save Service" }).click();
  await expect(page.getByText("Service saved.")).toBeVisible();

  await page.getByLabel("Package name").fill(packageName);
  await page.getByLabel("Package description").fill(
    "Includes planning support, coverage, and polished delivery.",
  );
  await page.getByLabel("Price note").fill("Starting from LKR 120,000");
  await page.getByLabel("Inclusions").fill("Planning call, coverage, delivery");
  await page.getByRole("button", { name: "Save Package" }).click();
  await expect(page.getByText("Package saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByText(serviceTitle, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(packageName, { exact: true }).first()).toBeVisible();

  await page.goto("/vendor-dashboard/contact");
  await page.getByLabel("Website").fill(website);
  await page.getByRole("button", { name: "Save Contact Info" }).click();
  await expect(page.getByText("Contact information updated.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Website")).toHaveValue(website);
});

test("vendor can submit a complete profile for review", async ({ page }) => {
  await signInAsSeededVendor(page);
  await page.goto("/vendor-dashboard/visibility");

  await page.getByRole("button", { name: "Submit for Review" }).click();

  await expect(
    page
      .getByText("Your profile has been submitted and is waiting for admin review.")
      .first(),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("pending").first()).toBeVisible();
});

test("vendor settings changes persist and password updates allow sign-in", async ({ page }) => {
  const fullName = uniqueLabel("Vendor Owner");
  const businessName = uniqueLabel("Vendor Studio");
  const nextPassword = "VendorPass9!";

  await signInAsSeededVendor(page);
  await page.goto("/vendor-dashboard/settings");

  await page.getByLabel("Full name").fill(fullName);
  await page.getByLabel("Business name").fill(businessName);
  await page.getByRole("button", { name: "Save Account" }).click();

  await expect(page.getByText("Account details updated.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue(fullName);
  await expect(page.getByLabel("Business name")).toHaveValue(businessName);

  await page.getByLabel("Current password").fill("Vendor123!");
  await page.getByLabel("New password", { exact: true }).fill(nextPassword);
  await page.getByLabel("Confirm new password").fill(nextPassword);
  await page.getByRole("button", { name: "Update Password" }).click();

  await expect(page.getByText("Password updated.")).toBeVisible();
  await page.getByRole("button", { name: "Sign Out" }).click();
  await expect(page).toHaveURL(/\/vendor-dashboard\/login/);

  await page.getByLabel("Email").fill("studio@vinyup.com");
  await page.getByLabel("Password", { exact: true }).fill(nextPassword);
  await page.locator("form").getByRole("button", { name: "Sign In" }).click();

  await expect(page).toHaveURL(/\/vendor-dashboard$/);
});

test("admin login lands in the admin dashboard", async ({ page }) => {
  await signInAsAdmin(page);
  await expect(
    page.getByRole("heading", { name: "Platform operations at a glance" }),
  ).toBeVisible();
});

test("admin can suspend and reactivate a couple with persisted state", async ({ page }) => {
  await signInAsAdmin(page);
  await page.goto("/admin/couples");

  await page.getByRole("row", { name: /Amaya Perera/i }).click();
  await page.getByRole("button", { name: "Suspend" }).click();
  await expect(page.getByText("Amaya Perera suspended.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("row", { name: /Amaya Perera/i })).toContainText("suspended");

  await page.getByRole("row", { name: /Amaya Perera/i }).click();
  await page.getByRole("button", { name: "Reactivate" }).click();
  await expect(page.getByText("Amaya Perera reactivated.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("row", { name: /Amaya Perera/i })).toContainText("active");
});

test("admin can update a plan and resolve a support inquiry", async ({ page }) => {
  const nextPriceLabel = `LKR 4,900 / wedding ${Date.now()}`;

  await signInAsAdmin(page);
  await page.goto("/admin/plans");

  await page.getByRole("row", { name: /Basic/i }).click();
  await page.getByLabel("Price label").fill(nextPriceLabel);
  await page.getByRole("button", { name: "Save Plan" }).click();
  await expect(page.getByText("Basic updated.")).toBeVisible();
  await page.reload();
  await page.getByRole("row", { name: /Basic/i }).click();
  await expect(page.getByLabel("Price label")).toHaveValue(nextPriceLabel);

  await page.goto("/admin/logs");
  await page.getByRole("row", { name: /Need help restoring vendor profile visibility/i }).getByRole(
    "button",
    { name: "Resolve" },
  ).click();
  await expect(
    page.getByText("Need help restoring vendor profile visibility marked resolved."),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("resolved").first()).toBeVisible();
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

test("couple wedding settings persist after reload", async ({ page }) => {
  const introMessage = uniqueLabel("Smoke intro message");

  await signInAsSeededCouple(page);
  await page.goto("/couple-dashboard/wedding");

  await page.getByLabel("Intro message").fill(introMessage);
  await page.getByRole("button", { name: "Save Wedding Settings" }).click();

  await expect(page.getByText("Wedding settings saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Intro message")).toHaveValue(introMessage);
});

test("couple budget and checklist entries survive reload", async ({ page }) => {
  const budgetTitle = uniqueLabel("Smoke Budget");
  const checklistTitle = uniqueLabel("Smoke Task");

  await signInAsSeededCouple(page);

  await page.goto("/couple-dashboard/budget");
  await page.getByLabel("Title").fill(budgetTitle);
  await page.getByLabel("Estimated").fill("50000");
  await page.getByRole("button", { name: "Add Item" }).click();
  await expect(page.getByText("Budget item added.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("cell", { name: budgetTitle })).toBeVisible();

  await page.goto("/couple-dashboard/checklist");
  await page.getByLabel("Task title").fill(checklistTitle);
  await page.getByRole("button", { name: "Add Task" }).click();
  await expect(page.getByText("Task added.")).toBeVisible();
  await page.reload();
  await expect(page.getByText(checklistTitle)).toBeVisible();
});
