import React, { useState } from "react";
import Image from "next/image";
import PaperUIFrame from "./PaperUIFrame";
import PaperUIButton from "./PaperUIButton";

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  quantity: number;
  type: string;
}

interface PixelInventoryProps {
  items: InventoryItem[];
  onItemUse?: (item: InventoryItem) => void;
  onItemDrop?: (item: InventoryItem) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * A pixel inventory component using the Pocket Inventory Series #2 Pixel Map assets
 */
export default function PixelInventory({
  items,
  onItemUse,
  onItemDrop,
  onClose,
  className = "",
}: PixelInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [currentTab, setCurrentTab] = useState("all");

  // Filter items by type
  const filteredItems =
    currentTab === "all"
      ? items
      : items.filter((item) => item.type === currentTab);

  // Get item categories - use a more compatible approach to get unique values
  const itemTypes = items.map((item) => item.type);
  const uniqueTypes = Array.from(new Set(itemTypes));
  const categories = ["all", ...uniqueTypes];

  // Handle item selection
  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
  };

  // Handle item use
  const handleUseItem = () => {
    if (selectedItem && onItemUse) {
      onItemUse(selectedItem);
    }
  };

  // Handle item drop
  const handleDropItem = () => {
    if (selectedItem && onItemDrop) {
      onItemDrop(selectedItem);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="relative pixelated p-4"
        style={{
          width: "400px",
          height: "500px",
          backgroundImage:
            "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Pixel Map/0.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-20 paper-hover"
            style={{
              width: "32px",
              height: "32px",
              backgroundImage:
                "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Buttons/1.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              imageRendering: "pixelated",
            }}
          ></button>
        )}

        {/* Inventory title */}
        <div className="text-center mb-4">
          <div
            className="pixelated p-2 inline-block"
            style={{
              backgroundImage:
                "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Holders/1.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="text-sm text-paper-brown font-semibold">
              Inventory
            </div>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex justify-center mb-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setCurrentTab(category)}
              className={`mx-1 transition-all ${
                currentTab === category ? "scale-110" : "scale-100 opacity-80"
              }`}
            >
              <div
                className="pixelated p-1 px-3"
                style={{
                  backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Side Tabs/${
                    currentTab === category ? "1.png" : "0.png"
                  }')`,
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="text-xs capitalize text-paper-brown">
                  {category}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="grid grid-cols-4 gap-2 overflow-y-auto h-48 p-2 mb-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`relative cursor-pointer transition-all hover:scale-105 ${
                selectedItem?.id === item.id ? "scale-110" : "scale-100"
              }`}
            >
              <div
                className="pixelated p-1"
                style={{
                  backgroundImage:
                    "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Holders/0.png')",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div
                  className="w-10 h-10 mx-auto pixelated"
                  style={{
                    backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Items/${item.icon}')`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                ></div>
                <div className="text-[10px] text-center text-paper-brown mt-1 truncate">
                  {item.name}
                </div>
                <div className="absolute top-0 right-1 text-[8px] bg-paper-brown text-white px-1 rounded-sm">
                  {item.quantity}
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-4 text-center text-paper-brown text-sm py-10">
              No items in this category
            </div>
          )}
        </div>

        {/* Selected item details */}
        {selectedItem && (
          <div
            className="pixelated p-3 mb-4"
            style={{
              backgroundImage:
                "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Holders/3.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="flex">
              <div
                className="w-12 h-12 mr-3 pixelated"
                style={{
                  backgroundImage: `url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Items/${selectedItem.icon}')`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              ></div>
              <div>
                <div className="text-sm font-semibold text-paper-brown">
                  {selectedItem.name} ({selectedItem.quantity})
                </div>
                <div className="text-xs text-paper-brown mt-1">
                  {selectedItem.description}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center gap-4">
          <PaperUIButton
            type="green"
            size="small"
            onClick={handleUseItem}
            disabled={!selectedItem}
          >
            Use
          </PaperUIButton>
          <PaperUIButton
            type="red"
            size="small"
            onClick={handleDropItem}
            disabled={!selectedItem}
          >
            Drop
          </PaperUIButton>
        </div>

        {/* Footer */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[80%]">
          <div
            className="pixelated p-1 text-center"
            style={{
              backgroundImage:
                "url('/assets/Pocket Inventory Series #2 Pixel Map v1.2/Sprites/Content/Progress Bars/0.png')",
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="text-xs text-paper-brown">
              {items.length} / 20 items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
