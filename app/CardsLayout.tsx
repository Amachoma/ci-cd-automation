"use client";

import VirtualizedGrid from "@/components/base/VirtualizedGrid/VirtualizedGrid";
import EmptyView from "@/components/base/EmptyView/EmptyView";
import { EMPTY_VIEW_TEXT_TYPES } from "@/components/base/EmptyView/interfaces";
import { ResizeConfig } from "@/hooks/mediaQuery/interfaces";
import { GridItemResizeConfig } from "@/components/base/VirtualizedGrid/interfaces";
import { PayloadItemProps } from "@/components/base/ContextMenu/interfaces";
import { contextMenuActionsArguments, GridItemProps, ItemProps } from "@/components/base/ItemContainer/interfaces";
import { getItemDataType } from "@/components/base/ItemContainer/helpers";
import { CONTEXT_MENU_ICONS } from "@/icons/icons";

function FoldersEmptyView() {
    const EMPTY_VIEW_MESSAGE_SETTINGS = [
        { type: EMPTY_VIEW_TEXT_TYPES.TEXT, label: "no collections to display" },
        { type: EMPTY_VIEW_TEXT_TYPES.BREAK },
        { type: EMPTY_VIEW_TEXT_TYPES.TEXT, label: "try to " },
        {
            type: EMPTY_VIEW_TEXT_TYPES.BUTTON,
            label: "reset the filters",
            onClick: () => {
                alert("Click!");
            },
        },
    ];
    return <EmptyView message={EMPTY_VIEW_MESSAGE_SETTINGS} />;
}

const FOLDER_GRID_CONFIG: ResizeConfig<GridItemResizeConfig> = {
    600: { columns: 1, gridGap: 14, padding: { left: 15, top: 15, right: 15, bottom: 15 }, aspectRatio: 4 },
    850: { columns: 2, gridGap: 14, padding: { left: 15, top: 15, right: 15, bottom: 15 }, aspectRatio: 4 },
    1200: { columns: 3, gridGap: 24, padding: { left: 20, top: 25, right: 20, bottom: 25 }, aspectRatio: 4 },
    1750: { columns: 4, gridGap: 30, padding: { left: 40, top: 25, right: 40, bottom: 25 }, aspectRatio: 4 },
    default: { columns: 5, gridGap: 40, padding: { left: 40, top: 40, right: 40, bottom: 40 }, aspectRatio: 4 },
};

const FOLDER_GRID_CHECKBOX_CONFIG = {
    default: { size: 18, right: 10, top: "calc(50% - 9px)" },
};

enum FOLDER_ACTIONS {
    ADD = "add",
    ADD_MULTIPLE = "addMultiple",
    DELETE = "delete",
    DELETE_MULTIPLE = "deleteMultiple",
}

const FOLDER_ITEM_ACTIONS: PayloadItemProps[][] = [
    [
        { id: FOLDER_ACTIONS.ADD, text: "add", icon: CONTEXT_MENU_ICONS.plus },
        { id: FOLDER_ACTIONS.ADD_MULTIPLE, text: "add selection", icon: CONTEXT_MENU_ICONS.plus },
        { id: FOLDER_ACTIONS.DELETE, text: "remove", icon: CONTEXT_MENU_ICONS.cross },
        { id: FOLDER_ACTIONS.DELETE_MULTIPLE, text: "remove selection", icon: CONTEXT_MENU_ICONS.cross },
    ],
];

interface MyModel {
    uid: string;
    text: string;
    date?: Date;
}

const folderContextActionsVisibilityCallback: contextMenuActionsArguments<boolean, MyModel> = function (
    id,
    targetUid,
    targetState,
    containerState,
    itemData
): boolean {
    if (!itemData) return false;
    switch (getItemDataType(itemData)) {
        case "array": {
            const itemRecord = itemData as string[];
            switch (id) {
                case FOLDER_ACTIONS.ADD_MULTIPLE:
                    return !!itemRecord.length;
                case FOLDER_ACTIONS.DELETE_MULTIPLE:
                    return !!itemRecord.length;
                default:
                    return false;
            }
        }
        case "dictionary": {
            const itemRecord = itemData as ItemProps<MyModel>;
            switch (id) {
                case FOLDER_ACTIONS.ADD:
                    return itemRecord.text.length > 10;
                case FOLDER_ACTIONS.DELETE:
                    return !!itemRecord.date;
                default:
                    return false;
            }
        }
        case "undefined":
            return false;
    }
};

const folderContextActionsHandler: contextMenuActionsArguments<void, MyModel> = function (
    actionId,
    targetId,
    targetState,
    containerState,
    itemData
) {
    if (!itemData) return;
    const itemRecord = itemData as ItemProps<MyModel>;

    switch (actionId) {
        case FOLDER_ACTIONS.ADD:
            alert(`Adding item "${targetId}" with text: "${itemRecord.text}"`);
            break;
        case FOLDER_ACTIONS.ADD_MULTIPLE:
            alert(`Adding multiple: "${itemData as string[]}"`);
            break;
        case FOLDER_ACTIONS.DELETE:
            alert(`Deleting item "${targetId}" with text: "${itemRecord.text}"`);
            break;
        case FOLDER_ACTIONS.DELETE_MULTIPLE:
            alert(`Deleting multiple: "${itemData as string[]}"`);
            break;
    }
};

function MyItem({ uid, text, date, contextMenuHandler }: GridItemProps<MyModel>) {
    return (
        <article
            style={{
                padding: 12,
                background: "#333",
                color: "ghostwhite",
                borderRadius: 8,
                height: "100%",
                boxShadow: "0 0 8px rgba(0, 0, 0, 0.3)",
            }}
            onContextMenu={contextMenuHandler}
        >
            <h2>{text}</h2>
            {date && <time>{date.toISOString()}</time>}
        </article>
    );
}

interface CardsLayoutProps {
    myItemsData: MyModel[];
}

export default function CardsLayout({ myItemsData }: CardsLayoutProps) {
    const one = 1;

    function foldersItemGetter(ids: string[]) {
        return myItemsData.filter((item) => ids.includes(item.uid));
    }

    function getIdsOrder() {
        return myItemsData.map((item) => item.uid);
    }

    return (
        <div className="random-container" style={{ width: "100vw", height: "100vh" }}>
            <VirtualizedGrid
                itemResizeConfig={FOLDER_GRID_CONFIG}
                contextMenuActions={FOLDER_ITEM_ACTIONS}
                contextMenuActionsVisibilityCallback={folderContextActionsVisibilityCallback}
                contextMenuActionsHandler={folderContextActionsHandler}
                itemPropsGetter={foldersItemGetter}
                tolerance={1}
                Item={MyItem}
                itemIdsGetter={getIdsOrder}
                canSelect={true}
                checkboxResizeConfig={FOLDER_GRID_CHECKBOX_CONFIG}
                disableClickOnSelection={true}
                emptyView={FoldersEmptyView}
            />
        </div>
    );
}
