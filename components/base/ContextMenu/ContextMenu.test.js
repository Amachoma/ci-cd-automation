import { render, screen, fireEvent, act } from "@testing-library/react";
import { within } from "@testing-library/dom";
import useContextMenu from "@/components/base/ContextMenu/useContextMenu";
import ContextMenu from "@/components/base/ContextMenu/ContextMenu";
import { sleep, mockMatchMedia } from "@/utils/testUtils";
import { defineScreenSize } from "../../../utils/testUtils";

let contextItemClicks = [];

const itemsGroups = [
    [
        { id: "add", text: "Add to Collection" },
        {
            id: "delete",
            text: "Remove item",
        },
    ],
    [{ id: "hide", text: "Hide Items" }],
    [{ id: "random", text: "Randomize items" }],
];
const itemCount = itemsGroups.reduce((acc, subArray) => (acc += subArray.length), 0);

function ContextMenuTest({ items }) {
    const { contextState, showContextMenu, closeContextMenu } = useContextMenu();

    function contextMenuClick(actionId, itemId) {
        contextItemClicks.push({ actionId, itemId });
        closeContextMenu();
    }

    return (
        <div>
            <button
                onContextMenu={(e) => {
                    showContextMenu(e, "item", items);
                }}
            >
                Context Menu
            </button>
            <ContextMenu
                isVisible={contextState.isVisible}
                x={contextState.pos.x}
                y={contextState.pos.y}
                items={contextState.items}
                closeHandler={closeContextMenu}
                itemClickHandler={contextMenuClick}
                itemId={contextState.opener}
            />
        </div>
    );
}

describe("Context Menu", () => {
    let unsub;
    beforeEach(() => {
        unsub = mockMatchMedia();
        render(<ContextMenuTest items={itemsGroups} />);
        contextItemClicks = [];
    });
    afterEach(() => {
        unsub();
    });

    it("Shouldn't be present by default", () => {
        const contextMenu = screen.queryByTestId("context-menu");
        expect(contextMenu).toBeNull();
    });

    it("Should appear on context menu event", () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button);
        });
        const contextMenu = screen.getByTestId("context-menu");
        expect(contextMenu).toBeInTheDocument();
    });

    it("Should be of right item count", () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button);
        });
        const contextMenu = screen.getByTestId("context-menu");
        const contextMenuItems = within(contextMenu).getAllByRole("button", contextMenu);
        expect(contextMenuItems).toHaveLength(itemCount);
    });

    it("Should appear at correct coordinates", () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button, { clientX: 100, clientY: 100 });
        });
        const contextMenu = screen.getByTestId("context-menu");
        const contextMenuStyles = getComputedStyle(contextMenu);
        expect(contextMenuStyles.left).toBe("100px");
        expect(contextMenuStyles.top).toBe("100px");
    });

    it("Should disappear on click outside", async () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button);
        });
        const contextMenuDarken = screen.getByTestId("context-menu-darken");
        act(() => {
            fireEvent.contextMenu(contextMenuDarken);
        });
        // Wait for animation and hook changes to finish
        await act(async () => {
            await sleep(800);
        });
        const contextMenu = await screen.queryByTestId("context-menu");
        expect(contextMenu).toBeNull();
    });

    it("Should be persistent on item misclick inside context menu", async () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button);
        });

        let contextMenu = screen.getByTestId("context-menu");
        act(() => {
            fireEvent.click(contextMenu);
            fireEvent.contextMenu(contextMenu);
        });

        // Wait for animation and hook changes to finish
        await act(async () => {
            await sleep(800);
        });
        contextMenu = screen.queryByTestId("context-menu");
        expect(contextMenu).toBeInTheDocument();
    });

    it("Should handle Item click correctly", () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        fireEvent.contextMenu(button);
        const contextMenuItem = screen.getByText("Hide Items");

        fireEvent.click(contextMenuItem);
        expect(contextItemClicks).toHaveLength(1);
        expect(contextItemClicks[0].itemId).toBe("item");
        expect(contextItemClicks[0].actionId).toBe("hide");
    });

    it("Should display correct number of groups", () => {
        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button);
        });

        const contextMenu = screen.getByTestId("context-menu");
        const contextMenuSections = within(contextMenu).getAllByTestId("context-items-section");
        expect(contextMenuSections).toHaveLength(itemsGroups.length);
    });

    it("Should change design on mobile", async () => {
        act(() => {
            defineScreenSize({ width: 300, height: 700 }, true);
        });

        const button = screen.getByRole("button", { name: /Context Menu/i });
        act(() => {
            fireEvent.contextMenu(button);
        });

        // Wait for animation and hook changes to finish
        await act(async () => {
            await sleep(800);
        });

        const contextMenu = screen.getByTestId("context-menu");
        const menuStyles = getComputedStyle(contextMenu);
        expect(menuStyles.getPropertyValue("transform")).toBe("translateY(0%)");

        const contextMenuDarken = screen.getByTestId("context-menu-darken");
        const bgStyles = getComputedStyle(contextMenuDarken);
        expect(+bgStyles.getPropertyValue("opacity")).toBe(1);
    });
});
