# Subjournals - Roam Research Extension

A professional Roam Research extension for parallel journaling streams with multi-user support.

## Features

- Create and manage multiple journal streams (subjournals)
- Color-coded journal entries
- Multi-user mode support with automatic username tagging
- Beautiful, modern UI with responsive design
- Bulletproof cascading logic for reliable operation

## Installation

1. Install the extension from Roam Depot
2. Create a page titled `[[roam/subjournals]]`
3. Add a block titled `My Subjournals:`
4. Add your subjournals as children of this block
5. Optionally add color settings as children of each subjournal

## Configuration

### Basic Setup

```
My Subjournals:
  - Your First Subjournal
    - Color: blue
  - Your Second Subjournal
    - Color: green
```

### Available Colors

- red
- orange
- yellow
- green
- blue
- purple
- brown
- grey
- white
- black

## Multi-user Mode

Enable multi-user mode in the extension settings to:
- Reposition the button for better multiplayer UI space
- Automatically prepend usernames to entries
- Smart cursor positioning after hashtags

## Development

### Testing Commands

```javascript
// Check if on a date page
window.subjournalsTest.isDatePage()

// Force UI update
window.subjournalsTest.updateUI()

// Create button
window.subjournalsTest.createButton()

// Get configured subjournals
window.subjournalsTest.getSubjournals()

// Multi-user mode functions
window.subjournalsTest.isMultiUserMode()
window.subjournalsTest.getCurrentUser()
window.subjournalsTest.toggleMultiUserMode()
window.subjournalsTest.testMultiUserEntry()
```

## Recent Bug Fixes

### 2024-03-21: Subjournals Detection Fix

Fixed an issue where the extension wasn't properly detecting configured subjournals. The bug was caused by:
- Incorrect block matching logic using regex instead of exact matching
- Not properly utilizing the page structure data
- Issues with child block traversal

The fix:
1. Now uses exact matching for the "My Subjournals:" block
2. Properly utilizes the page structure data
3. Correctly traverses the block hierarchy
4. Simplified color detection logic

## License

MIT License - See LICENSE file for details
