import { GameEngine } from "../GameEngine";
import { TimeManager, Hour } from "./TimeManager";
import { Howl, Howler } from "howler";

// Sound categories
export enum SoundCategory {
  MUSIC = "music",
  AMBIENT = "ambient",
  INTERFACE = "interface",
  COMBAT = "combat",
  MOVEMENT = "movement",
  VOICE = "voice",
  ENVIRONMENT = "environment",
}

// Sound priority levels
export enum SoundPriority {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2,
  CRITICAL = 3,
}

// Sound reference object
export interface SoundRef {
  id: string;
  howl?: Howl;
  sources: string[];
  volume: number;
  category: SoundCategory;
  loop: boolean;
  spatial: boolean;
  priority: SoundPriority;
  loadOnDemand: boolean;
}

// Sound state interface
export interface SoundState {
  masterVolume: number;
  categoryVolumes: Record<SoundCategory, number>;
  isMuted: boolean;
  currentMusic: string | null;
  currentAmbient: string | null;
  activeSounds: Map<string, string>; // id -> soundId
  loadedSounds: Set<string>;
}

// Sound event interface
export interface SoundEvent {
  type: "play" | "stop" | "volume" | "mute" | "unmute";
  category?: SoundCategory;
  id?: string;
  volume?: number;
}

// Define the sound library with different formats when available
export const SOUND_LIBRARY: Record<string, Omit<SoundRef, "id" | "howl">> = {
  // Main Menu Music
  music_main_menu: {
    sources: [
      "/assets/Knight & Monsters Sounds Pack/knight&monsters_soundpack.mp3",
    ],
    volume: 0.4,
    category: SoundCategory.MUSIC,
    loop: true,
    spatial: false,
    priority: SoundPriority.HIGH,
    loadOnDemand: false, // Load immediately since it's needed on startup
  },

  // Background Music
  music_main_theme: {
    sources: ["/assets/Knight & Monsters Sounds Pack/walk_knight.wav"],
    volume: 0.5,
    category: SoundCategory.MUSIC,
    loop: true,
    spatial: false,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  music_exploration: {
    sources: ["/assets/Knight & Monsters Sounds Pack/walk_boss.wav"],
    volume: 0.5,
    category: SoundCategory.MUSIC,
    loop: true,
    spatial: false,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  music_combat: {
    sources: ["/assets/Knight & Monsters Sounds Pack/attack_monster.wav"],
    volume: 0.6,
    category: SoundCategory.MUSIC,
    loop: true,
    spatial: false,
    priority: SoundPriority.HIGH,
    loadOnDemand: true,
  },
  music_tension: {
    sources: ["/assets/Knight & Monsters Sounds Pack/roar_monster.wav"],
    volume: 0.5,
    category: SoundCategory.MUSIC,
    loop: true,
    spatial: false,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },

  // Ambient Sounds
  ambient_night: {
    sources: ["/assets/Knight & Monsters Sounds Pack/roar2_monster.wav"],
    volume: 0.4,
    category: SoundCategory.AMBIENT,
    loop: true,
    spatial: false,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  ambient_day: {
    sources: ["/assets/Knight & Monsters Sounds Pack/roar3_monster.wav"],
    volume: 0.3,
    category: SoundCategory.AMBIENT,
    loop: true,
    spatial: false,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },

  // UI Sounds
  ui_click: {
    sources: ["/assets/Knight & Monsters Sounds Pack/coin.wav"],
    volume: 0.6,
    category: SoundCategory.INTERFACE,
    loop: false,
    spatial: false,
    priority: SoundPriority.LOW,
    loadOnDemand: false,
  },
  ui_hover: {
    sources: ["/assets/Knight & Monsters Sounds Pack/jump_knight.wav"],
    volume: 0.4,
    category: SoundCategory.INTERFACE,
    loop: false,
    spatial: false,
    priority: SoundPriority.LOW,
    loadOnDemand: false,
  },
  ui_open: {
    sources: ["/assets/Knight & Monsters Sounds Pack/gem.wav"],
    volume: 0.5,
    category: SoundCategory.INTERFACE,
    loop: false,
    spatial: false,
    priority: SoundPriority.LOW,
    loadOnDemand: false,
  },

  // Player Sounds
  player_walk: {
    sources: ["/assets/Knight & Monsters Sounds Pack/walk_knight.wav"],
    volume: 0.5,
    category: SoundCategory.MOVEMENT,
    loop: true,
    spatial: true,
    priority: SoundPriority.LOW,
    loadOnDemand: false,
  },
  player_jump: {
    sources: ["/assets/Knight & Monsters Sounds Pack/jump_knight.wav"],
    volume: 0.6,
    category: SoundCategory.MOVEMENT,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: false,
  },
  player_attack: {
    sources: ["/assets/Knight & Monsters Sounds Pack/attack_knight.wav"],
    volume: 0.7,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.HIGH,
    loadOnDemand: false,
  },
  player_hurt: {
    sources: ["/assets/Knight & Monsters Sounds Pack/hurt_knight.wav"],
    volume: 0.7,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.HIGH,
    loadOnDemand: false,
  },
  player_die: {
    sources: ["/assets/Knight & Monsters Sounds Pack/die_knight.wav"],
    volume: 0.8,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.CRITICAL,
    loadOnDemand: false,
  },

  // Enemy Sounds
  enemy_roar: {
    sources: ["/assets/Knight & Monsters Sounds Pack/roar_monster.wav"],
    volume: 0.6,
    category: SoundCategory.VOICE,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  enemy_roar2: {
    sources: ["/assets/Knight & Monsters Sounds Pack/roar2_monster.wav"],
    volume: 0.6,
    category: SoundCategory.VOICE,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  enemy_roar3: {
    sources: ["/assets/Knight & Monsters Sounds Pack/roar3_monster.wav"],
    volume: 0.6,
    category: SoundCategory.VOICE,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  enemy_attack: {
    sources: ["/assets/Knight & Monsters Sounds Pack/attack_monster.wav"],
    volume: 0.6,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.HIGH,
    loadOnDemand: true,
  },
  enemy_hurt: {
    sources: ["/assets/Knight & Monsters Sounds Pack/hurt_monster.wav"],
    volume: 0.6,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  enemy_hurt2: {
    sources: ["/assets/Knight & Monsters Sounds Pack/hurt2_monster.wav"],
    volume: 0.6,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  enemy_die: {
    sources: ["/assets/Knight & Monsters Sounds Pack/die_monster.wav"],
    volume: 0.7,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.HIGH,
    loadOnDemand: true,
  },
  enemy_die2: {
    sources: ["/assets/Knight & Monsters Sounds Pack/die2_monster.wav"],
    volume: 0.7,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.HIGH,
    loadOnDemand: true,
  },

  // Boss Sounds
  boss_walk: {
    sources: ["/assets/Knight & Monsters Sounds Pack/walk_boss.wav"],
    volume: 0.7,
    category: SoundCategory.MOVEMENT,
    loop: true,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: true,
  },
  boss_attack: {
    sources: ["/assets/Knight & Monsters Sounds Pack/axe_boss.wav"],
    volume: 0.8,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.HIGH,
    loadOnDemand: true,
  },
  boss_die: {
    sources: ["/assets/Knight & Monsters Sounds Pack/die_boss.wav"],
    volume: 0.9,
    category: SoundCategory.COMBAT,
    loop: false,
    spatial: true,
    priority: SoundPriority.CRITICAL,
    loadOnDemand: true,
  },

  // Item Sounds
  item_coin: {
    sources: ["/assets/Knight & Monsters Sounds Pack/coin.wav"],
    volume: 0.5,
    category: SoundCategory.INTERFACE,
    loop: false,
    spatial: true,
    priority: SoundPriority.LOW,
    loadOnDemand: false,
  },
  item_gem: {
    sources: ["/assets/Knight & Monsters Sounds Pack/gem.wav"],
    volume: 0.6,
    category: SoundCategory.INTERFACE,
    loop: false,
    spatial: true,
    priority: SoundPriority.MEDIUM,
    loadOnDemand: false,
  },

  // Environment Sounds
  env_voidus_midnight: {
    sources: ["/assets/Knight & Monsters Sounds Pack/die_boss.wav"],
    volume: 0.8,
    category: SoundCategory.ENVIRONMENT,
    loop: true,
    spatial: false,
    priority: SoundPriority.HIGH,
    loadOnDemand: true,
  },
};

// Dynamically import Howler types for use with SSR
let howlerLoaded = false;

/**
 * SoundManager class for handling all game audio
 */
export class SoundManager {
  private engine: GameEngine;
  private timeManager: TimeManager | null = null;
  private sounds: Map<string, SoundRef> = new Map();
  private state: SoundState;
  private isInitialized: boolean = false;
  private pendingSounds: Array<{ id: string; options?: any }> = [];
  private listeners: Map<string, ((event: SoundEvent) => void)[]> = new Map();
  private timeListenerAdded: boolean = false;
  private hasUserInteraction: boolean = false; // Track if user has interacted with the page
  private waitingForInteraction: boolean = false; // Track if we're waiting for interaction

  constructor(engine: GameEngine) {
    this.engine = engine;

    this.state = {
      masterVolume: 0.7,
      categoryVolumes: {
        [SoundCategory.MUSIC]: 0.5,
        [SoundCategory.AMBIENT]: 0.4,
        [SoundCategory.INTERFACE]: 0.8,
        [SoundCategory.COMBAT]: 0.7,
        [SoundCategory.MOVEMENT]: 0.6,
        [SoundCategory.VOICE]: 0.9,
        [SoundCategory.ENVIRONMENT]: 0.5,
      },
      isMuted: false,
      currentMusic: null,
      currentAmbient: null,
      activeSounds: new Map(),
      loadedSounds: new Set(),
    };

    // Initialize all sound references
    for (const [id, soundDef] of Object.entries(SOUND_LIBRARY)) {
      this.sounds.set(id, { ...soundDef, id, howl: undefined });
    }

    // Add event listener for user interaction at the document level
    if (typeof document !== "undefined") {
      const unlockAudio = () => {
        if (!this.hasUserInteraction) {
          console.log(
            "SoundManager: User interaction detected, unlocking audio"
          );
          this.hasUserInteraction = true;
          this.waitingForInteraction = false;

          // If Howler is locked, unlock it
          if (Howler.ctx && Howler.ctx.state !== "running") {
            Howler.ctx.resume().then(() => {
              console.log("SoundManager: Audio context resumed");
              // Play any pending sounds that were waiting for interaction
              this.playPendingSounds();
            });
          } else {
            // Play pending sounds directly if context is already running
            this.playPendingSounds();
          }

          // Remove the event listeners once audio is unlocked
          document.removeEventListener("click", unlockAudio);
          document.removeEventListener("touchstart", unlockAudio);
          document.removeEventListener("keydown", unlockAudio);
        }
      };

      document.addEventListener("click", unlockAudio);
      document.addEventListener("touchstart", unlockAudio);
      document.addEventListener("keydown", unlockAudio);
    }
  }

  /**
   * Initialize the sound manager
   */
  public async init(): Promise<void> {
    try {
      // Check if Howler is already loaded from import
      if (!howlerLoaded) {
        console.log("SoundManager: Howler imported from npm package");
        howlerLoaded = true;
      }

      // Initialize the sound library
      this.initializeSoundLibrary();

      // Register time-based events
      this.registerTimeEvents();

      // Load essential sounds
      await this.preloadEssentialSounds();

      // Mark as initialized
      this.isInitialized = true;

      // Play any pending sounds
      this.playPendingSounds();

      console.log("SoundManager: Initialized successfully");

      // Set default volumes
      this.updateHowlerVolume();

      return Promise.resolve();
    } catch (error) {
      console.error("SoundManager: Failed to initialize", error);
      return Promise.reject(error);
    }
  }

  /**
   * Initialize the sound library by creating Howl instances for each sound
   */
  private initializeSoundLibrary(): void {
    Object.entries(SOUND_LIBRARY).forEach(([id, sound]) => {
      const soundRef: SoundRef = {
        id,
        sources: sound.sources,
        volume: sound.volume,
        category: sound.category,
        loop: sound.loop,
        spatial: sound.spatial,
        priority: sound.priority,
        loadOnDemand: sound.loadOnDemand,
      };

      this.sounds.set(id, soundRef);

      // Create Howl instances for non-loadOnDemand sounds
      if (!sound.loadOnDemand) {
        this.createHowl(id);
      }
    });
  }

  /**
   * Create a Howl instance for a sound
   */
  private createHowl(soundId: string): boolean {
    const sound = this.sounds.get(soundId);

    if (!sound) {
      return false;
    }

    try {
      // Create the Howl instance if it doesn't exist
      if (!sound.howl) {
        sound.howl = new Howl({
          src: sound.sources,
          autoplay: false,
          loop: sound.loop,
          volume: this.calculateVolume(sound),
          html5: sound.loadOnDemand, // HTML5 Audio is less reliable but helps with large files
          preload: !sound.loadOnDemand, // Preload non-loadOnDemand sounds
          onload: () => {
            this.state.loadedSounds.add(soundId);
            console.log(`SoundManager: Loaded sound ${soundId}`);
          },
          onloaderror: (_id: number, error: any) => {
            console.error(
              `SoundManager: Error loading sound ${soundId}`,
              error
            );
          },
          onplayerror: (_id: number, error: any) => {
            console.error(
              `SoundManager: Error playing sound ${soundId}`,
              error
            );

            // Attempt to recover
            if (sound.howl) {
              sound.howl.once("unlock", () => {
                sound.howl?.play();
              });
            }
          },
        });

        // Save the updated sound
        this.sounds.set(soundId, sound);
        return true;
      }

      return true;
    } catch (error) {
      console.error(`SoundManager: Error creating Howl for ${soundId}`, error);
      return false;
    }
  }

  /**
   * Preload essential sounds that should be available immediately
   */
  private async preloadEssentialSounds(): Promise<void> {
    const promises: Promise<void>[] = [];

    // Preload non-loadOnDemand sounds
    this.sounds.forEach((sound, id) => {
      if (!sound.loadOnDemand) {
        promises.push(
          new Promise<void>((resolve) => {
            if (sound.howl) {
              sound.howl.once("load", () => {
                this.state.loadedSounds.add(id);
                resolve();
              });

              sound.howl.once("loaderror", () => {
                console.error(`SoundManager: Failed to preload ${id}`);
                resolve(); // Resolve anyway to prevent blocking
              });
            } else {
              resolve(); // No Howl instance, resolve immediately
            }
          })
        );
      }
    });

    // Wait for all essential sounds to load
    if (promises.length > 0) {
      await Promise.all(promises);
    }
  }

  /**
   * Play sounds that were queued before initialization
   */
  private playPendingSounds(): void {
    if (!this.isInitialized) {
      console.warn(
        "SoundManager: Cannot play pending sounds before initialization"
      );
      return;
    }

    if (!this.hasUserInteraction) {
      console.log(
        "SoundManager: Waiting for user interaction before playing pending sounds"
      );
      this.waitingForInteraction = true;
      return;
    }

    if (this.pendingSounds.length > 0) {
      console.log(
        `SoundManager: Playing ${this.pendingSounds.length} pending sounds`
      );

      // Take a copy of the array to avoid modification during iteration
      const pendingSoundsCopy = [...this.pendingSounds];
      this.pendingSounds = []; // Clear the pending sounds

      // Play each pending sound
      for (const { id, options } of pendingSoundsCopy) {
        this.play(id, options);
      }
    }
  }

  /**
   * Register for time-based events to change music/ambient sounds
   */
  private registerTimeEvents(): void {
    if (this.timeListenerAdded) {
      return;
    }

    this.timeManager = this.engine.timeManager;

    if (this.timeManager) {
      this.timeManager.onTimeChange((timeState) => {
        // Change ambient sounds based on time of day
        this.handleTimeChange(timeState.hour);
      });

      this.timeListenerAdded = true;
    }
  }

  /**
   * Handle time changes to play appropriate ambient sounds
   */
  private handleTimeChange(hour: Hour): void {
    // If we don't have user interaction, don't try to play sounds automatically
    if (!this.hasUserInteraction) {
      console.log(
        `SoundManager: Time changed to ${hour}, but waiting for user interaction to play ambient sounds`
      );
      return;
    }

    switch (hour) {
      case Hour.DAWN:
        this.playAmbient("ambient_day");
        break;
      case Hour.ZENITH:
        this.playAmbient("ambient_day");
        break;
      case Hour.DUSK:
        // Transition period, could fade between day and night
        this.playAmbient("ambient_day", { volume: 0.2 });
        break;
      case Hour.MIDNIGHT:
        this.playAmbient("ambient_night");

        // Check for special prophetic time combination
        try {
          if (
            this.timeManager &&
            // Check if the method exists by checking if it's a function
            typeof (this.timeManager as any).isPropheticTimeActive ===
              "function" &&
            // Call the method if it exists
            (this.timeManager as any).isPropheticTimeActive()
          ) {
            this.playAmbient("env_voidus_midnight");
          }
        } catch (error) {
          console.warn("Could not check for prophetic time:", error);
        }
        break;
    }
  }

  /**
   * Play a sound
   */
  public play(id: string, options: any = {}): string | null {
    // If not initialized, queue for later
    if (!this.isInitialized) {
      this.pendingSounds.push({ id, options });
      return null;
    }

    // Check if we need user interaction first
    if (!this.hasUserInteraction && !this.waitingForInteraction) {
      console.log(
        `SoundManager: Waiting for user interaction before playing ${id}`
      );
      this.waitingForInteraction = true;
      this.pendingSounds.push({ id, options });
      return null;
    }

    // Get the sound
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`SoundManager: Sound not found: ${id}`);
      return null;
    }

    // Ensure Howl is created
    if (!sound.howl) {
      const created = this.createHowl(id);
      if (!created) {
        console.warn(`SoundManager: Unable to create Howl for sound: ${id}`);
        return null;
      }
    }

    // Check if muted
    if (this.state.isMuted) {
      return null;
    }

    // Apply options
    const playOptions = { ...options };

    // Calculate volume based on master and category
    const volume = options.volume
      ? options.volume * this.calculateVolume(sound)
      : this.calculateVolume(sound);

    // Generate a unique ID for this sound instance
    const activeId = `${id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    try {
      // Play the sound
      const howlId = sound.howl!.play();

      // Set volume for this specific sound
      sound.howl!.volume(volume, howlId);

      // Apply other options like position for spatial audio
      if (options.position && sound.spatial) {
        const [x, y, z = 0] = options.position;
        sound.howl!.pos(x, y, z, howlId);
      }

      // Store active sound reference
      this.state.activeSounds.set(activeId, id);

      // Trigger event
      this.triggerEvent({ type: "play", id });

      // Return the active sound ID for later reference
      return activeId;
    } catch (error) {
      console.error(`SoundManager: Error playing sound ${id}`, error);
      return null;
    }
  }

  /**
   * Play background music
   */
  public playMusic(id: string, options: any = {}): string | null {
    // Stop current music if different
    if (this.state.currentMusic && this.state.currentMusic !== id) {
      this.stopMusic();
    }

    // Set as current music
    this.state.currentMusic = id;

    // Play as looping by default
    const musicOptions = {
      ...options,
      loop: options.loop !== undefined ? options.loop : true,
    };

    return this.play(id, musicOptions);
  }

  /**
   * Play ambient sound
   */
  public playAmbient(id: string, options: any = {}): string | null {
    // Stop current ambient if different
    if (this.state.currentAmbient && this.state.currentAmbient !== id) {
      this.stopAmbient();
    }

    // Set as current ambient
    this.state.currentAmbient = id;

    // Play as looping by default
    const ambientOptions = {
      ...options,
      loop: options.loop !== undefined ? options.loop : true,
    };

    return this.play(id, ambientOptions);
  }

  /**
   * Stop a specific sound
   */
  public stop(idOrActiveId: string): void {
    // Check if this is an active sound ID
    if (this.state.activeSounds.has(idOrActiveId)) {
      const id = this.state.activeSounds.get(idOrActiveId);
      const sound = id ? this.sounds.get(id) : null;

      if (sound?.howl) {
        // Extract the numeric playId from the activeId
        const playId = idOrActiveId.split("_")[1];
        sound.howl.stop(Number(playId));

        // Remove from active sounds
        this.state.activeSounds.delete(idOrActiveId);

        // Trigger event
        this.triggerEvent({
          type: "stop",
          id,
          category: sound.category,
        });
      }
    } else {
      // Try as a direct sound ID
      const sound = this.sounds.get(idOrActiveId);

      if (sound?.howl) {
        sound.howl.stop();

        // Remove all instances of this sound from active sounds
        Array.from(this.state.activeSounds.entries())
          .filter(([_, soundId]) => soundId === idOrActiveId)
          .forEach(([activeId]) => {
            this.state.activeSounds.delete(activeId);
          });

        // Trigger event
        this.triggerEvent({
          type: "stop",
          id: idOrActiveId,
          category: sound.category,
        });
      }
    }
  }

  /**
   * Stop current music
   */
  public stopMusic(): void {
    if (this.state.currentMusic) {
      const sound = this.sounds.get(this.state.currentMusic);

      if (sound?.howl) {
        sound.howl.stop();
      }

      this.state.currentMusic = null;
    }
  }

  /**
   * Stop current ambient sound
   */
  public stopAmbient(): void {
    if (this.state.currentAmbient) {
      const sound = this.sounds.get(this.state.currentAmbient);

      if (sound?.howl) {
        sound.howl.stop();
      }

      this.state.currentAmbient = null;
    }
  }

  /**
   * Stop all sounds
   */
  public stopAll(): void {
    if (Howler) {
      // Stop all sounds using individual sound objects
      this.sounds.forEach((sound) => {
        if (sound.howl) {
          sound.howl.stop();
        }
      });
    }

    this.state.activeSounds.clear();
    this.state.currentMusic = null;
    this.state.currentAmbient = null;
  }

  /**
   * Pause all sounds
   */
  public pauseAll(): void {
    // Howler global doesn't have pause method, we need to pause each sound individually
    this.sounds.forEach((sound) => {
      if (sound.howl?.playing()) {
        sound.howl.pause();
      }
    });
  }

  /**
   * Resume all sounds
   */
  public resumeAll(): void {
    if (!this.state.isMuted && Howler) {
      this.sounds.forEach((sound) => {
        if (sound.howl?.playing()) {
          sound.howl.play();
        }
      });
    }
  }

  /**
   * Set master volume
   */
  public setMasterVolume(volume: number): void {
    this.state.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateHowlerVolume();

    // Trigger event
    this.triggerEvent({
      type: "volume",
      volume: this.state.masterVolume,
    });
  }

  /**
   * Set category volume
   */
  public setCategoryVolume(category: SoundCategory, volume: number): void {
    this.state.categoryVolumes[category] = Math.max(0, Math.min(1, volume));
    this.updateCategoryVolumes(category);

    // Trigger event
    this.triggerEvent({
      type: "volume",
      category,
      volume: this.state.categoryVolumes[category],
    });
  }

  /**
   * Update volume for all active sounds in a category
   */
  private updateCategoryVolumes(category: SoundCategory): void {
    this.sounds.forEach((sound) => {
      if (sound.category === category && sound.howl) {
        sound.howl.volume(this.calculateVolume(sound));
      }
    });
  }

  /**
   * Update global Howler volume
   */
  private updateHowlerVolume(): void {
    if (Howler) {
      Howler.volume(this.state.isMuted ? 0 : this.state.masterVolume);
    }
  }

  /**
   * Calculate effective volume for a sound based on master and category volumes
   */
  private calculateVolume(sound: SoundRef): number {
    if (this.state.isMuted) {
      return 0;
    }

    return (
      sound.volume *
      this.state.masterVolume *
      this.state.categoryVolumes[sound.category]
    );
  }

  /**
   * Mute all sounds
   */
  public mute(): void {
    this.state.isMuted = true;
    this.updateHowlerVolume();

    // Trigger event
    this.triggerEvent({
      type: "mute",
    });
  }

  /**
   * Unmute all sounds
   */
  public unmute(): void {
    this.state.isMuted = false;
    this.updateHowlerVolume();

    // Trigger event
    this.triggerEvent({
      type: "unmute",
    });
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): boolean {
    if (this.state.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }

    return this.state.isMuted;
  }

  /**
   * Check if a sound is currently playing
   */
  public isPlaying(id: string): boolean {
    const sound = this.sounds.get(id);
    return !!sound?.howl?.playing();
  }

  /**
   * Check if any sound in a category is playing
   */
  public isCategoryPlaying(category: SoundCategory): boolean {
    let isPlaying = false;

    this.sounds.forEach((sound) => {
      if (sound.category === category && sound.howl?.playing()) {
        isPlaying = true;
      }
    });

    return isPlaying;
  }

  /**
   * Get the current volume setting
   */
  public getVolume(): number {
    return this.state.masterVolume;
  }

  /**
   * Get the volume for a specific category
   */
  public getCategoryVolume(category: SoundCategory): number {
    return this.state.categoryVolumes[category];
  }

  /**
   * Check if audio is muted
   */
  public isMuted(): boolean {
    return this.state.isMuted;
  }

  /**
   * Register a listener for sound events
   */
  public addEventListener(
    id: string,
    callback: (event: SoundEvent) => void
  ): void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }

    const callbacks = this.listeners.get(id) as ((event: SoundEvent) => void)[];
    callbacks.push(callback);
  }

  /**
   * Remove a listener
   */
  public removeEventListener(
    id: string,
    callback: (event: SoundEvent) => void
  ): void {
    if (this.listeners.has(id)) {
      const callbacks = this.listeners.get(id) as ((
        event: SoundEvent
      ) => void)[];
      const index = callbacks.indexOf(callback);

      if (index !== -1) {
        callbacks.splice(index, 1);
      }

      if (callbacks.length === 0) {
        this.listeners.delete(id);
      }
    }
  }

  /**
   * Trigger a sound event
   */
  private triggerEvent(event: SoundEvent): void {
    this.listeners.forEach((callbacks) => {
      callbacks.forEach((callback) => {
        callback(event);
      });
    });
  }

  /**
   * Play UI click sound (convenience method)
   */
  public playUIClick(): string | null {
    return this.play("ui_click");
  }

  /**
   * Play UI hover sound (convenience method)
   */
  public playUIHover(): string | null {
    return this.play("ui_hover");
  }

  /**
   * Play UI open sound (convenience method)
   */
  public playUIOpen(): string | null {
    return this.play("ui_open");
  }

  /**
   * Play main menu music
   * @returns Sound ID or null if playback failed
   */
  public playMainMenuMusic(): string | null {
    // Stop any existing music first
    this.stopMusic();

    // Play the main menu theme
    const musicId = this.playMusic("music_main_menu", {
      fadeIn: 1.5, // Fade in over 1.5 seconds
      volume: 0.4,
    });

    console.log("Playing main menu music", musicId);
    return musicId;
  }

  public playPlayerWalk(options: any = {}): string | null {
    return this.play("player_walk", options);
  }

  /**
   * Play player attack sound (convenience method)
   */
  public playPlayerAttack(options: any = {}): string | null {
    return this.play("player_attack", options);
  }

  /**
   * Play item pickup sound (convenience method)
   */
  public playItemPickup(
    type: "coin" | "gem",
    options: any = {}
  ): string | null {
    const soundId = type === "coin" ? "item_coin" : "item_gem";
    return this.play(soundId, options);
  }

  /**
   * Set music for current game mode
   */
  public setMusicForGameMode(mode: string): void {
    switch (mode) {
      case "exploration":
        this.playMusic("music_exploration");
        break;
      case "combat":
        this.playMusic("music_combat");
        break;
      case "dialog":
      case "shop":
      case "inventory":
      case "quest":
        // All non-action interfaces use the main theme
        this.playMusic("music_main_theme");
        break;
      default:
        this.playMusic("music_main_theme");
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    this.stopAll();

    // Clear listeners
    this.listeners.clear();

    // Clear sound references
    this.sounds.clear();

    // Reset state
    this.state.activeSounds.clear();
    this.state.loadedSounds.clear();

    // Unregister time events
    if (this.timeManager && this.timeListenerAdded) {
      // No direct way to remove a listener in our TimeManager yet
      this.timeListenerAdded = false;
    }

    // Reset initialization status
    this.isInitialized = false;
  }
}
