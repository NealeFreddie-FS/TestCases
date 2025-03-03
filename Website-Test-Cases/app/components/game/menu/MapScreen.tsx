"use client";

import React, { useState } from "react";
import { CharacterInfo } from "../../../types/GameTypes";
import styles from "../MenuScreens.module.css";

interface Region {
  id: string;
  name: string;
  description: string;
  discovered: boolean;
  currentLocation: boolean;
  services: string[];
  notes: { title: string; content: string }[];
  connectedAreas: { id: string; name: string; locked: boolean }[];
  coords: { x: number; y: number; width: number; height: number };
}

interface MapScreenProps {
  character: CharacterInfo | null;
}

const MapScreen: React.FC<MapScreenProps> = ({ character }) => {
  // Sample regions data - this would typically come from the game state
  const regions: Region[] = [
    {
      id: "firelink-shrine",
      name: "Firelink Shrine",
      description:
        "A sanctuary for Undead, centered around a bonfire. Many travelers pass through this once holy site on their journey.",
      discovered: true,
      currentLocation: true,
      services: [
        "Bonfire (Fast Travel)",
        "NPC: Firekeeper",
        "NPC: Crestfallen Warrior",
        "NPC: Blacksmith",
      ],
      notes: [
        {
          title: "Keeper's Note",
          content:
            "The Firekeeper tends to the bonfire, strengthening Estus Flasks in exchange for Estus Shards.",
        },
        {
          title: "Traveler's Warning",
          content:
            "Paths lead to dangerous territories in all directions. Prepare accordingly before venturing forth.",
        },
      ],
      connectedAreas: [
        { id: "undead-burg", name: "Undead Burg", locked: false },
        { id: "new-londo-ruins", name: "New Londo Ruins", locked: false },
        { id: "catacombs", name: "The Catacombs", locked: false },
      ],
      coords: { x: 50, y: 50, width: 15, height: 15 },
    },
    {
      id: "undead-burg",
      name: "Undead Burg",
      description:
        "A crumbling township once inhabited by humans, now overrun by hollows and other undead abominations.",
      discovered: true,
      currentLocation: false,
      services: ["Bonfire", "Merchant: Undead Male Merchant"],
      notes: [
        {
          title: "Knight's Observation",
          content:
            "The narrow streets and walkways make for dangerous combat. Try to engage enemies one at a time.",
        },
      ],
      connectedAreas: [
        { id: "firelink-shrine", name: "Firelink Shrine", locked: false },
        { id: "undead-parish", name: "Undead Parish", locked: false },
      ],
      coords: { x: 35, y: 30, width: 12, height: 10 },
    },
    {
      id: "undead-parish",
      name: "Undead Parish",
      description:
        "A holy site containing the first Bell of Awakening, guarded by the fearsome Bell Gargoyles.",
      discovered: true,
      currentLocation: false,
      services: ["Bonfire", "Blacksmith: Andre of Astora"],
      notes: [
        {
          title: "Blacksmith's Services",
          content:
            "Andre can reinforce weapons up to +5 and modify them to take different upgrade paths.",
        },
      ],
      connectedAreas: [
        { id: "undead-burg", name: "Undead Burg", locked: false },
        { id: "darkroot-garden", name: "Darkroot Garden", locked: false },
        { id: "sens-fortress", name: "Sen's Fortress", locked: true },
      ],
      coords: { x: 20, y: 20, width: 15, height: 12 },
    },
    {
      id: "new-londo-ruins",
      name: "New Londo Ruins",
      description:
        "A flooded city haunted by ghosts and darker entities. The ruins hide the path to the Abyss.",
      discovered: false,
      currentLocation: false,
      services: [],
      notes: [
        {
          title: "Warning",
          content:
            "Ghosts can only be harmed by cursed weapons or by those who are themselves cursed.",
        },
      ],
      connectedAreas: [
        { id: "firelink-shrine", name: "Firelink Shrine", locked: false },
        { id: "valley-of-drakes", name: "Valley of Drakes", locked: true },
      ],
      coords: { x: 65, y: 60, width: 18, height: 14 },
    },
    {
      id: "catacombs",
      name: "The Catacombs",
      description:
        "A labyrinthine network of tombs and chambers housing countless skeletons and necromancers.",
      discovered: false,
      currentLocation: false,
      services: ["Bonfire (Hidden)"],
      notes: [
        {
          title: "Undead Warning",
          content:
            "Skeletons will reanimate unless killed with a divine weapon or by killing the local necromancer.",
        },
      ],
      connectedAreas: [
        { id: "firelink-shrine", name: "Firelink Shrine", locked: false },
        { id: "tomb-of-giants", name: "Tomb of the Giants", locked: false },
      ],
      coords: { x: 70, y: 35, width: 14, height: 12 },
    },
  ];

  const [selectedRegion, setSelectedRegion] = useState<Region>(
    regions.find((r) => r.currentLocation) || regions[0]
  );
  const [mapScale, setMapScale] = useState<number>(1);

  // Handle region selection
  const handleRegionSelect = (region: Region) => {
    if (region.discovered) {
      setSelectedRegion(region);
    }
  };

  // Zoom map
  const zoomIn = () => setMapScale((prev) => Math.min(prev + 0.2, 2));
  const zoomOut = () => setMapScale((prev) => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setMapScale(1);

  return (
    <div className={styles.mapScreen}>
      <div className={styles.mapLayout}>
        {/* Left Column: Map Display */}
        <div className={styles.mapColumn}>
          <h3 className={styles.columnTitle}>World Map</h3>
          <div className={styles.mapContainer}>
            {/* SVG Map */}
            <div
              className={styles.mapBackground}
              style={{
                transform: `scale(${mapScale})`,
                transformOrigin: "center center",
              }}
            >
              <svg
                className={styles.mapSvg}
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Map Border */}
                <rect
                  className={styles.mapBorder}
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                />

                {/* Map Terrain */}
                <path
                  className={styles.mapTerrain}
                  d="M10,10 Q30,5 50,10 T90,15 L95,40 Q85,60 70,70 T30,80 L10,60 Q5,40 10,10 Z"
                />

                {/* Water Bodies */}
                <path
                  className={styles.mapWater}
                  d="M65,55 Q75,50 85,60 T75,75 L65,70 Q60,65 65,55 Z"
                />

                {/* Paths connecting regions */}
                <path
                  className={styles.mapPath}
                  d="M50,50 L35,30 L20,20 M50,50 L65,60 M50,50 L70,35"
                />

                {/* Map Markers */}
                {regions.map(
                  (region) =>
                    region.discovered && (
                      <g
                        key={region.id}
                        className={`${styles.mapMarker} ${
                          selectedRegion.id === region.id ? styles.selected : ""
                        }`}
                        onClick={() => handleRegionSelect(region)}
                        transform={`translate(${region.coords.x}, ${region.coords.y})`}
                      >
                        <rect
                          className={styles.markerArea}
                          x="-5"
                          y="-5"
                          width={region.coords.width}
                          height={region.coords.height}
                          rx="2"
                        />
                        <circle
                          className={styles.markerDot}
                          cx={region.coords.width / 2}
                          cy={region.coords.height / 2}
                          r={region.currentLocation ? 1.5 : 1}
                        />
                        {region.currentLocation && (
                          <circle
                            className={styles.playerMarker}
                            cx={region.coords.width / 2}
                            cy={region.coords.height / 2}
                            r="0.8"
                          />
                        )}
                        <text
                          className={styles.markerLabel}
                          x={region.coords.width / 2}
                          y={region.coords.height + 4}
                        >
                          {region.name}
                        </text>
                      </g>
                    )
                )}
              </svg>
            </div>

            {/* Map Controls */}
            <div className={styles.mapControls}>
              <button className={styles.mapButton} onClick={zoomIn}>
                +
              </button>
              <button className={styles.mapButton} onClick={resetZoom}>
                Reset
              </button>
              <button className={styles.mapButton} onClick={zoomOut}>
                -
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Location Details */}
        <div className={styles.locationColumn}>
          <div className={styles.regionDetails}>
            <h3 className={styles.regionName}>{selectedRegion.name}</h3>
            <p className={styles.regionDescription}>
              {selectedRegion.description}
            </p>

            {selectedRegion.notes.length > 0 && (
              <div className={styles.locationInfo}>
                <h4 className={styles.sectionTitle}>Notes</h4>
                {selectedRegion.notes.map((note, index) => (
                  <div key={index} className={styles.locationNote}>
                    <h4>{note.title}</h4>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
            )}

            {selectedRegion.services.length > 0 && (
              <div className={styles.locationInfo}>
                <h4 className={styles.sectionTitle}>Available Services</h4>
                <ul className={styles.servicesList}>
                  {selectedRegion.services.map((service, index) => (
                    <li key={index}>{service}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.mapNavigation}>
              <h4 className={styles.sectionTitle}>Connected Areas</h4>
              <ul className={styles.connectedAreas}>
                {selectedRegion.connectedAreas.map((area) => (
                  <li
                    key={area.id}
                    className={area.locked ? styles.lockedArea : ""}
                  >
                    {area.name} {area.locked && "(Locked)"}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapScreen;
