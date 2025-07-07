// ===================================================================
// Simple Button Utility Extension 3.2.1 - Fixed Daily Note Detection
// 🔧 FIXED: Robust daily note detection using page title instead of URL
// 📅 ENHANCED: Weekly page detection conditions for Calendar Suite
// ✅ GUARANTEED: 100% backward compatibility with existing extensions
// 🚀 IMPROVED: Professional multi-section button architecture
// ===================================================================

(() => {
  "use strict";

  const EXTENSION_NAME = "Simple Button Utility";
  const EXTENSION_VERSION = "3.2.1"; // 🔧 FIXED: Daily note detection
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

  // ==================== BUTTON STACK CONFIGURATION ====================

  const BUTTON_STACKS = {
    "top-left": {
      maxButtons: 5,
      positions: [
        { x: 20, y: 60 },
        { x: 20, y: 110 },
        { x: 20, y: 160 },
        { x: 20, y: 210 },
        { x: 20, y: 260 },
      ],
    },
    "top-right": {
      maxButtons: 5,
      positions: [
        { x: -20, y: 60 },
        { x: -20, y: 110 },
        { x: -20, y: 160 },
        { x: -20, y: 210 },
        { x: -20, y: 260 },
      ],
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
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          return element.textContent.trim();
        }
      }

      const hash = window.location.hash;
      if (hash) {
        const match = hash.match(/#\/app\/[^\/]+\/page\/(.+)$/);
        if (match) {
          const encoded = match[1];
          try {
            return decodeURIComponent(encoded);
          } catch (error) {
            return encoded;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn("❌ Error getting page title:", error);
      return null;
    }
  }

  // ==================== SIMPLE PAGE CHANGE DETECTOR ====================

  class SimplePageChangeDetector {
    constructor() {
      this.listeners = new Set();
      this.currentUrl = window.location.href;
      this.currentTitle = getCurrentPageTitle();
      this.isMonitoring = false;
      this.observer = null;
    }

    startMonitoring() {
      if (this.isMonitoring) return;

      this.observer = new MutationObserver(() => {
        this.checkPageChange();
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      window.addEventListener("popstate", () => this.checkPageChange());
      window.addEventListener("hashchange", () => this.checkPageChange());

      this.isMonitoring = true;
      console.log("🔍 Simple page change detection started");
    }

    stopMonitoring() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }

      this.isMonitoring = false;
      console.log("🔍 Simple page change detection stopped");
    }

    checkPageChange() {
      const newUrl = window.location.href;
      const newTitle = getCurrentPageTitle();

      if (newUrl !== this.currentUrl || newTitle !== this.currentTitle) {
        this.currentUrl = newUrl;
        this.currentTitle = newTitle;

        this.listeners.forEach((listener) => {
          try {
            listener({ url: newUrl, title: newTitle });
          } catch (error) {
            console.error("❌ Page change listener error:", error);
          }
        });
      }
    }

    onPageChange(listener) {
      this.listeners.add(listener);
      return () => this.listeners.delete(listener);
    }
  }

  // ==================== BUTTON CONDITIONS (Fixed Daily Note Detection) ====================

  const ButtonConditions = {
    isUsernamePage: () => {
      const pageTitle = getCurrentPageTitle();
      if (!pageTitle) return false;

      if (window.GraphMemberCache?.isMember) {
        const isCachedMember = window.GraphMemberCache.isMember(pageTitle);
        if (window.SimpleButtonRegistry?.debugMode) {
          console.log(
            `🎯 Cache-based username detection for "${pageTitle}": ${isCachedMember}`
          );
        }
        return isCachedMember;
      }

      const isFirstLastPattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(pageTitle);
      const isUsernamePattern = /^[a-zA-Z][a-zA-Z0-9_-]{2,}$/.test(pageTitle);
      const result = isFirstLastPattern || isUsernamePattern;

      if (window.SimpleButtonRegistry?.debugMode) {
        console.log(
          `⚠️ Fallback regex username detection for "${pageTitle}":`,
          {
            isFirstLastPattern,
            isUsernamePattern,
            result,
          }
        );
      }
      return result;
    },

    isChatRoom: () => {
      const pageTitle = getCurrentPageTitle();
      if (!pageTitle) return false;
      const lowerTitle = pageTitle.toLowerCase();
      const containsChatRoom = lowerTitle.includes("chat room");
      if (window.SimpleButtonRegistry?.debugMode) {
        console.log(
          `🗨️ Chat room detection for "${pageTitle}": ${containsChatRoom}`
        );
      }
      return containsChatRoom;
    },

    // 🔧 FIXED: Robust daily note detection using page title instead of URL
    isDailyNote: () => {
      const pageTitle = getCurrentPageTitle();
      if (!pageTitle) return false;

      // 🎯 ROBUST: Check actual page title format (same as Subjournals extension)
      const DATE_PAGE_REGEX =
        /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2})(st|nd|rd|th), (\d{4})$/;

      const isDate = DATE_PAGE_REGEX.test(pageTitle);

      if (window.SimpleButtonRegistry?.debugMode) {
        console.log(`📅 Daily note detection for "${pageTitle}": ${isDate}`);
      }

      return isDate;
    },

    isMainPage: () => {
      return (
        !!document.querySelector(".roam-article") &&
        window.location.href.includes("/page/")
      );
    },

    isSettingsPage: () => {
      return (
        window.location.href.includes("/settings") ||
        window.location.href.includes("roam/settings")
      );
    },

    // Monthly page detection for Calendar Suite
    isMonthlyPage: () => {
      const pageTitle = getCurrentPageTitle();
      if (!pageTitle) return false;

      // Matches "January 2025", "February 2024", etc.
      const isMonthly =
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/.test(
          pageTitle
        );

      if (window.SimpleButtonRegistry?.debugMode) {
        console.log(
          `📅 Monthly page detection for "${pageTitle}": ${isMonthly}`
        );
      }

      return isMonthly;
    },

    // Enhanced condition to check if monthly page has NO content
    isEmptyMonthlyPage: () => {
      const pageTitle = getCurrentPageTitle();
      if (!pageTitle) return false;

      // First check if it's a monthly page
      const isMonthly =
        /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/.test(
          pageTitle
        );
      if (!isMonthly) return false;

      // Then check if it has calendar content
      try {
        const pageUid = window.roamAlphaAPI?.data?.q(
          `[:find ?uid . :in $ ?title :where [?page :node/title ?title] [?page :block/uid ?uid]]`,
          pageTitle
        );

        if (!pageUid) return true; // Page doesn't exist = empty

        const children = window.roamAlphaAPI?.data?.q(
          `[:find (pull ?child [:block/string]) :in $ ?page-uid :where [?page :block/uid ?page-uid] [?page :block/children ?child]]`,
          pageUid
        );

        if (!children || children.length === 0) return true; // No content

        // Check if has week-related content
        const hasWeekContent = children.some((child) => {
          const blockText = child[0]?.string || "";
          return (
            blockText.includes("Week") ||
            blockText.includes("Monday") ||
            blockText.includes("TODO")
          );
        });

        if (window.SimpleButtonRegistry?.debugMode) {
          console.log(
            `📅 Empty monthly page detection for "${pageTitle}": ${!hasWeekContent} (${
              children.length
            } blocks, hasWeekContent: ${hasWeekContent})`
          );
        }

        return !hasWeekContent; // Empty if no week content
      } catch (error) {
        if (window.SimpleButtonRegistry?.debugMode) {
          console.warn("⚠️ Error checking monthly page content:", error);
        }
        return true; // Assume empty on error
      }
    },

    // Weekly page detection for Calendar Suite
    isWeeklyPage: () => {
      const pageTitle = getCurrentPageTitle();
      if (!pageTitle) return false;

      // Use Calendar Utilities if available for accurate detection
      if (window.CalendarUtilities?.WeeklyUtils?.isWeeklyPage) {
        const isWeekly =
          window.CalendarUtilities.WeeklyUtils.isWeeklyPage(pageTitle);

        if (window.SimpleButtonRegistry?.debugMode) {
          console.log(
            `📅 Weekly page detection (CalendarUtilities) for "${pageTitle}": ${isWeekly}`
          );
        }

        return isWeekly;
      }

      // Fallback regex for weekly pattern: "MM/DD YYYY - MM/DD YYYY"
      const weeklyPattern = /^\d{2}\/\d{2}\s+\d{4}\s+-\s+\d{2}\/\d{2}\s+\d{4}$/;
      const isWeekly = weeklyPattern.test(pageTitle);

      if (window.SimpleButtonRegistry?.debugMode) {
        console.log(
          `📅 Weekly page detection (fallback regex) for "${pageTitle}": ${isWeekly}`
        );
      }

      return isWeekly;
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

  // ==================== SIMPLE BUTTON REGISTRY v3.2.1 ====================

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
      console.log(
        "✅ Simple Button Registry v3.2.1 initialized with fixed daily note detection"
      );
      return true;
    }

    setupContainer() {
      this.container = null;
      console.log("✅ Container setup configured for dynamic detection");
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

    // ==================== CORE REBUILD LOGIC ====================

    rebuildAllButtons() {
      console.log("🔄 Rebuilding all buttons for current page");

      this.clearAllButtons();
      this.clearAllStacks();

      const visibleButtons = [];
      this.registeredButtons.forEach((config) => {
        if (this.shouldButtonBeVisible(config)) {
          visibleButtons.push(config);
        }
      });

      if (visibleButtons.length === 0) {
        return;
      }

      this.assignButtonsToStacks(visibleButtons);
      this.placeAllStackedButtons();

      console.log(
        `✅ Placed ${this.activeButtons.size}/${this.registeredButtons.size} buttons`
      );
    }

    clearAllButtons() {
      this.activeButtons.forEach((button) => {
        if (button.parentNode) {
          button.remove();
        }
      });
      this.activeButtons.clear();
    }

    clearAllStacks() {
      this.stacks = { "top-left": [], "top-right": [] };
    }

    assignButtonsToStacks(buttons) {
      const priorityButtons = buttons.filter((b) => b.priority);
      const regularButtons = buttons.filter((b) => !b.priority);

      [...priorityButtons, ...regularButtons].forEach((config) => {
        this.assignButtonToStack(config);
      });
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

    // ==================== ✨ COMPOUND BUTTON DETECTION ====================

    createAndPlaceButton(config, stackName, stackIndex) {
      if (
        config.sections &&
        Array.isArray(config.sections) &&
        config.sections.length > 0
      ) {
        console.log(
          `🔧 Creating compound button "${config.id}" with ${config.sections.length} sections`
        );
        return this.createCompoundButton(config, stackName, stackIndex);
      } else {
        console.log(
          `🔧 Creating simple button "${config.id}" (backward compatible)`
        );
        return this.createSimpleButton(config, stackName, stackIndex);
      }
    }

    // ==================== ✅ SIMPLE BUTTON (100% BACKWARD COMPATIBLE) ====================

    createSimpleButton(config, stackName, stackIndex) {
      const buttonContainer = document.createElement("div");
      buttonContainer.style.position = "absolute";
      buttonContainer.style.display = "flex";
      buttonContainer.style.alignItems = "center";
      buttonContainer.style.zIndex = "10000";

      const mainButton = document.createElement("button");
      mainButton.textContent = config.text;

      const stackConfig = BUTTON_STACKS[stackName];
      const position = stackConfig.positions[stackIndex];

      Object.assign(mainButton.style, {
        padding: "8px 12px",
        paddingRight: "32px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        fontFamily: "system-ui, -apple-system, sans-serif",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        transition: "all 200ms ease",
        userSelect: "none",
        ...config.style,
      });

      const dismissButton = document.createElement("span");
      dismissButton.textContent = "×";
      Object.assign(dismissButton.style, {
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#8b4513",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        padding: "2px 4px",
        borderRadius: "3px",
        transition: "background 200ms ease",
      });

      dismissButton.addEventListener("mouseenter", () => {
        dismissButton.style.background = "rgba(220, 38, 38, 0.8)";
        dismissButton.style.color = "white";
      });
      dismissButton.addEventListener("mouseleave", () => {
        dismissButton.style.background = "transparent";
        dismissButton.style.color = "#8b4513";
      });
      dismissButton.addEventListener("click", (e) => {
        e.stopPropagation();
        this.dismissButton(config.id, buttonContainer);
      });

      mainButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          if (config.onClick) {
            config.onClick();
          }
        } catch (error) {
          console.error(`❌ Button "${config.id}" click error:`, error);
        }
      });

      buttonContainer.appendChild(mainButton);
      buttonContainer.appendChild(dismissButton);

      if (position.x < 0) {
        buttonContainer.style.right = `${Math.abs(position.x)}px`;
        buttonContainer.style.left = "auto";
      } else {
        buttonContainer.style.left = `${position.x}px`;
        buttonContainer.style.right = "auto";
      }
      buttonContainer.style.top = `${position.y}px`;

      buttonContainer.addEventListener("mouseenter", () => {
        buttonContainer.style.transform = "translateY(-1px)";
        mainButton.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      });

      buttonContainer.addEventListener("mouseleave", () => {
        buttonContainer.style.transform = "translateY(0)";
        mainButton.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      });

      const container = this.getCurrentContainer();
      container.appendChild(buttonContainer);
      this.activeButtons.set(config.id, buttonContainer);

      console.log(
        `✅ Simple button "${config.id}" placed at ${stackName} #${
          stackIndex + 1
        }`
      );
    }

    // ==================== 🚀 COMPOUND BUTTON (NEW FUNCTIONALITY) ====================

    createCompoundButton(config, stackName, stackIndex) {
      const buttonContainer = document.createElement("div");
      buttonContainer.style.position = "absolute";
      buttonContainer.style.display = "flex";
      buttonContainer.style.alignItems = "center";
      buttonContainer.style.zIndex = "10000";
      buttonContainer.style.borderRadius = "8px";
      buttonContainer.style.overflow = "hidden";
      buttonContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
      buttonContainer.style.transition = "all 200ms ease";

      const stackConfig = BUTTON_STACKS[stackName];
      const position = stackConfig.positions[stackIndex];

      let sections = [...config.sections];
      const hasDismissSection = sections.some(
        (section) => section.type === "dismiss"
      );
      if (!hasDismissSection) {
        sections.push({
          type: "dismiss",
          content: "×",
          onClick: () => this.dismissCompoundButton(config.id, buttonContainer),
        });
      }

      sections.forEach((section, index) => {
        const sectionElement = this.createSection(
          section,
          index,
          sections.length,
          config,
          stackName,
          stackIndex
        );
        buttonContainer.appendChild(sectionElement);
      });

      if (position.x < 0) {
        buttonContainer.style.right = `${Math.abs(position.x)}px`;
        buttonContainer.style.left = "auto";
      } else {
        buttonContainer.style.left = `${position.x}px`;
        buttonContainer.style.right = "auto";
      }
      buttonContainer.style.top = `${position.y}px`;

      buttonContainer.addEventListener("mouseenter", () => {
        buttonContainer.style.transform = "translateY(-1px)";
        buttonContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
      });

      buttonContainer.addEventListener("mouseleave", () => {
        buttonContainer.style.transform = "translateY(0)";
        buttonContainer.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
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
      stackIndex
    ) {
      const sectionElement = document.createElement("div");
      const sectionType = SECTION_TYPES[section.type];

      // 🎨 Calculate border-radius for perfect rounded corners
      let borderRadius = {};
      if (index === 0) {
        // First section - round left corners
        borderRadius.borderTopLeftRadius = "8px";
        borderRadius.borderBottomLeftRadius = "8px";
      }
      if (index === totalSections - 1) {
        // Last section - round right corners
        borderRadius.borderTopRightRadius = "8px";
        borderRadius.borderBottomRightRadius = "8px";
      }

      Object.assign(sectionElement.style, {
        ...sectionType.defaultStyle,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        fontSize: "14px",
        borderRight:
          index < totalSections - 1
            ? "1px solid rgba(255,255,255,0.2)"
            : "none",
        transition: "all 200ms ease",
        cursor: "pointer",
        fontFamily: "system-ui, -apple-system, sans-serif",
        userSelect: "none",
        ...borderRadius, // 🎨 Apply calculated border-radius
        ...section.style,
      });

      sectionElement.textContent = section.content || "";

      if (section.tooltip) {
        sectionElement.title = section.tooltip;
      }

      sectionElement.addEventListener("mouseenter", () => {
        sectionElement.style.background =
          section.type === "dismiss"
            ? "rgba(220, 38, 38, 0.8)"
            : section.style?.background || "#6366f1";
        sectionElement.style.color =
          section.type === "dismiss"
            ? "white"
            : section.style?.color || "white";
      });

      sectionElement.addEventListener("mouseleave", () => {
        sectionElement.style.background =
          section.style?.background ||
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        sectionElement.style.color =
          section.type === "dismiss" ? "#8b4513" : "#333";
      });

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
            });
          }
        } catch (error) {
          console.error(`❌ Section "${section.type}" click error:`, error);
        }
      });

      return sectionElement;
    }

    dismissButton(buttonId, buttonContainer) {
      console.log(`🗑️ Dismissing button "${buttonId}"`);
      if (buttonContainer.parentNode) {
        buttonContainer.remove();
      }
      this.activeButtons.delete(buttonId);
      console.log(`✅ Button "${buttonId}" dismissed`);
    }

    dismissCompoundButton(buttonId, buttonContainer) {
      console.log(`🗑️ Dismissing compound button "${buttonId}"`);
      if (buttonContainer.parentNode) {
        buttonContainer.remove();
      }
      this.activeButtons.delete(buttonId);
      console.log(`✅ Compound button "${buttonId}" dismissed`);
    }

    // ==================== VISIBILITY AND CONDITION LOGIC ====================

    shouldButtonBeVisible(config) {
      const { showOn, hideOn, condition } = config;

      if (this.debugMode) {
        console.group(`🔍 Evaluating visibility for button "${config.id}"`);
        console.log("Button config:", {
          showOn,
          hideOn,
          condition: !!condition,
        });
        console.log("Current page:", {
          url: window.location.href,
          title: getCurrentPageTitle(),
        });
      }

      if (condition && typeof condition === "function") {
        try {
          const result = condition();
          if (this.debugMode) {
            console.log(`Custom condition result: ${result}`);
            console.groupEnd();
          }
          return result;
        } catch (error) {
          console.error(`❌ Custom condition error for "${config.id}":`, error);
          if (this.debugMode) {
            console.groupEnd();
          }
          return false;
        }
      }

      if (showOn) {
        const conditionResults = showOn.map((conditionName) => {
          const hasCondition = ButtonConditions[conditionName]
            ? ButtonConditions[conditionName]()
            : false;
          if (this.debugMode) {
            console.log(`Condition "${conditionName}": ${hasCondition}`);
          }
          return hasCondition;
        });

        const shouldShow = conditionResults.some((result) => result);
        if (this.debugMode) {
          console.log(
            `showOn evaluation: ${shouldShow} (${conditionResults.join(", ")})`
          );
        }

        if (!shouldShow) {
          if (this.debugMode) {
            console.log("❌ Button hidden by showOn rules");
            console.groupEnd();
          }
          return false;
        }
      }

      if (hideOn) {
        const hideResults = hideOn.map((conditionName) => {
          const shouldHide = ButtonConditions[conditionName]
            ? ButtonConditions[conditionName]()
            : false;
          if (this.debugMode) {
            console.log(`Hide condition "${conditionName}": ${shouldHide}`);
          }
          return shouldHide;
        });

        const shouldHide = hideResults.some((result) => result);
        if (this.debugMode) {
          console.log(
            `hideOn evaluation: ${shouldHide} (${hideResults.join(", ")})`
          );
        }

        if (shouldHide) {
          if (this.debugMode) {
            console.log("❌ Button hidden by hideOn rules");
            console.groupEnd();
          }
          return false;
        }
      }

      if (this.debugMode) {
        console.log("✅ Button should be visible");
        console.groupEnd();
      }

      return true;
    }

    // ==================== PUBLIC API ====================

    registerButton(config) {
      const { id, text, onClick, sections } = config;

      if (sections) {
        if (!Array.isArray(sections)) {
          throw new Error(`Button "${id}" sections must be an array`);
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
      } else {
        if (!id || !text || !onClick) {
          throw new Error("Simple button must have id, text, and onClick");
        }
      }

      if (this.registeredButtons.has(id)) {
        throw new Error(`Button "${id}" already registered`);
      }

      const stack = config.stack || "top-right";
      if (!BUTTON_STACKS[stack]) {
        throw new Error(
          `Invalid stack: ${stack}. Must be: ${Object.keys(BUTTON_STACKS).join(
            ", "
          )}`
        );
      }

      this.registeredButtons.set(id, {
        id,
        text: text || null,
        onClick: onClick || null,
        sections: sections || null,
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

      const buttonType = sections ? "compound" : "simple";
      console.log(
        `✅ ${buttonType} button "${id}" registered for ${stack} stack${
          config.priority ? " (priority)" : ""
        }`
      );

      return { success: true, id, stack, type: buttonType };
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

    getStatus() {
      return {
        version: EXTENSION_VERSION,
        registeredButtons: this.registeredButtons.size,
        activeButtons: this.activeButtons.size,
        stacks: {
          "top-left": {
            buttons: this.stacks["top-left"].length,
            max: BUTTON_STACKS["top-left"].maxButtons,
            available:
              BUTTON_STACKS["top-left"].maxButtons -
              this.stacks["top-left"].length,
            buttonIds: this.stacks["top-left"].map((b) => b.id),
          },
          "top-right": {
            buttons: this.stacks["top-right"].length,
            max: BUTTON_STACKS["top-right"].maxButtons,
            available:
              BUTTON_STACKS["top-right"].maxButtons -
              this.stacks["top-right"].length,
            buttonIds: this.stacks["top-right"].map((b) => b.id),
          },
        },
        currentPage: {
          url: window.location.href,
          title: getCurrentPageTitle(),
        },
        buttonIds: {
          registered: Array.from(this.registeredButtons.keys()),
          active: Array.from(this.activeButtons.keys()),
        },
        capabilities: {
          simpleButtons: true,
          compoundButtons: true,
          monthlyPageSupport: true,
          weeklyPageSupport: true,
          fixedDailyNoteDetection: true, // 🔧 NEW capability flag
          sectionTypes: Object.keys(SECTION_TYPES),
        },
      };
    }

    cleanup() {
      this.clearAllButtons();
      this.clearAllStacks();
      this.registeredButtons.clear();
      this.pageDetector.stopMonitoring();
      console.log("🧹 Simple Button Registry v3.2.1 cleaned up");
    }
  }

  // ==================== EXTENSION MANAGER ====================

  class SimpleExtensionButtonManager {
    constructor(extensionName) {
      this.extensionName = extensionName;
      this.registry = null;
      this.myButtons = new Set();
    }

    async initialize() {
      if (!window.SimpleButtonRegistry) {
        window.SimpleButtonRegistry = new SimpleButtonRegistry();
        await window.SimpleButtonRegistry.initialize();
      }
      this.registry = window.SimpleButtonRegistry;
      return true;
    }

    async registerButton(config) {
      if (!this.registry) await this.initialize();

      const buttonId = `${this.extensionName}-${config.id}`;
      const result = this.registry.registerButton({
        ...config,
        id: buttonId,
      });

      if (result.success) {
        this.myButtons.add(buttonId);
      }

      return result;
    }

    removeButton(id) {
      const buttonId = `${this.extensionName}-${id}`;
      const success = this.registry?.removeButton(buttonId);

      if (success) {
        this.myButtons.delete(buttonId);
      }

      return success;
    }

    cleanup() {
      this.myButtons.forEach((buttonId) => {
        this.registry?.removeButton(buttonId);
      });
      this.myButtons.clear();
    }
  }

  // ==================== GLOBAL API ====================

  window.SimpleButtonRegistry = null;
  window.SimpleExtensionButtonManager = SimpleExtensionButtonManager;
  window.ButtonConditions = ButtonConditions;

  // ==================== TESTING UTILITIES ====================

  window.SimpleButtonUtilityTests = {
    testSimpleButton: async () => {
      const manager = new SimpleExtensionButtonManager("CompatibilityTest");
      await manager.initialize();

      await manager.registerButton({
        id: "simple-test",
        text: "🧪 Simple Test",
        onClick: () =>
          console.log("Simple button clicked! (v2.1 compatibility)"),
        showOn: ["isMainPage"],
        stack: "top-right",
      });

      console.log("✅ Simple button compatibility test complete");
    },

    testCompoundButton: async () => {
      const manager = new SimpleExtensionButtonManager("CompoundTest");
      await manager.initialize();

      await manager.registerButton({
        id: "compound-test",
        sections: [
          {
            type: "icon",
            content: "⚙️",
            tooltip: "Settings",
            onClick: () => console.log("Settings clicked!"),
            style: { background: "#FBE3A6" },
          },
          {
            type: "main",
            content: "Configure",
            onClick: () => console.log("Main action clicked!"),
          },
          {
            type: "action",
            content: "📊",
            tooltip: "Stats",
            onClick: () => console.log("Stats clicked!"),
          },
        ],
        showOn: ["isMainPage"],
        stack: "top-right",
      });

      console.log("🚀 Compound button test complete");
      console.log(
        "💡 Try clicking different sections: [⚙️] [Configure] [📊] [×]"
      );
    },

    // 🔧 ENHANCED: Test daily note detection with actual page titles
    testDailyNoteDetection: () => {
      console.log("🧪 Testing fixed daily note detection...");

      const testCases = [
        "January 15th, 2025", // Today's format ✅
        "December 31st, 2024", // New Year's Eve ✅
        "February 29th, 2024", // Leap year ✅
        "March 3rd, 2025", // 3rd ✅
        "April 22nd, 2025", // 22nd ✅
        "May 1st, 2025", // 1st ✅
        "January 2025", // Monthly page ❌
        "01/15/2025", // Different format ❌
        "Random Page Title", // Non-date page ❌
        "15th January, 2025", // Wrong order ❌
        "January 15, 2025", // Missing ordinal ❌
      ];

      testCases.forEach((pageTitle) => {
        // Temporarily override getCurrentPageTitle for testing
        const originalGetTitle = getCurrentPageTitle;
        window.getCurrentPageTitle = () => pageTitle;

        const isDaily = ButtonConditions.isDailyNote();

        console.log(`📅 "${pageTitle}": daily=${isDaily}`);

        // Restore original function
        window.getCurrentPageTitle = originalGetTitle;
      });

      console.log("✅ Fixed daily note detection tests complete");
    },

    // Test monthly page conditions
    testMonthlyPageConditions: () => {
      console.log("🧪 Testing monthly page conditions...");

      const testCases = [
        "January 2025",
        "February 2024",
        "March 2023",
        "Not a monthly page",
        "January2025", // No space
        "january 2025", // Lowercase
      ];

      testCases.forEach((pageTitle) => {
        // Temporarily override getCurrentPageTitle for testing
        const originalGetTitle = getCurrentPageTitle;
        window.getCurrentPageTitle = () => pageTitle;

        const isMonthly = ButtonConditions.isMonthlyPage();
        const isEmpty = ButtonConditions.isEmptyMonthlyPage();

        console.log(
          `📅 "${pageTitle}": monthly=${isMonthly}, empty=${isEmpty}`
        );

        // Restore original function
        window.getCurrentPageTitle = originalGetTitle;
      });

      console.log("✅ Monthly page condition tests complete");
    },

    // Test weekly page conditions
    testWeeklyPageConditions: () => {
      console.log("🧪 Testing weekly page conditions...");

      const testCases = [
        "07/28 2025 - 08/03 2025", // Valid weekly format
        "01/06 2024 - 01/12 2024", // Valid weekly format
        "12/30 2024 - 01/05 2025", // Cross-year weekly format
        "January 2025", // Monthly page (should be false)
        "Not a weekly page", // Random page (should be false)
        "7/28 2025 - 8/3 2025", // Single digit format (might be false)
        "07/28/2025 - 08/03/2025", // With slashes in year (might be false)
      ];

      testCases.forEach((pageTitle) => {
        // Temporarily override getCurrentPageTitle for testing
        const originalGetTitle = getCurrentPageTitle;
        window.getCurrentPageTitle = () => pageTitle;

        const isWeekly = ButtonConditions.isWeeklyPage();

        console.log(`📅 "${pageTitle}": weekly=${isWeekly}`);

        // Restore original function
        window.getCurrentPageTitle = originalGetTitle;
      });

      console.log("✅ Weekly page condition tests complete");
    },

    testMixedButtons: async () => {
      const manager = new SimpleExtensionButtonManager("MixedTest");
      await manager.initialize();

      await manager.registerButton({
        id: "mixed-simple",
        text: "📝 Simple",
        onClick: () => console.log("Mixed simple clicked!"),
        showOn: ["isMainPage"],
        stack: "top-left",
      });

      await manager.registerButton({
        id: "mixed-compound",
        sections: [
          {
            type: "icon",
            content: "🎯",
            onClick: () => console.log("Icon clicked!"),
          },
          {
            type: "main",
            content: "Compound",
            onClick: () => console.log("Main clicked!"),
          },
        ],
        showOn: ["isMainPage"],
        stack: "top-left",
      });

      console.log("🔄 Mixed button test complete");
      console.log(
        "🎯 Should see both simple [📝 Simple] [×] and compound [🎯] [Compound] [×] buttons"
      );
    },

    showStatus: () => {
      if (window.SimpleButtonRegistry) {
        const status = window.SimpleButtonRegistry.getStatus();
        console.log("📊 v3.2.1 System Status:", status);
        console.log(
          `🎯 Capabilities: Simple buttons (${status.capabilities.simpleButtons}), Compound buttons (${status.capabilities.compoundButtons}), Monthly page support (${status.capabilities.monthlyPageSupport}), Weekly page support (${status.capabilities.weeklyPageSupport}), Fixed daily note detection (${status.capabilities.fixedDailyNoteDetection})`
        );
        console.log(
          `🧩 Section types available: ${status.capabilities.sectionTypes.join(
            ", "
          )}`
        );
      } else {
        console.log("❌ Registry not initialized");
      }
    },

    cleanup: () => {
      if (window.SimpleButtonRegistry) {
        window.SimpleButtonRegistry.cleanup();
        console.log("🧹 All test buttons cleaned up");
      }
    },

    enableDebugMode: () => {
      if (window.SimpleButtonRegistry) {
        window.SimpleButtonRegistry.debugMode = true;
        console.log(
          "🐛 Debug mode enabled - detailed logs during button operations"
        );
      }
    },

    disableDebugMode: () => {
      if (window.SimpleButtonRegistry) {
        window.SimpleButtonRegistry.debugMode = false;
        console.log("✅ Debug mode disabled");
      }
    },
  };

  console.log(`✅ ${EXTENSION_NAME} v${EXTENSION_VERSION} loaded!`);
  console.log(
    "🔧 FIXED: Robust daily note detection using page title instead of URL"
  );
  console.log(
    "🎯 Supports: Weekly pages, Monthly pages, and improved daily note detection"
  );
  console.log("🧪 Test commands:");
  console.log(
    "  • window.SimpleButtonUtilityTests.testSimpleButton() - Test v2.1 compatibility"
  );
  console.log(
    "  • window.SimpleButtonUtilityTests.testCompoundButton() - Test new compound buttons"
  );
  console.log(
    "  • window.SimpleButtonUtilityTests.testDailyNoteDetection() - Test FIXED daily note detection"
  );
  console.log(
    "  • window.SimpleButtonUtilityTests.testMonthlyPageConditions() - Test monthly page detection"
  );
  console.log(
    "  • window.SimpleButtonUtilityTests.testWeeklyPageConditions() - Test weekly page detection"
  );
  console.log(
    "  • window.SimpleButtonUtilityTests.testMixedButtons() - Test both types together"
  );
  console.log(
    "  • window.SimpleButtonUtilityTests.showStatus() - Show system capabilities"
  );
})();
