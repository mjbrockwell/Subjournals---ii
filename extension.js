// ===================================================================
// 📔 FULL FEATURED SUBJOURNALS v4.3 - WITH GUI CONFIG EDITOR
// 🔧 FIXED: Ported reliable detection patterns from Button Utility
// ✨ NEW: Beautiful modal-based configuration editor
// 🎯 RELIABLE: Simple page change detection that actually works
// ===================================================================

export default {
  onload: ({ extensionAPI }) => {
    console.log(
      "📔 Full Featured Subjournals v4.3 loading - GUI CONFIG EDITOR!"
    );

    // ===================================================================
    // 🔧 PORTED WORKING PATTERNS FROM BUTTON UTILITY EXTENSION
    // ===================================================================

    // ==================== ✅ WORKING PAGE TITLE DETECTION ====================

    function getCurrentPageTitle() {
      try {
        // ✅ PROVEN: Multiple DOM selectors from working extension
        const titleSelectors = [
          ".roam-article h1",
          ".rm-page-title",
          ".rm-title-display",
          "[data-page-title]",
          ".rm-page-title-text",
          ".roam-article > div:first-child h1",
          "h1[data-page-title]",
        ];

        // ✅ PROVEN: Try DOM selectors first
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element?.textContent?.trim()) {
            return element.textContent.trim();
          }
        }

        // ✅ PROVEN: URL hash fallback with proper decoding
        const hash = window.location.hash;
        if (hash) {
          const match = hash.match(/#\/app\/[^\/]+\/page\/(.+)$/);
          if (match) {
            const encoded = match[1];
            try {
              return decodeURIComponent(encoded);
            } catch (error) {
              return encoded; // Raw if decoding fails
            }
          }
        }

        return null;
      } catch (error) {
        console.warn("❌ Error getting page title:", error);
        return null;
      }
    }

    // ==================== ✅ WORKING PAGE CHANGE DETECTION ====================

    class WorkingPageChangeDetector {
      constructor() {
        this.listeners = new Set();
        this.currentUrl = window.location.href;
        this.currentTitle = getCurrentPageTitle();
        this.isMonitoring = false;
        this.observer = null;
      }

      startMonitoring() {
        if (this.isMonitoring) return;

        // ✅ PROVEN: Simple MutationObserver approach
        this.observer = new MutationObserver(() => {
          this.checkPageChange();
        });

        this.observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        // ✅ PROVEN: Standard event listeners
        window.addEventListener("popstate", () => this.checkPageChange());
        window.addEventListener("hashchange", () => this.checkPageChange());

        this.isMonitoring = true;
        console.log("🔍 Working page change detection started");
      }

      stopMonitoring() {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
        this.isMonitoring = false;
        console.log("🔍 Working page change detection stopped");
      }

      checkPageChange() {
        const newUrl = window.location.href;
        const newTitle = getCurrentPageTitle();

        if (newUrl !== this.currentUrl || newTitle !== this.currentTitle) {
          console.log(
            `📄 Page change detected: ${this.currentTitle} → ${newTitle}`
          );
          this.currentUrl = newUrl;
          this.currentTitle = newTitle;

          // ✅ PROVEN: Simple listener notification
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

    // ==================== ✅ WORKING PAGE CONDITIONS ====================

    const WorkingPageConditions = {
      // ✅ FIXED: Page title-based detection (more reliable!)
      isDailyNote: () => {
        const pageTitle = getCurrentPageTitle();
        if (!pageTitle) return false;

        // ✅ PRIMARY: Use title-based detection with our existing regex
        const titleBasedResult = DATE_PAGE_REGEX.test(pageTitle);

        // ✅ FALLBACK: URL-based detection for other setups
        const url = window.location.href;
        const urlBasedResult =
          /\/page\/\d{2}-\d{2}-\d{4}/.test(url) || // MM-DD-YYYY
          /\/page\/\d{4}-\d{2}-\d{2}/.test(url) || // YYYY-MM-DD
          /\/page\/[A-Z][a-z]+.*\d{4}/.test(url); // "January 1st, 2025"

        const result = titleBasedResult || urlBasedResult;

        console.log(
          `🗓️ Daily note detection for "${pageTitle}" (URL: ${url}): title=${titleBasedResult}, url=${urlBasedResult}, result=${result}`
        );
        return result;
      },

      // ✅ PROVEN: Page title based subjournal detection
      isConfiguredSubjournal: () => {
        const pageTitle = getCurrentPageTitle();
        if (!pageTitle) return false;

        const subjournals = getSubjournals();
        const isSubjournal = subjournals.some((s) => s.name === pageTitle);

        console.log(
          `📔 Subjournal detection for "${pageTitle}": ${isSubjournal}`
        );
        return isSubjournal;
      },

      // ✨ NEW: Config page detection
      isConfigPage: () => {
        const pageTitle = getCurrentPageTitle();
        const isConfig = pageTitle === CONFIG_PAGE_NAME;

        console.log(`⚙️ Config page detection for "${pageTitle}": ${isConfig}`);
        return isConfig;
      },

      isMainPage: () => {
        return (
          !!document.querySelector(".roam-article") &&
          window.location.href.includes("/page/")
        );
      },
    };

    // ===================================================================
    // 📔 SUBJOURNALS CORE FUNCTIONALITY (UNCHANGED)
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

    const COLOR_OPTIONS = [
      "red",
      "orange",
      "yellow",
      "green",
      "blue",
      "purple",
      "brown",
      "grey",
      "white",
    ];

    const CONFIG_PAGE_NAME = "roam/ext/subjournals/config";

    // ==================== STATE MANAGEMENT ====================

    let pageDetector;
    let hasShownOnboarding = false;
    let currentDropdown = null;
    let activeButton = null;
    let configModal = null;

    // ==================== ✅ SIMPLIFIED PAGE CONTEXT DETECTION ====================

    function getPageContext() {
      try {
        const pageTitle = getCurrentPageTitle();
        if (!pageTitle) return { context: "unknown" };

        // ✅ PROVEN: Use working detection methods
        const isDate = WorkingPageConditions.isDailyNote();
        const isSubjournal = WorkingPageConditions.isConfiguredSubjournal();
        const isConfig = WorkingPageConditions.isConfigPage();

        if (isConfig) {
          return {
            context: "config",
            pageTitle,
          };
        } else if (isDate) {
          return {
            context: "date",
            pageTitle,
            dateInfo: parseDatePage(pageTitle),
          };
        } else if (isSubjournal) {
          const subjournals = getSubjournals();
          const subjournalInfo = subjournals.find((s) => s.name === pageTitle);
          return {
            context: "subjournal",
            pageTitle,
            subjournalInfo,
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

    // ==================== CONFIGURATION READING (UNCHANGED) ====================

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

          subjournals.push({
            name,
            color,
            uid,
            colorUid: colorChild?.[":block/uid"],
          });
        });

        return subjournals;
      } catch (error) {
        console.error("⚠ Error getting subjournals:", error);
        return [];
      }
    }

    // ==================== ✨ NEW: CONFIG MODAL FUNCTIONALITY ====================

    function createConfigModal() {
      if (configModal) {
        configModal.remove();
        configModal = null;
      }

      console.log("🎨 Creating configuration modal...");

      // Modal overlay
      const overlay = document.createElement("div");
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: "999999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });

      // Modal container
      const modal = document.createElement("div");
      Object.assign(modal.style, {
        backgroundColor: "#ffffff",
        border: "2px solid #8b4513",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "600px",
        maxHeight: "80vh",
        overflowY: "auto",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
      });

      // Modal header
      const header = document.createElement("h2");
      header.textContent = "Configure Subjournals";
      Object.assign(header.style, {
        margin: "0 0 20px 0",
        color: "#8b4513",
        borderBottom: "2px solid #8b4513",
        paddingBottom: "10px",
      });

      // Form container
      const form = document.createElement("div");
      form.className = "subjournals-config-form";

      // Get current subjournals
      const currentSubjournals = getSubjournals();
      const subjournalRows = [];

      // Create rows for existing subjournals
      currentSubjournals.forEach((subjournal, index) => {
        const row = createSubjournalRow(
          subjournal.name,
          subjournal.color,
          index
        );
        subjournalRows.push(row);
        form.appendChild(row.element);
      });

      // Add new subjournal button
      const addButton = document.createElement("button");
      addButton.textContent = "➕ Add New Subjournal";
      Object.assign(addButton.style, {
        width: "100%",
        padding: "12px",
        margin: "15px 0",
        border: "2px dashed #8b4513",
        backgroundColor: "#f9f9f9",
        color: "#8b4513",
        fontSize: "14px",
        fontWeight: "600",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      });

      addButton.addEventListener("mouseenter", () => {
        addButton.style.backgroundColor = "#fffbeb";
        addButton.style.borderColor = "#d97706";
      });

      addButton.addEventListener("mouseleave", () => {
        addButton.style.backgroundColor = "#f9f9f9";
        addButton.style.borderColor = "#8b4513";
      });

      addButton.addEventListener("click", (e) => {
        e.preventDefault();
        const newIndex = subjournalRows.length;
        const newRow = createSubjournalRow("", "blue", newIndex);
        subjournalRows.push(newRow);
        form.insertBefore(newRow.element, addButton);
        newRow.nameInput.focus();
      });

      // Action buttons container
      const actionContainer = document.createElement("div");
      Object.assign(actionContainer.style, {
        display: "flex",
        gap: "12px",
        marginTop: "20px",
        borderTop: "1px solid #e5e5e5",
        paddingTop: "20px",
      });

      // Save button
      const saveButton = document.createElement("button");
      saveButton.textContent = "💾 Save Changes";
      Object.assign(saveButton.style, {
        flex: "1",
        padding: "12px 20px",
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
      });

      saveButton.addEventListener("mouseenter", () => {
        saveButton.style.backgroundColor = "#059669";
      });

      saveButton.addEventListener("mouseleave", () => {
        saveButton.style.backgroundColor = "#10b981";
      });

      saveButton.addEventListener("click", async (e) => {
        e.preventDefault();
        await saveConfiguration(subjournalRows);
        closeModal();
      });

      // Cancel button
      const cancelButton = document.createElement("button");
      cancelButton.textContent = "✕ Cancel";
      Object.assign(cancelButton.style, {
        flex: "0 0 auto",
        padding: "12px 20px",
        backgroundColor: "#6b7280",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s ease",
      });

      cancelButton.addEventListener("mouseenter", () => {
        cancelButton.style.backgroundColor = "#4b5563";
      });

      cancelButton.addEventListener("mouseleave", () => {
        cancelButton.style.backgroundColor = "#6b7280";
      });

      cancelButton.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });

      // Helper function to create subjournal row
      function createSubjournalRow(name, color, index) {
        const rowContainer = document.createElement("div");
        Object.assign(rowContainer.style, {
          display: "flex",
          gap: "12px",
          alignItems: "center",
          marginBottom: "12px",
          padding: "12px",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          backgroundColor: "#fafafa",
        });

        // Name input
        const nameInput = document.createElement("input");
        nameInput.type = "text";
        nameInput.value = name;
        nameInput.placeholder = "Subjournal name...";
        Object.assign(nameInput.style, {
          flex: "1",
          padding: "8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
        });

        // Color select
        const colorSelect = document.createElement("select");
        Object.assign(colorSelect.style, {
          padding: "8px 12px",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "14px",
          minWidth: "120px",
        });

        COLOR_OPTIONS.forEach((colorOption) => {
          const option = document.createElement("option");
          option.value = colorOption;
          option.textContent =
            colorOption.charAt(0).toUpperCase() + colorOption.slice(1);
          if (colorOption === color) option.selected = true;
          colorSelect.appendChild(option);
        });

        // Remove button
        const removeButton = document.createElement("button");
        removeButton.textContent = "🗑️";
        Object.assign(removeButton.style, {
          padding: "8px 12px",
          backgroundColor: "#fdf2f8", // Subtle pink pastel
          color: "#be185d", // Dark pink text for contrast
          border: "1px solid #f3e8ff",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        });

        removeButton.addEventListener("click", (e) => {
          e.preventDefault();
          rowContainer.remove();
          const rowIndex = subjournalRows.findIndex(
            (row) => row.element === rowContainer
          );
          if (rowIndex > -1) {
            subjournalRows.splice(rowIndex, 1);
          }
        });

        rowContainer.appendChild(nameInput);
        rowContainer.appendChild(colorSelect);
        rowContainer.appendChild(removeButton);

        return {
          element: rowContainer,
          nameInput,
          colorSelect,
          removeButton,
        };
      }

      // Close modal function
      function closeModal() {
        if (configModal) {
          configModal.remove();
          configModal = null;
        }
      }

      // Escape key closes modal
      const handleEscape = (e) => {
        if (e.key === "Escape") {
          closeModal();
          document.removeEventListener("keydown", handleEscape);
        }
      };
      document.addEventListener("keydown", handleEscape);

      // Click outside closes modal
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeModal();
        }
      });

      // Assemble modal
      modal.appendChild(header);
      modal.appendChild(form);
      form.appendChild(addButton);
      modal.appendChild(actionContainer);
      actionContainer.appendChild(saveButton);
      actionContainer.appendChild(cancelButton);
      overlay.appendChild(modal);

      document.body.appendChild(overlay);
      configModal = overlay;

      console.log("✅ Configuration modal created successfully");
    }

    // Save configuration to Roam blocks
    async function saveConfiguration(subjournalRows) {
      try {
        console.log("💾 Saving configuration...");

        // Get valid subjournals from form
        const newSubjournals = subjournalRows
          .map((row) => ({
            name: row.nameInput.value.trim(),
            color: row.colorSelect.value,
          }))
          .filter((subjournal) => subjournal.name.length > 0);

        if (newSubjournals.length === 0) {
          alert("⚠️ Please add at least one subjournal before saving.");
          return;
        }

        // Get or create config page
        let configPageUid = window.roamAlphaAPI.q(`
          [:find ?uid :where [?e :node/title "${CONFIG_PAGE_NAME}"] [?e :block/uid ?uid]]
        `)?.[0]?.[0];

        if (!configPageUid) {
          configPageUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.page.create({
            page: { title: CONFIG_PAGE_NAME, uid: configPageUid },
          });
        }

        // Find or create "My Subjournals:" block
        const allBlocks = window.roamAlphaAPI.q(`
          [:find ?uid ?string :where 
           [?page :block/uid "${configPageUid}"] [?child :block/page ?page]
           [?child :block/uid ?uid] [?child :block/string ?string]]
        `);

        let mySubjournalsUid = allBlocks.find(
          ([uid, string]) => string?.trim() === "My Subjournals:"
        )?.[0];

        if (!mySubjournalsUid) {
          mySubjournalsUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": configPageUid, order: 1 },
            block: { uid: mySubjournalsUid, string: "My Subjournals:" },
          });
        }

        // Clear existing subjournals
        const existingChildren = window.roamAlphaAPI.q(`
          [:find ?uid :where 
           [?parent :block/uid "${mySubjournalsUid}"] [?child :block/parents ?parent] [?child :block/uid ?uid]]
        `);

        for (const [childUid] of existingChildren) {
          await window.roamAlphaAPI.data.block.delete({
            block: { uid: childUid },
          });
        }

        // Create new subjournals
        for (let i = 0; i < newSubjournals.length; i++) {
          const { name, color } = newSubjournals[i];

          const subjournalUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": mySubjournalsUid, order: i },
            block: { uid: subjournalUid, string: name },
          });

          const colorUid = window.roamAlphaAPI.util.generateUID();
          await window.roamAlphaAPI.data.block.create({
            location: { "parent-uid": subjournalUid, order: 0 },
            block: { uid: colorUid, string: `Color: ${color}` },
          });
        }

        console.log("✅ Configuration saved successfully");

        // Show success message
        setTimeout(() => {
          alert(
            `✅ Configuration saved successfully!\n\n${newSubjournals.length} subjournals configured.`
          );
        }, 100);
      } catch (error) {
        console.error("❌ Error saving configuration:", error);
        alert(`❌ Error saving configuration: ${error.message}`);
      }
    }

    // ==================== ONBOARDING (UNCHANGED) ====================

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
              "Welcome to Full Featured Subjournals v4.3! Enhanced with GUI configuration editor. Click the 'Edit config page?' button to use the visual editor, or manually edit the subjournals below. Colors: red, orange, yellow, green, blue, purple, grey, brown, white. #clr-lgt-orn-act",
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
        alert(`📔 Welcome to Full Featured Subjournals v4.3!

✨ NEW: GUI Configuration Editor!

🎯 What's new in v4.3:
- ✅ Beautiful modal-based configuration editor
- ✅ Visual form with dropdowns for colors
- ✅ Add/remove subjournals with buttons
- ✅ Reliable daily note detection

🔧 I've created ${CONFIG_PAGE_NAME} with sample configuration.

🎨 Visit the config page and click "Edit config page?" to try the new visual editor!

This is your one-time welcome message.`);
      }, 1000);
    }

    // ==================== CASCADING BLOCK CREATION (UNCHANGED) ====================

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

      // Year block
      console.log(`\n🗓️ STEP 1: Creating/finding year block`);
      const yearSearchPattern = `#st0 [[${dateInfo.year}]]`;
      const yearCreateContent = `#st0 [[${dateInfo.year}]] #${colorTag}`;
      const yearUid = await findOrCreateStructureBlock(
        journalUid,
        yearSearchPattern,
        yearCreateContent
      );

      // Month block
      console.log(`\n📅 STEP 2: Creating/finding month block`);
      const monthSearchPattern = `#st0 [[${dateInfo.fullMonth}]]`;
      const monthCreateContent = `#st0 [[${dateInfo.fullMonth}]] #${colorTag}`;
      const monthUid = await findOrCreateStructureBlock(
        yearUid,
        monthSearchPattern,
        monthCreateContent
      );

      // Date block
      console.log(`\n📆 STEP 3: Creating/finding date block`);
      const dateSearchPattern = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]]`;
      const dateCreateContent = `#st0 ${dateInfo.dayName} [[${dateInfo.fullDate}]] #${colorTag}`;
      const dateUid = await findOrCreateStructureBlock(
        monthUid,
        dateSearchPattern,
        dateCreateContent
      );

      // Content block
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

    // ==================== ✅ ENHANCED BUTTON MANAGEMENT ====================

    function findButtonContainer() {
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

    function createButton(context) {
      // Remove existing button
      if (activeButton) {
        activeButton.remove();
        activeButton = null;
      }

      if (context.context === "config") {
        // ✨ NEW: Config page button
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "subjournals-button-container config-mode";

        Object.assign(buttonContainer.style, {
          position: "absolute",
          top: "8px",
          right: "20px",
          zIndex: "10000",
          display: "flex",
          alignItems: "stretch",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: "linear-gradient(135deg, #fefce8, #fef3c7)", // Pale pastel yellow
          border: "1.5px solid #8b4513", // Dark brown border
        });

        // Main button
        const mainButton = document.createElement("button");
        mainButton.textContent = "Edit config page?";
        Object.assign(mainButton.style, {
          padding: "8px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          color: "#8b4513",
          flex: "1",
        });
        mainButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          createConfigModal();
        });

        // Dismiss button
        const dismissButton = document.createElement("button");
        dismissButton.textContent = "✕";
        Object.assign(dismissButton.style, {
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderLeft: "1px solid #8b4513",
          cursor: "pointer",
          fontSize: "14px",
          color: "#8b4513",
        });
        dismissButton.addEventListener("click", () => {
          buttonContainer.remove();
          activeButton = null;
        });

        buttonContainer.appendChild(mainButton);
        buttonContainer.appendChild(dismissButton);

        const container = findButtonContainer();
        container.appendChild(buttonContainer);
        activeButton = buttonContainer;

        console.log("✅ Config page button created");
      } else if (context.context === "date") {
        // Date page: Show dropdown for subjournal selection
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "subjournals-button-container";

        Object.assign(buttonContainer.style, {
          position: "absolute",
          top: "8px",
          right: "20px",
          zIndex: "10000",
          display: "flex",
          alignItems: "stretch",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
          border: "1.5px solid #8b4513",
        });

        // Info button
        const infoButton = document.createElement("button");
        infoButton.textContent = "ℹ️";
        Object.assign(infoButton.style, {
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderRight: "1px solid #8b4513",
          cursor: "pointer",
          fontSize: "14px",
        });
        infoButton.addEventListener("click", () => {
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { title: CONFIG_PAGE_NAME },
          });
        });

        // Main button
        const mainButton = document.createElement("button");
        mainButton.textContent = "Add to Subjournal?";
        Object.assign(mainButton.style, {
          padding: "8px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          flex: "1",
        });
        mainButton.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const subjournals = getSubjournals();
          createDropdown(subjournals, buttonContainer, "sidebar");
        });

        // Dismiss button
        const dismissButton = document.createElement("button");
        dismissButton.textContent = "✕";
        Object.assign(dismissButton.style, {
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderLeft: "1px solid #8b4513",
          cursor: "pointer",
          fontSize: "14px",
          color: "#8b4513",
        });
        dismissButton.addEventListener("click", () => {
          buttonContainer.remove();
          activeButton = null;
        });

        buttonContainer.appendChild(infoButton);
        buttonContainer.appendChild(mainButton);
        buttonContainer.appendChild(dismissButton);

        const container = findButtonContainer();
        container.appendChild(buttonContainer);
        activeButton = buttonContainer;

        console.log("✅ Date page button created");
      } else if (context.context === "subjournal") {
        // Subjournal page: Show direct entry button
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "subjournals-button-container";

        Object.assign(buttonContainer.style, {
          position: "absolute",
          top: "8px",
          right: "20px",
          zIndex: "10000",
          display: "flex",
          alignItems: "stretch",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          background: "linear-gradient(135deg, #fffbeb, #fef3c7)",
          border: "1.5px solid #27ae60", // Green for subjournal pages
        });

        // Info button
        const infoButton = document.createElement("button");
        infoButton.textContent = "ℹ️";
        Object.assign(infoButton.style, {
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderRight: "1px solid #27ae60",
          cursor: "pointer",
          fontSize: "14px",
        });
        infoButton.addEventListener("click", () => {
          window.roamAlphaAPI.ui.mainWindow.openPage({
            page: { title: CONFIG_PAGE_NAME },
          });
        });

        // Main button
        const mainButton = document.createElement("button");
        mainButton.textContent = "Add entry to this page?";
        Object.assign(mainButton.style, {
          padding: "8px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600",
          color: "#27ae60",
          flex: "1",
        });
        mainButton.addEventListener("click", () => {
          handleDirectEntry(context.subjournalInfo);
        });

        // Dismiss button
        const dismissButton = document.createElement("button");
        dismissButton.textContent = "✕";
        Object.assign(dismissButton.style, {
          padding: "8px 10px",
          background: "transparent",
          border: "none",
          borderLeft: "1px solid #27ae60",
          cursor: "pointer",
          fontSize: "14px",
          color: "#27ae60",
        });
        dismissButton.addEventListener("click", () => {
          buttonContainer.remove();
          activeButton = null;
        });

        buttonContainer.appendChild(infoButton);
        buttonContainer.appendChild(mainButton);
        buttonContainer.appendChild(dismissButton);

        const container = findButtonContainer();
        container.appendChild(buttonContainer);
        activeButton = buttonContainer;

        console.log("✅ Subjournal page button created");
      }
    }

    // ==================== DROPDOWN FUNCTIONALITY (UNCHANGED) ====================

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

      // Position dropdown
      const container = findButtonContainer();
      if (triggerElement && triggerElement.getBoundingClientRect) {
        try {
          const buttonRect = triggerElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          dropdown.style.top = buttonRect.bottom - containerRect.top + 2 + "px";
          dropdown.style.left = buttonRect.left - containerRect.left + "px";
          dropdown.style.width = buttonRect.width + "px";
        } catch (error) {
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

    // ==================== NAVIGATION MODES (UNCHANGED) ====================

    async function handleSubjournalSelection(subjournalName, color) {
      try {
        const context = getPageContext();
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

    async function handleDirectEntry(subjournalInfo) {
      try {
        console.log(
          `🎯 FOCUS MODE: Creating direct entry for ${subjournalInfo.name}`
        );

        // Generate today's date info
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

    // ==================== ✅ SIMPLE UNIFIED UI MANAGEMENT ====================

    function updateUI() {
      console.log("🔄 Updating UI based on current page context");

      const context = getPageContext();
      console.log("📄 Current context:", context);

      // Remove existing button
      if (activeButton) {
        activeButton.remove();
        activeButton = null;
      }

      // Create appropriate button based on context
      if (
        context.context === "config" ||
        context.context === "date" ||
        context.context === "subjournal"
      ) {
        createButton(context);
      }
    }

    // ==================== ✅ INITIALIZATION WITH WORKING DETECTION ====================

    async function initialize() {
      console.log(
        "🚀 Initializing Full Featured Subjournals v4.3 - GUI Config Editor..."
      );

      // ✅ PROVEN: Initialize working page detector
      pageDetector = new WorkingPageChangeDetector();
      pageDetector.onPageChange(() => {
        console.log("📄 Page change detected - updating UI");
        updateUI();
      });
      pageDetector.startMonitoring();

      // Check for onboarding
      if (needsOnboarding()) {
        console.log("🛠️ First-time user detected - creating default structure");
        const created = await createDefaultStructure();
        if (created) showOnboardingGuidance();
      }

      // ✅ PROVEN: Initial UI update
      updateUI();

      // Settings panel
      extensionAPI.settings.panel.create({
        tabTitle: "Full Featured Subjournals v4.3",
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
        "✅ Full Featured Subjournals v4.3 initialized - GUI Config Editor ready!"
      );

      return {
        cleanup: () => {
          pageDetector.stopMonitoring();
          if (currentDropdown) currentDropdown.remove();
          if (activeButton) activeButton.remove();
          if (configModal) configModal.remove();
          console.log("🧹 Full Featured Subjournals v4.3 cleaned up");
        },
      };
    }

    // ==================== ✅ DEBUG UTILITIES ====================

    window.SubjournalsDebug = {
      testDailyNoteDetection: () => {
        console.log("🧪 Testing daily note detection...");

        const testUrls = [
          "https://roamresearch.com/#/app/test/page/01-15-2025",
          "https://roamresearch.com/#/app/test/page/2025-01-15",
          "https://roamresearch.com/#/app/test/page/January%2015th%2C%202025",
          "https://roamresearch.com/#/app/test/page/Not%20A%20Date",
        ];

        testUrls.forEach((url) => {
          const oldHref = window.location.href;
          Object.defineProperty(window.location, "href", { value: url });

          const result = WorkingPageConditions.isDailyNote();
          console.log(`📅 URL: ${url} → Daily Note: ${result}`);

          Object.defineProperty(window.location, "href", { value: oldHref });
        });
      },

      getCurrentContext: () => {
        const context = getPageContext();
        console.log("📄 Current page context:", context);
        return context;
      },

      getSubjournals: () => {
        const subjournals = getSubjournals();
        console.log("📔 Current subjournals:", subjournals);
        return subjournals;
      },

      forceUpdateUI: () => {
        console.log("🔄 Forcing UI update...");
        updateUI();
      },

      openConfigModal: () => {
        console.log("🎨 Opening config modal...");
        createConfigModal();
      },
    };

    return initialize();
  },

  onunload: () => {
    console.log("✅ Full Featured Subjournals v4.3 unloaded");
  },
};
