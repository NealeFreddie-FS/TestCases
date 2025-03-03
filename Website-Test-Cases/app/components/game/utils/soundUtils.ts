import { Howl } from "howler";

// Global sound instance for the main menu
let mainMenuMusic: Howl | null = null;
let initialized = false;
let muted = false;

/**
 * Initialize main menu sounds
 */
export function initMainMenuSounds(): void {
  if (initialized) return;

  // Create the main menu music howl
  mainMenuMusic = new Howl({
    src: ["/assets/Pixel Music Pack/Wav/main-menu.wav"],
    loop: true,
    volume: 0.4,
    autoplay: false,
    preload: true,
    onload: () => {
      console.log("Main menu music loaded successfully");
      window.dispatchEvent(new Event("mainMenuMusicLoaded"));
    },
    onloaderror: (id, error) => {
      console.error("Error loading main menu music:", error);
      const errorEvent = new CustomEvent("mainMenuMusicError", {
        detail: { message: "Failed to load main menu music", error },
      });
      window.dispatchEvent(errorEvent);
    },
    onplayerror: (id, error) => {
      console.error("Error playing main menu music:", error);
      const errorEvent = new CustomEvent("mainMenuMusicError", {
        detail: { message: "Failed to play main menu music", error },
      });
      window.dispatchEvent(errorEvent);

      // Try to recover by unlocking audio - useful on mobile
      if (mainMenuMusic) {
        mainMenuMusic.once("unlock", () => {
          playMainMenuMusic();
        });
      }
    },
  });

  initialized = true;
}

/**
 * Play the main menu music
 */
export function playMainMenuMusic(): void {
  if (!initialized) {
    try {
      initMainMenuSounds();
    } catch (error) {
      console.error("Failed to initialize sounds in playMainMenuMusic:", error);
      const errorEvent = new CustomEvent("mainMenuMusicError", {
        detail: { message: "Failed to initialize sound system", error },
      });
      window.dispatchEvent(errorEvent);
      return;
    }
  }

  if (mainMenuMusic) {
    try {
      if (!mainMenuMusic.playing()) {
        mainMenuMusic.fade(0, 0.4, 1500);
        mainMenuMusic.play();
        console.log("Playing main menu music");
      }
    } catch (error) {
      console.error(
        "Error playing main menu music in playMainMenuMusic:",
        error
      );
      const errorEvent = new CustomEvent("mainMenuMusicError", {
        detail: { message: "Failed to play music", error },
      });
      window.dispatchEvent(errorEvent);
    }
  } else {
    console.error("Main menu music is not initialized");
    const errorEvent = new CustomEvent("mainMenuMusicError", {
      detail: { message: "Music not properly initialized" },
    });
    window.dispatchEvent(errorEvent);
  }
}

/**
 * Stop the main menu music
 * @param fadeOut - Time in ms to fade out (default: 1000)
 */
export function stopMainMenuMusic(fadeOut: number = 1000): void {
  if (mainMenuMusic && mainMenuMusic.playing()) {
    mainMenuMusic.fade(mainMenuMusic.volume(), 0, fadeOut);

    // Stop after fade completes
    setTimeout(() => {
      if (mainMenuMusic) {
        mainMenuMusic.stop();
      }
    }, fadeOut);

    console.log("Stopping main menu music");
  }
}

/**
 * Toggle mute state of main menu sounds
 * @returns New mute state
 */
export function toggleMute(): boolean {
  muted = !muted;

  if (mainMenuMusic) {
    mainMenuMusic.mute(muted);
  }

  return muted;
}

/**
 * Clean up main menu sounds - call when no longer needed
 */
export function cleanupMainMenuSounds(): void {
  if (mainMenuMusic) {
    mainMenuMusic.stop();
    mainMenuMusic.unload();
    mainMenuMusic = null;
  }

  initialized = false;
}
