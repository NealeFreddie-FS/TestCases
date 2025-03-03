"use client";

import { GameEngine } from "../GameEngine";

export class DialogManager {
  engine: GameEngine;
  active: boolean = false;
  currentDialog: any = null;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  startDialog(dialogId: string, npcId?: string) {
    // In a real implementation, you would load dialog from a data source
    this.active = true;

    // Example dialog structure
    this.currentDialog = {
      id: dialogId,
      npcId: npcId || "unknown",
      text: "This is placeholder dialog text. In a real implementation, this would be loaded from a dialog database.",
      options: [
        { id: "option1", text: "Option 1 response" },
        { id: "option2", text: "Option 2 response" },
        { id: "exit", text: "End conversation" },
      ],
      currentNode: "start",
    };

    // Set game mode to dialog
    this.engine.setGameMode("dialog");
  }

  next() {
    // Move to next dialog node
    if (this.currentDialog) {
      // In a real implementation, this would navigate to the next node
      // based on the dialog tree structure
      console.log("Moving to next dialog node");
    }
  }

  choose(optionId: string) {
    // Handle dialog option selection
    if (this.currentDialog) {
      if (optionId === "exit") {
        this.endDialog();
      } else {
        // In a real implementation, this would follow the chosen dialog branch
        console.log(`Selected dialog option: ${optionId}`);
        this.next();
      }
    }
  }

  endDialog() {
    // End the current dialog
    this.active = false;
    this.currentDialog = null;

    // Return to exploration mode
    this.engine.setGameMode("exploration");
  }

  update(delta: number) {
    // Update any time-based dialog effects
    // This would be used for things like typewriter effects, etc.
  }
}
