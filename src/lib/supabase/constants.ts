import { defaultInvitationWorkspace } from "@/data/couple-mock";

export const DEFAULT_TRIAL_PLAN_CODE = "trial";

export function getDefaultInvitationSiteSeed() {
  const invitation = defaultInvitationWorkspace();

  return {
    site: {
      theme_preset: invitation.theme.preset,
      primary_color: invitation.theme.primaryColor,
      secondary_color: invitation.theme.secondaryColor,
      accent_color: invitation.theme.accentColor,
      surface_color: invitation.theme.surfaceColor,
      visibility: invitation.visibility,
      music_enabled: invitation.music.enabled,
      music_muted_by_default: invitation.music.mutedByDefault,
      music_track_id: invitation.music.trackId,
      is_published: false,
      has_unpublished_changes: false,
    },
    blocks: invitation.sections.map((section, index) => ({
      block_key: section.key,
      title: section.title,
      body: section.body,
      sort_order: index,
    })),
  };
}
