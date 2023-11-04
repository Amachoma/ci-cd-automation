import { act, fireEvent, render, screen } from "@testing-library/react";
import { within } from "@testing-library/dom";
import VirtualizedGrid from "@/components/base/VirtualizedGrid/VirtualizedGrid";
import { getItemDataType } from "@/components/base/ItemContainer/helpers";
import { defineScreenSize, mockMatchMedia, sleep } from "@/utils/testUtils";
import { getCurrentConfig } from "@/hooks/mediaQuery/useMediaQuery";
import { HIDE_ITEM, SHOW_ITEM } from "@/components/base/ItemContainer/consts";
import { ToastContainer } from "react-toastify";
import { SELECT_ITEM, SHUFFLE_ITEM, UNSELECT_ALL } from "../ItemContainer/consts";

const RESIZE_CONFIG = {
    600: { columns: 1, gridGap: 14, padding: { left: 15, top: 15, right: 15, bottom: 15 }, aspectRatio: 4 },
    1200: { columns: 3, gridGap: 24, padding: { left: 20, top: 25, right: 20, bottom: 25 }, aspectRatio: 2 },
    default: { columns: 5, gridGap: 40, padding: { left: 40, top: 40, right: 40, bottom: 40 }, aspectRatio: 1 },
};

const CHECKBOX_CONFIG = {
    600: { size: 14, right: 20, top: 20 },
    default: { size: 18, right: 10, top: "calc(50% - 9px)" },
};

const ITEM_ACTIONS = { ADD: "add", REMOVE: "remove", ADD_MULTIPLE: "add multiple" };
const ITEM_CONTEXT_ACTIONS = [
    [
        { id: ITEM_ACTIONS.ADD, text: "Add item" },
        { id: ITEM_ACTIONS.REMOVE, text: "Remove item" },
        { id: ITEM_ACTIONS.ADD_MULTIPLE, text: "Add multiple" },
    ],
];

// TO-REMEMBER: default must be false
const contextActionsVisibilityCallback = function (id, targetUid, targetState, containerState, itemData) {
    if (!itemData) return false;
    switch (getItemDataType(itemData)) {
        case "array": {
            switch (id) {
                case ITEM_ACTIONS.ADD_MULTIPLE:
                    return containerState.selectionMode && itemData.length > 0;
                // case FOLDER_ACTIONS.ADD_MULTIPLE:
                //     return !!itemRecord.length;
                default:
                    return false;
            }
        }
        case "dictionary": {
            switch (id) {
                case ITEM_ACTIONS.ADD:
                case ITEM_ACTIONS.REMOVE:
                    return itemData.isEven;
                default:
                    return false;
            }
        }
        case "undefined":
            return false;
    }
};

let actionsContainer = [];
const contextActionsHandler = function (actionId, targetId, targetState, containerState, itemData) {
    if (!itemData) return;
    const itemRecord = itemData;

    switch (actionId) {
        case ITEM_ACTIONS.ADD_MULTIPLE:
            actionsContainer.push({ actionId, targetId, itemRecord });
            break;
        case ITEM_ACTIONS.ADD:
        case ITEM_ACTIONS.REMOVE:
        default:
            actionsContainer.push({ actionId, targetId });
    }
};

function GridItem({ uid, index, contextMenuHandler }) {
    return (
        <div onContextMenu={contextMenuHandler} data-testid="grid-item">
            Item {index}
        </div>
    );
}

function TestEmptyView() {
    return <div>Empty View</div>;
}

function itemIdsGenerator(num) {
    return () => (num === 0 ? [] : new Array(num).fill(0).map((item, idx) => idx.toString()));
}

function itemIdxGetter(ids) {
    return ids.map((id) => ({ uid: id.toString(), index: id, isEven: id % 2 === 0 }));
}

let GRID_ITEM_TOTAL_COUNT = 80;

function renderGrid({
    tolerance = 1,
    itemCount = GRID_ITEM_TOTAL_COUNT,
    canSelect = true,
    canHide = true,
    canShuffle = true,
    itemContextMenuEmptyText = undefined,
    containerContextMenuEmptyText = undefined,
    contextMenuActions = ITEM_CONTEXT_ACTIONS,
} = {}) {
    return render(
        <div>
            <ToastContainer />
            <VirtualizedGrid
                uid="testVirtualGrid"
                itemResizeConfig={RESIZE_CONFIG}
                contextMenuActions={contextMenuActions}
                contextMenuActionsVisibilityCallback={contextActionsVisibilityCallback}
                contextMenuActionsHandler={contextActionsHandler}
                itemIdsGetter={itemIdsGenerator(itemCount)}
                itemPropsGetter={itemIdxGetter}
                tolerance={tolerance}
                Item={GridItem}
                canSelect={canSelect}
                canHide={canHide}
                canShuffle={canShuffle}
                checkboxResizeConfig={CHECKBOX_CONFIG}
                disableClickOnSelection={true}
                isSelectableKey="isEven"
                emptyContextMenuText={"there is no context menu for the system collection"}
                emptyView={TestEmptyView}
                itemContextMenuEmptyText={itemContextMenuEmptyText}
                containerContextMenuEmptyText={containerContextMenuEmptyText}
            />
        </div>
    );
}

function getColumnCount(virtualGrid) {
    const itemContainer = within(virtualGrid).getByTestId("controls-item-container");
    const containerStyles = getComputedStyle(itemContainer);
    return +containerStyles.getPropertyValue("grid-template-columns").split(",")[0].at(-1);
}

function fitContainerToScreen(virtualGrid) {
    //    within(virtualGrid).getByRole("region");
    const scrollRef = virtualGrid.querySelector(".simplebar-content-wrapper");
    Object.defineProperty(scrollRef, "offsetWidth", {
        writable: true,
        configurable: true,
        value: window.innerWidth,
    });
    Object.defineProperty(scrollRef, "offsetHeight", {
        writable: true,
        configurable: true,
        value: window.innerHeight,
    });
}

function scrollContainer(virtualGrid, value) {
    const scrollRef = virtualGrid.querySelector(".simplebar-content-wrapper");
    Object.defineProperty(scrollRef, "scrollTop", {
        writable: true,
        configurable: true,
        value,
    });
    scrollRef.dispatchEvent(new Event("scroll"));
    return value;
}

function getGridConfig(height, tolerance, scrollTop) {
    const { columns, gridGap, padding, aspectRatio } = getCurrentConfig(RESIZE_CONFIG);
    const horizontalGridGapSpace = gridGap * (columns - 1);
    const horizontalPadding = padding.left + padding.right;
    const itemWidth = (window.innerWidth - horizontalPadding - horizontalGridGapSpace) / columns;
    const itemHeight = itemWidth / aspectRatio;

    // const { itemWidth, itemHeight, padding, gridGap, columns } = getGridConfig();
    const totalRows = Math.ceil(GRID_ITEM_TOTAL_COUNT / columns);
    const oneRowSize = itemHeight + gridGap;

    const upperOffscreenRowCount = Math.floor(Math.max(scrollTop - padding.top, 0) / oneRowSize);

    let fullRowsToDisplay = Math.floor(window.innerHeight / oneRowSize) + 1;
    if (height % oneRowSize === 0 && Math.max(scrollTop - padding.top, 0) % oneRowSize === 0) {
        fullRowsToDisplay -= 1;
    }

    const renderFromRow = Math.max(upperOffscreenRowCount - tolerance, 0);
    const renderFromItem = renderFromRow * columns;
    const renderToRow = Math.min(upperOffscreenRowCount + fullRowsToDisplay + tolerance, totalRows);
    const renderToItem = Math.min(GRID_ITEM_TOTAL_COUNT, renderToRow * columns);

    const paddingTop = renderFromRow * oneRowSize + padding.top;
    const paddingBottom = (totalRows - renderToRow) * oneRowSize + padding.bottom;

    return {
        itemWidth,
        itemHeight,
        columns,
        gridGap,
        padding,
        paddingTop,
        paddingBottom,
        renderFromItem,
        renderToItem,
    };
}

function stylesGetter(element) {
    const containerStyles = getComputedStyle(element);
    return (propertyName) => containerStyles.getPropertyValue(propertyName);
}

function getGridItems() {
    return screen.getAllByTestId("grid-item");
}

function getContextMenu() {
    return screen.getByTestId("context-menu");
}

function queryContextMenu() {
    return screen.queryByTestId("context-menu");
}

function getGridItemContainer() {
    return screen.getByTestId("controls-item-container");
}

function openContextMenu(element) {
    act(() => {
        fireEvent.contextMenu(element);
    });
}

function clickContextMenuButton(buttonText) {
    act(() => {
        const contextMenu = getContextMenu();
        const btn = within(contextMenu).getByText(buttonText);
        fireEvent.click(btn);
    });
}

function findDifference(col1, col2) {
    return col1.reduce((acc, _, idx) => acc + Number(col1[idx].textContent !== col2[idx].textContent), 0);
}

describe("Grid With Virtualization", () => {
    let unsub;
    beforeEach(() => {
        unsub = mockMatchMedia();
    });

    afterEach(() => {
        unsub();
    });

    describe("Basic features", () => {
        it("Should use correct config after initialization", () => {
            const config = [
                { width: 1600, height: 900, expectedCount: 5 },
                { width: 1000, height: 400, expectedCount: 3 },
                { width: 320, height: 720, expectedCount: 1 },
            ];

            config.forEach(({ width, height, expectedCount }) => {
                defineScreenSize({ width, height });
                const { container: virtualGrid } = renderGrid();
                expect(getColumnCount(virtualGrid)).toBe(expectedCount);
            });
        });

        it("Should respond to resize event", () => {
            defineScreenSize({ width: 1600, height: 900 });
            // const matchMedia = jest.spyOn(window, "matchMedia");
            const { container: virtualGrid } = renderGrid();

            // expect(matchMedia).toHaveBeenCalledTimes(Object.keys(RESIZE_CONFIG).length);
            expect(getColumnCount(virtualGrid)).toBe(5);

            act(() => {
                defineScreenSize({ width: 320, height: 720 }, true);
            });

            expect(getColumnCount(virtualGrid)).toBe(1);
            // matchMedia.mockRestore();
        });

        it("Should display correct set of items", () => {
            const configs = [
                { width: 1600, height: 900, tolerance: 2, scrollTop: 0 },
                { width: 800, height: 420, tolerance: 3, scrollTop: 1000 },
                { width: 320, height: 760, tolerance: 5, scrollTop: 6194 },
            ];
            configs.forEach(({ width, height, tolerance, scrollTop }) => {
                defineScreenSize({ width, height });
                const { container: virtualGrid } = renderGrid({ tolerance });
                fitContainerToScreen(virtualGrid);

                // Trigger resize event to fit container size to screen
                act(() => {
                    scrollContainer(virtualGrid, scrollTop);
                    defineScreenSize({ width, height }, true);
                });

                const { renderFromItem, renderToItem } = getGridConfig(height, tolerance, scrollTop);

                const gridItems = getGridItems();

                expect(gridItems.at(0)).toHaveTextContent(`Item ${renderFromItem}`);
                expect(gridItems.at(-1)).toHaveTextContent(`Item ${renderToItem - 1}`);
                virtualGrid.remove();
            });
        });

        it("Should change items displayed on scroll", () => {
            const { width, height, tolerance, scrollTop } = {
                width: 1600,
                height: 900,
                tolerance: 1,
                scrollTop: 1200,
            };
            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance });
            fitContainerToScreen(virtualGrid);

            const gridConfigBefore = getGridConfig(height, tolerance, 0);
            const gridItemsBefore = getGridItems();

            act(() => {
                scrollContainer(virtualGrid, scrollTop);
                defineScreenSize({ width, height }, true);
            });

            const gridConfigAfter = getGridConfig(height, tolerance, scrollTop);
            const gridItemsAfter = getGridItems();

            expect(gridConfigBefore.renderFromItem).toBeLessThan(gridConfigAfter.renderFromItem);
            expect(gridConfigBefore.renderToItem).toBeLessThan(gridConfigAfter.renderToItem);
            expect(gridItemsBefore.length).toBeLessThanOrEqual(gridItemsAfter.length);
            virtualGrid.remove();
        });

        it("Should calculate container parameters correctly", () => {
            const configs = [
                { width: 1700, height: 1000, tolerance: 3, scrollTop: 0 },
                { width: 900, height: 520, tolerance: 7, scrollTop: 1000 },
                { width: 360, height: 720, tolerance: 5, scrollTop: 6194 },
            ];
            configs.forEach(({ width, height, tolerance, scrollTop }) => {
                defineScreenSize({ width, height });
                const { container: virtualGrid } = renderGrid({ tolerance });
                fitContainerToScreen(virtualGrid);

                // Trigger resize event to fit container size to screen
                act(() => {
                    scrollContainer(virtualGrid, scrollTop);
                    defineScreenSize({ width, height }, true);
                });

                const { itemWidth, columns, paddingBottom, paddingTop, padding, gridGap } = getGridConfig(
                    height,
                    tolerance,
                    scrollTop
                );

                const itemContainer = getGridItemContainer();
                const getGridStyle = stylesGetter(itemContainer);

                expect(getGridStyle("gap")).toBe(`${gridGap}px`);
                expect(getGridStyle("grid-template-columns")).toBe(`repeat(${columns}, ${itemWidth}px)`);
                expect(getGridStyle("padding")).toBe(
                    `${paddingTop}px ${padding.right}px ${paddingBottom}px ${padding.left}px`
                );
                virtualGrid.remove();
            });
        });

        it("Should display EmptyView component when there are no items to display", () => {
            const { width, height, tolerance } = {
                width: 1600,
                height: 900,
                tolerance: 1,
            };
            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance, itemCount: 0 });
            const gridContainer = screen.queryByTestId("controls-item-container");

            expect(within(virtualGrid).getByText("Empty View")).toBeInTheDocument();
            expect(gridContainer).toBeNull();
        });
    });

    describe("Animation classes", () => {
        it("Should initialize Items with init animation class", () => {
            const { width, height } = {
                width: 1600,
                height: 900,
            };
            defineScreenSize({ width, height });
            renderGrid();
            const initGridItems = document.querySelectorAll(".container__item_initial");
            expect(initGridItems.length).toBe(getGridItems().length);
        });

        it("Should attach appropriate directional animations classes to new items on scroll", async () => {
            const { width, height, tolerance, scrollTop } = {
                width: 1600,
                height: 900,
                tolerance: 1,
                scrollTop: 900,
            };
            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance });
            fitContainerToScreen(virtualGrid);

            act(() => {
                defineScreenSize({ width, height }, true);
            });

            act(() => {
                scrollContainer(virtualGrid, scrollTop);
                defineScreenSize({ width, height }, true);
            });

            let initGridItems = document.querySelectorAll(".container__item_bottom");
            expect(initGridItems.length).toBe(RESIZE_CONFIG.default.columns * 2);

            act(() => {
                scrollContainer(virtualGrid, 0);
                defineScreenSize({ width, height }, true);
            });
            initGridItems = document.querySelectorAll(".container__item_top");
            expect(initGridItems.length).toBe(RESIZE_CONFIG.default.columns);
        });

        it("Should preserve previously existed items on scroll ", () => {
            const { width, height, tolerance, scrollTop } = {
                width: 1600,
                height: 900,
                tolerance: 1,
                scrollTop: 900,
            };
            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance });
            fitContainerToScreen(virtualGrid);

            act(() => {
                defineScreenSize({ width, height }, true);
            });

            act(() => {
                scrollContainer(virtualGrid, scrollTop);
                defineScreenSize({ width, height }, true);
            });

            let initGridItems = document.querySelectorAll(".container__item_initial");
            expect(initGridItems.length).toBe(getGridItems().length - RESIZE_CONFIG.default.columns * 2);

            act(() => {
                scrollContainer(virtualGrid, 0);
                defineScreenSize({ width, height }, true);
            });
            initGridItems = document.querySelectorAll(".container__item_initial");
            expect(initGridItems.length).toBe(getGridItems().length - RESIZE_CONFIG.default.columns);
        });
    });

    describe("Context menu basics", () => {
        beforeEach(() => {
            const { width, height } = { width: 1600, height: 900 };
            defineScreenSize({ width, height });
        });

        it("Should display item context menu on contextMenu click on item", () => {
            const { container: virtualGrid } = renderGrid();
            fitContainerToScreen(virtualGrid);

            expect(queryContextMenu()).toBeNull();
            openContextMenu(getGridItems()[0]);
            expect(getContextMenu()).toBeInTheDocument();
        });

        it("Should display container context menu on contextMenu click on container", () => {
            const { container: virtualGrid } = renderGrid();
            fitContainerToScreen(virtualGrid);

            expect(queryContextMenu()).toBeNull();
            openContextMenu(getGridItemContainer());
            expect(getContextMenu()).toBeInTheDocument();
        });

        it("Shouldn't display context menu on item without actions click", () => {
            const { container: virtualGrid } = renderGrid({ canShuffle: false, canSelect: false, canHide: false });
            fitContainerToScreen(virtualGrid);

            act(() => {
                fireEvent.contextMenu(getGridItems()[1]);
            });

            expect(queryContextMenu()).toBeNull();
        });

        it("Should display different messages for container and item click when actions are empty", async () => {
            const [containerContextMenuEmptyText, itemContextMenuEmptyText] = ["Empty Container", "Empty Item"];
            const { container: virtualGrid } = renderGrid({
                canShuffle: false,
                canSelect: false,
                canHide: false,
                containerContextMenuEmptyText,
                itemContextMenuEmptyText,
            });
            fitContainerToScreen(virtualGrid);

            act(() => {
                fireEvent.contextMenu(getGridItems()[1]);
            });
            expect(await screen.findByText(itemContextMenuEmptyText)).toBeInTheDocument();

            act(() => {
                fireEvent.contextMenu(getGridItemContainer());
            });
            expect(await screen.findByText(containerContextMenuEmptyText)).toBeInTheDocument();
        });
    });

    describe("Hide/Reveal functions", () => {
        beforeEach(() => {
            const { width, height, tolerance } = { width: 1600, height: 900, tolerance: 2 };

            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance });
            fitContainerToScreen(virtualGrid);
        });

        it("Shouldn't display 'reveal' option when all items are visible", async () => {
            openContextMenu(getGridItems()[0]);
            expect(await within(getContextMenu()).queryByText(SHOW_ITEM.text)).toBeNull();

            openContextMenu(getGridItemContainer());
            expect(await within(getContextMenu()).queryByText(SHOW_ITEM.text)).toBeNull();
        });

        it("Should only display 'reveal' option at container context menu", async () => {
            openContextMenu(getGridItems()[0]);
            clickContextMenuButton(HIDE_ITEM.text);

            openContextMenu(getGridItems()[0]);
            expect(await within(getContextMenu()).queryByText(SHOW_ITEM.text)).toBeNull();
            openContextMenu(getGridItems()[1]);
            expect(await within(getContextMenu()).queryByText(SHOW_ITEM.text)).toBeNull();

            openContextMenu(getGridItemContainer());
            expect(await within(getContextMenu()).queryByText(SHOW_ITEM.text)).toBeInTheDocument();
        });

        it("Should preserve other elements when hiding an element", () => {
            const gridItemsBefore = getGridItems();
            // Item context menu trigger
            openContextMenu(gridItemsBefore[0]);

            // "Hide" option click
            clickContextMenuButton(HIDE_ITEM.text);

            let gridItemsAfter = getGridItems();
            gridItemsAfter.unshift(gridItemsAfter.pop());

            // When one element is hidden the items are the same except that one item
            expect(findDifference(gridItemsBefore, gridItemsAfter)).toBe(1);
        });

        it("Should return items to initial state when hitting 'reveal'\n", () => {
            // Container context menu trigger
            const gridItemsBefore = getGridItems();

            // Item context menu trigger
            openContextMenu(gridItemsBefore[0]);

            // "Hide" option click
            clickContextMenuButton(HIDE_ITEM.text);

            // Container context menu trigger
            openContextMenu(getGridItemContainer());

            // Context menu "reveal" click
            clickContextMenuButton(SHOW_ITEM.text);

            const gridItemsAfter = getGridItems();
            // When "reveal" is triggered items are the same as before
            expect(findDifference(gridItemsBefore, gridItemsAfter)).toBe(0);
        });
    });

    describe("Shuffle function", () => {
        beforeEach(() => {
            const { width, height, tolerance } = { width: 1600, height: 900, tolerance: 2 };

            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance });
            fitContainerToScreen(virtualGrid);
        });

        it("Should only display shuffle function through container context menu", async () => {
            openContextMenu(getGridItems()[0]);
            expect(await within(getContextMenu()).queryByText(SHUFFLE_ITEM.text)).toBeNull();

            openContextMenu(getGridItemContainer());
            expect(await within(getContextMenu()).queryByText(SHUFFLE_ITEM.text)).toBeInTheDocument();
        });

        it("Should shuffle properly", () => {
            const itemsBefore = getGridItems();

            openContextMenu(getGridItemContainer());
            clickContextMenuButton(SHUFFLE_ITEM.text);

            const itemsAfter = getGridItems();
            expect(findDifference(itemsBefore, itemsAfter)).toBeGreaterThan(0);
        });
    });

    describe("Select mode functions", () => {
        const CHECKBOX_CLASS = ".controls-checkbox";
        const CHECKBOX_CHECKED_CLASS = ".controls-checkbox_checked";
        const getText = (id) => ITEM_CONTEXT_ACTIONS[0].filter((item) => item.id === id)[0].text;

        beforeEach(() => {
            const { width, height, tolerance } = { width: 1600, height: 900, tolerance: 2 };

            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({ tolerance });
            fitContainerToScreen(virtualGrid);
        });

        it("Should select item when selection mode is triggered from item context menu", async () => {
            openContextMenu(getGridItems()[0]);
            clickContextMenuButton(SELECT_ITEM.text);
            expect(getGridItemContainer().querySelectorAll(CHECKBOX_CHECKED_CLASS).length).toBe(1);
        });

        it("Should make selection empty when selection mode is triggered from container context menu", () => {
            openContextMenu(getGridItemContainer());
            clickContextMenuButton(SELECT_ITEM.text);
            expect(getGridItemContainer().querySelectorAll(CHECKBOX_CHECKED_CLASS).length).toBe(0);
        });

        it("Should be able to click checkboxes", () => {
            openContextMenu(getGridItemContainer());
            clickContextMenuButton(SELECT_ITEM.text);

            expect(getGridItemContainer().querySelectorAll(CHECKBOX_CHECKED_CLASS).length).toBe(0);
            act(() => {
                fireEvent.click(getGridItemContainer().querySelector(CHECKBOX_CLASS));
            });
            expect(getGridItemContainer().querySelectorAll(CHECKBOX_CHECKED_CLASS).length).toBe(1);
        });

        it("Shouldn't display checkboxes for non-selectable items", () => {
            openContextMenu(getGridItemContainer());
            clickContextMenuButton(SELECT_ITEM.text);

            expect(getGridItems()[1].querySelectorAll(CHECKBOX_CLASS).length).toBe(0);
        });

        it("Should only display selection mode specific context menu items", async () => {
            openContextMenu(getGridItems()[0]);
            clickContextMenuButton(SELECT_ITEM.text);

            openContextMenu(getGridItems()[0]);
            expect(await within(getContextMenu()).queryByText(getText(ITEM_ACTIONS.ADD))).toBeNull();
            expect(await within(getContextMenu()).queryByText(getText(ITEM_ACTIONS.REMOVE))).toBeNull();
            expect(await within(getContextMenu()).queryByText(getText(ITEM_ACTIONS.ADD_MULTIPLE))).toBeInTheDocument();
            expect(await within(getContextMenu()).queryByText(UNSELECT_ALL.text)).toBeInTheDocument();
        });

        it("Should render checkboxes responding to resize event", () => {
            openContextMenu(getGridItemContainer());
            clickContextMenuButton(SELECT_ITEM.text);

            let checkboxStyles = stylesGetter(getGridItemContainer().querySelectorAll(CHECKBOX_CLASS)[0]);
            const size = checkboxStyles("--checkbox-size");

            act(() => {
                defineScreenSize({ width: 300, height: 720 }, true);
            });

            checkboxStyles = stylesGetter(getGridItemContainer().querySelectorAll(CHECKBOX_CLASS)[0]);
            expect(size).not.toEqual(checkboxStyles("--checkbox-size"));
        });

        it("Should provide appropriate item ids upon triggering select mode action", () => {
            openContextMenu(getGridItems()[0]);
            clickContextMenuButton(SELECT_ITEM.text);
            actionsContainer = [];

            act(() => {
                fireEvent.click(getGridItemContainer().querySelectorAll(CHECKBOX_CLASS)[2]);
            });

            openContextMenu(getGridItemContainer());
            clickContextMenuButton(getText(ITEM_ACTIONS.ADD_MULTIPLE));

            expect(actionsContainer[0].itemRecord.length).toBe(2);
        });

        // Otherwise, it's meaningless
        it("Should only display 'select' option when there are possible actions with multiple items", async () => {
            openContextMenu(getGridItemContainer());
            expect(within(getContextMenu()).getByText(SELECT_ITEM.text)).toBeInTheDocument();
            getGridItemContainer().remove();

            //close context menu
            act(() => {
                fireEvent.contextMenu(screen.getByTestId("context-menu-darken"));
            });
            await act(async () => {
                await sleep(800);
            });

            const contextMenuActions = [
                ITEM_CONTEXT_ACTIONS[0].filter((item) => item.id !== ITEM_ACTIONS.ADD_MULTIPLE),
            ];
            const { width, height, tolerance } = { width: 1600, height: 900, tolerance: 2 };

            defineScreenSize({ width, height });
            const { container: virtualGrid } = renderGrid({
                contextMenuActions,
                tolerance,
                canHide: false,
                canShuffle: false,
                canSelect: true,
            });
            fitContainerToScreen(virtualGrid);

            openContextMenu(getGridItems()[0]);
            expect(within(getContextMenu()).queryByText(SELECT_ITEM.text)).toBeNull();
        });
    });
});
