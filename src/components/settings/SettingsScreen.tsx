import { useState } from "react";
import { Volume2, VolumeX, Pencil, User } from "lucide-react";
import { useJeliStore } from "../../store/useJeliStore";
import { APP_IDENTITY, AUDIO_CONFIG, GAME_RULES, SCREEN_TITLES } from "../../config";
import ScreenHeader, { HEADER_OFFSET_STYLE } from "../layout/ScreenHeader";
import { cx } from "../../lib/cx";
import screenLayout from "../../styles/screenLayout.module.css";
import styles from "./SettingsScreen.module.css";

export default function SettingsScreen() {
  const profile = useJeliStore((s) => s.profile);
  const updateProfile = useJeliStore((s) => s.updateProfile);
  const audio = useJeliStore((s) => s.audio);
  const setVolume = useJeliStore((s) => s.setVolume);
  const setMuted = useJeliStore((s) => s.setMuted);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.displayName);

  function commitName() {
    if (nameDraft.trim()) updateProfile({ displayName: nameDraft.trim() });
    setEditingName(false);
  }

  function handleMuteToggle() {
    setMuted(!audio.muted);
  }

  return (
    <div className={screenLayout.screenBody} style={HEADER_OFFSET_STYLE}>
      <ScreenHeader title={SCREEN_TITLES.settings} />

      <div className={styles.content}>
        {/* Account */}
        <section className={cx("pixel-card", styles.profileSection)}>
          <div className={styles.avatar}>
            <User />
          </div>
          <div className={styles.profileInfo}>
            {editingName ? (
              <input
                autoFocus
                className={cx("pixel-input", styles.nameInput)}
                value={nameDraft}
                maxLength={GAME_RULES.profileNameMaxLength}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={commitName}
                onKeyDown={(e) => e.key === "Enter" && commitName()}
              />
            ) : (
              <h2 className={styles.nameDisplay}>{profile.displayName}</h2>
            )}
            <span className={cx("pixel-badge", styles.levelBadge)}>LV. {profile.level}</span>
          </div>
          <button
            type="button"
            aria-label="Edit profile"
            onClick={() => setEditingName(true)}
            className={cx("pixel-btn", styles.editProfileButton)}
          >
            <Pencil size={14} />
          </button>
        </section>

        {/* Audio */}
        <section className={cx("pixel-card", styles.audioSection)}>
          <h2 className={styles.sectionHeading}>AUDIO</h2>

          <div className={styles.volumeRow}>
            <button
              type="button"
              aria-label={audio.muted ? "Unmute" : "Mute"}
              onClick={handleMuteToggle}
              className={cx("pixel-btn", styles.muteButton)}
            >
              {audio.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            <input
              type="range"
              min={AUDIO_CONFIG.minVolume}
              max={AUDIO_CONFIG.maxVolume}
              value={audio.muted ? AUDIO_CONFIG.minVolume : audio.volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className={styles.volumeSlider}
            />

            <span className={styles.volumeValue}>{audio.muted ? AUDIO_CONFIG.minVolume : audio.volume}</span>
          </div>

          <div className={styles.audioActions}>
            <button type="button" onClick={handleMuteToggle} className={cx("pixel-btn-ruby", styles.audioActionButton)}>
              MUTE
            </button>
            <button
              type="button"
              onClick={() => setVolume(AUDIO_CONFIG.maxVolume)}
              className={cx("pixel-btn-emerald", styles.audioActionButton)}
            >
              MAX
            </button>
          </div>
        </section>

        {/* About */}
        <section className={cx("pixel-panel", styles.aboutSection)}>
          <h2 className={styles.aboutTitle}>{APP_IDENTITY.name.toUpperCase()}</h2>
          <p className={styles.aboutVersion}>Version {APP_IDENTITY.version}</p>
          <p className={styles.aboutCopyright}>
            © {new Date().getFullYear()} {APP_IDENTITY.copyrightHolder}
          </p>
        </section>
      </div>
    </div>
  );
}
