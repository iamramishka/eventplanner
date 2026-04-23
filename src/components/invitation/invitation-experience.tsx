"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Field, InlineNotice, SubmitButton, TextareaField } from "@/components/shared/form-controls";
import {
  buildInvitationBackground,
  formatInvitationDate,
  formatInvitationTime,
  getCountdownParts,
  getInvitationInitials,
  isInvitationSectionVisible,
} from "@/lib/invitation-utils";
import { invitationService } from "@/lib/services/invitation-service";
import { CoupleMusicTrack, InvitationThemeSettings } from "@/types/couple";
import {
  InvitationPageData,
  InvitationRsvpInput,
  InvitationTableLookupResult,
} from "@/types/invitation";
import { musicTracks } from "@/data/couple-mock";

type InvitationExperienceProps = {
  slug?: string;
  token?: string | null;
  entryMode?: "invitation" | "rsvp" | "table";
};

const defaultRsvpForm: InvitationRsvpInput = {
  status: "confirmed",
  attendingCount: 1,
  mealPreference: "Standard",
  liquorPreference: "Undecided",
  specialNote: "",
};

function shouldUseUnoptimizedImage(value: string) {
  return value.startsWith("data:");
}

function getTrackMood(trackId: string): CoupleMusicTrack | undefined {
  return musicTracks.find((item) => item.id === trackId);
}

function buildAmbientFrequencies(trackId: string) {
  switch (trackId) {
    case "garden-vows":
      return [329.63, 493.88];
    case "midnight-toast":
      return [261.63, 392.0];
    default:
      return [293.66, 440.0];
  }
}

function InvitationStateCard({
  title,
  description,
  ctaLabel,
  href,
}: {
  title: string;
  description: string;
  ctaLabel?: string;
  href?: string;
}) {
  return (
    <main className="invitation-shell flex min-h-screen items-center justify-center px-4 py-10">
      <section className="invitation-card max-w-xl rounded-[2rem] p-8 text-center sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose">Invitation</p>
        <h1 className="mt-5 font-display text-5xl text-charcoal">{title}</h1>
        <p className="mt-4 text-base leading-8 text-muted">{description}</p>
        {ctaLabel && href ? (
          <Link
            href={href}
            className="mt-8 inline-flex rounded-full bg-charcoal px-6 py-3 text-sm font-semibold text-white"
          >
            {ctaLabel}
          </Link>
        ) : null}
      </section>
    </main>
  );
}

function SectionCard({
  id,
  title,
  eyebrow,
  children,
}: {
  id?: string;
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="invitation-card invitation-section section-anchor rounded-[2rem] px-5 py-7 sm:px-8 sm:py-9">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 font-display text-4xl text-charcoal sm:text-5xl">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function InvitationExperience({
  slug,
  token = null,
  entryMode = "invitation",
}: InvitationExperienceProps) {
  const [page, setPage] = useState<InvitationPageData | null>(null);
  const [showLoading, setShowLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(entryMode !== "invitation");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [lookupToken, setLookupToken] = useState(token ?? "");
  const [tableQuery, setTableQuery] = useState("");
  const [tableResult, setTableResult] = useState<InvitationTableLookupResult | null>(null);
  const [rsvpForm, setRsvpForm] = useState<InvitationRsvpInput>(defaultRsvpForm);
  const [countdown, setCountdown] = useState<ReturnType<typeof getCountdownParts>>(null);
  const [isPending, startTransition] = useTransition();
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const nextPage =
        entryMode === "invitation"
          ? await invitationService.getInvitationBySlug(slug ?? "", token)
          : await invitationService.getInvitationByToken(token ?? "");

      if (!isMounted) {
        return;
      }

      setPage(nextPage);

      if (nextPage.status === "ready" && nextPage.guestContext) {
        const currentRsvp = nextPage.guestContext.existingRsvp;
        setRsvpForm({
          status: currentRsvp.status,
          attendingCount:
            currentRsvp.attendingCount > 0 ? currentRsvp.attendingCount : 1,
          mealPreference: currentRsvp.mealPreference,
          liquorPreference: currentRsvp.liquorPreference,
          specialNote: currentRsvp.specialNote,
        });
        setLookupToken(nextPage.guestContext.inviteToken);
      }

      if (!isMounted) {
        return;
      }

      window.setTimeout(() => {
        if (isMounted) {
          setShowLoading(false);
        }
      }, 900);
    })();

    return () => {
      isMounted = false;
    };
  }, [entryMode, slug, token]);

  useEffect(() => {
    if (!page?.eventDate) {
      return;
    }

    setCountdown(getCountdownParts(page.eventDate));
    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts(page.eventDate));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [page?.eventDate]);

  useEffect(() => {
    if (!page || page.status !== "ready" || !isOpen) {
      return;
    }

    if (entryMode === "rsvp") {
      document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (entryMode === "table") {
      document.getElementById("table-finder")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [entryMode, isOpen, page]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => undefined);
      }
    };
  }, []);

  const currentTheme = page?.status === "ready" ? page.invitation.theme : null;

  const heroSection = useMemo(
    () =>
      page?.status === "ready"
        ? page.invitation.sections.find((section) => section.key === "hero")
        : null,
    [page],
  );

  const storySection = useMemo(
    () =>
      page?.status === "ready"
        ? page.invitation.sections.find((section) => section.key === "story")
        : null,
    [page],
  );

  const detailsSection = useMemo(
    () =>
      page?.status === "ready"
        ? page.invitation.sections.find((section) => section.key === "event-details")
        : null,
    [page],
  );

  const specialNoteSection = useMemo(
    () =>
      page?.status === "ready"
        ? page.invitation.sections.find((section) => section.key === "special-note")
        : null,
    [page],
  );

  async function stopMusic() {
    setIsMusicPlaying(false);
    oscillatorsRef.current.forEach((oscillator) => oscillator.stop());
    oscillatorsRef.current = [];

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => undefined);
      audioContextRef.current = null;
      gainRef.current = null;
    }
  }

  async function toggleMusic() {
    if (!page || page.status !== "ready" || !page.invitation.music.enabled) {
      return;
    }

    if (isMusicPlaying) {
      await stopMusic();
      return;
    }

    const audioContext = new window.AudioContext();
    const gain = audioContext.createGain();
    gain.gain.value = 0.02;
    gain.connect(audioContext.destination);

    const oscillators = buildAmbientFrequencies(page.invitation.music.trackId).map((frequency) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      oscillator.connect(gain);
      oscillator.start();
      return oscillator;
    });

    audioContextRef.current = audioContext;
    gainRef.current = gain;
    oscillatorsRef.current = oscillators;
    setIsMusicPlaying(true);
  }

  if (showLoading) {
    return (
      <main className="invitation-shell flex min-h-screen items-center justify-center px-4 py-8">
        <div className="text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/60 bg-white/80 text-4xl font-semibold text-charcoal shadow-[0_24px_50px_rgba(103,76,67,0.14)] backdrop-blur">
            {getInvitationInitials(page?.coupleNames ?? "V W")}
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.38em] text-rose">
            Preparing your invitation
          </p>
          <p className="mt-3 text-sm text-muted">
            A warm welcome is on the way.
          </p>
        </div>
      </main>
    );
  }

  if (!page || page.status === "not-found") {
    return (
      <InvitationStateCard
        title="Invitation not found"
        description="This invitation link is unavailable or may have been shared incorrectly."
        ctaLabel="Back to Home"
        href="/"
      />
    );
  }

  if (page.status === "unpublished") {
    return (
      <InvitationStateCard
        title="Invitation coming soon"
        description="This wedding invitation has not been published yet. Please check back with the couple for the final invitation link."
        ctaLabel="Back to Home"
        href="/"
      />
    );
  }

  if (page.status === "locked") {
    return (
      <InvitationStateCard
        title={page.lockedTitle || "This invitation is currently locked"}
        description={
          page.lockedMessage ||
          "The couple's access window has ended, so this invitation is not available right now."
        }
        ctaLabel="Back to Home"
        href="/"
      />
    );
  }

  if (entryMode === "table") {
    const tableFinderEnabled = isInvitationSectionVisible("table-finder", page.invitation.visibility);

    if (!tableFinderEnabled) {
      return (
        <InvitationStateCard
          title="Table finder is not available yet"
          description="The couple has not published table lookup for this invitation yet. Please check back closer to the celebration."
          ctaLabel="Open Invitation"
          href={`/w/${page.weddingSlug}${token ? `?guest=${encodeURIComponent(token)}` : ""}`}
        />
      );
    }

    if (!page.guestContext?.tableAssignment) {
      return (
        <InvitationStateCard
          title="Table assignment not published yet"
          description="Your table details are not available right now. Please check back later or contact the couple if needed."
          ctaLabel="Open Invitation"
          href={`/w/${page.weddingSlug}${token ? `?guest=${encodeURIComponent(token)}` : ""}`}
        />
      );
    }
  }

  const visibility = page.invitation.visibility;
  const showEnvelope = entryMode === "invitation" && isInvitationSectionVisible("envelope", visibility);
  const showCountdown = isInvitationSectionVisible("countdown", visibility);
  const showAgenda = isInvitationSectionVisible("agenda", visibility) && page.agenda.length > 0;
  const showRsvp = isInvitationSectionVisible("rsvp", visibility);
  const showTableFinder = isInvitationSectionVisible("table-finder", visibility);
  const showGallery = isInvitationSectionVisible("gallery", visibility) && page.gallery.length > 0;
  const showGuestPreview =
    isInvitationSectionVisible("guest-preview", visibility) && page.guestPreview.confirmedCount > 0;
  const showStory = isInvitationSectionVisible("story", visibility) && Boolean(storySection?.body.trim());
  const showMusic = isInvitationSectionVisible("music", visibility) && page.invitation.music.enabled;
  const showVenueMap =
    isInvitationSectionVisible("venue-map", visibility) && Boolean(page.venueMapLink);
  const showSpecialMessage =
    isInvitationSectionVisible("special-message", visibility) && Boolean(specialNoteSection?.body.trim());

  const rsvpDeadlinePassed = Boolean(
    page.eventDate && page.eventDate < new Date().toISOString().slice(0, 10) && !page.guestContext,
  );

  const themeStyle = buildInvitationBackground(currentTheme as InvitationThemeSettings);
  const track = getTrackMood(page.invitation.music.trackId);
  const firstAgendaTime = page.agenda[0]?.eventTime;

  return (
    <main className="invitation-shell min-h-screen px-4 py-4 sm:px-6 sm:py-6" style={themeStyle}>
      {showEnvelope && !isOpen ? (
        <section className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center">
          <div className="invitation-card relative w-full overflow-hidden rounded-[2.4rem] px-6 py-10 text-center sm:px-10 sm:py-14">
            <div className="absolute inset-x-8 top-0 h-44 rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,231,236,0.92))]" />
            <div className="relative z-10">
              <p className="text-xs font-semibold uppercase tracking-[0.38em] text-rose">You are invited</p>
              <h1 className="mt-8 font-display text-6xl text-charcoal sm:text-7xl">
                {page.coupleNames}
              </h1>
              <p className="mt-4 text-base text-muted sm:text-lg">
                {formatInvitationDate(page.eventDate)}
              </p>
              {page.guestContext ? (
                <p className="mt-6 text-sm text-charcoal">
                  A special welcome for <strong>{page.guestContext.guestName}</strong>
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="mt-10 rounded-full bg-charcoal px-8 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,26,23,0.18)]"
              >
                Open Invitation
              </button>
            </div>
          </div>
        </section>
      ) : (
        <div className="mx-auto max-w-6xl space-y-6 pb-14">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/60 bg-white/70 px-4 py-3 text-sm text-charcoal shadow-[0_18px_44px_rgba(103,76,67,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 font-semibold">
                {page.coupleNames}
              </span>
              {page.guestContext ? (
                <span className="rounded-full bg-[#F7EEE9] px-3 py-1 text-muted">
                  Guest: {page.guestContext.guestName}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="#rsvp"
                className="rounded-full border border-soft-border bg-white px-4 py-2 font-semibold text-charcoal"
              >
                RSVP
              </a>
              {showMusic ? (
                <button
                  type="button"
                  onClick={() => {
                    void toggleMusic();
                  }}
                  className={`rounded-full px-4 py-2 font-semibold ${
                    isMusicPlaying ? "bg-charcoal text-white" : "border border-soft-border bg-white text-charcoal"
                  }`}
                >
                  {isMusicPlaying ? "Pause Music" : "Play Music"}
                </button>
              ) : null}
            </div>
          </div>

          {(notice || error) ? (
            <div className="space-y-3">
              {notice ? <InlineNotice tone="success">{notice}</InlineNotice> : null}
              {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
            </div>
          ) : null}

          <section className="invitation-card overflow-hidden rounded-[2.4rem]">
            <div className="relative min-h-[70vh]">
              <Image
                src={page.coverImage}
                alt={`${page.coupleNames} invitation hero`}
                fill
                priority
                unoptimized={shouldUseUnoptimizedImage(page.coverImage)}
                className="object-cover"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,20,18,0.15),rgba(27,20,18,0.55))]" />
              <div className="relative z-10 flex min-h-[70vh] flex-col justify-end px-6 py-8 text-white sm:px-10 sm:py-10">
                <p className="text-xs font-semibold uppercase tracking-[0.36em] text-white/80">Wedding Invitation</p>
                <h1 className="mt-5 font-display text-6xl leading-none sm:text-8xl">
                  {page.coupleNames}
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88">
                  {heroSection?.body || page.introMessage || "Join us for a day of love, joy, and celebration."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3 text-sm">
                  <span className="rounded-full border border-white/35 bg-white/10 px-4 py-2 backdrop-blur">
                    {formatInvitationDate(page.eventDate)}
                  </span>
                  {firstAgendaTime ? (
                    <span className="rounded-full border border-white/35 bg-white/10 px-4 py-2 backdrop-blur">
                      {formatInvitationTime(firstAgendaTime)}
                    </span>
                  ) : null}
                  {page.venueName ? (
                    <span className="rounded-full border border-white/35 bg-white/10 px-4 py-2 backdrop-blur">
                      {page.venueName}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {showStory && storySection ? (
            <SectionCard title={storySection.title} eyebrow="Invitation Message">
              <p className="max-w-3xl text-base leading-8 text-muted sm:text-lg">
                {storySection.body}
              </p>
              {page.introMessage && page.introMessage !== storySection.body ? (
                <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
                  {page.introMessage}
                </p>
              ) : null}
            </SectionCard>
          ) : null}

          <SectionCard title={detailsSection?.title || "Wedding Details"} eyebrow="Details">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-soft-border bg-white/70 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Date</p>
                <p className="mt-3 text-xl font-semibold text-charcoal">{formatInvitationDate(page.eventDate)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-soft-border bg-white/70 px-5 py-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">Venue</p>
                <p className="mt-3 text-xl font-semibold text-charcoal">{page.venueName || "Venue to be announced"}</p>
              </div>
            </div>
            {detailsSection?.body ? (
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{detailsSection.body}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {showVenueMap && page.venueMapLink ? (
                <a
                  href={page.venueMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
                >
                  Open Map
                </a>
              ) : null}
              {page.contactPhone ? (
                <a
                  href={`tel:${page.contactPhone}`}
                  className="rounded-full border border-soft-border bg-white px-5 py-3 text-sm font-semibold text-charcoal"
                >
                  Contact Couple
                </a>
              ) : null}
            </div>
          </SectionCard>

          {showCountdown && countdown ? (
            <SectionCard title={countdown.isPast ? "Today is the day" : "Countdown"} eyebrow="Before We Celebrate">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Days", value: countdown.days },
                  { label: "Hours", value: countdown.hours },
                  { label: "Minutes", value: countdown.minutes },
                  { label: "Seconds", value: countdown.seconds },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-soft-border bg-white/70 px-5 py-5 text-center">
                    <p className="text-4xl font-semibold text-charcoal">{item.value}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.26em] text-muted">{item.label}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {showAgenda ? (
            <SectionCard id="agenda" title="Agenda / Timeline" eyebrow="Schedule">
              <div className="space-y-4">
                {page.agenda.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-[1.6rem] border border-soft-border bg-white/72 px-5 py-5 md:grid-cols-[150px_1fr]"
                  >
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose">
                        {formatInvitationTime(item.eventTime)}
                      </p>
                      <p className="mt-2 text-sm text-muted">{item.durationMinutes} minutes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-semibold text-charcoal">{item.title}</p>
                      <p className="mt-2 text-base leading-8 text-muted">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {showRsvp ? (
            <SectionCard id="rsvp" title="RSVP" eyebrow="Response">
              {!page.guestContext ? (
                <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
                  <div className="rounded-[1.6rem] border border-soft-border bg-white/72 px-5 py-5">
                    <p className="text-lg font-semibold text-charcoal">Use your personal RSVP link</p>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      For the smoothest RSVP experience, open the invitation link shared with you directly by the couple.
                    </p>
                    <div className="mt-5">
                      <Field
                        label="Invite code / RSVP token"
                        name="lookupToken"
                        value={lookupToken}
                        placeholder="Enter the code from your invitation"
                        onChange={(event) => setLookupToken(event.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const next = await invitationService.lookupGuestTokenForWedding(
                            page.weddingSlug,
                            lookupToken,
                          );

                          if (!next) {
                            setError("We could not match that code to a guest for this wedding.");
                            setNotice("");
                            return;
                          }

                          setPage(next);
                          setNotice(`Welcome, ${next.guestContext?.guestName}. You can now RSVP below.`);
                          setError("");
                        })
                      }
                      className="mt-5 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      Continue to RSVP
                    </button>
                  </div>
                  <div className="rounded-[1.6rem] border border-soft-border bg-white/72 px-5 py-5">
                    <p className="text-lg font-semibold text-charcoal">Guest responses are updateable</p>
                    <p className="mt-3 text-sm leading-7 text-muted">
                      If your plans change later, just reopen the same link and submit your updated response again.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setNotice("");
                    setError("");

                    startTransition(async () => {
                      try {
                        const next = await invitationService.submitRsvp(
                          page.guestContext?.inviteToken ?? "",
                          rsvpForm,
                        );
                        setPage(next);
                        setNotice("Your RSVP has been saved. You can revisit this link anytime to update it.");
                      } catch (caughtError) {
                        setError(
                          caughtError instanceof Error
                            ? caughtError.message
                            : "Your RSVP could not be saved.",
                        );
                      }
                    });
                  }}
                >
                  <div className="rounded-[1.6rem] border border-soft-border bg-white/72 px-5 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose">
                      Guest Details
                    </p>
                    <p className="mt-4 text-3xl font-semibold text-charcoal">
                      {page.guestContext.guestName}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      You may RSVP for up to {page.guestContext.maxAllowedMembers} attendee
                      {page.guestContext.maxAllowedMembers > 1 ? "s" : ""}.
                    </p>
                    {page.guestContext.existingRsvp.submittedAt ? (
                      <p className="mt-4 rounded-[1.2rem] bg-[#F7EEE9] px-4 py-3 text-sm text-muted">
                        Latest response: <strong className="text-charcoal">{page.guestContext.existingRsvp.status}</strong>
                      </p>
                    ) : null}
                    {rsvpDeadlinePassed ? (
                      <p className="mt-4 rounded-[1.2rem] bg-[#FFF4F1] px-4 py-3 text-sm text-[#B45A51]">
                        RSVP submissions are currently closed.
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-4 rounded-[1.6rem] border border-soft-border bg-white/72 px-5 py-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: "Attending", value: "confirmed" },
                        { label: "Not sure yet", value: "pending" },
                        { label: "Cannot attend", value: "declined" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setRsvpForm((current) => ({
                              ...current,
                              status: option.value as InvitationRsvpInput["status"],
                              attendingCount:
                                option.value === "declined"
                                  ? 0
                                  : Math.max(current.attendingCount, 1),
                            }))
                          }
                          className={`rounded-[1.3rem] border px-4 py-4 text-sm font-semibold ${
                            rsvpForm.status === option.value
                              ? "border-transparent bg-charcoal text-white"
                              : "border-soft-border bg-white text-charcoal"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    {rsvpForm.status !== "declined" ? (
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-charcoal">Attendee count</span>
                        <select
                          value={rsvpForm.attendingCount}
                          onChange={(event) =>
                            setRsvpForm((current) => ({
                              ...current,
                              attendingCount: Number(event.target.value),
                            }))
                          }
                          className="invitation-focus rounded-[1.25rem] border border-soft-border bg-white px-4 py-3 text-sm text-charcoal"
                        >
                          {Array.from(
                            { length: page.guestContext.maxAllowedMembers },
                            (_, index) => index + 1,
                          ).map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-charcoal">Meal preference</span>
                        <select
                          value={rsvpForm.mealPreference}
                          onChange={(event) =>
                            setRsvpForm((current) => ({
                              ...current,
                              mealPreference: event.target.value as InvitationRsvpInput["mealPreference"],
                            }))
                          }
                          className="invitation-focus rounded-[1.25rem] border border-soft-border bg-white px-4 py-3 text-sm text-charcoal"
                        >
                          {["Standard", "Vegetarian", "Vegan", "Halal"].map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-charcoal">Liquor preference</span>
                        <select
                          value={rsvpForm.liquorPreference}
                          onChange={(event) =>
                            setRsvpForm((current) => ({
                              ...current,
                              liquorPreference: event.target.value as InvitationRsvpInput["liquorPreference"],
                            }))
                          }
                          className="invitation-focus rounded-[1.25rem] border border-soft-border bg-white px-4 py-3 text-sm text-charcoal"
                        >
                          {["Yes", "No", "Undecided"].map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <TextareaField
                      label="Special note"
                      name="specialNote"
                      value={rsvpForm.specialNote}
                      placeholder="Anything the couple should know?"
                      onChange={(event) =>
                        setRsvpForm((current) => ({
                          ...current,
                          specialNote: event.target.value,
                        }))
                      }
                    />

                    <div className="flex justify-end">
                      <SubmitButton
                        label="Save RSVP"
                        pendingLabel="Saving RSVP..."
                        pending={isPending || rsvpDeadlinePassed}
                      />
                    </div>
                  </div>
                </form>
              )}
            </SectionCard>
          ) : null}

          {showTableFinder ? (
            <SectionCard id="table-finder" title="Find My Table" eyebrow="Table Finder">
              {page.guestContext?.tableAssignment ? (
                <div className="rounded-[1.7rem] border border-soft-border bg-white/72 px-5 py-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose">Published Table</p>
                  <p className="mt-4 text-4xl font-semibold text-charcoal">
                    {page.guestContext.tableAssignment.tableName}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    Reserved for {page.guestContext.guestName} and {page.guestContext.tableAssignment.assignedCount} attendee
                    {page.guestContext.tableAssignment.assignedCount > 1 ? "s" : ""}.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[1.7rem] border border-soft-border bg-white/72 px-5 py-6">
                    <Field
                      label="Guest name"
                      name="tableLookup"
                      value={tableQuery}
                      placeholder="Enter the full guest name"
                      onChange={(event) => setTableQuery(event.target.value)}
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        startTransition(async () => {
                          const result = await invitationService.findTableByName(
                            page.weddingSlug,
                            tableQuery,
                          );
                          setTableResult(result);
                        })
                      }
                      className="mt-5 rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
                    >
                      Find Table
                    </button>
                  </div>

                  <div className="rounded-[1.7rem] border border-soft-border bg-white/72 px-5 py-6">
                    {tableResult?.status === "found" ? (
                      <>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose">
                          Table Assigned
                        </p>
                        <p className="mt-4 text-4xl font-semibold text-charcoal">
                          {tableResult.tableName}
                        </p>
                        <p className="mt-3 text-sm leading-7 text-muted">
                          Reserved for {tableResult.guestName} and {tableResult.assignedCount} attendee
                          {tableResult.assignedCount > 1 ? "s" : ""}.
                        </p>
                      </>
                    ) : (
                      <p className="text-sm leading-7 text-muted">
                        {tableResult?.message ?? "Search for your guest name to see the published table assignment."}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </SectionCard>
          ) : null}

          {showGallery ? (
            <SectionCard title="Gallery" eyebrow="Memories">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {page.gallery.map((asset) => (
                  <div key={asset.id} className="overflow-hidden rounded-[1.7rem] border border-soft-border bg-white/70">
                    <div className="relative aspect-[4/5]">
                      <Image
                        src={asset.imageUrl}
                        alt={asset.name}
                        fill
                        unoptimized={shouldUseUnoptimizedImage(asset.imageUrl)}
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="px-4 py-4">
                      <p className="font-semibold text-charcoal">{asset.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {showGuestPreview ? (
            <SectionCard title="Guest Preview" eyebrow="Celebrating Together">
              <div className="rounded-[1.7rem] border border-soft-border bg-white/72 px-5 py-6">
                <p className="text-4xl font-semibold text-charcoal">{page.guestPreview.confirmedCount}</p>
                <p className="mt-2 text-sm leading-7 text-muted">confirmed guests so far</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {page.guestPreview.names.map((name) => (
                    <span key={name} className="rounded-full bg-[#F7EEE9] px-4 py-2 text-sm text-charcoal">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : null}

          {showMusic ? (
            <SectionCard title="Music Control" eyebrow="Ambience">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] border border-soft-border bg-white/72 px-5 py-6">
                <div>
                  <p className="text-xl font-semibold text-charcoal">{track?.label ?? "Background music"}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {track?.mood ?? "Soft ambient track"}.
                    {page.invitation.music.mutedByDefault ? " Starts only when you choose to play it." : " Ready whenever you open the invitation."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void toggleMusic();
                  }}
                  className={`rounded-full px-5 py-3 text-sm font-semibold ${
                    isMusicPlaying ? "bg-charcoal text-white" : "border border-soft-border bg-white text-charcoal"
                  }`}
                >
                  {isMusicPlaying ? "Pause" : "Play"}
                </button>
              </div>
            </SectionCard>
          ) : null}

          <SectionCard title={specialNoteSection?.title || "With Love"} eyebrow="Final Message">
            <p className="max-w-3xl text-base leading-8 text-muted">
              {showSpecialMessage
                ? specialNoteSection?.body
                : "Thank you for being part of our celebration. We cannot wait to share this day with you."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {showRsvp ? (
                <a
                  href="#rsvp"
                  className="rounded-full bg-charcoal px-5 py-3 text-sm font-semibold text-white"
                >
                  RSVP Now
                </a>
              ) : null}
              {showVenueMap && page.venueMapLink ? (
                <a
                  href={page.venueMapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-soft-border bg-white px-5 py-3 text-sm font-semibold text-charcoal"
                >
                  View Venue
                </a>
              ) : null}
            </div>
          </SectionCard>
        </div>
      )}
    </main>
  );
}
