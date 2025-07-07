// ===================================================================
// 📔 FULL FEATURED SUBJOURNALS v4.1 - EVENT-DRIVEN + NEW CONFIG
// 🚀 Pure event-driven architecture with zero polling
// 🎯 New config location: roam/ext/subjournals/config
// 🔄 Context-aware: Date pages vs Subjournal pages
// 🏗️ Preserves critical cascading block creation with #st0 filtering
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📔 Full Featured Subjournals v4.1 loading - Event-Driven + New Config!"
    );

    // ===================================================================
    // 🎯 PURE EVENT-DRIVEN BUTTONS MANAGER - ZERO POLLING
    // ===================================================================

    const EXTENSION_NAME = "Subjournals Button Manager";
    const EXTENSION_VERSION = "4.1.0";

    // ==================== SECTION TYPE DEFINITIONS ====================

    const SECTION_TYPES = {
      icon: {
        defaultStyle: {
          padding: "8px 10px",
          minWidth: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        purpose: "Configuration, status indicators",
      },
      main: {
        defaultStyle: {
          padding: "8px 16px",
          fontWeight: "600",
          flex: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        purpose: "Primary action button",
      },
      action: {
        defaultStyle: {
          padding: "8px 12px",
          minWidth: "36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        purpose: "Secondary actions",
      },
      dismiss: {
        defaultStyle: {
          padding: "8px 10px",
          color: "#8b4513",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: "bold",
        },
        purpose: "Hide button (automatically added)",
      },
    };

    // ==================== CENTRALIZED PAGE TITLE DETECTION ====================

    function getCurrentPageTitle() {
      try {
        const titleSelectors = [
          ".roam-article h1",
          ".rm-page-title",
          ".rm-title-display",
          "[data-page-title]",
          ".rm-page-title-text",
          ".roam-article > div:first-child h1",
          "h1[data-page-title]",
        ];

        for (const selector of titleSelectors) {
          const titleElement = document.querySelector(selector);
          if (titleElement) {
            const titleText = titleElement.textContent?.trim();
            if (titleText && titleText !== "") {
              return titleText;
            }
          }
        }

        if (document.title && document.title !== "Roam") {
          const titleText = document.title
            .replace(" - Roam", "")
            .replace(" | Roam Research", "")
            .trim();
          if (titleText && titleText !== "") {
            return titleText;
          }
        }

        const url = window.location.href;
        const pageMatch = url.match(/\/page\/([^/?#]+)/);
        if (pageMatch) {
          const pageId = decodeURIComponent(pageMatch[1]);
          return pageId;
        }

        return null;
      } catch (error) {
        console.error("❌ Failed to get current page title:", error);
        return null;
      }
    }

    // ==================== BUTTON STACK POSITIONING ====================

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

    // ==================== 🚀 PURE EVENT-DRIVEN PAGE DETECTOR ====================

    class PureEventPageDetector {
      constructor() {
        this.currentUrl = window.location.href;
        this.listeners = new Set();
        this.isActive = false;
      }

      startListening() {
        if (this.isActive) return;

        this.setupHistoryListeners();
        this.setupFocusListeners();
        this.setupRoamListeners();

        this.isActive = true;
        console.log("🎯 Pure event-driven detection started");
      }

      setupHistoryListeners() {
        // ✅ PURE EVENT: History API changes only
        this.boundPopState = () => this.handleNavigationChange();
        window.addEventListener("popstate", this.boundPopState);

        // Intercept programmatic navigation
        this.originalPushState = history.pushState;
        this.originalReplaceState = history.replaceState;

        const self = this;
        history.pushState = function (...args) {
          self.originalPushState.apply(history, args);
          self.handleNavigationChange();
        };

        history.replaceState = function (...args) {
          self.originalReplaceState.apply(history, args);
          self.handleNavigationChange();
        };
      }

      setupFocusListeners() {
        // ✅ PURE EVENT: Only check when user returns to tab
        this.boundFocus = () => {
          const newUrl = window.location.href;
          if (newUrl !== this.currentUrl) {
            this.handleNavigationChange();
          }
        };
        window.addEventListener("focus", this.boundFocus);
      }

      setupRoamListeners() {
        // ✅ PURE EVENT: Listen for Roam's content loading events
        document.addEventListener("roam:page:loaded", () => {
          this.handleNavigationChange();
        });

        // ✅ PURE EVENT: Efficient title monitoring
        if (document.head) {
          this.titleObserver = new MutationObserver(() => {
            if (document.title !== this.currentTitle) {
              this.currentTitle = document.title;
              this.handleNavigationChange();
            }
          });

          this.titleObserver.observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      }

      handleNavigationChange() {
        const newUrl = window.location.href;
        if (newUrl !== this.currentUrl) {
          console.log(
            `📄 Pure event navigation: ${this.currentUrl} → ${newUrl}`
          );
          this.currentUrl = newUrl;

          // ✅ SINGLE EVENT: Notify all listeners once
          this.listeners.forEach((listener) => {
            try {
              listener({ url: newUrl, timestamp: Date.now() });
            } catch (error) {
              console.error("❌ Navigation listener error:", error);
            }
          });
        }
      }

      onPageChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
      }

      cleanup() {
        window.removeEventListener("popstate", this.boundPopState);
        window.removeEventListener("focus", this.boundFocus);

        if (this.originalPushState) history.pushState = this.originalPushState;
        if (this.originalReplaceState)
          history.replaceState = this.originalReplaceState;
        if (this.titleObserver) this.titleObserver.disconnect();

        this.isActive = false;
        console.log("🛑 Pure event detection stopped");
      }
    }

    // ==================== BUTTON CONDITIONS ====================

    const ButtonConditions = {
      isDailyNote: () => {
        const url = window.location.href;
        return (
          /\/page\/\d{2}-\d{2}-\d{4}/.test(url) ||
          /\/page\/\d{4}-\d{2}-\d{2}/.test(url) ||
          /\/page\/[A-Z][a-z]+.*\d{4}/.test(url)
        );
      },

      isMainPage: () => {
        return (
          !!document.querySelector(".roam-article") &&
          window.location.href.includes("/page/")
        );
      },

      custom: (conditionFn) => {
        if (!conditionFn || typeof conditionFn !== "function") {
          return false;
        }
        try {
          return conditionFn();
        } catch (error) {
          console.error("❌ Custom condition error:", error);
          return false;
        }
      },
    };

    // ==================== 🚀 EVENT-DRIVEN BUTTON REGISTRY ====================

    class EventDrivenButtonRegistry {
      constructor() {
        this.registeredButtons = new Map();
        this.activeButtons = new Map();
        this.stacks = { "top-left": [], "top-right": [] };
        this.containerCache = null;
        this.lastPageContext = null;
        this.pageDetector = new PureEventPageDetector();
      }

      async initialize() {
        // ✅ PURE EVENT: Only rebuild on actual navigation
        this.pageDetector.onPageChange(({ url }) => {
          this.handlePageChange(url);
        });

        // ✅ PURE EVENT: Only rebuild when container actually changes
        this.setupContainerWatcher();

        this.pageDetector.startListening();
        this.buildInitialButtons();

        console.log("✅ Event-driven button registry initialized");
        return true;
      }

      setupContainerWatcher() {
        // ✅ EFFICIENT: Only watch for container-level changes
        const containerObserver = new MutationObserver((mutations) => {
          let containerChanged = false;

          mutations.forEach((mutation) => {
            // Only care about container-level changes
            mutation.addedNodes.forEach((node) => {
              if (
                node.nodeType === 1 &&
                (node.classList?.contains("roam-article") ||
                  node.querySelector?.(".roam-article"))
              ) {
                containerChanged = true;
              }
            });

            mutation.removedNodes.forEach((node) => {
              if (
                node === this.containerCache ||
                node.contains?.(this.containerCache)
              ) {
                containerChanged = true;
                this.containerCache = null;
              }
            });
          });

          if (containerChanged) {
            console.log("📦 Container change detected - rebuilding buttons");
            this.rebuildAllButtons();
          }
        });

        // ✅ TARGETED: Only watch document body for major structural changes
        containerObserver.observe(document.body, {
          childList: true,
          subtree: false, // Don't watch deep changes
        });
      }

      async handlePageChange(url) {
        console.log("🔄 Event-driven page change:", url);

        // ✅ SMART: Only rebuild if context actually changed
        const newContext = await getPageContext();
        const contextChanged =
          JSON.stringify(newContext) !== JSON.stringify(this.lastPageContext);

        if (contextChanged) {
          console.log("📄 Page context changed - rebuilding buttons");
          this.lastPageContext = newContext;
          this.rebuildAllButtons();
        } else {
          console.log("📄 Same context - no rebuild needed");
        }
      }

      buildInitialButtons() {
        // Initial button build on startup
        this.rebuildAllButtons();
      }

      // ✅ CACHED: Container detection with caching
      getCurrentContainer() {
        if (this.containerCache && document.contains(this.containerCache)) {
          return this.containerCache;
        }

        const candidates = [
          ".roam-article",
          ".roam-main",
          ".roam-center-panel",
        ];
        for (const selector of candidates) {
          const element = document.querySelector(selector);
          if (element && document.contains(element)) {
            if (getComputedStyle(element).position === "static") {
              element.style.position = "relative";
            }
            this.containerCache = element;
            return element;
          }
        }

        this.containerCache = document.body;
        return document.body;
      }

      // ✅ EFFICIENT: Only rebuild when necessary
      rebuildAllButtons() {
        this.clearAllButtons();
        this.clearAllStacks();

        const visibleButtons = Array.from(this.registeredButtons.values())
          .filter((config) => this.shouldButtonBeVisible(config))
          .sort((a, b) => (a.priority ? -1 : 0) - (b.priority ? -1 : 0));

        visibleButtons.forEach((config) => {
          this.assignButtonToStack(config);
        });

        this.placeAllStackedButtons();

        console.log(
          `✅ Event-driven rebuild complete (${this.activeButtons.size} buttons)`
        );
      }

      clearAllButtons() {
        this.activeButtons.forEach((element) => {
          element.remove();
        });
        this.activeButtons.clear();
      }

      clearAllStacks() {
        this.stacks["top-left"] = [];
        this.stacks["top-right"] = [];
      }

      assignButtonToStack(config) {
        const targetStack = config.stack || "top-right";
        const stackConfig = BUTTON_STACKS[targetStack];

        if (this.stacks[targetStack].length < stackConfig.maxButtons) {
          this.stacks[targetStack].push(config);
          console.log(
            `📍 Button "${config.id}" assigned to ${targetStack} slot ${this.stacks[targetStack].length}`
          );
        } else {
          console.warn(
            `⚠️ Button "${config.id}" skipped - no slots available in ${targetStack}`
          );
        }
      }

      placeAllStackedButtons() {
        Object.keys(this.stacks).forEach((stackName) => {
          this.stacks[stackName].forEach((config, index) => {
            this.createAndPlaceButton(config, stackName, index);
          });
        });
      }

      createAndPlaceButton(config, stackName, stackIndex) {
        console.log(
          `🔧 Creating compound button "${config.id}" with ${config.sections.length} sections`
        );
        return this.createCompoundButton(config, stackName, stackIndex);
      }

      createCompoundButton(config, stackName, stackIndex) {
        const buttonContainer = document.createElement("div");
        buttonContainer.style.position = "absolute";
        buttonContainer.style.display = "flex";
        buttonContainer.style.alignItems = "stretch";
        buttonContainer.style.zIndex = "10000";
        buttonContainer.style.borderRadius = "12px";
        buttonContainer.style.overflow = "hidden";
        buttonContainer.style.boxShadow = "0 4px 12px rgba(245, 158, 11, 0.3)";
        buttonContainer.style.transition = "all 200ms ease";
        buttonContainer.style.background =
          "linear-gradient(135deg, #fffbeb, #fef3c7)";
        buttonContainer.style.border = "1.5px solid #8b4513";

        const stackConfig = BUTTON_STACKS[stackName];
        const position = stackConfig.positions[stackIndex];

        // Process sections and auto-add dismiss if not present
        let sections = [...config.sections];
        const hasDismissSection = sections.some(
          (section) => section.type === "dismiss"
        );
        if (!hasDismissSection) {
          sections.push({
            type: "dismiss",
            content: "✕",
            onClick: () =>
              this.dismissCompoundButton(config.id, buttonContainer),
          });
        }

        // Create each section
        sections.forEach((section, index) => {
          const sectionElement = this.createSection(
            section,
            index,
            sections.length,
            config,
            stackName,
            stackIndex,
            buttonContainer
          );
          buttonContainer.appendChild(sectionElement);
        });

        // Position the container
        if (position.x < 0) {
          buttonContainer.style.right = `${Math.abs(position.x)}px`;
          buttonContainer.style.left = "auto";
        } else {
          buttonContainer.style.left = `${position.x}px`;
          buttonContainer.style.right = "auto";
        }
        buttonContainer.style.top = `${position.y}px`;

        // Container hover effects
        buttonContainer.addEventListener("mouseenter", () => {
          buttonContainer.style.transform = "translateY(-1px)";
          buttonContainer.style.boxShadow =
            "0 6px 16px rgba(245, 158, 11, 0.4)";
        });

        buttonContainer.addEventListener("mouseleave", () => {
          buttonContainer.style.transform = "translateY(0)";
          buttonContainer.style.boxShadow =
            "0 4px 12px rgba(245, 158, 11, 0.3)";
        });

        const container = this.getCurrentContainer();
        container.appendChild(buttonContainer);
        this.activeButtons.set(config.id, buttonContainer);

        console.log(
          `✅ Compound button "${config.id}" placed at ${stackName} #${
            stackIndex + 1
          } with ${sections.length} sections`
        );
      }

      createSection(
        section,
        index,
        totalSections,
        buttonConfig,
        stackName,
        stackIndex,
        buttonContainer
      ) {
        const sectionElement = document.createElement("div");

        // Get section type configuration
        const sectionType = SECTION_TYPES[section.type] || SECTION_TYPES.action;

        // Apply base styling with warm theme
        Object.assign(sectionElement.style, {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          userSelect: "none",
          transition: "all 150ms ease",
          backgroundColor: "transparent",
          color: "#78716c",
          fontSize: "13px",
          fontWeight: "600",
          whiteSpace: "nowrap",
          ...sectionType.defaultStyle,
        });

        // Apply custom section styles
        if (section.style) {
          Object.assign(sectionElement.style, section.style);
        }

        // Add visual separators between sections
        if (index > 0) {
          sectionElement.style.borderLeft = "1px solid #8b4513";
        }

        // Set section content
        if (section.content) {
          if (typeof section.content === "string") {
            sectionElement.textContent = section.content;
          } else {
            sectionElement.appendChild(section.content);
          }
        }

        // Add tooltip if provided
        if (section.tooltip) {
          sectionElement.setAttribute("title", section.tooltip);
        }

        // Section-specific hover effects
        sectionElement.addEventListener("mouseenter", () => {
          switch (section.type) {
            case "dismiss":
              sectionElement.style.backgroundColor = "rgba(220, 53, 69, 0.1)";
              sectionElement.style.color = "#dc3545";
              break;
            case "icon":
              sectionElement.style.backgroundColor = "rgba(245, 158, 11, 0.2)";
              break;
            case "main":
              sectionElement.style.backgroundColor = "rgba(245, 158, 11, 0.15)";
              break;
            default:
              sectionElement.style.backgroundColor = "rgba(139, 69, 19, 0.1)";
          }
        });

        sectionElement.addEventListener("mouseleave", () => {
          sectionElement.style.backgroundColor = "transparent";
          sectionElement.style.color =
            section.type === "dismiss" ? "#8b4513" : "#78716c";
        });

        // Click handling
        sectionElement.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();

          try {
            if (section.onClick) {
              section.onClick({
                sectionType: section.type,
                sectionIndex: index,
                buttonId: buttonConfig.id,
                buttonStack: stackName,
                buttonPosition: stackIndex + 1,
                currentPage: {
                  url: window.location.href,
                  title: getCurrentPageTitle(),
                },
                sectionElement: sectionElement,
                buttonContainer: buttonContainer,
              });
            }
          } catch (error) {
            console.error(`❌ Section "${section.type}" click error:`, error);
          }
        });

        return sectionElement;
      }

      dismissCompoundButton(buttonId, buttonContainer) {
        console.log(`🗑️ Dismissing compound button "${buttonId}"`);
        if (buttonContainer.parentNode) {
          buttonContainer.remove();
        }
        this.activeButtons.delete(buttonId);
        console.log(`✅ Compound button "${buttonId}" dismissed`);
      }

      shouldButtonBeVisible(config) {
        const { showOn, hideOn, condition } = config;

        if (condition && typeof condition === "function") {
          try {
            return condition();
          } catch (error) {
            console.error(
              `❌ Custom condition error for "${config.id}":`,
              error
            );
            return false;
          }
        }

        if (showOn) {
          const shouldShow = showOn.some((conditionName) => {
            return ButtonConditions[conditionName]
              ? ButtonConditions[conditionName]()
              : false;
          });
          if (!shouldShow) return false;
        }

        if (hideOn) {
          const shouldHide = hideOn.some((conditionName) => {
            return ButtonConditions[conditionName]
              ? ButtonConditions[conditionName]()
              : false;
          });
          if (shouldHide) return false;
        }

        return true;
      }

      registerButton(config) {
        const { id, sections } = config;

        if (!sections || !Array.isArray(sections)) {
          throw new Error(`Button "${id}" must have sections array`);
        }

        sections.forEach((section, index) => {
          if (!section.type) {
            throw new Error(`Button "${id}" section ${index} must have a type`);
          }
          if (!SECTION_TYPES[section.type]) {
            throw new Error(
              `Button "${id}" section ${index} has invalid type: ${section.type}`
            );
          }
        });

        if (this.registeredButtons.has(id)) {
          throw new Error(`Button "${id}" already registered`);
        }

        const stack = config.stack || "top-right";
        if (!BUTTON_STACKS[stack]) {
          throw new Error(
            `Invalid stack: ${stack}. Must be: ${Object.keys(
              BUTTON_STACKS
            ).join(", ")}`
          );
        }

        this.registeredButtons.set(id, {
          id,
          sections,
          stack,
          priority: config.priority || false,
          showOn: config.showOn || null,
          hideOn: config.hideOn || null,
          condition: config.condition || null,
          style: config.style || {},
        });

        if (this.pageDetector.isActive) {
          this.rebuildAllButtons();
        }

        console.log(
          `✅ Compound button "${id}" registered for ${stack} stack${
            config.priority ? " (priority)" : ""
          }`
        );

        return { success: true, id, stack, type: "compound" };
      }

      removeButton(id) {
        const removed = this.registeredButtons.delete(id);
        if (this.activeButtons.has(id)) {
          this.activeButtons.get(id).remove();
          this.activeButtons.delete(id);
        }
        if (removed) {
          console.log(`🗑️ Button "${id}" removed`);
        }
        return removed;
      }

      cleanup() {
        this.clearAllButtons();
        this.clearAllStacks();
        this.registeredButtons.clear();
        this.pageDetector.cleanup();
        console.log("🧹 Event-driven Button Registry cleaned up");
      }
    }

    // ===================================================================
    // 📔 SUBJOURNALS CORE FUNCTIONALITY
    // ===================================================================

    // ==================== CONFIGURATION CONSTANTS ====================

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

    // ✅ NEW CONFIG LOCATION
    const CONFIG_PAGE_NAME = "roam/ext/subjournals/config";

    // ==================== STATE MANAGEMENT ====================

    let buttonRegistry;
    let hasShownOnboarding = false;
    let currentDropdown = null;

    // ==================== PAGE CONTEXT DETECTION ====================

    async function getPageContext() {
      try {
        const pageTitle = getCurrentPageTitle();
        if (!pageTitle) return { context: "unknown" };

        const isDate = DATE_PAGE_REGEX.test(pageTitle);
        const subjournals = getSubjournals();
        const matchingSubjournal = subjournals.find(
          (s) => s.name === pageTitle
        );

        if (isDate) {
          return {
            context: "date",
            pageTitle,
            dateInfo: parseDatePage(pageTitle),
          };
        } else if (matchingSubjournal) {
          return {
            context: "subjournal",
            pageTitle,
            subjournalInfo: matchingSubjournal,
          };
        } else {
          return { context: "other", pageTitle };
        }
      } catch (error) {
        console.error("🔍 Error detecting page context:", error);
        return { context: "error" };
      }
    }

    function parseDatePage(title) {
      const match = DATE_PAGE_REGEX.exec(title);
      if (!match) return null;

      const [, month, day, suffix, year] = match;
      const date = new Date(
        parseInt(year),
        getMonthIndex(month),
        parseInt(day)
      );
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

      return {
        month,
        day: parseInt(day),
        year: parseInt(year),
        dayName,
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

    // ==================== ✅ CONFIGURATION READING - NEW LOCATION ====================

    function getSubjournals() {
      try {
        const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where [?e :node/title "${CONFIG_PAGE_NAME}"] [?e :block/uid ?uid]]
        `)?.[0]?.[0];

        if (!configPageUid) return [];

        const allBlocks = window.roamAlphaAPI.q(`
          [:find ?uid ?string :where 
           [?page :block/uid "${configPageUid}"] [?child :block/page ?page]
           [?child :block/uid ?uid] [?child :block/string ?string]]
        `);

        const mySubjournalsBlock = allBlocks.find(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );
        if (!mySubjournalsBlock) return [];

        const parentUid = mySubjournalsBlock[0];
        const childUids = window.roamAlphaAPI.q(`
          [:find ?uid :where 
           [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent] [?child :block/uid ?uid]]
        `);

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

    // ==================== 🔥 CRITICAL: CASCADING BLOCK CREATION WITH #st0 FILTERING ====================

    async function findOrCreateStructureBlock(
      parentUid,
      searchPattern,
      createContent
    ) {
      try {
        console.group(`🔍 CASCADING BLOCK: findOrCreateStructureBlock`);
        console.log(`📍 Parent UID: ${parentUid}`);
        console.log(`🔍 Search Pattern: "${searchPattern}"`);
        console.log(`🏗️ Create Content: "${createContent}"`);

        // 🚨 CRITICAL: Only search blocks that have #st0 tag AND match pattern
        const children = window.roamAlphaAPI.q(`
          [:find ?uid ?string 
           :where 
           [?parent :block/uid "${parentUid}"] 
           [?child :block/parents ?parent] 
           [?child :block/uid ?uid] 
           [?child :block/string ?string]
           [?st0-page :node/title "st0"]
           [?child :block/refs ?st0-page]]
        `);

        console.log(`🔥 Filtered children with #st0 tag: ${children.length}`);

        const searchWithoutSt0 = searchPattern.replace("#st0 ", "");
        console.log(`🔍 Search pattern without #st0: "${searchWithoutSt0}"`);

        const existing = children.find(
          ([uid, string]) => string && string.includes(searchWithoutSt0)
        );

        if (existing) {
          console.log(
            `✅ FOUND EXISTING: UID: ${existing[0]} | Content: "${existing[1]}"`
          );
          console.groupEnd();
          return existing[0];
        }

        console.log(`❌ NO MATCH FOUND - creating new structure block`);
        console.log(`🏗️ Creating with content: "${createContent}"`);

        const blockUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": parentUid, order: 0 },
          block: { uid: blockUid, string: createContent },
        });

        console.log(`✅ Created new block with UID: ${blockUid}`);
        console.groupEnd();
        return blockUid;
      } catch (error) {
        console.error("❌ Error in findOrCreateStructureBlock:", error);
        console.groupEnd();
        throw error;
      }
    }

    async function createDateEntry(journalUid, dateInfo, color) {
      console.group(`🎯 CASCADING CREATION: createDateEntry`);
      console.log(`📅 Date Info:`, dateInfo);
      console.log(`🎨 Color: ${color}`);

      const colorTag = COLOR_MAP[color.toLowerCase()] || COLOR_MAP.blue;

      // 🔥 STEP 1: Year block (with #st0 filtering)
      console.log(`\n🗓️ STEP 1: Creating/finding year block`);
      const yearSearchPattern = `#st0 [[${dateInfo.year}]]`;
      const yearCreateContent = `#st0 [[${dateInfo.year}]] #${colorTag}`;

      const yearUid = await findOrCreateStructureBlock(
        journalUid,
        yearSearchPattern,
        yearCreateContent
      );

      // 🔥 STEP 2: Month block (with #st0 filtering)
      console.log(`\n📅 STEP 2: Creating/finding month block`);
      const monthSearchPattern = `#st0 [[${dateInfo.fullMonth}]]`;
      const monthCreateContent = `#st0 [[${dateInfo.fullMonth}]] #${colorTag}`;

      const monthUid = await findOrCreateStructureBlock(
        yearUid,
        monthSearchPattern,
        monthCreateContent
      );

      // 🔥 STEP 3: Date block (with #st0 filtering)
      console.log(`\n📆 STEP 3: Creating/finding date block`);
      const dateSearchPattern = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]]`;
      const dateCreateContent = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]] #${colorTag}`;

      const dateUid = await findOrCreateStructureBlock(
        monthUid,
        dateSearchPattern,
        dateCreateContent
      );

      // 🔥 STEP 4: Content block (regular block, no #st0)
      console.log(`\n📝 STEP 4: Creating content block`);
      const contentUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": dateUid, order: 0 },
        block: { uid: contentUid, string: "" },
      });

      console.log(`✅ Content block UID: ${contentUid}`);
      console.groupEnd();
      return contentUid;
    }

    // ==================== HELPER FUNCTIONS ====================

    async function getOrCreatePageUid(title) {
      let pageUid = window.roamAlphaAPI.q(`
        [:find ?uid :where [?e :node/title "${title}"] [?e :block/uid ?uid]]
      `)?.[0]?.[0];

      if (pageUid) return pageUid;

      pageUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.page.create({
        page: { title, uid: pageUid },
      });
      return pageUid;
    }

    async function getOrCreateJournalEntriesBlock(pageUid) {
      const allBlocks = window.roamAlphaAPI.q(`
        [:find ?uid ?string :where 
         [?page :block/uid "${pageUid}"] [?child :block/page ?page]
         [?child :block/uid ?uid] [?child :block/string ?string]]
      `);

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

    // ==================== ✅ ONBOARDING - NEW LOCATION ====================

    function needsOnboarding() {
      try {
        const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where [?e :node/title "${CONFIG_PAGE_NAME}"] [?e :block/uid ?uid]]
        `)?.[0]?.[0];

        if (!configPageUid) return true;

        const blocks = window.roamAlphaAPI.q(`
          [:find ?uid ?string :where 
           [?page :block/uid "${configPageUid}"] [?child :block/page ?page]
           [?child :block/uid ?uid] [?child :block/string ?string]]
        `);

        return !blocks.some(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );
      } catch (error) {
        return true;
      }
    }

    async function createDefaultStructure() {
      try {
        console.log(`🛠️ Creating ${CONFIG_PAGE_NAME} structure...`);

        const pageUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.page.create({
          page: { title: CONFIG_PAGE_NAME, uid: pageUid },
        });

        const instructionUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: 0 },
          block: {
            uid: instructionUid,
            string:
              "Welcome to Full Featured Subjournals v4.1! Pure event-driven architecture with new config location. List your personal subjournals below. Colors: red, orange, yellow, green, blue, purple, grey, brown, white, black. #clr-lgt-orn-act",
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
        alert(`📔 Welcome to Full Featured Subjournals v4.1!

🎯 PURE EVENT-DRIVEN + NEW CONFIG LOCATION!

✨ What's new in v4.1:
- ⚡ Zero polling/monitoring - pure event-driven architecture
- 📍 New config location: ${CONFIG_PAGE_NAME}
- 🚀 Significant performance improvements
- 🔄 Intelligent context-aware button management

🔧 I've created ${CONFIG_PAGE_NAME} with sample configuration.

👆 Click the [ℹ️] section to customize your subjournals!

This is your one-time welcome message.`);
      }, 1000);
    }

    // ==================== DROPDOWN FUNCTIONALITY ====================

    function createDropdown(subjournals, triggerElement, mode = "sidebar") {
      if (currentDropdown) {
        currentDropdown.remove();
        currentDropdown = null;
      }

      if (subjournals.length === 0) {
        alert(
          `⚠ No subjournals configured. Click the [ℹ️] button to set up ${CONFIG_PAGE_NAME}.`
        );
        return;
      }

      const dropdown = document.createElement("div");
      dropdown.className = "subjournals-dropdown";

      Object.assign(dropdown.style, {
        position: "absolute",
        zIndex: "10001",
        background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
        border: "1.5px solid #8b4513",
        boxShadow: "0 6px 16px rgba(245, 158, 11, 0.3)",
        minWidth: "200px",
        fontSize: "13px",
      });

      subjournals.forEach(({ name, color }) => {
        const option = document.createElement("div");
        option.className = "subjournals-option";
        option.textContent = name;

        const colorMap = {
          red: "#e74c3c",
          orange: "#e67e22",
          yellow: "#f1c40f",
          green: "#27ae60",
          blue: "#3498db",
          purple: "#9b59b6",
          brown: "#8b4513",
          grey: "#95a5a6",
          white: "#ecf0f1",
          black: "#2c3e50",
        };

        const colorValue = colorMap[color.toLowerCase()] || "#3498db";

        Object.assign(option.style, {
          padding: "10px 15px",
          cursor: "pointer",
          borderBottom: "1px solid rgba(139, 69, 19, 0.1)",
          borderLeft: `3px solid ${colorValue}`,
          color: colorValue,
          fontWeight: "600",
          transition: "all 150ms ease",
        });

        option.addEventListener("mouseenter", () => {
          option.style.backgroundColor = "rgba(245, 158, 11, 0.1)";
        });

        option.addEventListener("mouseleave", () => {
          option.style.backgroundColor = "transparent";
        });

        option.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.remove();
          currentDropdown = null;

          console.log(
            `🐇 Selected "${name}" with color "${color}" for ${mode} mode`
          );

          if (mode === "sidebar") {
            handleSubjournalSelection(name, color);
          } else {
            handleDirectEntry({ name, color });
          }
        });

        dropdown.appendChild(option);
      });

      // Position dropdown relative to button
      const container = buttonRegistry.getCurrentContainer();

      if (triggerElement && triggerElement.getBoundingClientRect) {
        try {
          const buttonRect = triggerElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          dropdown.style.top = buttonRect.bottom - containerRect.top + 2 + "px";
          dropdown.style.left = buttonRect.left - containerRect.left + "px";
          dropdown.style.width = buttonRect.width + "px";

          console.log(`📍 Dropdown positioned relative to button`);
        } catch (error) {
          console.warn("⚠️ Could not position dropdown, using fallback");
          dropdown.style.top = "60px";
          dropdown.style.right = "20px";
        }
      } else {
        dropdown.style.top = "60px";
        dropdown.style.right = "20px";
      }

      container.appendChild(dropdown);
      currentDropdown = dropdown;

      // Close dropdown when clicking outside
      const closeDropdown = (e) => {
        if (
          !dropdown.contains(e.target) &&
          (!triggerElement || !triggerElement.contains(e.target))
        ) {
          dropdown.remove();
          currentDropdown = null;
          document.removeEventListener("click", closeDropdown);
        }
      };

      setTimeout(() => document.addEventListener("click", closeDropdown), 0);
    }

    // ==================== NAVIGATION MODES ====================

    // MODE 1: Sidebar Navigation (from date pages)
    async function handleSubjournalSelection(subjournalName, color) {
      try {
        const context = await getPageContext();
        if (!context.dateInfo)
          throw new Error("Current page is not a valid date page");

        const subjournalPageUid = await getOrCreatePageUid(subjournalName);
        const journalUid = await getOrCreateJournalEntriesBlock(
          subjournalPageUid
        );
        const targetBlockUid = await createDateEntry(
          journalUid,
          context.dateInfo,
          color
        );

        // Open in sidebar
        await window.roamAlphaAPI.ui.rightSidebar.addWindow({
          window: { type: "outline", "block-uid": subjournalPageUid },
        });

        setTimeout(async () => {
          try {
            const windowId = `sidebar-outline-${subjournalPageUid}`;
            await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
              location: { "block-uid": targetBlockUid, "window-id": windowId },
            });
            console.log("🎯 ✅ SIDEBAR FOCUS SUCCESS!");
          } catch (focusError) {
            console.error("🎯 ❌ Focus error:", focusError);
          }
        }, 800);

        console.log(
          `✅ SIDEBAR SUCCESS: Entry created in ${subjournalName} for ${context.dateInfo.fullDate}`
        );
      } catch (error) {
        console.error("⚠ Error in sidebar mode:", error);
        alert(`❌ Error: ${error.message}`);
      }
    }

    // MODE 2: Focus Mode Navigation (from subjournal pages)
    async function handleDirectEntry(subjournalInfo) {
      try {
        console.log(
          `🎯 FOCUS MODE: Creating direct entry for ${subjournalInfo.name}`
        );

        const dateInfo = {
          year: new Date().getFullYear(),
          month: new Date().toLocaleDateString("en-US", { month: "long" }),
          day: new Date().getDate(),
          dayName: new Date().toLocaleDateString("en-US", { weekday: "long" }),
          fullDate: new Date()
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
          fullMonth: `${new Date().toLocaleDateString("en-US", {
            month: "long",
          })} ${new Date().getFullYear()}`,
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

        // Focus Mode activation
        setTimeout(async () => {
          try {
            console.log(`🎯 FOCUS MODE: Activating focus mode`);
            await window.roamAlphaAPI.ui.mainWindow.openBlock({
              block: { uid: newBlockUid },
            });
            console.log("🎯 ✅ FOCUS MODE SUCCESS!");
          } catch (focusError) {
            console.error("🎯 ❌ Focus Mode error:", focusError);
          }
        }, 200);

        console.log(`✅ FOCUS MODE SUCCESS: Direct entry created!`);
      } catch (error) {
        console.error("❌ Error in focus mode:", error);
        alert(`❌ Error: ${error.message}`);
      }
    }

    // ==================== BUTTON CREATION ====================

    function createSubjournalsButton() {
      return getPageContext().then((context) => {
        if (context.context === "date") {
          // Date page: Show dropdown for subjournal selection
          return {
            id: "subjournals-main",
            sections: [
              {
                type: "icon",
                content: "ℹ️",
                tooltip: "Configure Subjournals",
                onClick: () => {
                  window.roamAlphaAPI.ui.mainWindow.openPage({
                    page: { title: CONFIG_PAGE_NAME },
                  });
                },
              },
              {
                type: "main",
                content: "Add to Subjournal?",
                onClick: (params) => {
                  const subjournals = getSubjournals();
                  createDropdown(
                    subjournals,
                    params.buttonContainer,
                    "sidebar"
                  );
                },
              },
            ],
            condition: () => context.context === "date",
            stack: "top-right",
          };
        } else if (context.context === "subjournal") {
          // Subjournal page: Show direct entry button
          return {
            id: "subjournals-main",
            sections: [
              {
                type: "icon",
                content: "ℹ️",
                tooltip: "Configure Subjournals",
                onClick: () => {
                  window.roamAlphaAPI.ui.mainWindow.openPage({
                    page: { title: CONFIG_PAGE_NAME },
                  });
                },
              },
              {
                type: "main",
                content: "Add entry to this page?",
                onClick: () => {
                  handleDirectEntry(context.subjournalInfo);
                },
              },
            ],
            condition: () => context.context === "subjournal",
            stack: "top-right",
          };
        }

        return null; // No button on other pages
      });
    }

    // ==================== ✅ INITIALIZATION - EVENT-DRIVEN ====================

    async function initialize() {
      console.log(
        "🚀 Initializing Full Featured Subjournals v4.1 - Event-Driven + New Config..."
      );

      // ✅ EVENT-DRIVEN: Initialize button registry with zero polling
      buttonRegistry = new EventDrivenButtonRegistry();
      await buttonRegistry.initialize();

      // Check for onboarding
      if (needsOnboarding()) {
        console.log("🛠️ First-time user detected - creating default structure");
        const created = await createDefaultStructure();
        if (created) showOnboardingGuidance();
      }

      // Register the subjournals button with dynamic configuration
      const buttonConfig = await createSubjournalsButton();
      if (buttonConfig) {
        buttonRegistry.registerButton(buttonConfig);
      }

      // ✅ EVENT-DRIVEN: Re-register button on page changes (no polling)
      buttonRegistry.pageDetector.onPageChange(async () => {
        buttonRegistry.removeButton("subjournals-main");
        const newButtonConfig = await createSubjournalsButton();
        if (newButtonConfig) {
          buttonRegistry.registerButton(newButtonConfig);
        }
      });

      // Settings panel
      extensionAPI.settings.panel.create({
        tabTitle: "Full Featured Subjournals v4.1",
        settings: [
          {
            id: "debugMode",
            name: "Debug Mode",
            description: "Enable detailed console logging for troubleshooting",
            action: { type: "switch" },
          },
          {
            id: "performanceMode",
            name: "Performance Mode",
            description: "Enable performance monitoring and optimization",
            action: { type: "switch" },
          },
        ],
      });

      console.log(
        "✅ Full Featured Subjournals v4.1 initialized - Event-driven + New config location!"
      );

      return {
        cleanup: () => {
          buttonRegistry.cleanup();
          if (currentDropdown) currentDropdown.remove();
          console.log("🧹 Full Featured Subjournals v4.1 cleaned up");
        },
      };
    }

    return initialize();
  },

  onunload: () => {
    console.log("✅ Full Featured Subjournals v4.1 unloaded");
  },
};
