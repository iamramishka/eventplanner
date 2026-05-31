\# Public Web — Full Product \& Design Explanation

\## Perspective: Senior Software Engineer + Senior UI/UX Designer



\---



\# 1. Purpose of the Public Web



The \*\*Public Web\*\* is the main public-facing website of the platform.



It is not the couple dashboard.  

It is not the super admin.  

It is not the vendor dashboard.



It is the \*\*marketing, acquisition, and entry layer\*\* of the whole system.



\## Main goals of the Public Web

\- introduce the platform clearly

\- build trust

\- explain features

\- show invitation examples/templates

\- convert visitors into registered couples

\- attract vendors to join

\- provide sign up and sign in entry

\- give guest-side quick access like \*\*Find My Event\*\*

\- support SEO and shareability



\---



\# 2. Core Role of the Public Web in the Whole Product



The Public Web acts as:



\## A. Marketing website

For all visitors who want to understand the platform.



\## B. Conversion website

To turn visitors into:

\- couple users

\- vendor users



\## C. Entry gateway

To access:

\- Sign Up

\- Sign In

\- Find My Event



\## D. Showcase website

To demonstrate:

\- invitation page beauty

\- dashboard power

\- RSVP experience

\- guest management features



\---



\# 3. Main Public Web User Types



\## 1. Couple

A person planning a wedding and looking for a complete tool.



\### Their goals

\- understand the product

\- see how invitation website works

\- see pricing

\- create account

\- start wedding setup



\---



\## 2. Vendor

A wedding service provider who wants visibility.



\### Their goals

\- understand vendor benefits

\- create vendor profile

\- promote services



\---



\## 3. Guest

An invited wedding guest trying to find a wedding page.



\### Their goals

\- sign in not required

\- use \*\*Find My Event\*\*

\- open invite link

\- see wedding details



\---



\## 4. General Visitor

A person browsing, comparing, or recommending the service.



\---



\# 4. Public Web Information Architecture



The Public Web should be organized into these major pages.



\## Main pages

\- Home

\- Features

\- Templates / Demo Invitations

\- Pricing

\- Vendor Info / Join as Vendor

\- FAQ

\- About Us

\- Contact

\- Auth Page (Sign Up / Sign In / Find My Event)



\---



\# 5. Recommended Route Structure



```txt

/

&#x20;/features

&#x20;/templates

&#x20;/pricing

&#x20;/vendors

&#x20;/about

&#x20;/faq

&#x20;/contact

&#x20;/auth

&#x20;/find-event

&#x20;/w/:slug







Notes

/auth = combined Sign Up / Sign In / Find My Event tab page

/w/:slug = generated invitation public route

/find-event can later redirect or be merged into /auth

6\. Home Page — Full Section Breakdown



The home page is the most important page.



It must be modern, premium, emotional, and conversion-focused.



Section 1 — Hero Section

Purpose



Immediately explain what the platform does.



Must include

premium headline

short value proposition

CTA buttons

visual preview

trust-building emotional feel

Suggested headline



Plan your wedding guests, invitations, RSVPs, seating, and budget in one beautiful place.



Supporting text



Create your wedding website instantly, invite guests digitally, collect RSVPs, manage tables, track preferences, and stay organized — all from one dashboard.



CTA buttons

Start Free

View Demo Invitation

Secondary CTA

Join as Vendor

Visual content



Use:



elegant mockup of couple dashboard

wedding invitation preview

soft motion background

UX notes



Hero must load fast and communicate the product within 3–5 seconds.



Section 2 — Product Summary Highlights

Purpose



Explain the platform quickly with benefit cards.



Suggested cards

Guest Management

Online RSVP

Seating Planner

Budget Planner

Wedding Website Builder

Checklist \& Agenda

Vendor Management

Real-Time Tracking

UX notes



Use 2-line explanation under each card, not long paragraphs.



Section 3 — “How It Works”

Purpose



Reduce mental load and show simplicity.



Suggested steps

Sign up

Create your wedding

Get your invitation website instantly

Add guests and send invites

Track RSVPs and manage your event

UI suggestion



Use 5-step visual row or vertical step cards.



Section 4 — Invitation Showcase

Purpose



Sell the beauty and premium feel.



Must include

envelope mode preview

opening invite preview

live invitation page screenshots

gallery section

countdown section

RSVP section

find my table section

UX notes



This section must feel emotional and premium, not technical.



Section 5 — Dashboard Showcase

Purpose



Sell the system power.



Must include

guest list management preview

RSVP analytics preview

budget planner preview

checklist preview

theme editor preview

gallery manager preview

UX notes



This is where the visitor understands this is more than a simple invite tool.



Section 6 — Feature Deep Dive

Suggested grouped categories

For couples

invitation website

guests

RSVPs

seating

checklist

budget

agenda

vendors

For guests

beautiful invite view

RSVP online

find table

event details

gallery

For vendors

profile page

service listing

contact visibility

Section 7 — Templates / Themes Preview

Purpose



Show design variety.



Must include

classic gold

blush

sage

navy

lavender

CTA

Preview Template

Start With This Template

UX notes



Use real preview cards, not only names.



Section 8 — Pricing

Must include

free trial

package comparison

limits and premium features

Example plans

Free Trial

7 days

limited guests

limited gallery

core features only

Premium

more guests

full gallery

custom sections

vendor features

exports

UX notes



Be transparent and easy to compare.



Section 9 — Testimonials / Social Proof

Purpose



Increase trust.



Content

couple reviews

usage stats

happy customer messages

Section 10 — Vendor Callout

Purpose



Bring vendors into platform.



Content

why vendors should join

exposure benefits

create profile CTA

Section 11 — FAQ

Suggested questions

Is this only for invitations?

Can guests RSVP without login?

Can I manage bride side and groom side separately?

Can I update my invitation later?

Is there a free trial?

Can vendors join?

Section 12 — Final CTA

Suggested message



Start planning your wedding in one smart, beautiful platform.



Buttons

Create Your Wedding

View Invitation Demo

Section 13 — Footer

Include

product links

legal

contact

social links

vendor links

support links

7\. Auth Entry Experience — Public Web



Your auth flow should match your screenshots.



This is a strong choice.



Auth Page Structure

Route



/auth



Tabs

Sign Up

Sign In

Find My Event



This should be one page, not separate pages.



A. Sign In Tab

Fields

Email

Password

CTA

Sign In

Support link

Don’t have an account? Create One

UX behavior

simple centered form

minimal distraction

elegant logo above

large rounded inputs

strong button contrast

B. Sign Up Tab

Fields

Full Name

Email

Password

Confirm Password

CTA

Create Account

Support link

Already have an account? Sign In

UX behavior

same layout consistency as Sign In

step 1 of onboarding feeling

C. Find My Event Tab

Purpose



Allow guests to quickly locate their wedding event.



MVP options

Option 1



Placeholder with “Coming Soon”



Option 2



Search by:



couple name

invite code

guest phone number

Better long-term logic



Use:



invite URL

guest code

name + phone match

8\. Sign Up and Sign In UX Design Specification



This should feel:



premium

clean

emotional

trustworthy

not corporate-cold

easy for non-technical users

Layout style

centered content

max width small-to-medium

soft background

large whitespace

elegant logo on top

Components

rounded input fields

clear labels or placeholder text

large CTA buttons

subtle error messages

smooth tab transitions

Visual hierarchy

Logo

Tab switcher

Main title

Supporting link

Form inputs

Primary CTA

Input design

large height

rounded corners

soft border

visible focus state

clear error state

States

default

hover

focused

error

disabled

Button design

full width

rounded pill style

strong brand color

small shadow

hover elevation effect

9\. Wedding Onboarding Experience



After sign up, the user goes to wedding setup.



This is still part of the public-to-product conversion flow.



Route



/onboarding/wedding



Stepper

Account ✔

Wedding

Fields

Groom First Name

Bride First Name

Event Venue

Still Deciding toggle

Event Date

Date TBD toggle

Estimated Guests

Wait and See toggle

Estimated Budget (LKR)

Budget TBD toggle

CTA

Back

Create Wedding 🎉

UX notes

avoid overwhelming the user

only collect essentials

let them fill more later inside dashboard

10\. Public Web Flow Scenarios

Scenario 1 — New Couple Signs Up

Flow

Visitor enters Home page

Reads value proposition

Clicks Start Free

Goes to /auth

Opens Sign Up tab

Fills account details

Account created

Redirect to wedding onboarding

Fills wedding basics

Clicks Create Wedding

Wedding project created

Redirected to couple dashboard

Auto-generated invitation website also created

Backend result

user created

wedding created

slug generated

trial created

default invitation settings created

Scenario 2 — Existing Couple Signs In

Flow

User opens /auth

Selects Sign In

Enters credentials

If wedding exists → redirect dashboard

If wedding does not exist → redirect onboarding

Scenario 3 — Guest Finds Event

Flow

Guest opens public website or shared link

Clicks Find My Event

Searches by invite code or couple name

System returns invitation page or matching result

Guest enters public invite page

Scenario 4 — Vendor Wants to Join

Flow

Vendor visits Home or Vendors page

Reads benefits

Clicks Join as Vendor

Goes to vendor registration flow

Creates vendor profile

Scenario 5 — Visitor Checks Pricing Before Signup

Flow

Visitor opens Pricing page

Compares Free vs Premium

Clicks Start Free

Goes to auth page

Creates account

11\. Public Web Database Requirements



Even though the Public Web is mostly marketing, it still needs some connected data.



A. Users Table



Used for:



sign up

sign in

role handling

Fields

id

full\_name

email

password\_hash

role

status

email\_verified

created\_at

updated\_at

B. Weddings Table



Used during onboarding after sign up.



Fields

id

user\_id

groom\_first\_name

bride\_first\_name

event\_date

event\_date\_tbd

venue\_name

venue\_tbd

estimated\_guests

guests\_tbd

estimated\_budget

budget\_tbd

slug

setup\_completed

created\_at

updated\_at

C. Subscription Trials Table



Used to start free trial automatically.



Fields

id

user\_id

wedding\_id

plan\_name

starts\_at

ends\_at

grace\_delete\_at

status

created\_at

D. Wedding Site Settings Table



Used because wedding creation auto-generates invitation website settings.



Fields

id

wedding\_id

site\_title

cover\_enabled

countdown\_enabled

agenda\_enabled

gallery\_enabled

rsvp\_enabled

table\_finder\_enabled

guest\_preview\_enabled

music\_enabled

music\_url

primary\_color

secondary\_color

accent\_color

surface\_color

created\_at

updated\_at

E. Public CMS Tables (Recommended)



These are useful for marketing content management.



1\. pages



For editable public page content.



2\. testimonials



For home page reviews.



3\. faqs



For FAQ page management.



4\. templates



For invitation themes showcase.



5\. contacts / inquiries



For contact form submissions.



6\. vendor\_public\_profiles



For vendor marketplace previews.



12\. Recommended Public Web CMS Tables

marketing\_pages

Fields

id

page\_key

title

meta\_title

meta\_description

hero\_title

hero\_subtitle

section\_data\_json

published

updated\_at

faqs

Fields

id

question

answer

sort\_order

active

testimonials

Fields

id

person\_name

role\_type

review\_text

avatar\_url

rating

active

contact\_inquiries

Fields

id

full\_name

email

subject

message

created\_at

invitation\_templates

Fields

id

name

slug

preview\_image

description

active

sort\_order



13\. Public Web Backend API Needs



The Public Web will need APIs for:



auth register

auth login

auth me

create wedding

get current wedding

get public templates

get FAQ

get testimonials

submit contact form

Example endpoints

POST /api/v1/auth/register

POST /api/v1/auth/login

GET /api/v1/auth/me

POST /api/v1/weddings

GET /api/v1/templates/public

GET /api/v1/faqs

GET /api/v1/testimonials

POST /api/v1/contact

14\. Public Web UI/UX Style Direction



As a Senior UI/UX Designer, I would recommend this style direction:



Brand feeling

romantic

elegant

modern

soft premium

emotionally warm

lightweight SaaS quality

Design keywords

luxury minimal

soft surfaces

rounded interfaces

premium typography

calm motion

elegant contrast

mobile-first

15\. Color System Recommendation



The Public Web should use a warm, wedding-friendly palette.



Core palette approach



Use:



neutral soft background

elegant dark text

romantic accent

one premium metallic-inspired tone

Recommended color families

Ivory / Warm White

Blush Pink

Champagne Gold

Dusty Rose

Soft Lavender

Muted Sage

Charcoal text

Suggested base tokens

Background

\#FCF8F6

\#F8F2EE

Surface

\#FFFFFF

\#F7F4F2

Primary accent

\#C75C7A or #C45A74

Premium highlight

\#C9A574

Text primary

\#1F1A17

Text secondary

\#7C6F67

Border soft

\#E9DDD5

UX rule



Do not overuse dark or saturated colors.

Use soft contrast with selective rich accent.



16\. Typography Recommendation

Headings



Use elegant serif or stylish high-contrast font.



Good direction

Playfair-style

Cormorant-style

high elegance serif

Body text



Use clean sans-serif.



Good direction

Inter-style

Manrope-style

clean readable sans

Combination

serif for emotion and premium tone

sans-serif for clarity and usability

17\. Motion Design Recommendation



Motion must feel:



soft

refined

not flashy

not heavy

emotionally premium

Where to use animation

hero section reveal

card hover

button hover

section fade-in on scroll

invitation preview transitions

tab switching

loading skeletons

counters / stats

Avoid

excessive bouncing

overly dramatic parallax

too many simultaneous motion effects

long delays

18\. Transition Guidelines

Recommended transition duration

micro interactions: 150ms–220ms

cards/modals/tabs: 220ms–320ms

page transitions: 300ms–450ms

Use on

button hover

input focus

tab switching

card lift

modal open

invitation demo open

navbar sticky change

19\. Scroll Effects Recommendation



Scroll effects should improve storytelling.



Good scroll effects

fade-up section entrance

image reveal masking

soft stagger for cards

sticky feature explanation section

slow background glow shift

timeline section reveal

screenshot carousel movement

Example use areas

Home hero



Subtle parallax or floating glow shapes



How it works



Step cards reveal on scroll



Templates



Cards animate in with stagger



Dashboard preview



Sticky text left, scroll screenshots right



Testimonials



Horizontal gentle snap scroll



Performance rule



All scroll effects must be light and mobile-safe.



20\. Modern Visual Effects Recommendation

Use carefully

glassmorphism only lightly

soft shadows

depth through layered cards

gradient glow accents

rounded panels

muted premium overlays

Avoid

heavy blur everywhere

neon gradients

overly futuristic effects

dark corporate dashboards for public pages

21\. Navigation Design Recommendation

Desktop header

logo

features

templates

pricing

vendors

FAQ

Sign In

Start Free

Mobile

logo

hamburger menu

sticky CTA

Header behavior

transparent or soft at top

becomes solid on scroll

sticky after first viewport

22\. Responsive Design Rules



The Public Web must be mobile-first because:



many guests and couples browse on mobile

social sharing traffic is mobile-heavy

Priority breakpoints

mobile

tablet

laptop

large desktop

Mobile design priorities

CTA always visible

fast loading

minimal text walls

large tap targets

readable forms

no overloaded animations

23\. Public Web Performance Requirements



As a Senior Software Engineer, I would treat Public Web performance as critical.



Important requirements

fast first contentful paint

optimized images

lazy-loaded screenshots

compressed invitation demo images

SEO-friendly rendering

caching for public content

minimal JS on initial page load

Technical recommendations

server-side rendering or static generation for marketing pages

image optimization pipeline

content caching

code splitting

route-level lazy loading

24\. SEO Requirements



The Public Web needs strong SEO.



Must include

unique page titles

meta descriptions

Open Graph tags

Twitter preview

clean semantic headings

structured page content

sitemap

robots config

Best SEO pages

Home

Features

Pricing

Templates

Vendor pages

FAQ

25\. Accessibility Requirements



Do not ignore accessibility.



Must include

proper contrast

keyboard focus visibility

semantic buttons/links

form labels

alt text on images

reduced motion respect

accessible modal behavior

26\. Public Web Technical Architecture Recommendation

Frontend

Next.js or similar SSR-capable framework

Backend

shared API service

CMS/content source

DB-driven or admin-managed content

Assets

optimized image storage

CDN delivery

27\. Recommended Component Inventory

Marketing components

HeroSection

FeatureCard

TemplateCard

PricingCard

TestimonialCard

FAQAccordion

CTASection

Footer

Auth components

AuthTabs

SignInForm

SignUpForm

FindEventPanel

AuthInput

PasswordInput

PrimaryButton

Shared components

Navbar

MobileMenu

SectionHeader

Badge

Card

Modal

Toast

EmptyState

28\. Public Web Security Considerations



Even public systems need protection.



Must include

input validation

rate limiting on auth

password hashing

secure token handling

CSRF/session protection if needed

spam protection on contact form

brute-force protection on sign in

29\. Final Public Web Build Priority

Build first

Home page

Auth page

Sign up / sign in logic

Wedding onboarding

Pricing page

Templates page

FAQ

Contact page

Build next

Vendor entry page

Find My Event

Testimonials CMS

SEO refinement

30\. Final Recommendation



The Public Web should feel like this:



Emotionally

warm

beautiful

aspirational

premium

romantic

Functionally

fast

clear

conversion-focused

trustworthy

mobile-first

Technically

scalable

SEO-ready

CMS-friendly

integrated with auth and wedding creation

ready for invitation route generation

31\. Final Public Web Summary



The Public Web is not just a landing page.

It is the brand layer, acquisition layer, onboarding layer, and public discovery layer of the whole platform.



It must include:



marketing pages

auth entry

wedding onboarding entry

public invitation demo previews

pricing

vendor attraction

guest event lookup

content management structure

modern, emotional UI with premium motion and performance



This is the correct way to design and engineer the Public Web for your wedding platform.







