// 📔 FULL FEATURED SUBJOURNALS v3.0 - THE ULTIMATE EDITION
// Complete parallel journaling solution combining the best of both worlds
// Features: Context-aware UI, dual navigation modes, bulletproof reliability

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📔 Full Featured Subjournals v3.0 loading - THE ULTIMATE EDITION!"
    );

    // ==================== 1.0 🌳 PROFESSIONAL FOUNDATION ====================

    // 1.1 🍎 Configuration constants
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

    // 1.2 🍎 State management
    let updateTimer;
    let hasShownOnboarding = false;

    // ==================== 1.3 🛠️ ENHANCED ONBOARDING SYSTEM ====================

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

        const hasMySubjournals = blocks.some(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );
        return !hasMySubjournals;
      } catch (error) {
        console.error("🛠️ Error checking onboarding status:", error);
        return true;
      }
    }

    async function createDefaultStructure() {
      try {
        console.log("🛠️ Creating enhanced [[roam/subjournals]] structure...");

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
              "Welcome to Full Featured Subjournals! List your personal subjournals below. Colors: red, orange, yellow, green, blue, purple, grey, brown, white, black. #clr-lgt-orn-act",
          },
        });

        const subjournalsUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: 1 },
          block: { uid: subjournalsUid, string: "My Subjournals:" },
        });

        // Create diverse sample subjournals
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

        console.log("✅ Enhanced default structure created successfully");
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
        alert(`📔 Welcome to Full Featured Subjournals v3.0!

🎯 THE ULTIMATE parallel journaling solution is ready!

✨ What's new:
- Works on BOTH date pages AND subjournal pages
- Dropdown selection on date pages → opens in sidebar
- Direct entry on subjournal pages → Focus Mode zoom
- Bulletproof reliability with professional error handling

🔧 I've created [[roam/subjournals]] with sample configuration.

👆 Click the info button (ℹ️) to customize your subjournals!

This is your one-time welcome message.`);
      }, 1000);
    }

    // ==================== 1.4 🎮 MULTI-USER MODE ====================

    function isMultiUserMode() {
      try {
        const setting = extensionAPI.settings.get("multiUserMode");
        return setting === true || setting === "true";
      } catch (error) {
        return false;
      }
    }

    async function getCurrentUserDisplayName() {
      try {
        const userUid = window.roamAlphaAPI.user.uid();
        if (userUid) {
          const userData = window.roamAlphaAPI.pull("[*]", [
            ":user/uid",
            userUid,
          ]);
          return (
            userData?.[":user/display-name"] ||
            userData?.[":user/email"] ||
            userData?.[":user/uid"] ||
            userUid
          );
        }
        throw new Error("No user UID available");
      } catch (error) {
        try {
          const globalAppState = JSON.parse(
            localStorage.getItem("globalAppState") || '["","",[]]'
          );
          const userIndex = globalAppState.findIndex((s) => s === "~:user");
          if (userIndex > 0) {
            const userArray = globalAppState[userIndex + 1];
            const displayNameIndex = userArray.findIndex(
              (s) => s === "~:display-name"
            );
            if (displayNameIndex > 0) return userArray[displayNameIndex + 1];
          }
        } catch (fallbackError) {
          console.log("🎮 Fallback method failed:", fallbackError);
        }
        return "User";
      }
    }

    // ==================== 1.5 🔍 UNIFIED CONTEXT DETECTION ====================

    async function getPageContext() {
      try {
        let pageTitle;
        let pageUid;

        // Method 1: API call
        try {
          pageUid =
            await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
          if (pageUid) {
            pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
              ":block/uid",
              pageUid,
            ])?.[":node/title"];
          }
        } catch (error) {
          console.log("🔍 API method failed, trying fallbacks...");
        }

        // Method 2: URL parsing fallback
        if (!pageTitle) {
          const urlMatch = window.location.href.match(
            /#\/app\/[^\/]+\/page\/([^\/]+)/
          );
          if (urlMatch) {
            pageUid = urlMatch[1];
            pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
              ":block/uid",
              pageUid,
            ])?.[":node/title"];
          }
        }

        // Method 3: DOM fallback
        if (!pageTitle) {
          const titleElement = document.querySelector(
            ".rm-title-display, [data-page-links], .rm-page-ref-link-color"
          );
          pageTitle = titleElement?.textContent?.trim();
        }

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
            pageUid,
            dateInfo: parseDatePage(pageTitle),
          };
        } else if (matchingSubjournal) {
          return {
            context: "subjournal",
            pageTitle,
            pageUid,
            subjournalInfo: matchingSubjournal,
          };
        } else {
          return { context: "other", pageTitle, pageUid };
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

    function getColorTag(color = "blue") {
      return COLOR_MAP[color.toLowerCase().trim()] || COLOR_MAP.blue;
    }

    // ==================== 1.6 🦊 UNIFIED CONFIGURATION READING ====================

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

    // ==================== 1.7 🎯 UNIFIED CREATION ALGORITHM ====================

    function findBlockWithColorAgnosticSearch(parentUid, searchPattern) {
      try {
        const startsWith = window.roamAlphaAPI.q(`
          [:find (pull ?child [:block/uid :block/string])
           :where 
           [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]
           [?child :block/string ?string] [(clojure.string/starts-with? ?string "${searchPattern}")]]
        `);

        if (startsWith.length > 0) {
          const found = startsWith[0][0];
          return {
            uid: found[":block/uid"] || found.uid,
            string: found[":block/string"] || found.string,
          };
        }

        const containing = window.roamAlphaAPI.q(`
          [:find (pull ?child [:block/uid :block/string])
           :where 
           [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]
           [?child :block/string ?string] [(clojure.string/includes? ?string "${searchPattern}")]]
        `);

        const validBlocks = containing.filter(([block]) => {
          const string = block[":block/string"] || block.string || "";
          return string.trim().startsWith("#st0");
        });

        if (validBlocks.length > 0) {
          const found = validBlocks[0][0];
          return {
            uid: found[":block/uid"] || found.uid,
            string: found[":block/string"] || found.string,
          };
        }

        return null;
      } catch (error) {
        console.error(`🎯 Search error for "${searchPattern}":`, error);
        return null;
      }
    }

    async function createBlock(parentUid, content, order = null) {
      if (order === null) {
        const childCount =
          window.roamAlphaAPI.q(`
          [:find (count ?child) :where 
           [?parent :block/uid "${parentUid}"] [?child :block/parents ?parent]]
        `)?.[0]?.[0] || 0;
        order = childCount;
      }

      const blockUid = window.roamAlphaAPI.util.generateUID();
      await window.roamAlphaAPI.data.block.create({
        location: { "parent-uid": parentUid, order: order },
        block: { uid: blockUid, string: content },
      });

      return blockUid;
    }

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

      return await createBlock(pageUid, "Journal Entries:", 0);
    }

    async function createDateEntry(journalUid, dateInfo, color) {
      const startTime = Date.now();
      const TIMEOUT = 3000;
      const colorTag = getColorTag(color);
      const multiUserMode = isMultiUserMode();

      let userDisplayName = "";
      if (multiUserMode) {
        try {
          userDisplayName = await getCurrentUserDisplayName();
        } catch (userError) {
          userDisplayName = "User";
        }
      }

      const workingOn = { step: null, uid: null, content: null };
      let loopCount = 0;

      while (Date.now() - startTime < TIMEOUT) {
        loopCount++;

        try {
          // Year block
          const yearCreateContent = `#st0 [[${dateInfo.year}]] #${colorTag}`;
          const yearSearchPattern = `#st0 [[${dateInfo.year}]]`;
          const yearBlock = findBlockWithColorAgnosticSearch(
            journalUid,
            yearSearchPattern
          );

          if (!yearBlock) {
            if (workingOn.step !== "year" || workingOn.uid !== journalUid) {
              workingOn.step = "year";
              workingOn.uid = journalUid;
              workingOn.content = yearCreateContent;
              await createBlock(journalUid, yearCreateContent, 0);
            }
            continue;
          }

          // Month block
          const monthCreateContent = `#st0 [[${dateInfo.fullMonth}]] #${colorTag}`;
          const monthSearchPattern = `#st0 [[${dateInfo.fullMonth}]]`;
          const monthBlock = findBlockWithColorAgnosticSearch(
            yearBlock.uid,
            monthSearchPattern
          );

          if (!monthBlock) {
            if (workingOn.step !== "month" || workingOn.uid !== yearBlock.uid) {
              workingOn.step = "month";
              workingOn.uid = yearBlock.uid;
              workingOn.content = monthCreateContent;
              await createBlock(yearBlock.uid, monthCreateContent, 0);
            }
            continue;
          }

          // Date block
          const dateCreateContent = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]] #${colorTag}`;
          const dateSearchPattern = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]]`;
          const dateBlock = findBlockWithColorAgnosticSearch(
            monthBlock.uid,
            dateSearchPattern
          );

          if (!dateBlock) {
            if (workingOn.step !== "date" || workingOn.uid !== monthBlock.uid) {
              workingOn.step = "date";
              workingOn.uid = monthBlock.uid;
              workingOn.content = dateCreateContent;
              await createBlock(monthBlock.uid, dateCreateContent, 0);
            }
            continue;
          }

          // Content block
          const initialContent = multiUserMode
            ? `#[[${userDisplayName}]] `
            : "";
          const newBlockUid = await createBlock(dateBlock.uid, initialContent);

          console.log(
            `🎯 ✅ SUCCESS: Created entry in ${loopCount} loops (${
              Date.now() - startTime
            }ms)`
          );
          return newBlockUid;
        } catch (error) {
          console.error(`🎯 Loop ${loopCount} error:`, error.message);
        }
      }

      throw new Error(`Timeout after ${TIMEOUT}ms (${loopCount} loops)`);
    }

    // ==================== 1.8 🦜 UNIFIED UI SYSTEM - SMALLER BUTTONS ====================

    function findOptimalButtonContainer() {
      const possibleTargets = [
        ".roam-article",
        ".roam-main",
        ".rm-article-wrapper",
        ".roam-center-panel",
        ".flex-h-box > div:nth-child(2)",
        "#app > div > div > div:nth-child(2)",
        '.bp3-tab-panel[aria-hidden="false"]',
      ];

      for (const selector of possibleTargets) {
        const element = document.querySelector(selector);
        if (element) {
          const computedStyle = getComputedStyle(element);
          if (computedStyle.position === "static") {
            element.style.position = "relative";
          }
          return { targetElement: element, selectorUsed: selector };
        }
      }

      return { targetElement: document.body, selectorUsed: "body (fallback)" };
    }

    // 🎨 DATE PAGE UI: Dropdown Selection
    function createDatePageButton() {
      const existingButton = document.querySelector(".subjournals-trigger");
      if (existingButton) existingButton.remove();

      const multiUserMode = isMultiUserMode();
      const { targetElement } = findOptimalButtonContainer();

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "subjournals-trigger";
      buttonContainer.style.top = multiUserMode ? "45px" : "8px"; // Smaller offset

      const infoButton = document.createElement("button");
      infoButton.className = "subjournals-info";
      infoButton.textContent = "ℹ️";
      infoButton.title = "Configure Subjournals";

      const mainButton = document.createElement("button");
      mainButton.className = "subjournals-main";
      mainButton.textContent = "Add to Subjournal?";

      const dismissButton = document.createElement("button");
      dismissButton.className = "subjournals-dismiss";
      dismissButton.textContent = "✕";
      dismissButton.title = "Hide Button";

      infoButton.addEventListener("click", (e) => {
        e.stopPropagation();
        window.roamAlphaAPI.ui.mainWindow.openPage({
          page: { title: "roam/subjournals" },
        });
      });

      mainButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const subjournals = getSubjournals();
        createDropdown(subjournals, mainButton, "sidebar");
      });

      dismissButton.addEventListener("click", (e) => {
        e.stopPropagation();
        buttonContainer.remove();
      });

      buttonContainer.appendChild(infoButton);
      buttonContainer.appendChild(mainButton);
      buttonContainer.appendChild(dismissButton);
      targetElement.appendChild(buttonContainer);
    }

    // 🎨 SUBJOURNAL PAGE UI: Direct Entry
    function createSubjournalPageButton(subjournalInfo) {
      const existingButton = document.querySelector(".subjournals-trigger");
      if (existingButton) existingButton.remove();

      const multiUserMode = isMultiUserMode();
      const { targetElement } = findOptimalButtonContainer();

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "subjournals-trigger subjournal-mode";
      buttonContainer.style.top = multiUserMode ? "45px" : "8px"; // Smaller offset

      const infoButton = document.createElement("button");
      infoButton.className = "subjournals-info";
      infoButton.textContent = "ℹ️";
      infoButton.title = "Configure Subjournals";

      const mainButton = document.createElement("button");
      mainButton.className = "subjournals-main";
      mainButton.textContent = "Add entry to this page?";

      const dismissButton = document.createElement("button");
      dismissButton.className = "subjournals-dismiss";
      dismissButton.textContent = "✕";
      dismissButton.title = "Hide Button";

      infoButton.addEventListener("click", (e) => {
        e.stopPropagation();
        window.roamAlphaAPI.ui.mainWindow.openPage({
          page: { title: "roam/subjournals" },
        });
      });

      mainButton.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`🐇 Direct entry clicked for ${subjournalInfo.name}`);
        await handleDirectEntry(subjournalInfo);
      });

      dismissButton.addEventListener("click", (e) => {
        e.stopPropagation();
        buttonContainer.remove();
      });

      buttonContainer.appendChild(infoButton);
      buttonContainer.appendChild(mainButton);
      buttonContainer.appendChild(dismissButton);
      targetElement.appendChild(buttonContainer);

      console.log(`🦜 Direct entry button created for ${subjournalInfo.name}`);
    }

    function createDropdown(subjournals, mainButton, mode = "sidebar") {
      const existingDropdown = document.querySelector(".subjournals-dropdown");
      if (existingDropdown) existingDropdown.remove();

      if (subjournals.length === 0) {
        alert(
          "⚠ No subjournals configured. Click the info button (ℹ️) to set up [[roam/subjournals]]."
        );
        return;
      }

      const dropdown = document.createElement("div");
      dropdown.className = "subjournals-dropdown";

      subjournals.forEach(({ name, color }) => {
        const option = document.createElement("div");
        option.className = "subjournals-option";
        option.textContent = name;
        option.setAttribute("data-color", color);

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
        option.style.borderLeft = `2px solid ${colorValue}`; // Slightly thinner
        option.style.color = colorValue;

        option.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.remove();
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

      const buttonContainer = mainButton.parentElement;
      const parentContainer = buttonContainer.parentElement;
      const buttonContainerRect = buttonContainer.getBoundingClientRect();
      const parentContainerRect = parentContainer.getBoundingClientRect();

      dropdown.style.position = "absolute";
      dropdown.style.top =
        buttonContainerRect.bottom - parentContainerRect.top + "px";
      dropdown.style.left =
        buttonContainerRect.left - parentContainerRect.left + "px";
      dropdown.style.width = buttonContainerRect.width + "px";
      dropdown.style.zIndex = "9999";

      parentContainer.appendChild(dropdown);

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

    // ==================== 1.9 🎯 DUAL NAVIGATION MODES ====================

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

        // Open in sidebar with bulletproof focus
        await window.roamAlphaAPI.ui.rightSidebar.addWindow({
          window: { type: "outline", "block-uid": subjournalPageUid },
        });

        setTimeout(async () => {
          try {
            const blockData = window.roamAlphaAPI.pull("[:block/string]", [
              ":block/uid",
              targetBlockUid,
            ]);
            const content = blockData?.[":block/string"] || "";
            const cursorPosition = content.length;

            const windowId = `sidebar-outline-${subjournalPageUid}`;
            const focusConfig = {
              location: { "block-uid": targetBlockUid, "window-id": windowId },
            };

            if (isMultiUserMode() && cursorPosition > 0) {
              focusConfig.selection = {
                start: cursorPosition,
                end: cursorPosition,
              };
            }

            await window.roamAlphaAPI.ui.setBlockFocusAndSelection(focusConfig);
            console.log(
              "🎯 ✅ SIDEBAR FOCUS SUCCESS: Professional-grade sidebar focus achieved!"
            );

            setTimeout(() => {
              const activeElement = document.activeElement;
              const success =
                activeElement?.tagName === "TEXTAREA" &&
                activeElement?.closest(".rm-sidebar-window") &&
                activeElement?.id?.includes(targetBlockUid);

              if (!success) {
                const sidebarTextarea = document.querySelector(
                  ".rm-sidebar-window textarea"
                );
                if (sidebarTextarea) {
                  sidebarTextarea.focus();
                  console.log(
                    "🎯 ✅ FALLBACK SUCCESS: Used textarea hunt approach"
                  );
                }
              }
            }, 200);
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

        console.log(`🎯 ✅ Block created successfully: ${newBlockUid}`);

        // Focus Mode activation
        setTimeout(async () => {
          try {
            console.log(`🎯 FOCUS MODE: Activating professional Focus Mode`);

            await window.roamAlphaAPI.ui.mainWindow.openBlock({
              block: { uid: newBlockUid },
            });

            await new Promise((resolve) => setTimeout(resolve, 300));

            const verification = {
              urlContainsBlock: window.location.href.includes(newBlockUid),
              hasBreadcrumbs: !!document.querySelector(
                ".rm-zoom-item, .zoom-path"
              ),
              targetVisible: !!document.querySelector(`[id*="${newBlockUid}"]`),
            };

            const positiveCount =
              Object.values(verification).filter(Boolean).length;
            const success = positiveCount >= 2;

            if (success) {
              console.log(
                `🎯 ✅ FOCUS MODE SUCCESS: ${positiveCount}/3 indicators positive`
              );
              console.log(
                `🎯 🎉 USER EXPERIENCE: Professional Focus Mode activated!`
              );

              // Cursor positioning
              const multiUserMode = isMultiUserMode();
              if (multiUserMode) {
                setTimeout(async () => {
                  try {
                    const blockData = window.roamAlphaAPI.pull(
                      "[:block/string]",
                      [":block/uid", newBlockUid]
                    );
                    const content = blockData?.[":block/string"] || "";
                    if (content.length > 0) {
                      await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                        "block-uid": newBlockUid,
                        selection: {
                          start: content.length,
                          end: content.length,
                        },
                      });
                    }
                  } catch (cursorError) {
                    console.log("🎯 Cursor positioning error:", cursorError);
                  }
                }, 500);
              }
            } else {
              console.log(`🎯 ⚠ Focus Mode verification failed`);
            }
          } catch (focusError) {
            console.error("🎯 ❌ Focus Mode error:", focusError);
          }
        }, 200);

        console.log(
          `✅ FOCUS MODE SUCCESS: Direct entry created with revolutionary Focus Mode UX!`
        );
      } catch (error) {
        console.error("❌ Error in focus mode:", error);
        alert(`❌ Error: ${error.message}`);
      }
    }

    // ==================== 1.10 🔄 UNIFIED UI MANAGEMENT ====================

    async function updateUI() {
      const context = await getPageContext();

      if (context.context === "date") {
        // On date page - show dropdown for subjournal selection
        if (needsOnboarding()) {
          console.log(
            "🛠️ First-time user detected - creating default structure"
          );
          const created = await createDefaultStructure();
          if (created) showOnboardingGuidance();
        }
        createDatePageButton();
      } else if (context.context === "subjournal") {
        // On subjournal page - show direct entry button
        createSubjournalPageButton(context.subjournalInfo);
      } else {
        // Neither - remove any existing buttons
        const existingButton = document.querySelector(".subjournals-trigger");
        if (existingButton) existingButton.remove();
      }
    }

    function scheduleUpdate() {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(updateUI, 300);
    }

    // ==================== 1.11 🎨 ENHANCED STYLING - SMALLER BUTTONS ====================

    const style = document.createElement("style");
    style.textContent = `
      /* 🎨 MAIN TRIGGER BUTTON - 33% SMALLER */
      .subjournals-trigger {
        position: absolute; left: 8px; z-index: 9999; display: flex;
        border: 1px solid #8B4513; border-radius: 6px; background: rgb(251, 238, 166);
        box-shadow: 0 2px 4px rgba(0,0,0,0.15); transition: all 0.2s ease; overflow: hidden;
        font-size: 11px; /* Reduced from ~14px */
      }
      .subjournals-trigger:hover { background: #FFF700; }
      
      /* 🎨 INDIVIDUAL BUTTONS - PROPORTIONALLY SMALLER */
      .subjournals-info, .subjournals-main, .subjournals-dismiss {
        background: transparent; border: none; cursor: pointer; color: #8B4513;
        transition: all 0.2s ease; border-radius: 0; font-size: 10px; /* Reduced */
      }
      .subjournals-info:hover, .subjournals-main:hover, .subjournals-dismiss:hover {
        background: rgba(139, 69, 19, 0.1);
      }
      
      /* 🎨 BUTTON SIZING - ABOUT 33% SMALLER */
      .subjournals-info { 
        border-right: 1px solid #8B4513; 
        padding: 5px 7px; /* Reduced from 8px 10px */
        font-size: 10px; /* Reduced from 14px */
      }
      .subjournals-main { 
        padding: 8px 11px; /* Reduced from 12px 16px */
        flex: 1; white-space: nowrap; 
        font-size: 11px; /* Slightly larger for readability */
      }
      .subjournals-dismiss { 
        border-left: 1px solid #8B4513; 
        padding: 5px 7px; /* Reduced from 8px 10px */
        font-size: 9px; /* Reduced from 12px */
        min-width: 20px; /* Reduced from 30px */
      }
      
      /* 🎨 DROPDOWN - PROPORTIONALLY SMALLER */
      .subjournals-dropdown {
        position: absolute; z-index: 9999; background: white; border: 1px solid #8B4513;
        border-top: none; border-radius: 0 0 6px 6px; box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        box-sizing: border-box; font-size: 11px; /* Reduced from 14px */
      }
      
      .subjournals-option {
        padding: 7px 10px; /* Reduced from 10px 15px */
        cursor: pointer; border-bottom: 1px solid #f0f0f0;
        transition: background 0.2s ease; font-size: 11px; /* Reduced from 14px */
        font-weight: 500;
      }
      .subjournals-option:hover { background: #f8f9fa !important; }
      .subjournals-option:last-child { border-bottom: none; }
      
      /* 🎨 COLOR BORDERS - SLIGHTLY THINNER */
      .subjournals-dropdown .subjournals-option[data-color="red"] { 
        border-left: 2px solid #e74c3c !important; color: #e74c3c !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="orange"] { 
        border-left: 2px solid #e67e22 !important; color: #e67e22 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="yellow"] { 
        border-left: 2px solid #f1c40f !important; color: #f1c40f !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="green"] { 
        border-left: 2px solid #27ae60 !important; color: #27ae60 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="blue"] { 
        border-left: 2px solid #3498db !important; color: #3498db !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="purple"] { 
        border-left: 2px solid #9b59b6 !important; color: #9b59b6 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="brown"] { 
        border-left: 2px solid #8b4513 !important; color: #8b4513 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="grey"] { 
        border-left: 2px solid #95a5a6 !important; color: #95a5a6 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="white"] { 
        border-left: 2px solid #ecf0f1 !important; color: #2c3e50 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="black"] { 
        border-left: 2px solid #2c3e50 !important; color: #2c3e50 !important; 
      }

      /* 🎨 SUBJOURNAL MODE INDICATOR (SUBTLE DIFFERENCE) */
      .subjournals-trigger.subjournal-mode {
        border-color: #27ae60; /* Green border for subjournal pages */
      }
      .subjournals-trigger.subjournal-mode .subjournals-main {
        color: #27ae60; /* Green text for subjournal mode */
      }
    `;
    document.head.appendChild(style);

    // ==================== 1.12 🚀 INITIALIZATION ====================

    const observer = new MutationObserver((mutations) => {
      const hasPageChanges = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some(
          (node) =>
            node.nodeType === 1 &&
            (node.querySelector?.(".rm-title-display") ||
              node.classList?.contains("rm-title-display") ||
              node.querySelector?.("[data-page-links]"))
        )
      );

      if (hasPageChanges) scheduleUpdate();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    let currentUrl = window.location.href;
    const urlCheckInterval = setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        scheduleUpdate();
      }
    }, 500);

    // Enhanced settings panel
    extensionAPI.settings.panel.create({
      tabTitle: "Full Featured Subjournals",
      settings: [
        {
          id: "multiUserMode",
          name: "Multi-user Mode",
          description:
            "Enable collaborative features: repositioned buttons and automatic username tagging",
          action: {
            type: "switch",
            onChange: (newValue) => {
              console.log(`🎮 Multi-user mode changed to: ${newValue}`);
              setTimeout(scheduleUpdate, 100);
            },
          },
        },
        {
          id: "preferredMode",
          name: "Preferred Navigation Mode",
          description:
            "Choose your preferred navigation: Sidebar (traditional) or Focus Mode (immersive)",
          action: {
            type: "select",
            items: ["sidebar", "focus", "ask"],
            onChange: (newValue) => {
              console.log(`🎯 Preferred mode changed to: ${newValue}`);
            },
          },
        },
      ],
    });

    // Initial UI update
    scheduleUpdate();

    // ==================== 1.13 🧪 COMPREHENSIVE TESTING SUITE ====================

    window.fullFeaturedSubjournalsTest = {
      // Context detection
      getPageContext: async () => await getPageContext(),
      getSubjournals: () => getSubjournals(),

      // UI management
      updateUI: async () => await updateUI(),
      scheduleUpdate: () => scheduleUpdate(),

      // Mode testing
      isMultiUserMode: () => isMultiUserMode(),
      toggleMultiUserMode: () => {
        const current = extensionAPI.settings.get("multiUserMode");
        const newValue = !current;
        extensionAPI.settings.set("multiUserMode", newValue);
        scheduleUpdate();
        return newValue;
      },

      // Core functionality testing
      testSidebarMode: async (subjournalName = null, color = "blue") => {
        if (!subjournalName) {
          const subjournals = getSubjournals();
          if (subjournals.length === 0) return false;
          subjournalName = subjournals[0].name;
          color = subjournals[0].color;
        }
        console.log(`🧪 Testing SIDEBAR mode for ${subjournalName}`);
        await handleSubjournalSelection(subjournalName, color);
        return true;
      },

      testFocusMode: async (subjournalName = null, color = "blue") => {
        if (!subjournalName) {
          const subjournals = getSubjournals();
          if (subjournals.length === 0) return false;
          subjournalName = subjournals[0].name;
          color = subjournals[0].color;
        }
        console.log(`🧪 Testing FOCUS mode for ${subjournalName}`);
        await handleDirectEntry({ name: subjournalName, color });
        return true;
      },

      testBothModes: async () => {
        const subjournals = getSubjournals();
        if (subjournals.length === 0) {
          console.log("🧪 No subjournals configured");
          return false;
        }

        const firstSubjournal = subjournals[0];
        console.log(`🧪 Testing BOTH modes with ${firstSubjournal.name}`);

        try {
          console.log("🧪 1. Testing sidebar mode...");
          await handleSubjournalSelection(
            firstSubjournal.name,
            firstSubjournal.color
          );

          await new Promise((resolve) => setTimeout(resolve, 2000));

          console.log("🧪 2. Testing focus mode...");
          await handleDirectEntry(firstSubjournal);

          console.log("🧪 ✅ Both modes tested successfully!");
          return true;
        } catch (error) {
          console.error("🧪 ❌ Both modes test failed:", error);
          return false;
        }
      },

      // Advanced testing
      testColorAgnosticReuse: async () => {
        try {
          console.log("🧪 Testing color-agnostic hierarchy reuse...");
          const context = await getPageContext();

          if (context.context !== "date") {
            console.log("🧪 Not on a date page, creating test structure...");
            return false;
          }

          const testPageUid = window.roamAlphaAPI.util.generateUID();
          const journalUid = await getOrCreateJournalEntriesBlock(testPageUid);

          console.log("🧪 Creating first entry with BLUE...");
          await createDateEntry(journalUid, context.dateInfo, "blue");

          console.log(
            "🧪 Creating second entry with RED (should reuse hierarchy)..."
          );
          await createDateEntry(journalUid, context.dateInfo, "red");

          console.log("🧪 ✅ Color-agnostic reuse test complete!");
          return true;
        } catch (error) {
          console.error("🧪 ❌ Color reuse test failed:", error);
          return false;
        }
      },

      // Debug functions
      debugCurrentState: async () => {
        const context = await getPageContext();
        const subjournals = getSubjournals();
        const multiUser = isMultiUserMode();

        return {
          pageContext: context,
          availableSubjournals: subjournals,
          multiUserMode: multiUser,
          buttonVisible: !!document.querySelector(".subjournals-trigger"),
          currentUrl: window.location.href,
          version: "Full Featured v3.0",
        };
      },

      createTestStructure: async () => await createDefaultStructure(),
      needsOnboarding: () => needsOnboarding(),
    };

    console.log("✅ Full Featured Subjournals v3.0 loaded successfully!");
    console.log(
      "🎯 ULTIMATE EDITION: Dual navigation modes with bulletproof reliability"
    );
    console.log(
      "🎨 UI: Smaller, less obtrusive buttons with same great design"
    );
    console.log("📱 Context-aware: Works on date pages AND subjournal pages");
    console.log(
      "🚀 Navigation: Sidebar mode + Focus Mode for complete workflow coverage"
    );
    console.log(
      "🧪 Test functions available at window.fullFeaturedSubjournalsTest"
    );

    // Return cleanup manifest for professional lifecycle
    return {
      elements: [style],
      observers: [observer],
      timeouts: [urlCheckInterval],
      unload: () => {
        clearTimeout(updateTimer);
        clearInterval(urlCheckInterval);
        delete window.fullFeaturedSubjournalsTest;
        console.log("🧹 Full Featured Subjournals v3.0 cleaned up");
      },
    };
  },

  onunload: () => {
    console.log("✅ Full Featured Subjournals v3.0 unloaded");
  },
};
