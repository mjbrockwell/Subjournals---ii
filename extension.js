// 🎮 SUBJOURNALS EXTENSION WITH MULTI-USER MODE
// Professional Roam Research extension for parallel journaling streams
// Enhanced with Multiplayer Mode for collaborative environments
// Forest Ecosystem Documentation System + Bulletproof Cascading Logic

export default {
  onload: ({ extensionAPI }) => {
    console.log("📔 Subjournals extension loading with Multi-user Mode...");

    // 🚨 SAFETY CHECK: Log extension loading status
    try {
      console.log("🔍 Extension environment check:");
      console.log("- window.roamAlphaAPI exists:", !!window.roamAlphaAPI);
      console.log("- extensionAPI provided:", !!extensionAPI);
      console.log("- Current URL:", window.location.href);
    } catch (envError) {
      console.error("❌ Environment check failed:", envError);
    }

    // 🚨 WRAP ENTIRE EXTENSION IN TRY-CATCH
    try {
      // ==================== 1.0 🌳 MAIN COMPONENT INITIALIZATION ====================

      // 1.1 🍎 Resource tracking and state management
      const resources = {
        observers: [],
        elements: [],
        eventListeners: [],
        intervals: [],
      };

      // 1.1.1 🍎 Core configuration constants
      const DATE_PAGE_REGEX =
        /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2})(st|nd|rd|th), (\d{4})$/;

      // 1.1.2 🌈 Color mapping for visual theming
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

      // 1.1.3 🍎 Month ordering for hierarchical positioning (newest first)
      const MONTH_ORDER = [
        "December",
        "November",
        "October",
        "September",
        "August",
        "July",
        "June",
        "May",
        "April",
        "March",
        "February",
        "January",
      ];

      // ==================== 1.2 🎮 MULTI-USER MODE UTILITIES ====================

      /**
       * 1.2.1 🎮 Get Multi-user Mode setting
       */
      function isMultiUserMode() {
        try {
          const setting = extensionAPI.settings.get("multiUserMode");
          console.log("🎮 Multi-user mode setting:", setting);
          return setting === true || setting === "true";
        } catch (error) {
          console.log(
            "🎮 Error reading multi-user setting, defaulting to false:",
            error
          );
          return false;
        }
      }

      /**
       * 1.2.2 🎮 Get current user display name for hashtag
       */
      async function getCurrentUserDisplayName() {
        try {
          console.log("🎮 Getting current user display name...");

          // Method 1: Use Josh Brown's new official API
          const userUid = window.roamAlphaAPI.user.uid();
          console.log("🎮 Got user UID:", userUid);

          if (userUid) {
            // Pull user data to get display name
            const userData = window.roamAlphaAPI.pull("[*]", [
              ":user/uid",
              userUid,
            ]);
            console.log("🎮 Got user data:", userData);

            // Try different possible display name fields
            const displayName =
              userData?.[":user/display-name"] ||
              userData?.[":user/email"] ||
              userData?.[":user/uid"] ||
              userUid;

            console.log("🎮 Final display name:", displayName);
            return displayName;
          }

          throw new Error("No user UID available");
        } catch (error) {
          console.error("🎮 Error getting user display name:", error);

          // Fallback: try to get from localStorage or other sources
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
                const displayName = userArray[displayNameIndex + 1];
                console.log(
                  "🎮 Fallback display name from localStorage:",
                  displayName
                );
                return displayName;
              }
            }
          } catch (fallbackError) {
            console.log("🎮 Fallback method also failed:", fallbackError);
          }

          // Final fallback
          return "User";
        }
      }

      // ==================== 1.3 🔍 DETECTION AND PARSING UTILITIES ====================

      /**
       * 1.3.1 🔍 Check if current page is a date page
       */
      async function isDatePage() {
        try {
          // 1.3.1.1 🔷 Get current page UID (handle async)
          const currentPageUid =
            await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
          console.log("🔍 Debug: currentPageUid =", currentPageUid);

          if (!currentPageUid) {
            console.log(
              "🔍 Debug: No currentPageUid found, trying alternative methods"
            );

            // 1.3.1.2 🔍 Alternative method: check URL for page reference
            const urlMatch = window.location.href.match(
              /#\/app\/[^\/]+\/page\/([^\/]+)/
            );
            if (urlMatch) {
              const pageUidFromUrl = urlMatch[1];
              console.log("🔍 Debug: Found pageUid in URL:", pageUidFromUrl);
              const pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
                ":block/uid",
                pageUidFromUrl,
              ])?.[":node/title"];
              console.log("🔍 Debug: pageTitle from URL method =", pageTitle);

              if (pageTitle) {
                const isMatch = DATE_PAGE_REGEX.test(pageTitle);
                console.log("🔍 Debug: DATE_PAGE_REGEX.test result =", isMatch);
                return isMatch;
              }
            }

            // 1.3.1.3 🔍 Another alternative: check page title element
            const titleElement = document.querySelector(
              ".rm-title-display, [data-page-links], .rm-page-ref-link-color"
            );
            if (titleElement) {
              const titleText = titleElement.textContent?.trim();
              console.log("🔍 Debug: Found title in DOM:", titleText);
              if (titleText) {
                const isMatch = DATE_PAGE_REGEX.test(titleText);
                console.log("🔍 Debug: DATE_PAGE_REGEX.test result =", isMatch);
                return isMatch;
              }
            }

            return false;
          }

          // 1.3.1.4 🔷 Extract page title
          const pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
            ":block/uid",
            currentPageUid,
          ])?.[":node/title"];
          console.log("🔍 Debug: pageTitle =", pageTitle);

          if (!pageTitle) {
            console.log("🔍 Debug: No pageTitle found");
            return false;
          }

          // 1.3.1.5 🔍 Test regex match
          const isMatch = DATE_PAGE_REGEX.test(pageTitle);
          console.log("🔍 Debug: DATE_PAGE_REGEX.test result =", isMatch);

          return isMatch;
        } catch (error) {
          console.error("⚠ Error checking date page:", error);
          return false;
        }
      }

      /**
       * 1.3.2 🔍 Parse date page title into structured components
       */
      function parseDatePage(title) {
        // 1.3.2.1 🔶 Execute regex pattern matching
        const match = DATE_PAGE_REGEX.exec(title);
        if (!match) return null;

        // 1.3.2.2 🔷 Destructure match results
        const [, month, day, suffix, year] = match;

        // 1.3.2.3 🧮 Calculate date object and day name
        const date = new Date(
          parseInt(year),
          getMonthIndex(month),
          parseInt(day)
        );
        const dayName = date.toLocaleDateString("en-US", { weekday: "long" });

        // 1.3.2.4 🍎 Return structured date information
        return {
          month,
          day: parseInt(day),
          year: parseInt(year),
          dayName,
          fullDate: title,
          fullMonth: `${month} ${year}`,
        };
      }

      /**
       * 1.3.3 🧮 Get month index (0-11) from month name
       */
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

      /**
       * 1.3.4 🌈 Get color tag for subjournal theming
       */
      function getColorTag(color = "blue") {
        const normalizedColor = color.toLowerCase().trim();
        return COLOR_MAP[normalizedColor] || COLOR_MAP.blue;
      }

      // ==================== 1.4 🦊 BULLETPROOF UTILITY FUNCTIONS ====================

      /**
       * 1.4.1 🦊 Find block containing specific text anywhere under parent
       */
      function findBlockContaining(parentUid, searchText) {
        console.log(
          `🔍 Searching for text "${searchText}" under parent ${parentUid}`
        );

        const blocks = window.roamAlphaAPI.q(`
          [:find (pull ?child [:block/uid :block/string])
           :where 
           [?parent :block/uid "${parentUid}"]
           [?child :block/parents ?parent]
           [?child :block/string ?string]
           [(clojure.string/includes? ?string "${searchText}")]]
        `);

        console.log(
          `🔍 Found ${blocks.length} blocks containing "${searchText}"`
        );

        if (blocks.length > 0) {
          const found = blocks[0][0];

          const uid = found[":block/uid"] || found["uid"] || found.uid;
          const string =
            found[":block/string"] || found["string"] || found.string;

          console.log(`🔍 Using first match: ${uid} - "${string}"`);

          if (!uid) {
            console.log(`🔍 ERROR - No UID found in block data:`, found);
            return null;
          }

          return {
            uid: uid,
            string: string,
          };
        }

        return null;
      }

      /**
       * 1.4.2 🧩 Create block with logging
       */
      async function createBlock(parentUid, content, order = 0) {
        console.log(
          `🧩 Creating block under ${parentUid} with content "${content}"`
        );

        const blockUid = window.roamAlphaAPI.util.generateUID();

        try {
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": parentUid, order: order },
            block: { uid: blockUid, string: content },
          });
          console.log(`🧩 Block created successfully with UID ${blockUid}`);
          return blockUid;
        } catch (error) {
          console.log(`🧩 Block creation failed: ${error.message}`);
          throw error;
        }
      }

      // ==================== 1.5 🦊 DATA PROCESSING FUNCTIONS ====================

      /**
       * 1.5.1 🦊 Get subjournals configuration from Roam
       */
      async function getSubjournals() {
        try {
          console.log("🦊 Debug: getSubjournals() called");

          const configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where 
           [?e :node/title "roam/subjournals"] 
           [?e :block/uid ?uid]]
        `)?.[0]?.[0];

          console.log("🔷 Debug: configPageUid =", configPageUid);

          // Self-healing: Create config page if it doesn't exist
          if (!configPageUid) {
            console.log("🔄 Self-healing: Creating [[roam/subjournals]] page");
            const newPageUid = await getOrCreatePageUid("roam/subjournals");
            
            // Create the instruction block
            await createBlock(newPageUid, 
              "List your personal subjournals indented under the block titled \"My Subjournals:\". You can indent a color choice below each one. Allowable colors are red, orange, yellow, green, blue, purple, brown, grey, white or black. #clr-lgt-orn-act"
            );
            
            // Create the My Subjournals block
            await createBlock(newPageUid, "My Subjournals:");
            
            // Navigate to the new page
            window.roamAlphaAPI.ui.mainWindow.openPage({
              page: { title: "roam/subjournals" },
            });
            
            alert("🔄 Created [[roam/subjournals]] page. Please add your subjournals under the 'My Subjournals:' block.");
            return [];
          }

          // Get the full page structure
          const pageData = window.roamAlphaAPI.pull(
            "[:block/uid :block/string {:block/children [:block/uid :block/string {:block/children [:block/uid :block/string]}]}]",
            [":block/uid", configPageUid]
          );
          console.log("🔷 Debug: Full page structure:", JSON.stringify(pageData, null, 2));

          // Find the "My Subjournals:" block in the children
          const mySubjournalsBlock = pageData[":block/children"]?.find(block => 
            block[":block/string"]?.trim() === "My Subjournals:"
          );

          // Self-healing: Create My Subjournals block if it doesn't exist
          if (!mySubjournalsBlock) {
            console.log("🔄 Self-healing: Creating 'My Subjournals:' block");
            const newBlockUid = await createBlock(configPageUid, "My Subjournals:");
            
            // Navigate to the config page
            window.roamAlphaAPI.ui.mainWindow.openPage({
              page: { title: "roam/subjournals" },
            });
            
            alert("🔄 Created 'My Subjournals:' block. Please add your subjournals as children of this block.");
            return [];
          }

          console.log("🔷 Debug: Found My Subjournals block:", JSON.stringify(mySubjournalsBlock, null, 2));

          const subjournals = [];
          const children = mySubjournalsBlock[":block/children"] || [];

          console.log("🔷 Debug: Processing children:", JSON.stringify(children, null, 2));

          // Self-healing: Check for valid subjournals
          if (children.length === 0) {
            console.log("🔄 Self-healing: No subjournals found");
            window.roamAlphaAPI.ui.mainWindow.openPage({
              page: { title: "roam/subjournals" },
            });
            alert("🔄 No subjournals found. Please add your subjournals as children of the 'My Subjournals:' block.");
            return [];
          }

          children.forEach((child, index) => {
            const name = child[":block/string"]?.trim();
            if (!name || /^color\s*:/i.test(name)) return;

            let color = "blue";
            const colorChildren = child[":block/children"] || [];

            const colorChild = colorChildren.find((grandchild) => {
              const grandchildString = grandchild[":block/string"] || "";
              return /color\s*:/i.test(grandchildString);
            });

            if (colorChild) {
              const colorMatch = colorChild[":block/string"].match(/color\s*:\s*(\w+)/i);
              if (colorMatch) {
                color = colorMatch[1];
              }
            }

            subjournals.push({ name, color });
          });

          // Self-healing: Check for valid color settings
          subjournals.forEach(({ name, color }) => {
            if (!COLOR_MAP[color]) {
              console.log(`🔄 Self-healing: Invalid color '${color}' for subjournal '${name}', using default blue`);
              color = "blue";
            }
          });

          console.log("🦊 Debug: Final subjournals array:", subjournals);
          return subjournals;
        } catch (error) {
          console.error("⚠ Error getting subjournals:", error);
          return [];
        }
      }

      /**
       * 1.5.2 🦊 Create or get page UID with error handling
       */
      async function getOrCreatePageUid(title) {
        try {
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
        } catch (error) {
          console.error("⚠ Error creating page:", error);
          throw error;
        }
      }

      /**
       * 1.5.3 🦊 Find or create Journal Entries block
       */
      async function getOrCreateJournalEntriesBlock(pageUid) {
        try {
          console.log(
            "🦊 getOrCreateJournalEntriesBlock called for pageUid:",
            pageUid
          );

          const journalBlock = findBlockContaining(pageUid, "Journal Entries");

          if (journalBlock) {
            console.log(
              "✅ Using existing Journal Entries block:",
              journalBlock.uid
            );
            return journalBlock.uid;
          }

          console.log("🧩 Creating new Journal Entries block");
          const journalUid = await createBlock(pageUid, "Journal Entries:", 0);

          console.log("✅ Created new Journal Entries block:", journalUid);
          return journalUid;
        } catch (error) {
          console.error("⚠ Error creating journal entries block:", error);
          throw error;
        }
      }

      /**
       * 1.5.4 🌊 🎮 BULLETPROOF createDateEntry with MULTI-USER MODE SUPPORT
       */
      async function createDateEntry(journalUid, dateInfo, color) {
        try {
          const startTime = Date.now();
          const TIMEOUT = 3000;
          const colorTag = getColorTag(color);
          const multiUserMode = isMultiUserMode();

          console.log(
            `🌊 Creating date entry for ${dateInfo.fullDate} in journal ${journalUid}`
          );
          console.log(`🎮 Multi-user mode: ${multiUserMode}`);

          // 🎮 Get username for multi-user mode
          let userDisplayName = "";
          if (multiUserMode) {
            try {
              userDisplayName = await getCurrentUserDisplayName();
              console.log(`🎮 Will use username: "${userDisplayName}"`);
            } catch (userError) {
              console.error(
                "🎮 Error getting username, using fallback:",
                userError
              );
              userDisplayName = "User";
            }
          }

          const workingOn = {
            step: null,
            uid: null,
            content: null,
          };

          let loopCount = 0;

          while (Date.now() - startTime < TIMEOUT) {
            loopCount++;
            const elapsed = Date.now() - startTime;
            console.log(
              `🌊 LOOP ${loopCount}: Starting (elapsed: ${elapsed}ms)`
            );

            try {
              // STEP 1: Find or create year block
              console.log(
                `🌊 LOOP ${loopCount} STEP 1: Looking for year block "${dateInfo.year}"`
              );
              const yearContent = `#st0 [[${dateInfo.year}]] #${colorTag}`;
              const yearBlock = findBlockContaining(journalUid, dateInfo.year);

              if (!yearBlock) {
                console.log(
                  `🌊 LOOP ${loopCount} STEP 1: Year block doesn't exist`
                );
                if (workingOn.step !== "year" || workingOn.uid !== journalUid) {
                  console.log(
                    `🌊 LOOP ${loopCount} STEP 1: Creating year block`
                  );
                  workingOn.step = "year";
                  workingOn.uid = journalUid;
                  workingOn.content = yearContent;
                  await createBlock(journalUid, yearContent);
                } else {
                  console.log(
                    `🌊 LOOP ${loopCount} STEP 1: Already working on year creation, waiting...`
                  );
                }
                continue;
              }

              console.log(
                `🌊 LOOP ${loopCount} STEP 1: ✅ Year block exists: ${yearBlock.uid}`
              );

              // STEP 2: Find or create month block
              console.log(
                `🌊 LOOP ${loopCount} STEP 2: Looking for month block "${dateInfo.fullMonth}"`
              );
              const monthContent = `#st0 [[${dateInfo.fullMonth}]] #${colorTag}`;
              const monthBlock = findBlockContaining(
                yearBlock.uid,
                dateInfo.fullMonth
              );

              if (!monthBlock) {
                console.log(
                  `🌊 LOOP ${loopCount} STEP 2: Month block doesn't exist`
                );
                if (
                  workingOn.step !== "month" ||
                  workingOn.uid !== yearBlock.uid
                ) {
                  console.log(
                    `🌊 LOOP ${loopCount} STEP 2: Creating month block`
                  );
                  workingOn.step = "month";
                  workingOn.uid = yearBlock.uid;
                  workingOn.content = monthContent;
                  await createBlock(yearBlock.uid, monthContent);
                } else {
                  console.log(
                    `🌊 LOOP ${loopCount} STEP 2: Already working on month creation, waiting...`
                  );
                }
                continue;
              }

              console.log(
                `🌊 LOOP ${loopCount} STEP 2: ✅ Month block exists: ${monthBlock.uid}`
              );

              // STEP 3: Find or create date banner
              console.log(
                `🌊 LOOP ${loopCount} STEP 3: Looking for date block "${dateInfo.fullDate}"`
              );
              const dateContent = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]] #${colorTag}`;
              const dateBlock = findBlockContaining(
                monthBlock.uid,
                dateInfo.fullDate
              );

              if (!dateBlock) {
                console.log(
                  `🌊 LOOP ${loopCount} STEP 3: Date block doesn't exist`
                );
                if (
                  workingOn.step !== "date" ||
                  workingOn.uid !== monthBlock.uid
                ) {
                  console.log(
                    `🌊 LOOP ${loopCount} STEP 3: Creating date block`
                  );
                  workingOn.step = "date";
                  workingOn.uid = monthBlock.uid;
                  workingOn.content = dateContent;
                  await createBlock(monthBlock.uid, dateContent);
                } else {
                  console.log(
                    `🌊 LOOP ${loopCount} STEP 3: Already working on date creation, waiting...`
                  );
                }
                continue;
              }

              console.log(
                `🌊 LOOP ${loopCount} STEP 3: ✅ Date block exists: ${dateBlock.uid}`
              );

              // STEP 4: Create new content block with conditional username prepend
              console.log(
                `🌊 LOOP ${loopCount} STEP 4: Creating new content block under date`
              );

              // 🎮 Multi-user mode: prepend username hashtag
              const initialContent = multiUserMode
                ? `#[[${userDisplayName}]] `
                : "";
              console.log(
                `🎮 Initial content for new block: "${initialContent}"`
              );

              const newBlockUid = await createBlock(
                dateBlock.uid,
                initialContent
              );

              console.log(
                `🌊 SUCCESS: Created final content block: ${newBlockUid}`
              );
              console.log(`🎮 Multi-user mode was: ${multiUserMode}`);
              console.log(
                `🌊 TOTAL LOOPS: ${loopCount}, ELAPSED: ${
                  Date.now() - startTime
                }ms`
              );

              return newBlockUid;
            } catch (error) {
              console.log(`🌊 LOOP ${loopCount} ERROR: ${error.message}`);
            }
          }

          const timeoutMessage = `Timeout after 3 seconds (${loopCount} loops). Was working on: ${workingOn.step}`;
          console.log(`🌊 TIMEOUT: ${timeoutMessage}`);
          throw new Error(timeoutMessage);
        } catch (error) {
          console.error("⚠ Error creating date entry:", error);
          throw error;
        }
      }

      // ==================== 1.6 🦜 UI MANAGEMENT COMPONENTS ====================

      /**
       * 1.6.1 🎯 Button placement with MULTI-USER MODE positioning
       */
      function findOptimalButtonContainer() {
        console.log("🎯 Finding optimal button container");

        const possibleTargets = [
          ".roam-article",
          ".roam-main",
          ".rm-article-wrapper",
          ".roam-center-panel",
          ".flex-h-box > div:nth-child(2)",
          "#app > div > div > div:nth-child(2)",
          '.bp3-tab-panel[aria-hidden="false"]',
        ];

        let targetElement = null;
        let selectorUsed = null;

        for (const selector of possibleTargets) {
          const element = document.querySelector(selector);
          if (element) {
            targetElement = element;
            selectorUsed = selector;
            console.log(`✅ Found target using: ${selector}`);
            break;
          }
        }

        if (!targetElement) {
          console.error("❌ Could not find suitable target element");
          targetElement = document.body;
          selectorUsed = "body (fallback)";
        }

        const computedStyle = getComputedStyle(targetElement);
        if (computedStyle.position === "static") {
          targetElement.style.position = "relative";
          console.log(`🔧 Set ${selectorUsed} to position: relative`);
        }

        console.log(`🎯 Selected container: ${selectorUsed}`);
        return { targetElement, selectorUsed };
      }

      /**
       * 1.6.2 🦜 Create dropdown menu for subjournal selection
       */
      function createDropdown(subjournals, mainButton) {
        console.log("🦜 createDropdown called with:", subjournals);

        const existingDropdown = document.querySelector(
          ".subjournals-dropdown"
        );
        if (existingDropdown) {
          existingDropdown.remove();
        }

        if (subjournals.length === 0) {
          alert(
            '⚠ No subjournals configured. Please set up [[roam/subjournals]] page with "My Subjournals:" block.'
          );
          return;
        }

        const dropdown = document.createElement("div");
        dropdown.className = "subjournals-dropdown";

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

          const optionColor = colorMap[color] || "#333";
          option.style.color = optionColor;
          option.setAttribute("data-color", color);

          option.addEventListener("click", (e) => {
            console.log(`🐇 Option "${name}" clicked!`);
            e.stopPropagation();
            dropdown.remove();
            handleSubjournalSelection(name, color);
          });

          dropdown.appendChild(option);
        });

        const buttonContainer = mainButton.parentElement;
        const parentContainer = buttonContainer.parentElement;

        const buttonContainerRect = buttonContainer.getBoundingClientRect();
        const parentContainerRect = parentContainer.getBoundingClientRect();

        const relativeTop =
          buttonContainerRect.bottom - parentContainerRect.top;
        const relativeLeft =
          buttonContainerRect.left - parentContainerRect.left;

        dropdown.style.position = "absolute";
        dropdown.style.top = relativeTop + "px";
        dropdown.style.left = relativeLeft + "px";
        dropdown.style.zIndex = "9999";
        dropdown.style.minWidth = buttonContainerRect.width + "px";
        dropdown.style.maxWidth = "300px";
        dropdown.style.backgroundColor = "white";
        dropdown.style.border = "1.5px solid #8B4513";

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

        setTimeout(() => {
          document.addEventListener("click", closeDropdown);
        }, 0);
      }

      /**
       * 1.6.3 🦜 🎮 Create main subjournal trigger button with MULTI-USER POSITIONING
       */
      function createSubjournalButton() {
        console.log("🦜 createSubjournalButton called");

        // 🎮 Check multi-user mode for positioning
        const multiUserMode = isMultiUserMode();
        console.log(
          "🎮 Multi-user mode for button positioning:",
          multiUserMode
        );

        const existingButton = document.querySelector(".subjournals-trigger");
        if (existingButton) {
          existingButton.remove();
        }

        const { targetElement, selectorUsed } = findOptimalButtonContainer();

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "subjournals-trigger";

        // 🎮 Apply dynamic positioning based on multi-user mode
        if (multiUserMode) {
          buttonContainer.style.top = "60px"; // Moved down to make space for other multiplayer buttons
          console.log("🎮 Button positioned at 60px (multi-user mode)");
        } else {
          buttonContainer.style.top = "10px"; // Normal position
          console.log("🎮 Button positioned at 10px (normal mode)");
        }

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

        const infoClickHandler = (e) => {
          e.stopPropagation();
          try {
            window.roamAlphaAPI.ui.mainWindow.openPage({
              page: { title: "roam/subjournals" },
            });
          } catch (error) {
            console.error("❌ Error navigating to config page:", error);
          }
        };

        const mainClickHandler = (e) => {
          e.preventDefault();
          e.stopPropagation();
          try {
            const subjournals = getSubjournals();
            if (!subjournals || subjournals.length === 0) {
              alert(
                '⚠ No subjournals configured. Please set up [[roam/subjournals]] page with "My Subjournals:" block.'
              );
              return;
            }
            createDropdown(subjournals, mainButton);
          } catch (error) {
            console.error("❌ Error in main click handler:", error);
            alert(`❌ Error creating dropdown: ${error.message}`);
          }
        };

        const dismissClickHandler = (e) => {
          e.stopPropagation();
          try {
            buttonContainer.remove();
          } catch (error) {
            console.error("❌ Error dismissing button:", error);
          }
        };

        infoButton.addEventListener("click", infoClickHandler);
        mainButton.addEventListener("click", mainClickHandler);
        dismissButton.addEventListener("click", dismissClickHandler);

        buttonContainer.appendChild(infoButton);
        buttonContainer.appendChild(mainButton);
        buttonContainer.appendChild(dismissButton);

        targetElement.appendChild(buttonContainer);
        resources.elements.push(buttonContainer);

        console.log(
          "✅ Button successfully added to DOM with multi-user positioning"
        );
      }

      /**
       * 1.6.4 🦜 Update UI based on current page context
       */
      async function updateUI() {
        console.log("🦜 updateUI called");

        const isDatePageResult = await isDatePage();
        console.log("🔍 isDatePage() returned:", isDatePageResult);

        if (isDatePageResult) {
          console.log("✅ On date page - creating button");
          createSubjournalButton();
        } else {
          console.log("❌ Not on date page - removing button");
          const existingButtonContainer = document.querySelector(
            ".subjournals-trigger"
          );
          if (existingButtonContainer) {
            existingButtonContainer.remove();
          }
        }
      }

      // ==================== 1.7 🐇 USER INTERACTION HANDLERS ====================

      /**
       * 1.7.1 🐇 🎮 Handle subjournal selection workflow with MULTI-USER FOCUS POSITIONING
       */
      async function handleSubjournalSelection(subjournalName, color) {
        try {
          console.log(
            `🐇 Handling selection of "${subjournalName}" with color "${color}"`
          );

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
          if (!dateInfo)
            throw new Error("Current page is not a valid date page");

          console.log("🔍 Parsed date info:", dateInfo);

          const subjournalPageUid = await getOrCreatePageUid(subjournalName);
          console.log("🦊 Subjournal page UID:", subjournalPageUid);

          const journalUid = await getOrCreateJournalEntriesBlock(
            subjournalPageUid
          );
          console.log("🦊 Journal entries block UID:", journalUid);

          // 🎮 Create date entry with multi-user support (username prepending handled inside createDateEntry)
          const targetBlockUid = await createDateEntry(
            journalUid,
            dateInfo,
            color
          );
          console.log("🌊 Target block UID for cursor:", targetBlockUid);

          await window.roamAlphaAPI.ui.rightSidebar.addWindow({
            window: { type: "block", "block-uid": journalUid },
          });
          console.log("👁 Opened sidebar successfully");

          // 🎮 Focus with multi-user awareness - cursor positioned at END of content
          setTimeout(() => {
            try {
              const multiUserMode = isMultiUserMode();
              console.log(
                "🎮 Setting focus in multi-user mode:",
                multiUserMode
              );

              // In multi-user mode, we want cursor at the END (after the hashtag and space)
              // In normal mode, cursor at beginning of empty block
              const focusConfig = {
                location: {
                  "block-uid": targetBlockUid,
                  "window-id": "sidebar",
                },
              };

              // 🎮 If multi-user mode, set selection to end of existing content
              if (multiUserMode) {
                // Get the current content to calculate end position
                try {
                  const blockData = window.roamAlphaAPI.pull(
                    "[:block/string]",
                    [":block/uid", targetBlockUid]
                  );
                  const content = blockData?.[":block/string"] || "";
                  const endPosition = content.length;

                  focusConfig.selection = {
                    start: endPosition,
                    end: endPosition,
                  };

                  console.log(
                    `🎮 Setting cursor at position ${endPosition} after content: "${content}"`
                  );
                } catch (selectionError) {
                  console.log(
                    "🎮 Could not set precise cursor position, using default:",
                    selectionError
                  );
                }
              }

              window.roamAlphaAPI.ui.setBlockFocusAndSelection(focusConfig);
              console.log("🎯 Set focus successfully");
            } catch (focusError) {
              console.error("⚠ Focus error (non-critical):", focusError);
            }
          }, 500);

          console.log(
            `✅ SUCCESS: Created entry in ${subjournalName} for ${dateInfo.fullDate}`
          );

          // 🎮 Log multi-user mode status for debugging
          const multiUserMode = isMultiUserMode();
          if (multiUserMode) {
            console.log(
              "🎮 Multi-user mode was active - username hashtag should be prepended"
            );
          } else {
            console.log("🎮 Normal mode was active - empty block created");
          }
        } catch (error) {
          console.error("⚠ Error handling subjournal selection:", error);

          if (error.message.includes("Timeout after")) {
            alert(
              `⏱️ The operation took too long to complete. This usually means Roam is busy. Please try again in a moment.\n\nDetails: ${error.message}`
            );
          } else {
            alert(`❌ Error creating subjournal entry: ${error.message}`);
          }
        }
      }

      /**
       * 1.7.2 🐇 Check page changes with debouncing
       */
      let updateTimer;
      function scheduleUpdate() {
        console.log("🔄 scheduleUpdate called");
        clearTimeout(updateTimer);
        updateTimer = setTimeout(async () => {
          console.log("⏰ updateUI being called from timer");
          await updateUI();
        }, 300);
      }

      // ==================== 1.8 🔧 INITIALIZATION AND SETUP ====================

      // 1.8.1 🎨 Add professional styling with DYNAMIC POSITIONING
      const style = document.createElement("style");
      style.textContent = `
        /* 1.8.1.1 🦜 Main trigger button container - DYNAMIC positioning for multi-user mode */
        .subjournals-trigger {
          position: absolute;
          /* top property set dynamically by JavaScript based on multi-user mode */
          left: 10px;
          z-index: 9999;
          display: flex;
          border: 1.5px solid #8B4513;
          border-radius: 8px;
          background: rgb(251, 238, 166);
          box-shadow: 0 3px 6px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
          overflow: hidden;
          font-family: inherit;
        }

        .subjournals-trigger:hover {
          background: #FFF700;
        }

        /* 1.8.1.2 ℹ️ Info button (left) */
        .subjournals-info {
          background: transparent;
          border: none;
          border-right: 1px solid #8B4513;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 14px;
          color: #8B4513;
          transition: all 0.2s ease;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .subjournals-info:hover {
          background: rgba(139, 69, 19, 0.1);
        }

        /* 1.8.1.3 🎨 Main button (center) */
        .subjournals-main {
          background: transparent;
          border: none;
          padding: 12px 16px;
          cursor: pointer;
          color: #8B4513;
          font-size: inherit;
          font-weight: inherit;
          font-family: inherit;
          line-height: inherit;
          letter-spacing: inherit;
          transition: all 0.2s ease;
          border-radius: 0;
          white-space: nowrap;
          flex: 1;
        }

        .subjournals-main:hover {
          background: rgba(139, 69, 19, 0.1);
        }

        /* 1.8.1.4 ❌ Dismiss button (right) */
        .subjournals-dismiss {
          background: transparent;
          border: none;
          border-left: 1px solid #8B4513;
          padding: 8px 10px;
          cursor: pointer;
          font-size: 12px;
          color: #8B4513;
          transition: all 0.2s ease;
          border-radius: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
        }

        .subjournals-dismiss:hover {
          background: rgba(139, 69, 19, 0.1);
        }

        /* 1.8.1.5 🦜 Dropdown menu styling */
        .subjournals-dropdown {
          position: absolute;
          z-index: 9999;
          background: white;
          border: 1.5px solid #8B4513;
          border-top: none;
          border-radius: 0 0 8px 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          overflow-y: auto;
          font-family: var(--font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }

        /* 1.8.1.6 🦜 Dropdown option styling */
        .subjournals-option {
          padding: 10px 15px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease;
          color: #333;
        }

        .subjournals-option:hover {
          background: #f8f9fa;
        }

        .subjournals-option:last-child {
          border-bottom: none;
        }

        /* 1.8.1.7 🌈 Color indicators for subjournals */
        .subjournals-option[data-color="red"] { border-left: 3px solid #e74c3c; }
        .subjournals-option[data-color="orange"] { border-left: 3px solid #e67e22; }
        .subjournals-option[data-color="yellow"] { border-left: 3px solid #f1c40f; }
        .subjournals-option[data-color="green"] { border-left: 3px solid #27ae60; }
        .subjournals-option[data-color="blue"] { border-left: 3px solid #3498db; }
        .subjournals-option[data-color="purple"] { border-left: 3px solid #9b59b6; }
        .subjournals-option[data-color="brown"] { border-left: 3px solid #8b4513; }
        .subjournals-option[data-color="grey"] { border-left: 3px solid #95a5a6; }
        .subjournals-option[data-color="white"] { border-left: 3px solid #ecf0f1; }
        .subjournals-option[data-color="black"] { border-left: 3px solid #2c3e50; }

        /* 1.8.1.8 📱 Responsive design */
        @media (max-width: 768px) {
          .subjournals-main {
            font-size: 11px;
            padding: 6px 10px;
          }
          .subjournals-info, .subjournals-dismiss {
            padding: 6px 8px;
            font-size: 11px;
          }
          .subjournals-dropdown { min-width: 180px; }
          .subjournals-option { padding: 8px 12px; font-size: 13px; }
        }
      `;
      document.head.appendChild(style);
      resources.elements.push(style);

      // 1.8.2 🌀 Set up page change observation system
      const observer = new MutationObserver((mutations) => {
        console.log("👁 MutationObserver fired, mutations:", mutations.length);

        const hasPageChanges = mutations.some((mutation) => {
          const hasNodeChanges = Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === 1 &&
              (node.querySelector?.(".rm-title-display") ||
                node.classList?.contains("rm-title-display") ||
                node.querySelector?.("[data-page-links]") ||
                node.classList?.contains("rm-page") ||
                node.tagName === "H1")
          );
          if (hasNodeChanges) {
            console.log("📄 Found page change in mutation:", mutation);
          }
          return hasNodeChanges;
        });

        if (hasPageChanges) {
          console.log("🔄 Page changes detected, scheduling update");
          scheduleUpdate();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      resources.observers.push(observer);

      // 1.8.3 🔄 URL change detection for navigation
      let currentUrl = window.location.href;
      console.log("🌐 Initial URL:", currentUrl);

      const urlCheckInterval = setInterval(() => {
        if (window.location.href !== currentUrl) {
          console.log(
            "🌐 URL changed from",
            currentUrl,
            "to",
            window.location.href
          );
          currentUrl = window.location.href;
          scheduleUpdate();
        }
      }, 500);
      resources.intervals = [urlCheckInterval];

      // 1.8.4 🎮 Create Settings Panel for Multi-user Mode
      try {
        console.log("🎮 Creating settings panel for Multi-user Mode...");
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
                  console.log(
                    `🎮 Multi-user mode setting changed to: ${newValue}`
                  );
                  // Trigger UI update to reposition button
                  setTimeout(() => {
                    scheduleUpdate();
                  }, 100);
                },
              },
            },
          ],
        });
        console.log("✅ Settings panel created successfully");
      } catch (settingsError) {
        console.error("❌ Error creating settings panel:", settingsError);
      }

      // 1.8.5 🚀 Initial UI update
      console.log("🚀 Running initial UI update");
      scheduleUpdate();

      // 1.8.6 🧪 Add testing functions
      window.subjournalsTest = {
        isDatePage: async () => await isDatePage(),
        updateUI: async () => await updateUI(),
        createButton: () => createSubjournalButton(),
        getSubjournals: () => getSubjournals(),
        // 🎮 Multi-user mode testing functions
        isMultiUserMode: () => isMultiUserMode(),
        getCurrentUser: async () => await getCurrentUserDisplayName(),
        toggleMultiUserMode: () => {
          const current = extensionAPI.settings.get("multiUserMode");
          const newValue = !current;
          extensionAPI.settings.set("multiUserMode", newValue);
          console.log(`🎮 Toggled multi-user mode: ${current} → ${newValue}`);
          // Recreate button with new positioning
          scheduleUpdate();
          return newValue;
        },
        testMultiUserEntry: async () => {
          try {
            const pageUid =
              await window.roamAlphaAPI.ui.mainWindow.getOpenPageOrBlockUid();
            const pageTitle = window.roamAlphaAPI.pull("[:node/title]", [
              ":block/uid",
              pageUid,
            ])?.[":node/title"];
            const dateInfo = parseDatePage(pageTitle);
            if (!dateInfo) throw new Error("Not a date page");

            const journalUid = await getOrCreateJournalEntriesBlock(pageUid);
            const targetUid = await createDateEntry(
              journalUid,
              dateInfo,
              "blue"
            );
            console.log("✅ Multi-user test successful:", targetUid);
            return targetUid;
          } catch (error) {
            console.error("❌ Multi-user test failed:", error);
            return null;
          }
        },
      };

      console.log(
        "✅ Subjournals extension loaded successfully with MULTI-USER MODE!"
      );
      console.log("🎮 NEW MULTI-USER FEATURES:");
      console.log("  - Toggle in Roam Depot Extensions settings");
      console.log("  - Button repositioning for multiplayer UI space");
      console.log("  - Automatic username hashtag prepending");
      console.log("  - Smart cursor positioning after hashtag");
      console.log("🧪 Testing commands:");
      console.log("  - window.subjournalsTest.isMultiUserMode()");
      console.log("  - window.subjournalsTest.toggleMultiUserMode()");
      console.log("  - window.subjournalsTest.getCurrentUser()");
      console.log("  - window.subjournalsTest.testMultiUserEntry()");

      // 1.8.7 🧹 Store cleanup function
      window.subjournalsCleanup = () => {
        resources.observers.forEach((obs) => obs.disconnect());
        resources.elements.forEach((el) => el.remove());
        if (resources.intervals) {
          resources.intervals.forEach((interval) => clearInterval(interval));
        }
        clearTimeout(updateTimer);
        delete window.subjournalsTest;
        console.log("🧹 Subjournals extension cleaned up");
      };
    } catch (extensionError) {
      console.error("❌ CRITICAL: Extension failed to load:", extensionError);
      console.error("❌ Error details:", extensionError.stack);

      try {
        window.subjournalsTest = {
          extensionStatus: () => {
            console.log(
              "❌ Extension failed to load with error:",
              extensionError
            );
            return { error: extensionError.message, loaded: false };
          },
          forceReload: () => {
            console.log("🔄 Attempting to reload extension...");
            try {
              location.reload();
            } catch (reloadError) {
              console.error("❌ Reload failed:", reloadError);
            }
          },
        };
        console.log("🚧 Emergency test functions created");
      } catch (testError) {
        console.error(
          "❌ Even emergency test function creation failed:",
          testError
        );
      }
    }
  },

  onunload: () => {
    try {
      if (window.subjournalsCleanup) {
        window.subjournalsCleanup();
        delete window.subjournalsCleanup;
      }
      console.log("✅ Extension unloaded successfully");
    } catch (unloadError) {
      console.error("❌ Error during extension unload:", unloadError);
    }
  },
};
