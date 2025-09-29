import React from "react";
import { IonIcon } from "@ionic/react";
import { trashOutline } from "ionicons/icons";

interface Props {
    selectedCount: number;
    onDelete: () => void;
    onToggleSelectVisible: () => void;
    onClearSelection: () => void;
}

export default function OptionsMenu({ selectedCount, onDelete, onToggleSelectVisible, onClearSelection }: Props) {
    return (
        <div className="absolute mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-md w-48 z-20">
            <button
                className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 ${selectedCount === 0 ? "opacity-60 pointer-events-none" : ""}`}
                onClick={onDelete}
            >
                <IonIcon icon={trashOutline} />
                Delete Selected ({selectedCount})
            </button>

            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={onToggleSelectVisible}>
                Toggle Select Visible
            </button>

            <button className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={onClearSelection}>
                Clear Selection
            </button>
        </div>
    );
}
