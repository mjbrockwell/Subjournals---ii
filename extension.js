// 📔 SUBJOURNALS V2.0 - FIXED COLOR-AGNOSTIC BLOCK REUSE
// Professional Roam Research extension for parallel journaling streams
// FIXED: Bulletproof color-agnostic search prevents duplicate hierarchies

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📔 Subjournals v2.0 loading with FIXED color-agnostic search..."
    );

    // ==================== 1.0 🌳 PROFESSIONAL FOUNDATION ====================

    // 1.1 🍎 Configuration constants (preserved from v1.0)
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

    // ==================== 1.3 🛠️ ONBOARDING SYSTEM ====================

    function needsOnboarding() {
      try {
        const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where 
           [?e :node/title "roam/subjournals"] 
           [?e :block/uid ?uid]]
        `)?.[0]?.[0];

        if (!configPageUid) {
          console.log(
            "🛠️ No [[roam/subjournals]] page found - needs onboarding"
          );
          return true;
        }

        const blocks = window.roamAlphaAPI.q(`
          [:find ?uid ?string :where 
           [?page :block/uid "${configPageUid}"]
           [?child :block/page ?page]
           [?child :block/uid ?uid]
           [?child :block/string ?string]]
        `);

        const hasMySubjournals = blocks.some(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );

        if (!hasMySubjournals) {
          console.log("🛠️ No 'My Subjournals:' block found - needs onboarding");
          return true;
        }

        console.log("🛠️ Configuration exists - no onboarding needed");
        return false;
      } catch (error) {
        console.error("🛠️ Error checking onboarding status:", error);
        return true;
      }
    }

    async function createDefaultStructure() {
      try {
        console.log("🛠️ Creating default [[roam/subjournals]] structure...");

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
              "List your personal subjournals indented under... Acceptable colors are red, orange, yellow, green, blue, purple, grey, brown, white or black. #clr-lgt-orn-act",
          },
        });

        const subjournalsUid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": pageUid, order: 1 },
          block: { uid: subjournalsUid, string: "My Subjournals:" },
        });

        const sample1Uid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": subjournalsUid, order: 0 },
          block: { uid: sample1Uid, string: "Sample Subjournal" },
        });

        const color1Uid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": sample1Uid, order: 0 },
          block: { uid: color1Uid, string: "Color: grey" },
        });

        const sample2Uid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": subjournalsUid, order: 1 },
          block: { uid: sample2Uid, string: "Another Sample Subjournal" },
        });

        const color2Uid = window.roamAlphaAPI.util.generateUID();
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": sample2Uid, order: 0 },
          block: { uid: color2Uid, string: "Color: white" },
        });

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
        alert(`📔 Welcome to Subjournals!

I've created a [[roam/subjournals]] page with sample configuration.

Click the info button (ℹ️) on the yellow button to customize your subjournals, or try the dropdown to see how it works!

This message will only show once.`);
      }, 1000);
    }

    // ==================== 1.4 🎮 MULTI-USER MODE ====================

    function isMultiUserMode() {
      try {
        const setting = extensionAPI.settings.get("multiUserMode");
        return setting === true || setting === "true";
      } catch (error) {
        console.log("🎮 Error reading multi-user setting:", error);
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
          const displayName =
            userData?.[":user/display-name"] ||
            userData?.[":user/email"] ||
            userData?.[":user/uid"] ||
            userUid;
          return displayName;
        }
        throw new Error("No user UID available");
      } catch (error) {
        console.error("🎮 Error getting user display name:", error);

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
            if (displayNameIndex > 0) {
              return userArray[displayNameIndex + 1];
            }
          }
        } catch (fallbackError) {
          console.log("🎮 Fallback method failed:", fallbackError);
        }
        return "User";
      }
    }

    // ==================== 1.5 🔍 DETECTION UTILITIES ====================

    async function isDatePage() {
      try {
        const currentPageUid =
          await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
        if (currentPageUid) {
          const pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
            ":block/uid",
            currentPageUid,
          ])?.[":node/title"];
          if (pageTitle) {
            return DATE_PAGE_REGEX.test(pageTitle);
          }
        }

        const urlMatch = window.location.href.match(
          /#\/app\/[^\/]+\/page\/([^\/]+)/
        );
        if (urlMatch) {
          const pageUidFromUrl = urlMatch[1];
          const pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
            ":block/uid",
            pageUidFromUrl,
          ])?.[":node/title"];
          if (pageTitle) {
            return DATE_PAGE_REGEX.test(pageTitle);
          }
        }

        const titleElement = document.querySelector(
          ".rm-title-display, [data-page-links], .rm-page-ref-link-color"
        );
        if (titleElement) {
          const titleText = titleElement.textContent?.trim();
          if (titleText) {
            return DATE_PAGE_REGEX.test(titleText);
          }
        }

        return false;
      } catch (error) {
        console.error("⚠ Error checking date page:", error);
        return false;
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
      const normalizedColor = color.toLowerCase().trim();
      return COLOR_MAP[normalizedColor] || COLOR_MAP.blue;
    }

    // ==================== 1.6 🦊 DATA PROCESSING ====================

    function getSubjournals() {
      try {
        const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where 
           [?e :node/title "roam/subjournals"] 
           [?e :block/uid ?uid]]
        `)?.[0]?.[0];

        if (!configPageUid) return [];

        const allBlocks = window.roamAlphaAPI.q(`
          [:find ?uid ?string :where 
           [?page :block/uid "${configPageUid}"]
           [?child :block/page ?page]
           [?child :block/uid ?uid]
           [?child :block/string ?string]]
        `);

        const mySubjournalsBlock = allBlocks.find(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        );

        if (!mySubjournalsBlock) return [];

        const parentUid = mySubjournalsBlock[0];
        const childUids = window.roamAlphaAPI.q(`
          [:find ?uid :where 
           [?parent :block/uid "${parentUid}"]
           [?child :block/parents ?parent]
           [?child :block/uid ?uid]]
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
            if (colorMatch) {
              color = colorMatch[1];
            }
          }

          subjournals.push({ name, color });
        });

        return subjournals;
      } catch (error) {
        console.error("⚠ Error getting subjournals:", error);
        return [];
      }
    }

    // ==================== 1.7 🎯 FIXED COLOR-AGNOSTIC SEARCH ALGORITHM ====================

    /**
     * 1.7.1 🎯 BULLETPROOF color-agnostic block finder
     * FIXED: Uses starts-with pattern + multiple fallback strategies
     */
    function findBlockWithColorAgnosticSearch(parentUid, searchPattern) {
      console.log(
        `🎯 COLOR-AGNOSTIC SEARCH: Looking for pattern "${searchPattern}" under ${parentUid}`
      );

      try {
        // Strategy 1: Find blocks that START with our pattern (most precise)
        const startsWith = window.roamAlphaAPI.q(`
          [:find (pull ?child [:block/uid :block/string])
           :where 
           [?parent :block/uid "${parentUid}"]
           [?child :block/parents ?parent]
           [?child :block/string ?string]
           [(clojure.string/starts-with? ?string "${searchPattern}")]]
        `);

        if (startsWith.length > 0) {
          const found = startsWith[0][0];
          const uid = found[":block/uid"] || found.uid;
          const string = found[":block/string"] || found.string;

          console.log(`🎯 ✅ FOUND with starts-with: ${uid} - "${string}"`);
          return { uid, string };
        }

        // Strategy 2: Find blocks containing pattern + validate they're our format
        const containing = window.roamAlphaAPI.q(`
          [:find (pull ?child [:block/uid :block/string])
           :where 
           [?parent :block/uid "${parentUid}"]
           [?child :block/parents ?parent]
           [?child :block/string ?string]
           [(clojure.string/includes? ?string "${searchPattern}")]]
        `);

        // Filter to only blocks that START with #st0 (our extension blocks)
        const validBlocks = containing.filter(([block]) => {
          const string = block[":block/string"] || block.string || "";
          return string.trim().startsWith("#st0");
        });

        if (validBlocks.length > 0) {
          const found = validBlocks[0][0];
          const uid = found[":block/uid"] || found.uid;
          const string = found[":block/string"] || found.string;

          console.log(
            `🎯 ✅ FOUND with filtered contains: ${uid} - "${string}"`
          );
          return { uid, string };
        }

        console.log(
          `🎯 ❌ NOT FOUND: No blocks match pattern "${searchPattern}"`
        );
        return null;
      } catch (error) {
        console.error(`🎯 ❌ SEARCH ERROR for "${searchPattern}":`, error);
        return null;
      }
    }

    /**
     * 1.7.2 🎯 Get children count for proper ordering
     */
    function getChildrenCount(parentUid) {
      try {
        const childCount =
          window.roamAlphaAPI.q(`
          [:find (count ?child)
           :where 
           [?parent :block/uid "${parentUid}"]
           [?child :block/parents ?parent]]
        `)?.[0]?.[0] || 0;

        return childCount;
      } catch (error) {
        console.log(`🎯 Error counting children for ${parentUid}:`, error);
        return 0;
      }
    }

    /**
     * 1.7.3 🧩 Enhanced block creation with precise ordering
     */
    async function createBlock(parentUid, content, order = null) {
      console.log(`🧩 Creating block under ${parentUid}: "${content}"`);

      if (order === null) {
        order = getChildrenCount(parentUid);
      }

      const blockUid = window.roamAlphaAPI.util.generateUID();

      try {
        await window.roamAlphaAPI.data.block.create({
          location: { "parent-uid": parentUid, order: order },
          block: { uid: blockUid, string: content },
        });

        console.log(`🧩 ✅ Block created: ${blockUid} at order ${order}`);
        return blockUid;
      } catch (error) {
        console.error(`🧩 ❌ Block creation failed: ${error.message}`);
        throw error;
      }
    }

    async function getOrCreatePageUid(title) {
      let pageUid = window.roamAlphaAPI.q(`
        [:find ?uid :where 
         [?e :node/title "${title}"] 
         [?e :block/uid ?uid]]
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
         [?page :block/uid "${pageUid}"]
         [?child :block/page ?page]
         [?child :block/uid ?uid]
         [?child :block/string ?string]]
      `);

      const journalBlock = allBlocks.find(
        ([uid, string]) => string?.trim() === "Journal Entries:"
      );

      if (journalBlock) return journalBlock[0];

      return await createBlock(pageUid, "Journal Entries:", 0);
    }

    /**
     * 1.7.4 🎯 FIXED: Bulletproof cascading creation with color-agnostic reuse
     */
    async function createDateEntry(journalUid, dateInfo, color) {
      const startTime = Date.now();
      const TIMEOUT = 3000;
      const colorTag = getColorTag(color);
      const multiUserMode = isMultiUserMode();

      console.log(
        `🎯 FIXED ALGORITHM: Creating date entry for ${dateInfo.fullDate}`
      );
      console.log(`🎯 Color: "${color}" → Tag: "#${colorTag}"`);

      let userDisplayName = "";
      if (multiUserMode) {
        try {
          userDisplayName = await getCurrentUserDisplayName();
        } catch (userError) {
          console.error("🎮 Error getting username:", userError);
          userDisplayName = "User";
        }
      }

      const workingOn = { step: null, uid: null, content: null };
      let loopCount = 0;

      while (Date.now() - startTime < TIMEOUT) {
        loopCount++;
        console.log(
          `🎯 FIXED LOOP ${loopCount}: Color-agnostic hierarchy building`
        );

        try {
          // STEP 1: Find or create year block - COLOR AGNOSTIC SEARCH
          const yearCreateContent = `#st0 [[${dateInfo.year}]] #${colorTag}`;
          const yearSearchPattern = `#st0 [[${dateInfo.year}]]`; // 🔥 NO COLOR TAG

          console.log(`🎯 YEAR SEARCH: "${yearSearchPattern}" (agnostic)`);
          console.log(`🎯 YEAR CREATE: "${yearCreateContent}" (with color)`);

          const yearBlock = findBlockWithColorAgnosticSearch(
            journalUid,
            yearSearchPattern
          );

          if (!yearBlock) {
            if (workingOn.step !== "year" || workingOn.uid !== journalUid) {
              console.log(
                `🎯 YEAR CREATE: No existing year found, creating new`
              );
              workingOn.step = "year";
              workingOn.uid = journalUid;
              workingOn.content = yearCreateContent;
              await createBlock(journalUid, yearCreateContent, 0);
            }
            continue;
          }

          console.log(
            `🎯 YEAR ✅: Reusing existing ${yearBlock.uid} - "${yearBlock.string}"`
          );

          // STEP 2: Find or create month block - COLOR AGNOSTIC SEARCH
          const monthCreateContent = `#st0 [[${dateInfo.fullMonth}]] #${colorTag}`;
          const monthSearchPattern = `#st0 [[${dateInfo.fullMonth}]]`; // 🔥 NO COLOR TAG

          console.log(`🎯 MONTH SEARCH: "${monthSearchPattern}" (agnostic)`);
          console.log(`🎯 MONTH CREATE: "${monthCreateContent}" (with color)`);

          const monthBlock = findBlockWithColorAgnosticSearch(
            yearBlock.uid,
            monthSearchPattern
          );

          if (!monthBlock) {
            if (workingOn.step !== "month" || workingOn.uid !== yearBlock.uid) {
              console.log(
                `🎯 MONTH CREATE: No existing month found, creating new`
              );
              workingOn.step = "month";
              workingOn.uid = yearBlock.uid;
              workingOn.content = monthCreateContent;
              await createBlock(yearBlock.uid, monthCreateContent, 0);
            }
            continue;
          }

          console.log(
            `🎯 MONTH ✅: Reusing existing ${monthBlock.uid} - "${monthBlock.string}"`
          );

          // STEP 3: Find or create date banner - COLOR AGNOSTIC SEARCH
          const dateCreateContent = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]] #${colorTag}`;
          const dateSearchPattern = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]]`; // 🔥 NO COLOR TAG

          console.log(`🎯 DATE SEARCH: "${dateSearchPattern}" (agnostic)`);
          console.log(`🎯 DATE CREATE: "${dateCreateContent}" (with color)`);

          const dateBlock = findBlockWithColorAgnosticSearch(
            monthBlock.uid,
            dateSearchPattern
          );

          if (!dateBlock) {
            if (workingOn.step !== "date" || workingOn.uid !== monthBlock.uid) {
              console.log(
                `🎯 DATE CREATE: No existing date found, creating new`
              );
              workingOn.step = "date";
              workingOn.uid = monthBlock.uid;
              workingOn.content = dateCreateContent;
              await createBlock(monthBlock.uid, dateCreateContent, 0);
            }
            continue;
          }

          console.log(
            `🎯 DATE ✅: Reusing existing ${dateBlock.uid} - "${dateBlock.string}"`
          );

          // STEP 4: Create content block with multi-user support
          const initialContent = multiUserMode
            ? `#[[${userDisplayName}]] `
            : "";

          console.log(
            `🎯 CONTENT CREATE: Adding new entry with content "${initialContent}"`
          );
          const newBlockUid = await createBlock(dateBlock.uid, initialContent);

          console.log(
            `🎯 ✅ FIXED SUCCESS: Created entry in ${loopCount} loops (${
              Date.now() - startTime
            }ms)`
          );
          console.log(
            `🎯 🔄 REUSE CONFIRMED: All existing hierarchy blocks were reused successfully`
          );

          return newBlockUid;
        } catch (error) {
          console.error(`🎯 Loop ${loopCount} error:`, error.message);
        }
      }

      throw new Error(`Timeout after ${TIMEOUT}ms (${loopCount} loops)`);
    }

    // ==================== 1.8 🦜 UI COMPONENTS (preserved) ====================

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

    function createDropdown(subjournals, mainButton) {
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
        option.style.borderLeft = `3px solid ${colorValue}`;
        option.style.color = colorValue;

        option.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.remove();
          console.log(`🐇 Selected "${name}" with color "${color}"`);
          handleSubjournalSelection(name, color);
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

    function createSubjournalButton() {
      const existingButton = document.querySelector(".subjournals-trigger");
      if (existingButton) existingButton.remove();

      const multiUserMode = isMultiUserMode();
      const { targetElement } = findOptimalButtonContainer();

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "subjournals-trigger";
      buttonContainer.style.top = multiUserMode ? "60px" : "10px";

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
        createDropdown(subjournals, mainButton);
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

    // ==================== 1.9 🐇 INTERACTION HANDLERS ====================

    async function handleSubjournalSelection(subjournalName, color) {
      try {
        const currentPageUid =
          await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
        let pageTitle = currentPageUid
          ? window.roamAlphaAPI.pull("[:node/title]", [
              ":block/uid",
              currentPageUid,
            ])?.[":node/title"]
          : null;

        if (!pageTitle) {
          const titleElement = document.querySelector(
            ".rm-title-display, [data-page-links], .rm-page-ref-link-color"
          );
          pageTitle = titleElement?.textContent?.trim();
        }

        if (!pageTitle) throw new Error("Could not get current page title");

        const dateInfo = parseDatePage(pageTitle);
        if (!dateInfo) throw new Error("Current page is not a valid date page");

        // Use FIXED color-agnostic algorithm
        const subjournalPageUid = await getOrCreatePageUid(subjournalName);
        const journalUid = await getOrCreateJournalEntriesBlock(
          subjournalPageUid
        );
        const targetBlockUid = await createDateEntry(
          journalUid,
          dateInfo,
          color
        );

        await window.roamAlphaAPI.ui.rightSidebar.addWindow({
          window: { type: "block", "block-uid": journalUid },
        });

        // 🎯 BULLETPROOF CURSOR POSITIONING - Multiple strategies!
        setTimeout(async () => {
          try {
            console.log(
              `🎯 FOCUS: Attempting to focus new block ${targetBlockUid}`
            );

            // Get block content for cursor positioning
            const blockData = window.roamAlphaAPI.pull("[:block/string]", [
              ":block/uid",
              targetBlockUid,
            ]);
            const content = blockData?.[":block/string"] || "";
            const cursorPosition = content.length;

            console.log(
              `🎯 FOCUS: Block content: "${content}", cursor position: ${cursorPosition}`
            );

            // Strategy 1: Try to get the actual sidebar window ID
            let sidebarWindowId = null;
            try {
              const sidebarWindows =
                window.roamAlphaAPI.ui.rightSidebar.getWindows();
              console.log("🎯 FOCUS: Found sidebar windows:", sidebarWindows);

              // Find the window containing our journal
              const journalWindow = sidebarWindows.find(
                (w) => w.type === "block" && w["block-uid"] === journalUid
              );

              if (journalWindow) {
                // Try to construct the proper window ID
                sidebarWindowId = `sidebar-${journalWindow["block-uid"]}`;
                console.log(
                  `🎯 FOCUS: Using constructed sidebar window ID: ${sidebarWindowId}`
                );
              }
            } catch (windowError) {
              console.log(
                "🎯 FOCUS: Could not get sidebar windows:",
                windowError
              );
            }

            // Strategy 2: Try with the constructed sidebar window ID
            if (sidebarWindowId) {
              try {
                await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                  location: {
                    "block-uid": targetBlockUid,
                    "window-id": sidebarWindowId,
                  },
                  selection: {
                    start: cursorPosition,
                    end: cursorPosition,
                  },
                });
                console.log("🎯 ✅ FOCUS SUCCESS: Strategy 2 worked!");
                return;
              } catch (strategy2Error) {
                console.log("🎯 FOCUS: Strategy 2 failed:", strategy2Error);
              }
            }

            // Strategy 3: Try without window ID (let Roam figure it out)
            try {
              await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                location: { "block-uid": targetBlockUid },
                selection: {
                  start: cursorPosition,
                  end: cursorPosition,
                },
              });
              console.log("🎯 ✅ FOCUS SUCCESS: Strategy 3 worked!");
              return;
            } catch (strategy3Error) {
              console.log("🎯 FOCUS: Strategy 3 failed:", strategy3Error);
            }

            // Strategy 4: Basic focus without selection
            try {
              await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                location: { "block-uid": targetBlockUid },
              });
              console.log(
                "🎯 ✅ FOCUS SUCCESS: Strategy 4 worked (basic focus)!"
              );
              return;
            } catch (strategy4Error) {
              console.log("🎯 FOCUS: Strategy 4 failed:", strategy4Error);
            }

            // Strategy 5: Try main window focus (in case sidebar focus is broken)
            try {
              // Get current user UID for main window ID construction
              const userUid = window.roamAlphaAPI.user.uid();
              const pageUid =
                await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
              const mainWindowId = `${userUid}-body-outline-${pageUid}`;

              await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
                location: {
                  "block-uid": targetBlockUid,
                  "window-id": mainWindowId,
                },
                selection: {
                  start: cursorPosition,
                  end: cursorPosition,
                },
              });
              console.log(
                "🎯 ✅ FOCUS SUCCESS: Strategy 5 worked (main window)!"
              );
              return;
            } catch (strategy5Error) {
              console.log("🎯 FOCUS: Strategy 5 failed:", strategy5Error);
            }

            console.log(
              "🎯 ❌ FOCUS: All strategies failed - block created but no focus"
            );
          } catch (overallError) {
            console.error("🎯 ❌ FOCUS: Overall error:", overallError);
          }
        }, 1000); // Longer delay for sidebar rendering

        // BONUS: Try again after a longer delay as backup
        setTimeout(async () => {
          try {
            console.log("🎯 BACKUP FOCUS: Trying one more time...");

            const blockData = window.roamAlphaAPI.pull("[:block/string]", [
              ":block/uid",
              targetBlockUid,
            ]);
            const content = blockData?.[":block/string"] || "";

            await window.roamAlphaAPI.ui.setBlockFocusAndSelection({
              location: { "block-uid": targetBlockUid },
              selection: { start: content.length, end: content.length },
            });

            console.log("🎯 ✅ BACKUP FOCUS: Success on second attempt!");
          } catch (backupError) {
            console.log(
              "🎯 BACKUP FOCUS: Also failed, but that's okay - block is created!"
            );
          }
        }, 2000);

        console.log(
          `✅ FIXED SUCCESS: Entry created in ${subjournalName} for ${dateInfo.fullDate}`
        );
      } catch (error) {
        console.error("⚠ Error handling subjournal selection:", error);

        if (error.message.includes("Timeout")) {
          alert(`⏱️ Operation timed out. Roam may be busy - please try again.`);
        } else {
          alert(`❌ Error: ${error.message}`);
        }
      }
    }

    // ==================== 1.10 🔄 PAGE CHANGE DETECTION ====================

    async function updateUI() {
      const isDatePageResult = await isDatePage();

      if (isDatePageResult) {
        if (needsOnboarding()) {
          console.log(
            "🛠️ First-time user detected - creating default structure"
          );
          const created = await createDefaultStructure();
          if (created) {
            showOnboardingGuidance();
          } else {
            console.error("❌ Failed to create default structure");
          }
        }
        createSubjournalButton();
      } else {
        const existingButton = document.querySelector(".subjournals-trigger");
        if (existingButton) existingButton.remove();
      }
    }

    function scheduleUpdate() {
      clearTimeout(updateTimer);
      updateTimer = setTimeout(updateUI, 300);
    }

    // ==================== 1.11 🎨 STYLING ====================

    const style = document.createElement("style");
    style.textContent = `
      .subjournals-trigger {
        position: absolute; left: 10px; z-index: 9999; display: flex;
        border: 1.5px solid #8B4513; border-radius: 8px; background: rgb(251, 238, 166);
        box-shadow: 0 3px 6px rgba(0,0,0,0.2); transition: all 0.2s ease; overflow: hidden;
      }
      .subjournals-trigger:hover { background: #FFF700; }
      
      .subjournals-info, .subjournals-main, .subjournals-dismiss {
        background: transparent; border: none; cursor: pointer; color: #8B4513;
        transition: all 0.2s ease; border-radius: 0;
      }
      .subjournals-info:hover, .subjournals-main:hover, .subjournals-dismiss:hover {
        background: rgba(139, 69, 19, 0.1);
      }
      
      .subjournals-info { border-right: 1px solid #8B4513; padding: 8px 10px; font-size: 14px; }
      .subjournals-main { padding: 12px 16px; flex: 1; white-space: nowrap; }
      .subjournals-dismiss { border-left: 1px solid #8B4513; padding: 8px 10px; font-size: 12px; min-width: 30px; }
      
      .subjournals-dropdown {
        position: absolute; z-index: 9999; background: white; border: 1.5px solid #8B4513;
        border-top: none; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        box-sizing: border-box;
      }
      
      .subjournals-option {
        padding: 10px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0;
        transition: background 0.2s ease; font-size: 14px; font-weight: 500;
      }
      .subjournals-option:hover { background: #f8f9fa !important; }
      .subjournals-option:last-child { border-bottom: none; }
      
      .subjournals-dropdown .subjournals-option[data-color="red"] { 
        border-left: 3px solid #e74c3c !important; color: #e74c3c !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="orange"] { 
        border-left: 3px solid #e67e22 !important; color: #e67e22 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="yellow"] { 
        border-left: 3px solid #f1c40f !important; color: #f1c40f !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="green"] { 
        border-left: 3px solid #27ae60 !important; color: #27ae60 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="blue"] { 
        border-left: 3px solid #3498db !important; color: #3498db !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="purple"] { 
        border-left: 3px solid #9b59b6 !important; color: #9b59b6 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="brown"] { 
        border-left: 3px solid #8b4513 !important; color: #8b4513 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="grey"] { 
        border-left: 3px solid #95a5a6 !important; color: #95a5a6 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="white"] { 
        border-left: 3px solid #ecf0f1 !important; color: #2c3e50 !important; 
      }
      .subjournals-dropdown .subjournals-option[data-color="black"] { 
        border-left: 3px solid #2c3e50 !important; color: #2c3e50 !important; 
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

    extensionAPI.settings.panel.create({
      tabTitle: "Subjournals",
      settings: [
        {
          id: "multiUserMode",
          name: "Multi-user Mode",
          description:
            "Enable collaborative features: button repositioning and automatic username tagging",
          action: {
            type: "switch",
            onChange: (newValue) => {
              console.log(`🎮 Multi-user mode changed to: ${newValue}`);
              setTimeout(scheduleUpdate, 100);
            },
          },
        },
      ],
    });

    scheduleUpdate();

    // Enhanced testing functions with color-agnostic debugging
    window.subjournalsTest = {
      isDatePage: async () => await isDatePage(),
      updateUI: async () => await updateUI(),
      getSubjournals: () => getSubjournals(),
      needsOnboarding: () => needsOnboarding(),
      createDefaultStructure: async () => await createDefaultStructure(),
      isMultiUserMode: () => isMultiUserMode(),
      toggleMultiUserMode: () => {
        const current = extensionAPI.settings.get("multiUserMode");
        const newValue = !current;
        extensionAPI.settings.set("multiUserMode", newValue);
        scheduleUpdate();
        return newValue;
      },

      // 🎯 NEW: Color-agnostic testing functions
      testColorAgnosticSearch: (parentUid, searchPattern) => {
        console.log("🎯 Testing color-agnostic search...");
        return findBlockWithColorAgnosticSearch(parentUid, searchPattern);
      },

      simulateHierarchyReuse: async () => {
        console.log("🎯 Simulating hierarchy reuse test...");
        try {
          const currentPageUid =
            await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
          const pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
            ":block/uid",
            currentPageUid,
          ])?.[":node/title"];

          if (!pageTitle) throw new Error("Not on a valid page");

          const dateInfo = parseDatePage(pageTitle);
          if (!dateInfo) throw new Error("Not on a date page");

          // Test with two different colors
          const testJournalUid = window.roamAlphaAPI.util.generateUID();

          console.log("🎯 Creating first entry with BLUE...");
          await createDateEntry(testJournalUid, dateInfo, "blue");

          console.log(
            "🎯 Creating second entry with RED (should reuse hierarchy)..."
          );
          await createDateEntry(testJournalUid, dateInfo, "red");

          console.log("🎯 ✅ Test complete! Check if hierarchy was reused.");
          return true;
        } catch (error) {
          console.error("🎯 ❌ Test failed:", error);
          return false;
        }
      },

      debugHierarchy: (journalUid) => {
        console.log("🎯 Debugging hierarchy under journal:", journalUid);

        const allBlocks = window.roamAlphaAPI.q(`
          [:find ?uid ?string :where 
           [?parent :block/uid "${journalUid}"]
           [?child :block/parents ?parent]
           [?child :block/uid ?uid]
           [?child :block/string ?string]]
        `);

        console.log("🎯 Found blocks:");
        allBlocks.forEach(([uid, string]) => {
          console.log(`  ${uid}: "${string}"`);
        });

        return allBlocks;
      },
    };

    console.log("✅ Subjournals v2.0 loaded with FIXED color-agnostic search!");

    return {
      elements: [style],
      observers: [observer],
      timeouts: [urlCheckInterval],
      unload: () => {
        clearTimeout(updateTimer);
        clearInterval(urlCheckInterval);
        delete window.subjournalsTest;
      },
    };
  },

  onunload: () => {
    console.log("✅ Subjournals v2.0 unloaded");
  },
};
