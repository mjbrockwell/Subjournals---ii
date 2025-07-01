// ===================================================================
// 📔 FULL FEATURED SUBJOURNALS v4.0 - COMPOUND BUTTONS EDITION
// 🚀 Complete rebuild with integrated buttons manager
// 🎯 Tripartite compound buttons: [ℹ️] [Main Action] [✕]
// 🔄 Context-aware: Date pages vs Subjournal pages
// 🏗️ Preserves critical cascading block creation with #st0 filtering
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📔 Full Featured Subjournals v4.0 loading - Compound Buttons Edition!"
    );

    // ===================================================================
    // 🎯 EMBEDDED BUTTONS MANAGER - COMPLETE INTEGRATION
    // ===================================================================

    const EXTENSION_NAME = "Subjournals Button Manager";
    const EXTENSION_VERSION = "4.0.0";
    const ANIMATION_DURATION = 200;

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
        console.log("🚀 Subjournals page monitoring started");
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
        console.log("🛑 Subjournals page monitoring stopped");
      }

      setupURLListeners() {
        this.boundURLChange = () => this.checkForPageChange();
        window.addEventListener("popstate", this.boundURLChange);

        this.originalPushState = history.pushState;
        this.originalReplaceState = history.replaceState;

        const self = this;
        history.pushState = function (...args) {
          self.originalPushState.apply(history, args);
          setTimeout(() => self.checkForPageChange(), 50);
        };

        history.replaceState = function (...args) {
          self.originalReplaceState.apply(history, args);
          setTimeout(() => self.checkForPageChange(), 50);
        };
      }

      setupTitleListener() {
        const self = this;
        this.titleObserver = new MutationObserver(() => {
          if (document.title !== self.currentTitle) {
            setTimeout(() => self.checkForPageChange(), 50);
          }
        });

        this.titleObserver.observe(document.head, {
          childList: true,
          subtree: true,
        });
      }

      setupPeriodicCheck() {
        this.checkInterval = setInterval(() => {
          this.checkForPageChange();
        }, 3000);
      }

      checkForPageChange() {
        const newUrl = window.location.href;
        const newTitle = document.title;

        if (newUrl !== this.currentUrl || newTitle !== this.currentTitle) {
          console.log(
            `📄 Subjournals page changed: ${this.currentUrl} → ${newUrl}`
          );
          this.currentUrl = newUrl;
          this.currentTitle = newTitle;

          this.listeners.forEach((listener) => {
            try {
              listener({ url: newUrl, title: newTitle });
            } catch (error) {
              console.error(
                "❌ Subjournals page change listener error:",
                error
              );
            }
          });
        }
      }

      onPageChange(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
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

    // ==================== SIMPLE BUTTON REGISTRY ====================

    class SimpleButtonRegistry {
      constructor() {
        this.registeredButtons = new Map();
        this.activeButtons = new Map();
        this.stacks = { "top-left": [], "top-right": [] };
        this.container = null;
        this.debugMode = false;
        this.pageDetector = new SimplePageChangeDetector();

        this.pageDetector.onPageChange(() => {
          this.rebuildAllButtons();
        });
      }

      async initialize() {
        this.setupContainer();
        this.pageDetector.startMonitoring();
        this.rebuildAllButtons();
        console.log("✅ Subjournals Button Registry v4.0 initialized");
        return true;
      }

      setupContainer() {
        this.container = null;
        console.log(
          "✅ Subjournals container setup configured for dynamic detection"
        );
      }

      getCurrentContainer() {
        const candidates = [
          ".roam-article",
          ".roam-main .roam-article",
          ".roam-main",
        ];
        for (const selector of candidates) {
          const element = document.querySelector(selector);
          if (element && document.contains(element)) {
            if (getComputedStyle(element).position === "static") {
              element.style.position = "relative";
            }
            return element;
          }
        }
        console.warn("⚠️ No suitable container found, using document.body");
        return document.body;
      }

      rebuildAllButtons() {
        console.log("🔄 Rebuilding subjournals buttons for current page...");

        this.clearAllButtons();
        this.clearAllStacks();

        const visibleButtons = [];
        this.registeredButtons.forEach((config) => {
          if (this.shouldButtonBeVisible(config)) {
            visibleButtons.push(config);
          }
        });

        visibleButtons.sort((a, b) => {
          if (a.priority && !b.priority) return -1;
          if (!a.priority && b.priority) return 1;
          return 0;
        });

        visibleButtons.forEach((config) => {
          this.assignButtonToStack(config);
        });

        this.placeAllStackedButtons();

        console.log(
          `✅ Subjournals button rebuild complete (${this.activeButtons.size} visible)`
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
            `📍 Subjournals button "${config.id}" assigned to ${targetStack} slot ${this.stacks[targetStack].length}`
          );
        } else {
          console.warn(
            `⚠️ Subjournals button "${config.id}" skipped - no slots available in ${targetStack}`
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
          `🔧 Creating compound subjournals button "${config.id}" with ${config.sections.length} sections`
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

        // 🎯 EXACT STYLING: Warm yellow gradient with elegant brown border
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
          `✅ Compound subjournals button "${
            config.id
          }" placed at ${stackName} #${stackIndex + 1} with ${
            sections.length
          } sections`
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
          color: "#78716c", // Muted brown text
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

        // Section-specific hover effects with warm theme
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
            console.error(
              `❌ Subjournals section "${section.type}" click error:`,
              error
            );
          }
        });

        return sectionElement;
      }

      dismissCompoundButton(buttonId, buttonContainer) {
        console.log(`🗑️ Dismissing subjournals compound button "${buttonId}"`);
        if (buttonContainer.parentNode) {
          buttonContainer.remove();
        }
        this.activeButtons.delete(buttonId);
        console.log(`✅ Subjournals compound button "${buttonId}" dismissed`);
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
          throw new Error(
            `Subjournals button "${id}" must have sections array`
          );
        }

        // Validate each section
        sections.forEach((section, index) => {
          if (!section.type) {
            throw new Error(
              `Subjournals button "${id}" section ${index} must have a type`
            );
          }
          if (!SECTION_TYPES[section.type]) {
            throw new Error(
              `Subjournals button "${id}" section ${index} has invalid type: ${section.type}`
            );
          }
        });

        if (this.registeredButtons.has(id)) {
          throw new Error(`Subjournals button "${id}" already registered`);
        }

        const stack = config.stack || "top-right";
        if (!BUTTON_STACKS[stack]) {
          throw new Error(
            `Invalid stack: ${stack}. Must be: ${Object.keys(
              BUTTON_STACKS
            ).join(", ")}`
          );
        }

        // Store configuration
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

        if (this.pageDetector.isMonitoring) {
          this.rebuildAllButtons();
        }

        console.log(
          `✅ Subjournals compound button "${id}" registered for ${stack} stack${
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
          console.log(`🗑️ Subjournals button "${id}" removed`);
        }
        return removed;
      }

      cleanup() {
        this.clearAllButtons();
        this.clearAllStacks();
        this.registeredButtons.clear();
        this.pageDetector.stopMonitoring();
        console.log("🧹 Subjournals Button Registry cleaned up");
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

    // ==================== STATE MANAGEMENT ====================

    let buttonRegistry;
    let hasShownOnboarding = false;
    let currentDropdown = null;

    // ==================== PAGE CONTEXT DETECTION ====================

    async function getPageContext() {
      try {
        const pageTitle = getCurrentPageTitle();
        if (!pageTitle) return { context: "unknown" };

        // Check if it's a date page
        const isDate = DATE_PAGE_REGEX.test(pageTitle);

        // Check if it's a configured subjournal
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

    // ==================== CONFIGURATION READING ====================

    function getSubjournals() {
      try {
        const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where [?e :node/title "roam/subjournals"] [?e :block/uid ?uid]]
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

        // Test each filtered child against the pattern (without #st0 prefix)
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

    // ==================== ONBOARDING ====================

    function needsOnboarding() {
      try {
        const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where [?e :node/title "roam/subjournals"] [?e :block/uid ?uid]]
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
              "Welcome to Full Featured Subjournals v4.0! List your personal subjournals below. Colors: red, orange, yellow, green, blue, purple, grey, brown, white, black. #clr-lgt-orn-act",
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
        alert(`📔 Welcome to Full Featured Subjournals v4.0!

🎯 Complete rebuild with compound buttons and integrated button manager!

✨ What's new:
- Tripartite compound buttons: [ℹ️] [Main Action] [✕]
- Intelligent button placement with other extensions
- Context-aware: Works on date pages AND subjournal pages  
- Bulletproof cascading block creation with #st0 filtering

🔧 I've created [[roam/subjournals]] with sample configuration.

👆 Click the [ℹ️] section to customize your subjournals!

This is your one-time welcome message.`);
      }, 1000);
    }

    // ==================== DROPDOWN FUNCTIONALITY ====================

    function createDropdown(subjournals, triggerElement, mode = "sidebar") {
      // Remove any existing dropdown
      if (currentDropdown) {
        currentDropdown.remove();
        currentDropdown = null;
      }

      if (subjournals.length === 0) {
        alert(
          "⚠ No subjournals configured. Click the [ℹ️] button to set up [[roam/subjournals]]."
        );
        return;
      }

      const dropdown = document.createElement("div");
      dropdown.className = "subjournals-dropdown";

      // Warm yellow dropdown styling
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

          // Position dropdown directly below the button, aligned to the right edge
          dropdown.style.top = buttonRect.bottom - containerRect.top + 2 + "px";
          dropdown.style.left = buttonRect.left - containerRect.left + "px";
          dropdown.style.width = buttonRect.width + "px";

          console.log(
            `📍 Dropdown positioned: top=${
              buttonRect.bottom - containerRect.top + 2
            }px, left=${buttonRect.left - containerRect.left}px, width=${
              buttonRect.width
            }px`
          );
        } catch (error) {
          console.warn(
            "⚠️ Could not position dropdown relative to button, using default position"
          );
          dropdown.style.top = "60px";
          dropdown.style.right = "20px";
        }
      } else {
        // Fallback positioning
        console.warn("⚠️ No valid trigger element, using fallback positioning");
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
        const subjournals = getSubjournals();

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
                    page: { title: "roam/subjournals" },
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
                    page: { title: "roam/subjournals" },
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

    // ==================== INITIALIZATION ====================

    async function initialize() {
      console.log("🚀 Initializing Full Featured Subjournals v4.0...");

      // Initialize button registry
      buttonRegistry = new SimpleButtonRegistry();
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

      // Re-register button on page changes
      buttonRegistry.pageDetector.onPageChange(async () => {
        buttonRegistry.removeButton("subjournals-main");
        const newButtonConfig = await createSubjournalsButton();
        if (newButtonConfig) {
          buttonRegistry.registerButton(newButtonConfig);
        }
      });

      // Settings panel
      extensionAPI.settings.panel.create({
        tabTitle: "Full Featured Subjournals v4.0",
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
        "✅ Full Featured Subjournals v4.0 initialized with compound buttons!"
      );

      return {
        cleanup: () => {
          buttonRegistry.cleanup();
          if (currentDropdown) currentDropdown.remove();
          console.log("🧹 Full Featured Subjournals v4.0 cleaned up");
        },
      };
    }

    return initialize();
  },

  onunload: () => {
    console.log("✅ Full Featured Subjournals v4.0 unloaded");
  },
};
