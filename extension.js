// 📔 SUBJOURNALS v4.1 - WITH AGGRESSIVE STRUCTURE FILTERING
// 🐛 FIXED: Bulletproof structure block detection using tag references
// ✅ ENHANCED: Pre-filters blocks to only those with actual #st0 tags
// ✅ COMPATIBLE: Works with other button-using extensions

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📔 Subjournals v4.1 loading - Bulletproof Structure Filtering!"
    );

    // ===================================================================
    // 🚀 SIMPLE BUTTON UTILITY (NO IIFE) - ESSENTIAL PARTS ONLY
    // ===================================================================

    // ==================== BUTTON STACK POSITIONING (CRITICAL!) ====================

    const BUTTON_STACKS = {
      "top-left": {
        maxButtons: 2,
        positions: [
          { x: 14, y: 6 },
          { x: 14, y: 54 },
        ],
      },
      "top-right": {
        maxButtons: 5,
        positions: [
          { x: -14, y: 6 },
          { x: -14, y: 54 },
          { x: -14, y: 102 },
          { x: -14, y: 150 },
          { x: -14, y: 198 },
        ],
      },
    };

    // ==================== PAGE CHANGE DETECTOR ====================

    class SimplePageChangeDetector {
      constructor() {
        this.currentUrl = window.location.href;
        this.currentTitle = document.title;
        this.listeners = new Set();
        this.isMonitoring = false;
      }

      startMonitoring() {
        if (this.isMonitoring) return;
        this.setupURLListeners();
        this.setupTitleListener();
        this.setupPeriodicCheck();
        this.isMonitoring = true;
        console.log("🚀 Simple page monitoring started");
      }

      stopMonitoring() {
        if (!this.isMonitoring) return;
        window.removeEventListener("popstate", this.boundURLChange);
        if (this.originalPushState) history.pushState = this.originalPushState;
        if (this.originalReplaceState)
          history.replaceState = this.originalReplaceState;
        if (this.titleObserver) this.titleObserver.disconnect();
        if (this.checkInterval) clearInterval(this.checkInterval);
        this.isMonitoring = false;
        console.log("🛑 Simple page monitoring stopped");
      }

      addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
      }

      notifyChange(type) {
        this.listeners.forEach((callback) => {
          try {
            callback(type);
          } catch (error) {
            console.error("🚨 Page change listener error:", error);
          }
        });
      }

      setupURLListeners() {
        this.boundURLChange = () => {
          if (window.location.href !== this.currentUrl) {
            this.currentUrl = window.location.href;
            this.notifyChange("url");
          }
        };

        window.addEventListener("popstate", this.boundURLChange);

        this.originalPushState = history.pushState;
        this.originalReplaceState = history.replaceState;

        history.pushState = (...args) => {
          this.originalPushState.apply(history, args);
          setTimeout(() => this.boundURLChange(), 0);
        };

        history.replaceState = (...args) => {
          this.originalReplaceState.apply(history, args);
          setTimeout(() => this.boundURLChange(), 0);
        };
      }

      setupTitleListener() {
        this.titleObserver = new MutationObserver((mutations) => {
          const newTitle = document.title;
          if (newTitle !== this.currentTitle) {
            this.currentTitle = newTitle;
            this.notifyChange("title");
          }
        });

        this.titleObserver.observe(
          document.querySelector("title") || document.head,
          {
            childList: true,
            subtree: true,
            characterData: true,
          }
        );
      }

      setupPeriodicCheck() {
        this.checkInterval = setInterval(() => {
          const currentUrl = window.location.href;
          const currentTitle = document.title;

          if (currentUrl !== this.currentUrl) {
            this.currentUrl = currentUrl;
            this.notifyChange("periodic-url");
          }

          if (currentTitle !== this.currentTitle) {
            this.currentTitle = currentTitle;
            this.notifyChange("periodic-title");
          }
        }, 1000);
      }
    }

    // ==================== SHARED BUTTON REGISTRY (CRITICAL!) ====================

    class SharedButtonRegistry {
      constructor() {
        this.buttons = new Map();
        this.pageDetector = new SimplePageChangeDetector();
        this.isInitialized = false;
      }

      initialize() {
        if (this.isInitialized) return;

        this.pageDetector.startMonitoring();
        this.pageDetector.addListener(() => this.refreshAllButtons());

        this.isInitialized = true;
        console.log("🌟 SharedButtonRegistry initialized");
      }

      registerButton(
        id,
        buttonCreator,
        shouldShow,
        preferredStack = "top-right"
      ) {
        console.log(`📌 Registering button: ${id} for ${preferredStack}`);

        this.buttons.set(id, {
          creator: buttonCreator,
          shouldShow: shouldShow,
          stack: preferredStack,
          element: null,
          isVisible: false,
        });

        this.refreshButton(id);
        return id;
      }

      removeButton(id) {
        const buttonData = this.buttons.get(id);
        if (buttonData?.element?.parentNode) {
          buttonData.element.parentNode.removeChild(buttonData.element);
        }
        this.buttons.delete(id);
        console.log(`🗑️ Removed button: ${id}`);
      }

      refreshButton(id) {
        const buttonData = this.buttons.get(id);
        if (!buttonData) return;

        const shouldBeVisible = buttonData.shouldShow();

        if (shouldBeVisible && !buttonData.isVisible) {
          this.showButton(id);
        } else if (!shouldBeVisible && buttonData.isVisible) {
          this.hideButton(id);
        }
      }

      refreshAllButtons() {
        setTimeout(() => {
          this.buttons.forEach((_, id) => this.refreshButton(id));
        }, 100);
      }

      showButton(id) {
        const buttonData = this.buttons.get(id);
        if (!buttonData || buttonData.isVisible) return;

        const targetContainer = this.findTargetContainer();
        if (!targetContainer) {
          console.warn(`🎯 Could not find target container for ${id}`);
          return;
        }

        const { stack, position } = this.findOptimalPosition(buttonData.stack);
        const element = buttonData.creator(stack, position);

        element.style.position = "absolute";
        element.style.zIndex = "9999";

        if (stack === "top-right") {
          element.style.right = `${Math.abs(
            BUTTON_STACKS[stack].positions[position].x
          )}px`;
        } else {
          element.style.left = `${BUTTON_STACKS[stack].positions[position].x}px`;
        }
        element.style.top = `${BUTTON_STACKS[stack].positions[position].y}px`;

        targetContainer.appendChild(element);

        buttonData.element = element;
        buttonData.isVisible = true;

        console.log(`✅ Showed button ${id} at ${stack} position ${position}`);
      }

      hideButton(id) {
        const buttonData = this.buttons.get(id);
        if (!buttonData || !buttonData.isVisible) return;

        if (buttonData.element?.parentNode) {
          buttonData.element.parentNode.removeChild(buttonData.element);
        }

        buttonData.element = null;
        buttonData.isVisible = false;

        console.log(`🙈 Hid button ${id}`);
      }

      findTargetContainer() {
        const targets = [
          ".roam-article",
          ".roam-main",
          ".rm-article-wrapper",
          ".roam-center-panel",
          ".flex-h-box > div:nth-child(2)",
          "#app > div > div > div:nth-child(2)",
          '.bp3-tab-panel[aria-hidden="false"]',
        ];

        for (const selector of targets) {
          const element = document.querySelector(selector);
          if (element) {
            if (getComputedStyle(element).position === "static") {
              element.style.position = "relative";
            }
            return element;
          }
        }

        return document.body;
      }

      findOptimalPosition(preferredStack) {
        const stack =
          BUTTON_STACKS[preferredStack] || BUTTON_STACKS["top-right"];
        const stackName =
          preferredStack in BUTTON_STACKS ? preferredStack : "top-right";

        const usedPositions = Array.from(this.buttons.values())
          .filter((b) => b.isVisible && b.stack === stackName)
          .map((b) => this.getButtonPosition(b.element));

        for (let i = 0; i < stack.maxButtons; i++) {
          if (!usedPositions.includes(i)) {
            return { stack: stackName, position: i };
          }
        }

        return { stack: stackName, position: 0 };
      }

      getButtonPosition(element) {
        if (!element) return -1;
        const topValue = parseInt(element.style.top) || 0;
        const positions = BUTTON_STACKS["top-right"].positions;
        return positions.findIndex((pos) => pos.y === topValue);
      }

      cleanup() {
        this.buttons.forEach((_, id) => this.removeButton(id));
        this.pageDetector.stopMonitoring();
        console.log("🧹 Shared Button Registry cleaned up");
      }
    }

    // ==================== INITIALIZE SHARED REGISTRY ====================

    if (!window.SharedButtonRegistry) {
      window.SharedButtonRegistry = new SharedButtonRegistry();
      window.SharedButtonRegistry.initialize();
      console.log("🌟 Created global SharedButtonRegistry");
    } else {
      console.log("🔗 Using existing SharedButtonRegistry");
    }

    const buttonRegistry = window.SharedButtonRegistry;

    // ===================================================================
    // 🎨 BEAUTIFUL DROPDOWN STYLING
    // ===================================================================

    const dropdownStyle = document.createElement("style");
    dropdownStyle.textContent = `
      .subjournals-dropdown {
        position: absolute;
        z-index: 10001;
        background: white;
        border: 1px solid #ddd;
        border-radius: 0 0 6px 6px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        box-sizing: border-box;
        font-size: 14px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        overflow: hidden;
        animation: dropdownFadeIn 200ms ease;
        border-top: none;
      }
      
      @keyframes dropdownFadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .subjournals-option {
        padding: 10px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: all 150ms ease;
        font-size: 14px;
        font-weight: 500;
        display: flex;
        align-items: center;
        background: white;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        box-sizing: border-box;
      }
      
      .subjournals-option:hover {
        background: #f8f9fa !important;
        transform: translateX(2px);
      }
      
      .subjournals-option:last-child {
        border-bottom: none;
        border-bottom-left-radius: 6px;
        border-bottom-right-radius: 6px;
      }

      /* Color-coded borders */
      .subjournals-option[data-color="red"] { border-left: 3px solid #e74c3c !important; color: #e74c3c !important; }
      .subjournals-option[data-color="orange"] { border-left: 3px solid #e67e22 !important; color: #e67e22 !important; }
      .subjournals-option[data-color="yellow"] { border-left: 3px solid #f1c40f !important; color: #f39c12 !important; }
      .subjournals-option[data-color="green"] { border-left: 3px solid #27ae60 !important; color: #27ae60 !important; }
      .subjournals-option[data-color="blue"] { border-left: 3px solid #3498db !important; color: #3498db !important; }
      .subjournals-option[data-color="purple"] { border-left: 3px solid #9b59b6 !important; color: #9b59b6 !important; }
      .subjournals-option[data-color="brown"] { border-left: 3px solid #8b4513 !important; color: #8b4513 !important; }
      .subjournals-option[data-color="grey"] { border-left: 3px solid #95a5a6 !important; color: #7f8c8d !important; }
      .subjournals-option[data-color="white"] { border-left: 3px solid #ecf0f1 !important; color: #2c3e50 !important; }
      .subjournals-option[data-color="black"] { border-left: 3px solid #2c3e50 !important; color: #2c3e50 !important; }
    `;
    document.head.appendChild(dropdownStyle);

    // ===================================================================
    // 📔 SUBJOURNALS CORE LOGIC
    // ===================================================================

    const DATE_PAGE_REGEX =
      /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2})(st|nd|rd|th), (\d{4})$/;

    const COLOR_MAP = {
      red: "clr-lgt-red-act",
      orange: "clr-lgt-orn-act",
      yellow: "clr-lgt-ylo-act",
      green: "clr-lgt-grn-act",
      blue: "clr-lgt-blu-act",
      purple: "clr-lgt-ppl-act",
      brown: "clr-lgt-brn-act",
      grey: "clr-lgt-gry-act",
      white: "clr-wht-act",
      black: "clr-blk-act",
    };

    let hasShownOnboarding = false;

    // ==================== PAGE CONTEXT DETECTION ====================

    function getCurrentPageTitle() {
      try {
        // Method 1: API
        const pageUid =
          window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid?.();
        if (pageUid) {
          const title = window.roamAlphaAPI.pull("[:node/title]", [
            ":block/uid",
            pageUid,
          ])?.[":node/title"];
          if (title) return title;
        }
      } catch (error) {
        console.log("🔍 API method failed, trying fallbacks...");
      }

      try {
        // Method 2: URL parsing
        const urlMatch = window.location.href.match(
          /#\/app\/[^\/]+\/page\/([^\/]+)/
        );
        if (urlMatch) {
          const pageUid = urlMatch[1];
          const title = window.roamAlphaAPI.pull("[:node/title]", [
            ":block/uid",
            pageUid,
          ])?.[":node/title"];
          if (title) return title;
        }
      } catch (error) {
        console.log("🔍 URL method failed, trying DOM...");
      }

      try {
        // Method 3: DOM
        const titleElement = document.querySelector(
          ".rm-title-display, [data-page-links], .rm-page-ref-link-color"
        );
        if (titleElement?.textContent?.trim()) {
          return titleElement.textContent.trim();
        }
      } catch (error) {
        console.log("🔍 DOM method failed");
      }

      return null;
    }

    function isDailyNote() {
      const title = getCurrentPageTitle();
      return title && DATE_PAGE_REGEX.test(title);
    }

    function isSubjournalPage() {
      const title = getCurrentPageTitle();
      if (!title) return null;

      const subjournals = getSubjournals();
      const matchingSubjournal = subjournals.find((s) => s.name === title);
      return matchingSubjournal || null;
    }

    function shouldShowButton() {
      return isDailyNote() || isSubjournalPage() !== null;
    }

    // ==================== SUBJOURNALS CONFIGURATION ====================

    function getSubjournals() {
      try {
        const configPageUid = window.roamAlphaAPI.q(
          `[:find ?uid :where [?e :node/title "roam/subjournals"] [?e :block/uid ?uid]]`
        )?.[0]?.[0];
        if (!configPageUid) return [];

        const allBlocks = window.roamAlphaAPI.q(
          `[:find ?uid ?string :where [?page :block/uid "${configPageUid}"] [?child :block/page ?page] [?child :block/uid ?uid] [?child :block/string ?string]]`
        );

        const mySubjournalsBlock = allBlocks.find(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );
        if (!mySubjournalsBlock) return [];

        const parentUid = mySubjournalsBlock[0];
        const childUids = window.roamAlphaAPI.q(
          `[:find ?uid :where [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent] [?child :block/uid ?uid]]`
        );

        const subjournals = [];
        childUids.forEach(([uid]) => {
          const childData = window.roamAlphaAPI.pull(
            "[:block/uid :block/string {:block/children [:block/uid :block/string]}]",
            [":block/uid", uid]
          );

          const name = childData[":block/string"]?.trim();
          if (!name || /^color\s*:/i.test(name)) return;

          let color = "blue";
          const colorChildren = childData[":block/children"] || [];
          const colorChild = colorChildren.find((grandchild) =>
            /color\s*:/i.test(grandchild[":block/string"] || "")
          );

          if (colorChild) {
            const colorMatch =
              colorChild[":block/string"].match(/color\s*:\s*(\w+)/i);
            if (colorMatch) color = colorMatch[1];
          }

          subjournals.push({ name, color });
        });

        return subjournals;
      } catch (error) {
        console.error("⚠ Error getting subjournals:", error);
        return [];
      }
    }

    // ==================== BUTTON CREATION WITH EXACT STYLING ====================

    function createSubjournalsButton(stack, position) {
      console.log(
        `🔧 Creating subjournals button for ${stack} position ${position}`
      );

      const buttonContainer = document.createElement("div");
      buttonContainer.style.display = "flex";
      buttonContainer.style.alignItems = "center";
      buttonContainer.style.gap = "0";

      buttonContainer.style.background =
        "linear-gradient(135deg, #fffbeb, #fef3c7)";
      buttonContainer.style.border = "1.5px solid #8b4513";
      buttonContainer.style.borderRadius = "12px";
      buttonContainer.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
      buttonContainer.style.overflow = "hidden";
      buttonContainer.style.transition = "all 200ms ease";

      // Check if we're on a subjournal page
      const subjournalInfo = isSubjournalPage();
      const isOnSubjournalPage = subjournalInfo !== null;

      // Info button
      const infoButton = document.createElement("button");
      infoButton.textContent = "ℹ️";
      infoButton.style.cssText = `
        background: none; border: none; color: #78716c; padding: 8px 12px; cursor: pointer;
        font-size: 14px; border-right: 1px solid rgba(139, 69, 19, 0.2); transition: all 150ms ease;
        font-weight: 600;
      `;
      infoButton.title = "Configure Subjournals";
      infoButton.addEventListener("click", () => {
        window.roamAlphaAPI.ui.mainWindow.openPage({
          page: { title: "roam/subjournals" },
        });
      });

      // Main button - different text based on page type
      const mainButton = document.createElement("button");
      mainButton.textContent = isOnSubjournalPage
        ? `Add entry to ${subjournalInfo.name}?`
        : "Add to Subjournal?";
      mainButton.style.cssText = `
        background: none; border: none; color: #78716c; padding: 10px 16px; cursor: pointer;
        font-size: 14px; font-weight: 600; flex: 1; transition: all 150ms ease;
      `;
      mainButton.addEventListener("click", () => {
        if (isOnSubjournalPage) {
          // Direct entry for subjournal page
          handleDirectEntry(subjournalInfo);
        } else {
          // Dropdown for daily note page
          const subjournals = getSubjournals();
          showSubjournalDropdown(subjournals, buttonContainer);
        }
      });

      // Dismiss button
      const dismissButton = document.createElement("button");
      dismissButton.textContent = "×";
      dismissButton.style.cssText = `
        background: none; border: none; color: #78716c; padding: 8px 10px; cursor: pointer;
        font-size: 14px; font-weight: 600; border-left: 1px solid rgba(139, 69, 19, 0.2); transition: all 150ms ease;
      `;
      dismissButton.addEventListener("click", () => {
        buttonRegistry.removeButton("subjournals-main");
      });

      // Hover effects
      [infoButton, mainButton, dismissButton].forEach((btn) => {
        btn.addEventListener(
          "mouseenter",
          () => (btn.style.backgroundColor = "rgba(139, 69, 19, 0.1)")
        );
        btn.addEventListener(
          "mouseleave",
          () => (btn.style.backgroundColor = "transparent")
        );
      });

      // Container hover effect
      buttonContainer.addEventListener("mouseenter", () => {
        buttonContainer.style.transform = "translateY(-1px)";
        buttonContainer.style.boxShadow = "0 6px 16px rgba(245, 158, 11, 0.4)";
      });
      buttonContainer.addEventListener("mouseleave", () => {
        buttonContainer.style.transform = "translateY(0)";
        buttonContainer.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
      });

      buttonContainer.appendChild(infoButton);
      buttonContainer.appendChild(mainButton);
      buttonContainer.appendChild(dismissButton);

      return buttonContainer;
    }

    // ==================== DROPDOWN AND ACTIONS ====================

    function showSubjournalDropdown(subjournals, buttonContainer) {
      const existingDropdown = document.querySelector(".subjournals-dropdown");
      if (existingDropdown) existingDropdown.remove();

      if (subjournals.length === 0) {
        alert(
          "⚠ No subjournals configured. Click the info button (ℹ️) to set up [[roam/subjournals]]."
        );
        return;
      }

      // Create the dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "subjournals-dropdown";

      subjournals.forEach(({ name, color }) => {
        const option = document.createElement("div");
        option.className = "subjournals-option";
        const displayName =
          name.length > 20 ? name.substring(0, 17) + "..." : name;
        option.textContent = displayName;
        option.setAttribute("data-color", color);
        option.title = name; // Full name in tooltip

        option.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.remove();
          console.log(`🐇 Selected "${name}" with color "${color}"`);
          handleSubjournalSelection(name, color);
        });

        dropdown.appendChild(option);
      });

      // Position the dropdown
      const parentContainer = buttonContainer.parentElement;
      const buttonRect = buttonContainer.getBoundingClientRect();
      const parentRect = parentContainer.getBoundingClientRect();

      dropdown.style.position = "absolute";
      dropdown.style.top = buttonRect.bottom - parentRect.top + "px";
      dropdown.style.right = parentRect.right - buttonRect.right + "px";
      dropdown.style.width = buttonRect.width + "px";
      dropdown.style.zIndex = "10001";

      parentContainer.appendChild(dropdown);

      // Close dropdown when clicking outside
      const closeDropdown = (e) => {
        if (
          !dropdown.contains(e.target) &&
          !buttonContainer.contains(e.target)
        ) {
          dropdown.remove();
          document.removeEventListener("click", closeDropdown);
        }
      };

      setTimeout(() => document.addEventListener("click", closeDropdown), 0);
    }

    // ==================== SUBJOURNAL ENTRY CREATION ====================

    async function handleSubjournalSelection(subjournalName, color) {
      try {
        console.log(`🎯 Creating entry for ${subjournalName} from daily note`);
        const pageTitle = getCurrentPageTitle();
        const dateInfo = parseDatePage(pageTitle);

        if (!dateInfo) throw new Error("Current page is not a valid date page");

        const subjournalPageUid = await getOrCreatePageUid(subjournalName);
        const journalUid = await getOrCreateJournalEntriesBlock(
          subjournalPageUid
        );
        const targetBlockUid = await createDateEntry(
          journalUid,
          dateInfo,
          color
        );

        // Open in sidebar with focus
        await window.roamAlphaAPI.ui.rightSidebar.addWindow({
          window: { type: "outline", "block-uid": subjournalPageUid },
        });

        setTimeout(async () => {
          try {
            const windowId = `sidebar-outline-${subjournalPageUid}`;
            await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
              location: { "block-uid": targetBlockUid, "window-id": windowId },
            });
            console.log("🎯 ✅ Sidebar focus achieved!");
          } catch (focusError) {
            console.error("🎯 Focus error:", focusError);
          }
        }, 800);

        console.log(`✅ Entry created in ${subjournalName}`);
      } catch (error) {
        console.error("❌ Error creating entry:", error);
        alert(`❌ Error: ${error.message}`);
      }
    }

    async function handleDirectEntry(subjournalInfo) {
      try {
        console.log(
          `🎯 FOCUS MODE: Creating direct entry for ${subjournalInfo.name}`
        );

        // Create date info for today
        const today = new Date();
        const dateInfo = {
          year: today.getFullYear(),
          month: today.toLocaleDateString("en-US", { month: "long" }),
          day: today.getDate(),
          dayName: today.toLocaleDateString("en-US", { weekday: "long" }),
          fullDate: today
            .toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            .replace(/(\d+)/, (match) => {
              const day = parseInt(match);
              const suffix =
                day === 1 || day === 21 || day === 31
                  ? "st"
                  : day === 2 || day === 22
                  ? "nd"
                  : day === 3 || day === 23
                  ? "rd"
                  : "th";
              return day + suffix;
            }),
          fullMonth: `${today.toLocaleDateString("en-US", {
            month: "long",
          })} ${today.getFullYear()}`,
        };

        const subjournalPageUid = await getOrCreatePageUid(subjournalInfo.name);
        const journalUid = await getOrCreateJournalEntriesBlock(
          subjournalPageUid
        );
        const newBlockUid = await createDateEntry(
          journalUid,
          dateInfo,
          subjournalInfo.color
        );

        console.log(`🎯 ✅ Block created: ${newBlockUid}`);

        // Focus Mode activation
        setTimeout(async () => {
          try {
            await window.roamAlphaAPI.ui.mainWindow.openBlock({
              block: { uid: newBlockUid },
            });

            console.log("🎯 ✅ FOCUS MODE activated!");
          } catch (focusError) {
            console.error("🎯 Focus Mode error:", focusError);
          }
        }, 200);

        console.log(`✅ Direct entry created in Focus Mode!`);
      } catch (error) {
        console.error("❌ Error in direct entry:", error);
        alert(`❌ Error: ${error.message}`);
      }
    }

    // ==================== HELPER FUNCTIONS ====================

    function parseDatePage(title) {
      const match = DATE_PAGE_REGEX.exec(title);
      if (!match) return null;

      const [, month, day, suffix, year] = match;
      return {
        month,
        day: parseInt(day),
        year: parseInt(year),
        dayName: new Date(
          parseInt(year),
          getMonthIndex(month),
          parseInt(day)
        ).toLocaleDateString("en-US", { weekday: "long" }),
        fullDate: title,
        fullMonth: `${month} ${year}`,
      };
    }

    function getMonthIndex(monthName) {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return months.indexOf(monthName);
    }

    async function getOrCreatePageUid(title) {
      let pageUid = window.roamAlphaAPI.q(
        `[:find ?uid :where [?e :node/title "${title}"] [?e :block/uid ?uid]]`
      )?.[0]?.[0];
      if (pageUid) return pageUid;

      pageUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.page.create({
        page: { title, uid: pageUid },
      });
      return pageUid;
    }

    async function getOrCreateJournalEntriesBlock(pageUid) {
      const allBlocks = window.roamAlphaAPI.q(
        `[:find ?uid ?string :where [?page :block/uid "${pageUid}"] [?child :block/page ?page] [?child :block/uid ?uid] [?child :block/string ?string]]`
      );
      const journalBlock = allBlocks.find(
        ([uid, string]) => string?.trim() === "Journal Entries:"
      );
      if (journalBlock) return journalBlock[0];

      const blockUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": pageUid, order: 0 },
        block: { uid: blockUid, string: "Journal Entries:" },
      });
      return blockUid;
    }

    async function createDateEntry(journalUid, dateInfo, color) {
      const colorTag = COLOR_MAP[color.toLowerCase()] || COLOR_MAP.blue;

      // Create year block
      let yearUid = await findOrCreateStructureBlock(
        journalUid,
        `#st0 [[${dateInfo.year}]]`,
        `#st0 [[${dateInfo.year}]] #${colorTag}`
      );

      // Create month block
      let monthUid = await findOrCreateStructureBlock(
        yearUid,
        `#st0 [[${dateInfo.fullMonth}]]`,
        `#st0 [[${dateInfo.fullMonth}]] #${colorTag}`
      );

      // Create date block
      let dateUid = await findOrCreateStructureBlock(
        monthUid,
        `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]]`,
        `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]] #${colorTag}`
      );

      // Create content block
      const contentUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": dateUid, order: 0 },
        block: { uid: contentUid, string: "" },
      });

      return contentUid;
    }

    // ==================== 🔥 BULLETPROOF STRUCTURE BLOCK DETECTION ====================

    async function findOrCreateStructureBlock(
      parentUid,
      searchPattern,
      createContent
    ) {
      try {
        // 🔥 AGGRESSIVE FILTERING: Only get blocks that actually reference the "st0" page
        const children = window.roamAlphaAPI.q(
          `[:find ?uid ?string 
            :where 
            [?parent :block/uid "${parentUid}"] 
            [?child :block/parents ?parent] 
            [?child :block/uid ?uid] 
            [?child :block/string ?string]
            [?st0-page :node/title "st0"]
            [?child :block/refs ?st0-page]]`
        );

        console.log(
          `🔍 Found ${children.length} blocks with #st0 tag under parent ${parentUid}`
        );

        // Now search within the filtered set for the specific pattern (without #st0 since we already filtered for it)
        const existing = children.find(
          ([uid, string]) =>
            string && string.includes(searchPattern.replace("#st0 ", ""))
        );
        if (existing) {
          console.log(
            `🎯 Found existing structure block with pattern: "${searchPattern}"`
          );
          return existing[0];
        }

        console.log(
          `🏗️ Creating new structure block with pattern: "${searchPattern}"`
        );
        const blockUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": parentUid, order: 0 },
          block: { uid: blockUid, string: createContent },
        });
        return blockUid;
      } catch (error) {
        console.error("Error in findOrCreateStructureBlock:", error);
        throw error;
      }
    }

    // ==================== ONBOARDING ====================

    function needsOnboarding() {
      try {
        const configPageUid = window.roamAlphaAPI.q(
          `[:find ?uid :where [?e :node/title "roam/subjournals"] [?e :block/uid ?uid]]`
        )?.[0]?.[0];
        if (!configPageUid) return true;
        const blocks = window.roamAlphaAPI.q(
          `[:find ?uid ?string :where [?page :block/uid "${configPageUid}"] [?child :block/page ?page] [?child :block/uid ?uid] [?child :block/string ?string]]`
        );
        return !blocks.some(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );
      } catch (error) {
        return true;
      }
    }

    async function createDefaultStructure() {
      try {
        console.log("🛠️ Creating [[roam/subjournals]] structure...");
        const pageUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.page.create({
          page: { title: "roam/subjournals", uid: pageUid },
        });

        const instructionUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: 0 },
          block: {
            uid: instructionUid,
            string:
              "Welcome to Subjournals v4.1! List your personal subjournals below. Colors: red, orange, yellow, green, blue, purple, grey, brown, white, black. #clr-lgt-orn-act",
          },
        });

        const subjournalsUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: 1 },
          block: { uid: subjournalsUid, string: "My Subjournals:" },
        });

        const samples = [
          { name: "Therapy Journal", color: "blue" },
          { name: "Project Ideas", color: "green" },
          { name: "Health & Wellness", color: "red" },
          { name: "Learning Notes", color: "purple" },
        ];

        for (let i = 0; i < samples.length; i++) {
          const sampleUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": subjournalsUid, order: i },
            block: { uid: sampleUid, string: samples[i].name },
          });

          const colorUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": sampleUid, order: 0 },
            block: { uid: colorUid, string: `Color: ${samples[i].color}` },
          });
        }

        console.log("✅ Default structure created successfully");
        return true;
      } catch (error) {
        console.error("❌ Error creating default structure:", error);
        return false;
      }
    }

    function showOnboardingGuidance() {
      if (hasShownOnboarding) return;
      hasShownOnboarding = true;
      setTimeout(() => {
        alert(`📔 Welcome to Subjournals v4.1!

✨ What's new:
- Bulletproof structure filtering that prevents false positives
- Enhanced debugging with detailed console logging
- Rock-solid reliability for all hierarchical block creation
- Better performance with aggressive tag filtering  

🔧 I've created [[roam/subjournals]] with sample configuration.

👆 Click the button to customize your subjournals!

This is your one-time welcome message.`);
      }, 1000);
    }

    // ==================== INITIALIZATION ====================

    async function initialize() {
      console.log(
        "🚀 Initializing Subjournals v4.1 with bulletproof structure filtering..."
      );

      // Check for onboarding
      if (needsOnboarding()) {
        console.log("🛠️ First-time user detected - creating default structure");
        const created = await createDefaultStructure();
        if (created) showOnboardingGuidance();
      }

      // Register button with updated condition
      buttonRegistry.registerButton(
        "subjournals-main",
        createSubjournalsButton,
        shouldShowButton,
        "top-right"
      );

      // Settings panel
      extensionAPI.settings.panel.create({
        tabTitle: "Subjournals v4.1",
        settings: [
          {
            id: "debugMode",
            name: "Debug Mode",
            description: "Enable detailed console logging for troubleshooting",
            action: { type: "switch" },
          },
        ],
      });

      console.log(
        "✅ Subjournals v4.1 initialized with bulletproof structure filtering!"
      );

      return {
        cleanup: () => {
          buttonRegistry.removeButton("subjournals-main");
          const existingDropdown = document.querySelector(
            ".subjournals-dropdown"
          );
          if (existingDropdown) existingDropdown.remove();
          if (dropdownStyle && dropdownStyle.parentNode) {
            dropdownStyle.parentNode.removeChild(dropdownStyle);
          }
          console.log("🧹 Subjournals v4.1 cleaned up");
        },
      };
    }

    return initialize();
  },

  onunload: () => {
    console.log("✅ Subjournals v4.1 unloaded");
  },
};
