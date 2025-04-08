"use strict";
// This is a simple client-side TypeScript file
// Track segments that have insights generated
let generatedSegmentsInsights = [];
document.addEventListener('DOMContentLoaded', () => {
    console.log('Website loaded successfully!');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const mainContent = document.querySelector('.main-content');
    // Add class to nav items to make text labels appear only on sidebar hover
    navItems.forEach(item => {
        const textSpan = item.querySelector('span');
        if (textSpan) {
            textSpan.classList.add('transition-opacity', 'duration-300');
        }
    });
    // Optional: Add active class to current page navigation
    const currentPath = window.location.pathname;
    navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === currentPath) {
            link.classList.add('bg-gray-700');
        }
    });
    // Navigation sidebar functionality - select all navigation links (both top and bottom sections)
    const navItemsLinks = document.querySelectorAll('.nav-item a');
    const flowContainers = document.querySelectorAll('.flow-container');
    // Show the active flow content and hide others
    const showActiveFlow = (hash) => {
        // Hide all flow containers
        flowContainers.forEach(container => {
            container.classList.remove('active');
        });
        // Determine which flow to show based on the hash
        let flowId;
        switch (hash) {
            case '#fanbase':
                flowId = 'fanbase-flow';
                break;
            case '#segments':
                flowId = 'segments-flow';
                break;
            case '#campaigns':
                flowId = 'campaigns-flow';
                break;
            case '#settings':
                flowId = 'settings-flow';
                break;
            case '#help':
                flowId = 'help-flow';
                break;
            default:
                flowId = 'fanbase-flow'; // Default to fanbase
        }
        // Show the active flow
        const activeFlow = document.getElementById(flowId);
        if (activeFlow) {
            activeFlow.classList.add('active');
            // Initialize specific flow content if needed
            if (flowId === 'fanbase-flow') {
                initFanbaseTable();
            }
            else if (flowId === 'segments-flow') {
                initSegmentsTable();
            }
        }
    };
    // Set active nav item based on current page or default to Fanbase
    const setActiveNavItem = () => {
        // Get current path or hash
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash || '#fanbase';
        // Remove active class from all items
        navItemsLinks.forEach(item => {
            item.classList.remove('active');
        });
        // Try to find matching nav item
        let activeFound = false;
        navItemsLinks.forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPath || href === currentHash) {
                item.classList.add('active');
                activeFound = true;
            }
        });
        // If no active item found, set Fanbase as active by default
        if (!activeFound && navItemsLinks.length > 0) {
            // Find the Fanbase link
            const fanbaseLink = Array.from(navItemsLinks).find(item => item.getAttribute('href') === '#fanbase');
            if (fanbaseLink) {
                fanbaseLink.classList.add('active');
            }
            else if (navItemsLinks.length > 0) {
                // Fallback to first item if Fanbase link not found
                navItemsLinks[0].classList.add('active');
            }
        }
        // Show the appropriate flow
        showActiveFlow(currentHash);
    };
    // Add click handler for navigation items
    navItemsLinks.forEach(item => {
        item.addEventListener('click', (e) => {
            // Prevent default navigation for demo
            e.preventDefault();
            // Get the hash from the href
            const hash = item.getAttribute('href') || '';
            // Update URL hash without triggering page navigation
            if (hash.startsWith('#')) {
                window.history.pushState(null, '', hash);
            }
            // Remove active class from all items
            navItemsLinks.forEach(link => {
                link.classList.remove('active');
            });
            // Add active class to clicked item
            item.classList.add('active');
            // Show the appropriate flow
            showActiveFlow(hash);
        });
    });
    // Listen for hash changes in the URL
    window.addEventListener('hashchange', () => {
        setActiveNavItem();
    });
    // Global state for fanbase
    let fans = [];
    let currentPage = 1;
    let rowsPerPage = 10;
    let totalPages = 1;
    const fanTemplateIndices = {};
    // Selection mode state for fanbase
    let selectModeActive = false;
    let selectedFans = [];
    // Global state for segments
    let segments = [];
    let segmentsCurrentPage = 1;
    let segmentsRowsPerPage = 10;
    let segmentsTotalPages = 1;
    // Selection mode state for segments
    let segmentsSelectModeActive = false;
    let selectedSegments = [];
    // Generate mock segment data
    const generateSegmentData = (count) => {
        const segmentNames = [
            'Toulousain', 'Femme 20-30', 'Étudiant', 'CSP+', 'Fan Premium',
            'Abonnés saison 2023-2024', 'Acheteurs maillots', 'Visiteurs site web',
            'Supporters historiques', 'Familles', 'Jeunes actifs', 'Fans internationaux',
            'Entreprises partenaires', 'Club supporters', 'Acheteurs tickets VIP'
        ];
        const segments = [];
        // Generate dates between 1-3 years ago
        const getRandomDate = () => {
            const now = new Date();
            const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return new Date(threeYearsAgo.getTime() + Math.random() * (oneYearAgo.getTime() - threeYearsAgo.getTime()));
        };
        // Generate percentages with bias toward higher values (60%+)
        const generateProfilePercentage = () => {
            // Use a weighted random approach to generate more segments with percentages above 60%
            const rand = Math.random();
            if (rand < 0.15) {
                // 15% chance to be in 0-40% range
                return Math.floor(Math.random() * 40);
            }
            else if (rand < 0.35) {
                // 20% chance to be in 40-60% range
                return Math.floor(Math.random() * 20) + 40;
            }
            else if (rand < 0.7) {
                // 35% chance to be in 60-80% range
                return Math.floor(Math.random() * 20) + 60;
            }
            else {
                // 30% chance to be above 80%
                return Math.floor(Math.random() * 20) + 80;
            }
        };
        for (let i = 1; i <= count; i++) {
            // Create unique segments first
            if (i <= segmentNames.length) {
                segments.push({
                    id: i,
                    name: segmentNames[i - 1],
                    createdDate: getRandomDate(),
                    fanCount: 100 + Math.floor(Math.random() * 9900), // Between 100 and 10,000 fans
                    profilePercentage: generateProfilePercentage() // Add profile percentage
                });
            }
            else {
                // For extras, create combinations or variations
                const base = segmentNames[Math.floor(Math.random() * segmentNames.length)];
                segments.push({
                    id: i,
                    name: `${base} - Variation ${i - segmentNames.length}`,
                    createdDate: getRandomDate(),
                    fanCount: 100 + Math.floor(Math.random() * 9900),
                    profilePercentage: generateProfilePercentage() // Add profile percentage
                });
            }
        }
        return segments;
    };
    // Generate mock fan data
    const generateMockFans = (count) => {
        const firstNames = ['John', 'Jane', 'Michael', 'Emma', 'Robert', 'Sarah', 'David', 'Lisa', 'Thomas', 'Alice',
            'William', 'Emily', 'James', 'Olivia', 'Daniel', 'Sophie', 'Matthew', 'Sophia', 'Anthony', 'Mia'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson',
            'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez', 'Moore', 'Martin', 'Jackson', 'Thompson', 'White'];
        const fans = [];
        // Generate dates between 1-3 years ago
        const getRandomDate = () => {
            const now = new Date();
            const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return new Date(threeYearsAgo.getTime() + Math.random() * (oneYearAgo.getTime() - threeYearsAgo.getTime()));
        };
        // Format date as DD/MM/YYYY
        const formatDate = (date) => {
            return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
        };
        for (let i = 1; i <= count; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const gender = Math.random() > 0.5 ? 'male' : 'female';
            const createdDate = getRandomDate();
            const totalValue = Math.floor(Math.random() * 10000) / 100; // Random value between 0 and 100 with 2 decimal places
            const proximityRating = Math.floor(Math.random() * 100); // Random proximity rating between 0 and 100
            fans.push({
                id: i,
                firstName,
                lastName,
                gender,
                createdDate,
                totalValue,
                proximityRating
            });
        }
        return fans;
    };
    // Switch between normal and selection mode
    const toggleSelectionMode = (active) => {
        // Store the previous state to detect change
        const wasActive = selectModeActive;
        // Update state
        selectModeActive = active;
        // Reset selections if turning off selection mode
        if (!active) {
            selectedFans = [];
        }
        // Get UI elements
        const selectButton = document.querySelector('#fanbase-flow button:has(.fa-check-square)') ||
            document.querySelector('#fanbase-flow button:has(.fa-times)');
        const addFanButton = document.querySelector('#fanbase-flow button:has(.fa-plus)') ||
            document.querySelector('#fanbase-flow button:has(.fa-trash)');
        const tableRows = document.querySelectorAll('#fans-table-body tr');
        const actionButtons = document.querySelectorAll('#fans-table-body button[data-id]');
        const exportButtonContainer = document.getElementById('export-button-container');
        
        if (active) {
            // Update select button to Cancel
            if (selectButton) {
                selectButton.innerHTML = `
          <i class="fas fa-times"></i>
          <span>Cancel</span>
        `;
                selectButton.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                selectButton.classList.add('bg-gray-700', 'hover:bg-gray-800', 'text-white');
            }
            
            // Add export button if it doesn't exist
            if (!document.getElementById('export-button') && exportButtonContainer) {
                const exportButton = document.createElement('button');
                exportButton.id = 'export-button';
                exportButton.className = 'bg-gray-300 text-gray-500 py-2 px-4 rounded flex items-center space-x-1 cursor-not-allowed transition-all duration-200';
                exportButton.innerHTML = `
          <i class="fas fa-file-export"></i>
          <span>Export</span>
        `;
                exportButton.disabled = true;
                exportButtonContainer.appendChild(exportButton);
                
                // Add click handler
                exportButton.addEventListener('click', () => {
                    if (selectedFans.length === 0) return;
                    // In a real app, this would export the selected fans
                    alert(`Exporting ${selectedFans.length} fan(s). In a real app, this would download a CSV or Excel file.`);
                });
            }
            
            // Change add fan button to delete fan
            if (addFanButton) {
                addFanButton.innerHTML = `
          <i class="fas fa-trash"></i>
          <span>Delete Fan</span>
        `;
                addFanButton.classList.remove('bg-indigo-100', 'hover:bg-indigo-200', 'text-indigo-700');
                addFanButton.classList.add('bg-red-100', 'hover:bg-red-200', 'text-red-700');
                
                // Disable delete button initially since no selections yet
                addFanButton.disabled = true;
                addFanButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
            
            // Make rows selectable with pointer cursor
            tableRows.forEach(row => {
                row.classList.add('cursor-pointer', 'hover:bg-gray-50', 'select-row');
                // Add checkbox column if it doesn't exist
                if (!row.querySelector('.select-checkbox')) {
                    const checkbox = document.createElement('td');
                    checkbox.className = 'select-checkbox px-6 py-4 whitespace-nowrap w-12 text-center';
                    checkbox.innerHTML = `<div class="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"></div>`;
                    row.insertBefore(checkbox, row.firstChild);
                }
            });
            
            // Add listeners to rows for selection
            addRowSelectionListeners();
        }
        else {
            // Restore select button
            if (selectButton) {
                selectButton.innerHTML = `
          <i class="fas fa-check-square"></i>
          <span>Select</span>
        `;
                selectButton.classList.remove('bg-gray-700', 'hover:bg-gray-800', 'text-white');
                selectButton.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            }
            
            // Reset add fan button
            if (addFanButton) {
                addFanButton.innerHTML = `
          <i class="fas fa-plus"></i>
          <span>Add Fan</span>
        `;
                addFanButton.classList.remove('bg-red-100', 'hover:bg-red-200', 'text-red-700', 'opacity-50', 'cursor-not-allowed');
                addFanButton.classList.add('bg-indigo-100', 'hover:bg-indigo-200', 'text-indigo-700');
                addFanButton.disabled = false;
            }
            
            // Remove export button
            const exportButton = document.getElementById('export-button');
            if (exportButton && exportButtonContainer) {
                exportButtonContainer.removeChild(exportButton);
            }
            
            // Remove selection checkboxes and restore rows
            tableRows.forEach(row => {
                row.classList.remove('cursor-pointer', 'hover:bg-gray-50', 'select-row', 'bg-indigo-50');
                const checkbox = row.querySelector('.select-checkbox');
                if (checkbox) {
                    row.removeChild(checkbox);
                }
            });
        }
        
        // Update table header
        updateTableHeader(active);
    };
    // Update table header for selection mode
    const updateTableHeader = (selectionMode) => {
        const headerRow = document.querySelector('table thead tr');
        if (!headerRow)
            return;
        // Add or remove checkbox column in header
        if (selectionMode) {
            if (!headerRow.querySelector('.select-checkbox-header')) {
                const checkboxHeader = document.createElement('th');
                checkboxHeader.className = 'select-checkbox-header px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12';
                checkboxHeader.innerHTML = `<div class="w-6 h-6 flex items-center justify-center"></div>`;
                headerRow.insertBefore(checkboxHeader, headerRow.firstChild);
            }
        }
        else {
            const checkboxHeader = headerRow.querySelector('.select-checkbox-header');
            if (checkboxHeader) {
                headerRow.removeChild(checkboxHeader);
            }
        }
    };
    // Add listeners to rows for selection
    const addRowSelectionListeners = () => {
        const rows = document.querySelectorAll('#fans-table-body tr.select-row');
        
        rows.forEach(row => {
            // Remove previous event listeners if any by cloning and replacing the row
            const newRow = row.cloneNode(true);
            if (row.parentNode) {
                row.parentNode.replaceChild(newRow, row);
            }
            
            newRow.addEventListener('click', (e) => {
                if (!selectModeActive) return;
                
                // Get the fan id from the row
                const viewButton = newRow.querySelector('button[data-id]');
                if (!viewButton) return;
                
                const fanId = parseInt(viewButton.getAttribute('data-id') || '0');
                const checkbox = newRow.querySelector('.select-checkbox div');
                
                // Toggle selection
                if (selectedFans.includes(fanId)) {
                    // Deselect
                    selectedFans = selectedFans.filter(id => id !== fanId);
                    newRow.classList.remove('bg-indigo-50');
                    if (checkbox) {
                        checkbox.className = 'w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center';
                        checkbox.innerHTML = '';
                    }
                } else {
                    // Select
                    selectedFans.push(fanId);
                    newRow.classList.add('bg-indigo-50');
                    if (checkbox) {
                        checkbox.className = 'w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center';
                        checkbox.innerHTML = '<i class="fas fa-check text-xs"></i>';
                    }
                }
                
                // Update UI based on selection count
                updateSelectionUI();
            });
        });
    };
    // Update UI based on selection
    const updateSelectionUI = () => {
        const addFanButton = document.querySelector('#fanbase-flow button:has(.fa-trash)');
        const exportButton = document.getElementById('export-button');
        
        if (selectedFans.length > 0) {
            // Enable delete button
            if (addFanButton) {
                addFanButton.disabled = false;
                addFanButton.classList.remove('opacity-50', 'cursor-not-allowed');
                addFanButton.innerHTML = `
          <i class="fas fa-trash"></i>
          <span>Delete Fan${selectedFans.length > 1 ? 's' : ''}</span>
        `;
            }
            
            // Enable export button
            if (exportButton) {
                exportButton.disabled = false;
                exportButton.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                exportButton.classList.add('bg-green-100', 'text-green-700', 'hover:bg-green-200');
                exportButton.innerHTML = `
          <i class="fas fa-file-export"></i>
          <span>Export${selectedFans.length > 0 ? ` (${selectedFans.length})` : ''}</span>
        `;
            }
        } else {
            // Disable delete button
            if (addFanButton) {
                addFanButton.disabled = true;
                addFanButton.classList.add('opacity-50', 'cursor-not-allowed');
                addFanButton.innerHTML = `
          <i class="fas fa-trash"></i>
          <span>Delete Fan</span>
        `;
            }
            
            // Disable export button
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.classList.remove('bg-green-100', 'text-green-700', 'hover:bg-green-200');
                exportButton.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                exportButton.innerHTML = `
          <i class="fas fa-file-export"></i>
          <span>Export</span>
        `;
            }
        }
    };
    // Initialize the Fanbase table
    const initFanbaseTable = () => {
        // Generate mock data if not already generated
        if (fans.length === 0) {
            fans = generateMockFans(100);
        }
        // Set up event listeners
        const rowsPerPageSelect = document.getElementById('rows-per-page');
        const prevPageButton = document.getElementById('prev-page');
        const nextPageButton = document.getElementById('next-page');
        const searchInput = document.querySelector('#fanbase-flow input[placeholder="Search fans..."]');
        const selectButton = document.querySelector('#fanbase-flow button:has(.fa-check-square)');
        const addFanButton = document.querySelector('#fanbase-flow button:has(.fa-plus)');
        
        // Original fans array for filtering
        let originalFans = [...fans];
        
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm === '') {
                    // Reset to original data
                    fans = [...originalFans];
                }
                else {
                    // Filter fans based on search term
                    fans = originalFans.filter(fan => fan.firstName.toLowerCase().includes(searchTerm) ||
                        fan.lastName.toLowerCase().includes(searchTerm));
                }
                currentPage = 1; // Reset to first page when searching
                renderTable();
            });
        }
        
        if (selectButton) {
            selectButton.addEventListener('click', () => {
                // Toggle selection mode
                toggleSelectionMode(!selectModeActive);
                // Important: Re-render the table when selection mode is toggled
                renderTable();
            });
        }
        
        if (addFanButton) {
            addFanButton.addEventListener('click', () => {
                if (selectModeActive && selectedFans.length > 0) {
                    // Delete selected fans
                    const confirmDelete = confirm(`Are you sure you want to delete ${selectedFans.length} fan(s)?`);
                    if (confirmDelete) {
                        fans = fans.filter(fan => !selectedFans.includes(fan.id));
                        originalFans = [...fans];
                        renderTable();
                        // Remain in selection mode but clear selections
                        selectedFans = [];
                        updateSelectionUI();
                    }
                }
                else {
                    // In a real app, this would open a form to add a new fan
                    alert('This would open a form to add a new fan in a real app.');
                }
            });
        }
        
        if (rowsPerPageSelect) {
            rowsPerPageSelect.addEventListener('change', () => {
                rowsPerPage = parseInt(rowsPerPageSelect.value);
                currentPage = 1; // Reset to first page when changing rows per page
                renderTable();
            });
        }
        
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderTable();
                }
            });
        }
        
        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderTable();
                }
            });
        }
        
        // Initial render
        renderTable();
    };
    // Render the table with current state
    const renderTable = () => {
        const tableBody = document.getElementById('fans-table-body');
        const paginationNumbers = document.getElementById('pagination-numbers');
        const showingText = document.getElementById('showing-text');
        if (!tableBody || !paginationNumbers || !showingText)
            return;
        // Calculate pagination
        totalPages = Math.ceil(fans.length / rowsPerPage);
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, fans.length);
        const currentFans = fans.slice(startIndex, endIndex);
        // Update showing text
        showingText.textContent = `Showing ${startIndex + 1}-${endIndex} of ${fans.length} fans`;
        // Clear previous content
        tableBody.innerHTML = '';
        paginationNumbers.innerHTML = '';
        // Add table rows
        currentFans.forEach(fan => {
            const row = document.createElement('tr');
            // Add selection checkbox if in selection mode
            if (selectModeActive) {
                const isSelected = selectedFans.includes(fan.id);
                const checkbox = document.createElement('td');
                checkbox.className = 'select-checkbox px-6 py-4 whitespace-nowrap w-12 text-center';
                checkbox.innerHTML = isSelected
                    ? `<div class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center"><i class="fas fa-check text-xs"></i></div>`
                    : `<div class="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"></div>`;
                row.appendChild(checkbox);
                // Add selection styling
                if (isSelected) {
                    row.classList.add('bg-indigo-50');
                }
                // Add selection related classes
                row.classList.add('cursor-pointer', 'hover:bg-gray-50', 'select-row');
            }
            // Name column
            const nameCell = document.createElement('td');
            nameCell.className = 'px-6 py-4 whitespace-nowrap w-1/7';
            nameCell.innerHTML = `
        <div class="flex items-center">
          <div class="w-full">
            <div class="font-medium text-gray-900 text-base truncate max-w-[150px]">
              ${fan.firstName} ${fan.lastName.toUpperCase()}
            </div>
          </div>
        </div>
      `;
            // Gender column
            const genderCell = document.createElement('td');
            genderCell.className = 'px-6 py-4 whitespace-nowrap text-center w-1/7';
            const genderClass = fan.gender === 'male'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-pink-100 text-pink-800';
            genderCell.innerHTML = `
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${genderClass}">
          ${fan.gender}
        </span>
      `;
            // Proximity rating column
            const proximityCell = document.createElement('td');
            proximityCell.className = 'px-6 py-4 whitespace-nowrap text-center w-1/7';
            // Determine color based on rating range
            let proximityClass = '';
            if (fan.proximityRating < 30) {
                proximityClass = 'bg-red-100 text-red-800'; // Light red with red font (0-30%)
            }
            else if (fan.proximityRating < 55) {
                proximityClass = 'bg-yellow-100 text-yellow-800'; // Yellow (30-55%)
            }
            else if (fan.proximityRating < 85) {
                proximityClass = 'bg-blue-100 text-blue-800'; // Blue (55-85%)
            }
            else {
                proximityClass = 'bg-green-100 text-green-800'; // Green (85-100%) - all higher ratings now use green
            }
            proximityCell.innerHTML = `
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${proximityClass}">
          ${fan.proximityRating}%
        </span>
      `;
            // Creation date column
            const dateCell = document.createElement('td');
            dateCell.className = 'px-6 py-4 whitespace-nowrap w-1/7';
            dateCell.innerHTML = `
        <div class="text-gray-500 text-base">
          ${fan.createdDate.getDate().toString().padStart(2, '0')}/${(fan.createdDate.getMonth() + 1).toString().padStart(2, '0')}/${fan.createdDate.getFullYear()}
        </div>
      `;
            // Total value column
            const valueCell = document.createElement('td');
            valueCell.className = 'px-6 py-4 whitespace-nowrap text-right text-base w-1/7';
            valueCell.innerHTML = `
        <div class="font-medium text-gray-900 text-base">
          ${fan.totalValue.toFixed(2)} €
        </div>
      `;
            // AI Insight column
            const insightCell = document.createElement('td');
            insightCell.className = 'px-6 py-4 whitespace-nowrap text-center w-1/7';
            // Check if this fan already has insights generated
            const isGenerated = generatedSegmentsInsights.includes(fan.id);
            insightCell.innerHTML = `
        <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm flex items-center space-x-1 mx-auto ${isGenerated ? 'generated' : ''}" data-insight-id="${fan.id}">
          <i class="fas fa-magic"></i>
          <span>Generate</span>
        </button>
      `;
            // Actions column
            const actionsCell = document.createElement('td');
            actionsCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/7';
            actionsCell.innerHTML = `
        <div class="flex justify-end w-full">
          <button class="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded text-sm flex items-center space-x-1" data-id="${fan.id}">
            <i class="fas fa-eye"></i>
            <span>Voir</span>
          </button>
        </div>
      `;
            row.appendChild(nameCell);
            row.appendChild(genderCell);
            row.appendChild(proximityCell);
            row.appendChild(dateCell);
            row.appendChild(valueCell);
            row.appendChild(insightCell);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
        // Add click event listeners to the "Voir" buttons
        const viewButtons = tableBody.querySelectorAll('button[data-id]');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const fanId = e.currentTarget.getAttribute('data-id');
                const fanIdNum = parseInt(fanId || '0');
                const selectedFan = fans.find(fan => fan.id === fanIdNum);
                if (selectedFan) {
                    showFanProfile(selectedFan);
                }
            });
        });
        // Add click event listeners to the "Generate" buttons
        const generateButtons = tableBody.querySelectorAll('button[data-insight-id]');
        generateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const fanId = e.currentTarget.getAttribute('data-insight-id');
                const fanIdNum = parseInt(fanId || '0');
                const selectedFan = fans.find(fan => fan.id === fanIdNum);
                if (!selectedFan)
                    return;
                // If already generated, just show the modal
                if (button.classList.contains('generated')) {
                    showAIInsight(selectedFan);
                    return;
                }
                // Show loading state
                const originalContent = button.innerHTML;
                button.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>`;
                button.disabled = true;
                button.classList.add('opacity-75');
                // Simulate AI generation delay 
                setTimeout(() => {
                    // Reset button state but mark as generated
                    button.innerHTML = `<i class="fas fa-magic"></i><span>Generate</span>`;
                    button.classList.remove('opacity-75');
                    button.disabled = false;
                    // Mark as generated but keep the original colors and hover effects
                    button.classList.add('generated');
                    // Show AI insight in modal
                    showAIInsight(selectedFan);
                }, 1500);
            });
        });
        // Add pagination numbers
        // Always show first page
        addPaginationButton(1, paginationNumbers);
        if (totalPages <= 5) {
            // Show all pages if 5 or fewer
            for (let i = 2; i <= totalPages; i++) {
                addPaginationButton(i, paginationNumbers);
            }
        }
        else {
            // Show ellipsis for many pages
            if (currentPage > 2) {
                addEllipsis(paginationNumbers);
            }
            // Show pages around current page
            for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
                addPaginationButton(i, paginationNumbers);
            }
            if (currentPage < totalPages - 1) {
                addEllipsis(paginationNumbers);
            }
            // Always show last page
            if (totalPages > 1) {
                addPaginationButton(totalPages, paginationNumbers);
            }
        }
        // Update buttons state
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');
        if (prevPageBtn) {
            prevPageBtn.classList.toggle('opacity-50', currentPage === 1);
            prevPageBtn.classList.toggle('cursor-not-allowed', currentPage === 1);
        }
        if (nextPageBtn) {
            nextPageBtn.classList.toggle('opacity-50', currentPage === totalPages);
            nextPageBtn.classList.toggle('cursor-not-allowed', currentPage === totalPages);
        }
        // Re-add row selection listeners if in selection mode
        if (selectModeActive) {
            addRowSelectionListeners();
        }
    };
    // Helper function to add pagination button
    const addPaginationButton = (pageNum, container) => {
        const button = document.createElement('button');
        button.className = `relative inline-flex items-center px-4 py-2 border ${pageNum === currentPage
            ? 'bg-gray-700 text-white border-gray-700'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} text-sm font-medium`;
        button.textContent = pageNum.toString();
        button.addEventListener('click', () => {
            currentPage = pageNum;
            renderTable();
        });
        container.appendChild(button);
    };
    // Helper function to add ellipsis to pagination
    const addEllipsis = (container) => {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700';
        ellipsis.textContent = '...';
        container.appendChild(ellipsis);
    };
    // Generate AI Insight for a fan - multiple templates
    const generateAIInsight = (fan, templateIndex = 0) => {
        // Calculate age range based on ID (just for demo)
        const ageBase = fan.id % 40 + 18; // Ages 18-57
        const ageRange = `${ageBase}-${ageBase + 5}`;
        // Location based on ID
        const locations = [
            "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
            "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"
        ];
        const location = locations[fan.id % locations.length];
        // Job based on ID
        const jobs = [
            "Ingénieur", "Médecin", "Enseignant", "Commercial", "Étudiant",
            "Développeur", "Consultant", "Entrepreneur", "Manager", "Architecte"
        ];
        const job = jobs[fan.id % jobs.length];
        const previousJobs = jobs[(fan.id + 3) % jobs.length] + ", " + jobs[(fan.id + 7) % jobs.length];
        // Income bracket based on total value
        const incomeBrackets = [
            "20,000€ - 30,000€", "30,000€ - 50,000€", "50,000€ - 70,000€",
            "70,000€ - 100,000€", "100,000€+"
        ];
        const incomeBracketIndex = Math.min(Math.floor(fan.totalValue / 20), incomeBrackets.length - 1);
        const incomeBracket = incomeBrackets[incomeBracketIndex];
        // Household size based on ID
        const householdSize = (fan.id % 5) + 1;
        // Average ticket price based on total value and ID
        const avgTicketPrice = Math.floor((fan.totalValue * 10) / (fan.id % 5 + 1));
        // Merchandise preferences
        const merchItems = [
            "maillots", "écharpes", "casquettes", "ballons",
            "posters", "accessoires", "vêtements casual", "objets collectors"
        ];
        const primaryMerch = merchItems[fan.id % merchItems.length];
        const secondaryMerch = merchItems[(fan.id + 4) % merchItems.length];
        // Calculate spending breakdown (ticketing vs merchandise)
        const ticketingPercentage = 60 + (fan.id % 30);
        const ticketingValue = Math.floor(fan.totalValue * ticketingPercentage / 100);
        const merchValue = Math.floor(fan.totalValue - ticketingValue);
        // Rival clubs 
        const rivalClubs = [
            "Olympique de Marseille", "AS Monaco", "Olympique Lyonnais",
            "LOSC Lille", "AS Saint-Étienne", "OGC Nice", "Stade Rennais"
        ];
        const primaryRival = rivalClubs[fan.id % rivalClubs.length];
        const secondaryRival = rivalClubs[(fan.id + 3) % rivalClubs.length];
        // Number of received campaigns
        const campaignsReceived = 5 + (fan.id % 20);
        // Gender-specific terms
        const genderPronoun = fan.gender === 'male' ? 'il' : 'elle';
        const genderAdjective = fan.gender === 'male' ? '' : 'e';
        const genderFan = fan.gender === 'male' ? 'fan' : 'fanne';
        // Multiple templates for variation
        const templates = [
            // Template 1 - Chronological narrative
            `<p class="text-gray-800 leading-relaxed">
        <span class="font-semibold">${fan.firstName} ${fan.lastName}</span> est un${genderAdjective} ${genderFan} âgé${genderAdjective} de ${ageRange} ans qui habite à ${location}. 
        Actuellement ${job.toLowerCase()}, ${genderPronoun} a précédemment travaillé comme ${previousJobs.toLowerCase()} et se situe dans une tranche de revenus de ${incomeBracket}.
        
        ${fan.firstName} vit dans un foyer de ${householdSize} ${householdSize > 1 ? 'personnes' : 'personne'} et dépense en moyenne ${avgTicketPrice}€ par place. 
        Sa préférence en matière de merchandising va pour les ${primaryMerch} et les ${secondaryMerch}, avec un panier total de ${fan.totalValue.toFixed(2)}€ 
        (dont ${ticketingValue}€ en billetterie et ${merchValue}€ en merchandising).
        
        Avec un score de proximité de ${fan.proximityRating}%, ${genderPronoun} assiste régulièrement aux matchs contre ${primaryRival} et ${secondaryRival}. 
        ${genderPronoun.charAt(0).toUpperCase() + genderPronoun.slice(1)} a reçu ${campaignsReceived} campagnes de communication de notre part.
        
        ${fan.proximityRating > 70 ?
                `Étant un${genderAdjective} ${genderFan} très fidèle, nous recommandons de lui proposer des offres premium ou des expériences VIP pour renforcer cette relation privilégiée.` :
                fan.proximityRating > 40 ?
                    `Pour augmenter son engagement qui est actuellement modéré, nous suggérons de lui proposer des offres spéciales pour les matchs contre ${primaryRival}.` :
                    `Pour stimuler son engagement qui reste faible, nous recommandons de lui envoyer des offres promotionnelles ciblées sur les ${primaryMerch}.`}
        ${householdSize > 1 ? ` Des packs familiaux seraient également pertinents pour ce profil.` : ''}
      </p>`,
            // Template 2 - Engagement-focused narrative
            `<p class="text-gray-800 leading-relaxed">
        Résident${genderAdjective} à ${location}, <span class="font-semibold">${fan.firstName} ${fan.lastName}</span> (${ageRange} ans) présente un profil intéressant avec un score de proximité de ${fan.proximityRating}%. 
        ${genderPronoun.charAt(0).toUpperCase() + genderPronoun.slice(1)} travaille actuellement comme ${job.toLowerCase()} après avoir exercé en tant que ${previousJobs.toLowerCase()}.
        
        Son panier total s'élève à ${fan.totalValue.toFixed(2)}€, réparti entre billetterie (${ticketingValue}€) et merchandising (${merchValue}€), avec une préférence marquée pour les ${primaryMerch}. 
        Pour les événements sportifs, ${genderPronoun} dépense en moyenne ${avgTicketPrice}€ par place et montre un intérêt particulier pour les matchs contre ${primaryRival}.
        
        Compte tenu de son profil socio-économique (revenu: ${incomeBracket}, foyer de ${householdSize} ${householdSize > 1 ? 'personnes' : 'personne'}), 
        ${fan.proximityRating > 70 ?
                `nous recommandons de capitaliser sur sa forte affinité en lui proposant des expériences exclusives et premium.` :
                fan.proximityRating > 40 ?
                    `nous suggérons de renforcer son engagement modéré par des offres personnalisées liées à ses centres d'intérêt.` :
                    `nous conseillons d'intensifier nos efforts marketing avec des promotions ciblées pour développer son affinité avec le club.`}
        
        À noter que ${genderPronoun} a déjà reçu ${campaignsReceived} communications de notre part, ce qui nécessite une approche ${campaignsReceived > 15 ? 'soigneusement dosée' : 'plus régulière'}.
        ${householdSize > 1 ? ` La dimension familiale est à exploiter dans nos futures offres.` : ''}
      </p>`,
            // Template 3 - Business-focused narrative
            `<p class="text-gray-800 leading-relaxed">
        Analyse du profil : <span class="font-semibold">${fan.firstName} ${fan.lastName}</span>, ${ageRange} ans, ${genderFan} basé${genderAdjective} à ${location}.
        
        • <span class="font-medium">Données socio-professionnelles :</span> ${job} (précédemment : ${previousJobs.toLowerCase()}), revenu estimé dans la tranche ${incomeBracket}, foyer de ${householdSize} ${householdSize > 1 ? 'personnes' : 'personne'}.
        
        • <span class="font-medium">Comportement d'achat :</span> Valeur totale ${fan.totalValue.toFixed(2)}€ (${ticketingValue}€ billetterie, ${merchValue}€ merchandising), prix moyen par billet ${avgTicketPrice}€, affinité produits: ${primaryMerch}, ${secondaryMerch}.
        
        • <span class="font-medium">Engagement :</span> Proximité ${fan.proximityRating}%, ${campaignsReceived} campagnes reçues, présence régulière aux matchs vs ${primaryRival} et ${secondaryRival}.
        
        • <span class="font-medium">Recommandation stratégique :</span> 
        ${fan.proximityRating > 70 ?
                `Client à haute valeur, opportunité de développer le revenu par fan via des offres premium et services VIP adaptés à son profil.` :
                fan.proximityRating > 40 ?
                    `Potentiel d'augmentation du panier moyen, cibler avec des offres liées à ses intérêts spécifiques (matchs vs ${primaryRival}).` :
                    `Client à développer, opportunité d'accroissement de l'engagement via des offres promotionnelles sur ses produits préférés (${primaryMerch}).`}
        ${householdSize > 1 ? ` Les offres groupées familiales présentent un potentiel de croissance important pour ce profil.` : ''}
      </p>`
        ];
        // Return the selected template (loop through available templates)
        return `
      <div class="text-left">
        ${templates[templateIndex % templates.length]}
        <div class="mt-4 flex justify-end">
          <button id="regenerate-insight" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded flex items-center space-x-2 text-sm">
            <i class="fas fa-sync-alt"></i>
            <span>Régénérer</span>
          </button>
        </div>
      </div>
    `;
    };
    // Create modal overlay for AI Insight
    const createInsightModal = () => {
        // Check if modal already exists
        const existingModal = document.getElementById('insight-modal');
        if (existingModal) {
            return existingModal;
        }
        // Create modal container
        const modal = document.createElement('div');
        modal.id = 'insight-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center hidden';
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto';
        // Create header
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center px-6 py-4 border-b';
        header.innerHTML = `
      <h2 class="text-xl font-bold text-gray-800 flex items-center">
        <i class="fas fa-magic text-indigo-500 mr-2"></i>
        AI Insight
      </h2>
      <button id="close-modal" class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-times"></i>
      </button>
    `;
        // Create body
        const body = document.createElement('div');
        body.id = 'insight-modal-body';
        body.className = 'px-6 py-4';
        // Assemble modal
        modalContent.appendChild(header);
        modalContent.appendChild(body);
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        // Add close button functionality
        const closeButton = modal.querySelector('#close-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                modal.classList.add('hidden');
            });
        }
        // Close when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
        return modal;
    };
    // Show AI Insight modal for a fan
    const showAIInsight = (fan) => {
        const modal = createInsightModal();
        const modalBody = document.getElementById('insight-modal-body');
        // Initialize or increment template index for this fan
        if (!fanTemplateIndices[fan.id]) {
            fanTemplateIndices[fan.id] = 0;
        }
        const updateModalContent = () => {
            if (modalBody) {
                modalBody.innerHTML = generateAIInsight(fan, fanTemplateIndices[fan.id]);
                // Add event listener to the regenerate button
                const regenerateButton = document.getElementById('regenerate-insight');
                if (regenerateButton) {
                    regenerateButton.addEventListener('click', () => {
                        // Cycle to the next template
                        fanTemplateIndices[fan.id] = (fanTemplateIndices[fan.id] + 1) % 3;
                        updateModalContent();
                    });
                }
            }
        };
        if (modal && modalBody) {
            // Initial content update
            updateModalContent();
            modal.classList.remove('hidden');
        }
    };
    // Show fan profile page
    const showFanProfile = (fan) => {
        // Hide all flow containers
        const flowContainers = document.querySelectorAll('.flow-container');
        flowContainers.forEach(container => {
            container.classList.remove('active');
        });
        // Show fan profile
        const fanProfileFlow = document.getElementById('fan-profile-flow');
        if (fanProfileFlow) {
            fanProfileFlow.classList.add('active');
            // Populate the fan profile content
            populateFanProfile(fan);
            // Setup action buttons
            setupFanProfileButtons(fan);
            // Back to fans button
            const backButton = document.getElementById('back-to-fans-btn');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    // Hide fan profile and show fanbase
                    fanProfileFlow.classList.remove('active');
                    const fanbaseFlow = document.getElementById('fanbase-flow');
                    if (fanbaseFlow) {
                        fanbaseFlow.classList.add('active');
                    }
                });
            }
        }
    };
    // Populate the fan profile with all the fan data
    const populateFanProfile = (fan) => {
        // Set fan name in the title
        const fanNameElement = document.getElementById('fan-profile-name');
        if (fanNameElement) {
            fanNameElement.textContent = `${fan.firstName} ${fan.lastName.toUpperCase()}`;
        }
        // Generate fan insight
        const insight = generateFanInsight(fan);
        const profileContent = document.getElementById('fan-profile-content');
        if (profileContent) {
            // Clean HTML to ensure proper display
            const cleanedInsight = insight.replace(/\n/g, '<br>');
            // Generate AI insight with a container, using the same format as the fanbase page
            profileContent.innerHTML = `
        <div class="grid grid-cols-3 gap-4">
          <div class="col-span-2">
            <div class="p-6 bg-white shadow-md rounded-lg h-full">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-800 flex items-center">
                  <i class="fas fa-magic text-indigo-500 mr-2"></i>
                  AI Insight
                </h2>
                <button id="regenerate-fan-insight" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded text-sm flex items-center space-x-1">
                  <i class="fas fa-sync-alt"></i>
                  <span>Régénérer</span>
                </button>
              </div>
              
              <div class="text-left mt-7">
                ${cleanedInsight}
              </div>
            </div>
          </div>
          
          <div class="col-span-1">
            <div class="p-6 bg-white shadow-md rounded-lg h-full flex flex-col">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-semibold text-gray-800 flex items-center">
                  <i class="fas fa-layer-group text-gray-700 mr-2"></i>
                  Segments reliés
                </h2>
              </div>
              
              <div class="text-left mt-7 overflow-y-auto flex-grow" id="segments-container" style="max-height: 210px;">
                <div class="flex flex-wrap gap-2" id="segments-list">
                  <span class="segment-item px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">Haute valeur</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-green-100 text-green-700 font-medium">Fan local</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">Collectionneur</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">Acheteur précoce</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium">Famille</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">Toulousain</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-pink-100 text-pink-700 font-medium">Femme 20-30</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-teal-100 text-teal-700 font-medium">Étudiant</span>
                  <span class="segment-item px-3 py-1 rounded-full bg-orange-100 text-orange-700 font-medium">CSP+</span>
                </div>
              </div>
              
              <div class="mt-4 pt-2 border-t border-gray-200">
                <button id="edit-segments-btn" class="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded flex items-center justify-center">
                  <i class="fas fa-edit mr-2"></i>
                  <span>Modifier les segments</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-3">
          <div class="bg-white shadow-md rounded-lg">
            <div class="flex w-full bg-gray-700 rounded-t-lg overflow-hidden">
              <button class="selector-tab flex-1 py-4 px-4 text-center font-medium text-white border-b-2 border-transparent bg-gray-600 shadow-inner" data-tab="demographic">
                <span>Démographique</span>
              </button>
              <button class="selector-tab flex-1 py-4 px-4 text-center font-medium text-gray-300 border-b-2 border-transparent hover:text-white hover:bg-gray-600" data-tab="ticketing">
                <span>Billetterie & Matchday</span>
              </button>
              <button class="selector-tab flex-1 py-4 px-4 text-center font-medium text-gray-300 border-b-2 border-transparent hover:text-white hover:bg-gray-600" data-tab="merchandising">
                <span>Merchandising</span>
              </button>
            </div>
            
            <div class="p-6 min-h-[200px]">
              <div id="tab-content" class="text-center text-gray-500">
                <p>Sélectionnez une catégorie pour afficher les informations détaillées</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-3">
          <div class="bg-white shadow-md rounded-lg">
            <div class="flex w-full bg-gray-700 rounded-t-lg overflow-hidden">
              <button class="marketing-tab flex-1 py-4 px-4 text-center font-medium text-white border-b-2 border-transparent bg-gray-600 shadow-inner">
                <span>Campagnes Marketing</span>
              </button>
            </div>
            
            <div class="p-6 min-h-[200px]">
              <div id="marketing-content" class="text-gray-900">
                <table class="min-w-full divide-y divide-gray-300">
                  <tbody class="divide-y divide-gray-200">
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-bullhorn text-gray-500 mr-3"></i>
                          Campagnes reçues (all-type) <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-all"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${13 + Math.floor(fan.id % 10)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center pl-10">
                          <i class="fas fa-envelope text-gray-500 mr-3"></i>
                          Emails <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-email"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${8 + Math.floor(fan.id % 6)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center pl-10">
                          <i class="fab fa-google text-gray-500 mr-3"></i>
                          Google Ads <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-google"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${2 + Math.floor(fan.id % 3)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center pl-10">
                          <i class="fab fa-facebook text-gray-500 mr-3"></i>
                          Meta Ads <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-meta"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${2 + Math.floor(fan.id % 4)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center pl-10">
                          <i class="fab fa-whatsapp text-gray-500 mr-3"></i>
                          WhatsApp <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-whatsapp"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${1 + Math.floor(fan.id % 2)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center pl-10">
                          <i class="fab fa-google text-gray-500 mr-3"></i>
                          Campagnes bien targetées par Google Ads <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-targeted-google"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${1 + Math.floor(fan.proximityRating / 20)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center pl-10">
                          <i class="fab fa-facebook text-gray-500 mr-3"></i>
                          Campagnes bien targetées par Meta Ads <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-campaigns-targeted-meta"></i>
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        <span>${1 + Math.floor(fan.proximityRating / 25)}</span>
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-mouse-pointer text-gray-500 mr-3"></i>
                          Nombre de clics (all-time)
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${8 + Math.floor(fan.proximityRating / 10)}</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-euro-sign text-gray-500 mr-3"></i>
                          Coût total campagnes
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${30 + Math.floor(fan.id * 2.5)} €</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-hand-pointer text-gray-500 mr-3"></i>
                          Coût par clic
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${((30 + Math.floor(fan.id * 2.5)) / (8 + Math.floor(fan.proximityRating / 10))).toFixed(2)} €</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-shopping-cart text-gray-500 mr-3"></i>
                          Valeur de conversion
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${75 + Math.floor(fan.proximityRating * 1.5)} €</td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-percentage text-gray-500 mr-3"></i>
                          Click Through Rate (all-time)
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        ${(() => {
                const rate = 12 + Math.floor(fan.proximityRating / 4);
                let bgColor = '';
                let textColor = '';
                if (rate < 20) {
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                }
                else if (rate < 30) {
                    bgColor = 'bg-orange-100';
                    textColor = 'text-orange-800';
                }
                else if (rate < 40) {
                    bgColor = 'bg-blue-100';
                    textColor = 'text-blue-800';
                }
                else {
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                }
                return `<span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}">${rate}%</span>`;
            })()}
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-exchange-alt text-gray-500 mr-3"></i>
                          Taux de conversion (all-time)
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
                        ${(() => {
                const rate = 5 + Math.floor(fan.proximityRating / 6);
                let bgColor = '';
                let textColor = '';
                if (rate < 10) {
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                }
                else if (rate < 15) {
                    bgColor = 'bg-orange-100';
                    textColor = 'text-orange-800';
                }
                else if (rate < 20) {
                    bgColor = 'bg-blue-100';
                    textColor = 'text-blue-800';
                }
                else {
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                }
                return `<span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}">${rate}%</span>`;
            })()}
                      </td>
                    </tr>
                    <tr class="border-b border-gray-200">
                      <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
                        <span class="flex items-center">
                          <i class="fas fa-chart-line text-gray-500 mr-3"></i>
                          ROI (all time)
                        </span>
                      </td>
                      <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">
                        ${(() => {
                const roi = Math.floor((75 + Math.floor(fan.proximityRating * 1.5)) / (30 + Math.floor(fan.id * 2.5)) * 100);
                let bgColor = '';
                let textColor = '';
                if (roi < 100) {
                    bgColor = 'bg-red-100';
                    textColor = 'text-red-800';
                }
                else if (roi < 150) {
                    bgColor = 'bg-yellow-100';
                    textColor = 'text-yellow-800';
                }
                else if (roi < 200) {
                    bgColor = 'bg-blue-100';
                    textColor = 'text-blue-800';
                }
                else {
                    bgColor = 'bg-green-100';
                    textColor = 'text-green-800';
                }
                return `<span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${bgColor} ${textColor}">${roi}%</span>`;
            })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="mb-[100px]"></div>
      `;
            // Add event listener to regenerate button
            const regenerateButton = document.getElementById('regenerate-fan-insight');
            if (regenerateButton) {
                regenerateButton.addEventListener('click', () => {
                    // Simulate regenerating insight
                    regenerateButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>Génération...</span>`;
                    regenerateButton.disabled = true;
                    setTimeout(() => {
                        // Cycle to the next template
                        const fanTemplateIndices = window.fanTemplateIndices;
                        fanTemplateIndices[fan.id] = (fanTemplateIndices[fan.id] + 1) % 3;
                        // Update with a different template
                        populateFanProfile(fan);
                    }, 1200);
                });
            }
            // Add event listeners to the selector tabs
            const selectorTabs = document.querySelectorAll('.selector-tab');
            const tabContent = document.getElementById('tab-content');
            if (selectorTabs.length > 0 && tabContent) {
                selectorTabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Remove active state from all tabs
                        selectorTabs.forEach(t => {
                            t.classList.remove('text-white', 'bg-gray-600', 'shadow-inner');
                            t.classList.add('text-gray-300');
                        });
                        // Add active state to clicked tab
                        tab.classList.remove('text-gray-300');
                        tab.classList.add('text-white', 'bg-gray-600', 'shadow-inner');
                        // Update content based on selected tab
                        const tabType = tab.getAttribute('data-tab');
                        if (tabType === 'demographic') {
                            // ... demographic tab content generation code ...
                            showDemographicTab(fan, tabContent);
                        }
                        else if (tabType === 'ticketing') {
                            showTicketingTab(fan, tabContent);
                        }
                        else if (tabType === 'merchandising') {
                            showMerchandisingTab(fan, tabContent);
                        }
                    });
                });
                // Automatically select the demographic tab (first tab) when the page loads
                const demographicTab = document.querySelector('.selector-tab[data-tab="demographic"]');
                if (demographicTab) {
                    demographicTab.click();
                }
            }
        }
        // Setup segments editor after content is loaded
        setupSegmentsEditor();
        // Get marketing content element
        const marketingContent = document.getElementById('marketing-content');
        if (marketingContent) {
            // Add event listeners for the marketing campaign buttons
            setTimeout(() => {
                // All campaigns button
                const viewAllCampaignsButton = document.getElementById('view-campaigns-all');
                if (viewAllCampaignsButton) {
                    viewAllCampaignsButton.addEventListener('click', () => {
                        const campaignsData = generateCampaignData(13 + Math.floor(fan.id % 10), 'all');
                        showMarketingDetailsPopup('Détail des campagnes marketing', campaignsData, ['Date', 'Name', 'Type', 'Status', 'Clicks', 'CTR', 'Cost', 'Result', 'Action']);
                    });
                }
                // Email campaigns button
                const viewEmailCampaignsButton = document.getElementById('view-campaigns-email');
                if (viewEmailCampaignsButton) {
                    viewEmailCampaignsButton.addEventListener('click', () => {
                        const campaignsData = generateCampaignData(8 + Math.floor(fan.id % 6), 'email');
                        showMarketingDetailsPopup('Détail des campagnes email', campaignsData, ['Date', 'Name', 'Status', 'Clicks', 'CTR', 'Cost', 'Result', 'Action']);
                    });
                }
                // Google Ads campaigns button
                const viewGoogleCampaignsButton = document.getElementById('view-campaigns-google');
                if (viewGoogleCampaignsButton) {
                    viewGoogleCampaignsButton.addEventListener('click', () => {
                        const campaignsData = generateCampaignData(2 + Math.floor(fan.id % 3), 'google');
                        showMarketingDetailsPopup('Détail des campagnes Google Ads', campaignsData, ['Date', 'Name', 'Status', 'Clicks', 'CTR', 'Cost', 'Result', 'Action']);
                    });
                }
                // Meta Ads campaigns button
                const viewMetaCampaignsButton = document.getElementById('view-campaigns-meta');
                if (viewMetaCampaignsButton) {
                    viewMetaCampaignsButton.addEventListener('click', () => {
                        const campaignsData = generateCampaignData(2 + Math.floor(fan.id % 4), 'meta');
                        showMarketingDetailsPopup('Détail des campagnes Meta Ads', campaignsData, ['Date', 'Name', 'Status', 'Clicks', 'CTR', 'Cost', 'Result', 'Action']);
                    });
                }
                // WhatsApp campaigns button
                const viewWhatsAppCampaignsButton = document.getElementById('view-campaigns-whatsapp');
                if (viewWhatsAppCampaignsButton) {
                    viewWhatsAppCampaignsButton.addEventListener('click', () => {
                        const campaignsData = generateCampaignData(1 + Math.floor(fan.id % 2), 'whatsapp');
                        showMarketingDetailsPopup('Détail des campagnes WhatsApp', campaignsData, ['Date', 'Name', 'Status', 'Clicks', 'CTR', 'Cost', 'Result', 'Action']);
                    });
                }
                // Targeted Google Ads campaigns button
                const viewTargetedGoogleButton = document.getElementById('view-campaigns-targeted-google');
                if (viewTargetedGoogleButton) {
                    viewTargetedGoogleButton.addEventListener('click', () => {
                        const campaignsCount = 1 + Math.floor(fan.proximityRating / 20);
                        const campaignsData = generateCampaignData(campaignsCount, 'google');
                        showTargetedCampaignDetailsPopup('Campagnes ciblées Google Ads', campaignsData, fan);
                    });
                }
                // Targeted Meta Ads campaigns button
                const viewTargetedMetaButton = document.getElementById('view-campaigns-targeted-meta');
                if (viewTargetedMetaButton) {
                    viewTargetedMetaButton.addEventListener('click', () => {
                        const campaignsCount = 1 + Math.floor(fan.proximityRating / 25);
                        const campaignsData = generateCampaignData(campaignsCount, 'meta');
                        showTargetedCampaignDetailsPopup('Campagnes ciblées Meta Ads', campaignsData, fan);
                    });
                }
            }, 100);
        }
        // Setup the fan profile handlers
        setupFanProfileHandlers(fan);
    };
    // Setup fan profile action buttons
    const setupFanProfileButtons = (fan) => {
        // Export button
        const exportButton = document.getElementById('export-fan-btn');
        if (exportButton) {
            exportButton.addEventListener('click', () => {
                alert(`Exporting data for ${fan.firstName} ${fan.lastName}. In a real app, this would download a CSV or PDF file.`);
            });
        }
        // Delete button
        const deleteButton = document.getElementById('delete-fan-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                const confirmDelete = confirm(`Are you sure you want to delete ${fan.firstName} ${fan.lastName}?`);
                if (confirmDelete) {
                    // Remove fan from array
                    fans = fans.filter(f => f.id !== fan.id);
                    // Go back to fans list
                    const fanbaseFlow = document.getElementById('fanbase-flow');
                    if (fanbaseFlow) {
                        document.querySelectorAll('.flow-container').forEach(container => {
                            container.classList.remove('active');
                        });
                        fanbaseFlow.classList.add('active');
                    }
                    // Re-render table
                    renderTable();
                }
            });
        }
    };
    // Set initial active item
    setActiveNavItem();
    // Display demographic tab content
    const showDemographicTab = (fan, tabContent) => {
        // Calculate additional fan data (reusing code from AI Insight)
        const ageBase = fan.id % 40 + 18; // Ages 18-57
        const ageRange = `${ageBase}-${ageBase + 5}`;
        // Location based on ID
        const locations = [
            "Paris", "Marseille", "Lyon", "Toulouse", "Nice",
            "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"
        ];
        const location = locations[fan.id % locations.length];
        // Job based on ID
        const jobs = [
            "Ingénieur", "Médecin", "Enseignant", "Commercial", "Étudiant",
            "Développeur", "Consultant", "Entrepreneur", "Manager", "Architecte"
        ];
        const job = jobs[fan.id % jobs.length];
        const previousJobs = jobs[(fan.id + 3) % jobs.length] + ", " + jobs[(fan.id + 7) % jobs.length];
        // Income bracket based on total value
        const incomeBrackets = [
            "20,000€ - 30,000€", "30,000€ - 50,000€", "50,000€ - 70,000€",
            "70,000€ - 100,000€", "100,000€+"
        ];
        const incomeBracketIndex = Math.min(Math.floor(fan.totalValue / 20), incomeBrackets.length - 1);
        const incomeBracket = incomeBrackets[incomeBracketIndex];
        // Household size based on ID
        const householdSize = (fan.id % 5) + 1;
        // Calculate spending breakdown (ticketing vs merchandise)
        const ticketingPercentage = 60 + (fan.id % 30);
        const ticketingValue = Math.floor(fan.totalValue * ticketingPercentage / 100);
        const merchValue = Math.floor(fan.totalValue - ticketingValue);
        // Determine color for proximity
        let proximityClass = '';
        if (fan.proximityRating < 30) {
            proximityClass = 'bg-red-100 text-red-800';
        }
        else if (fan.proximityRating < 55) {
            proximityClass = 'bg-yellow-100 text-yellow-800';
        }
        else if (fan.proximityRating < 85) {
            proximityClass = 'bg-blue-100 text-blue-800';
        }
        else if (fan.proximityRating < 95) {
            proximityClass = 'bg-green-100 text-green-800';
        }
        else {
            proximityClass = 'bg-yellow-100 text-yellow-800'; // Gold for 95%+
        }
        // Gender bubble class
        const genderClass = fan.gender === 'male'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-pink-100 text-pink-800';
        tabContent.innerHTML = `
      <table class="w-full">
        <tbody class="divide-y divide-gray-200">
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-birthday-cake text-gray-500 mr-3"></i>
                Âge
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${ageRange} ans</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-venus-mars text-gray-500 mr-3"></i>
                Genre
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${genderClass}">
                ${fan.gender === 'male' ? 'Male' : 'Female'}
              </span>
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-chart-line text-gray-500 mr-3"></i>
                Score de proximité
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${proximityClass}">
                ${fan.proximityRating}%
              </span>
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-map-marker-alt text-gray-500 mr-3"></i>
                Zone d'habitation
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${location}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-briefcase text-gray-500 mr-3"></i>
                Emploi actuel
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${job}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-history text-gray-500 mr-3"></i>
                Emplois précédents
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${previousJobs}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-euro-sign text-gray-500 mr-3"></i>
                Tranche de revenus
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${incomeBracket}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-users text-gray-500 mr-3"></i>
                Taille du foyer
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${householdSize} ${householdSize > 1 ? 'personnes' : 'personne'}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-shopping-cart text-gray-500 mr-3"></i>
                Panier total (all-time)
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${fan.totalValue.toFixed(2)} €</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-ticket-alt text-gray-500 mr-3"></i>
                Panier billetterie (all-time)
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${ticketingValue.toFixed(2)} €</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-tshirt text-gray-500 mr-3"></i>
                Panier merchandising (all-time)
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${merchValue.toFixed(2)} €</td>
          </tr>
        </tbody>
      </table>
    `;
    };
    // Display ticketing tab content
    const showTicketingTab = (fan, tabContent) => {
        // Generate mock data based on fan id
        const ticketCount = 8 + Math.floor(fan.proximityRating / 10);
        const seatsPerMatch = 1 + Math.floor(fan.id % 4);
        const matchesAttended = 5 + Math.floor(fan.proximityRating / 15);
        // Preferred seating zones
        const allZones = ["Tribune Boulogne", "Tribune Paris", "Tribune Auteuil", "Tribune Borelli", "Présidentielle"];
        const primaryZone = allZones[fan.id % allZones.length];
        const secondaryZone = allZones[(fan.id + 2) % allZones.length];
        // Calculate arrival time (in minutes before match)
        const arrivalMinutes = 20 + Math.floor(fan.id % 40);
        // Most frequently attended clubs
        const allClubs = ["OM", "OL", "Monaco", "Lille", "Rennes", "Nantes", "Lens", "Bordeaux", "St. Etienne"];
        const mostAttendedClubs = [];
        for (let i = 0; i < 3; i++) {
            mostAttendedClubs.push(allClubs[(fan.id + i) % allClubs.length]);
        }
        // Least attended clubs (maximum of 5)
        const leastAttendedClubs = [];
        for (let i = 0; i < 5; i++) {
            leastAttendedClubs.push(allClubs[(fan.id + i + 5) % allClubs.length]);
        }
        // Distance from stadium in kilometers
        const distanceKm = 1 + Math.floor(fan.id % 25); // 1-25 km
        // Transportation options to stadium
        const carMinutes = Math.floor(distanceKm * 1.5); // ~40 km/h average speed
        const publicTransportMinutes = Math.floor(distanceKm * 2.5); // slower than car
        const publicTransportChanges = Math.floor(distanceKm / 8); // more changes with distance
        // Average ticket price
        const avgTicketPrice = 40 + Math.floor(fan.id % 80); // 40-120 €
        // Total ticketing spending
        const ticketingSpending = ticketCount * avgTicketPrice;
        // Generate mock ticket details for popup
        const generateTicketDetails = () => {
            const tickets = [];
            for (let i = 0; i < ticketCount; i++) {
                const matchDate = new Date();
                matchDate.setDate(matchDate.getDate() - (i * 20) - Math.floor(Math.random() * 10));
                const opponent = allClubs[Math.floor(Math.random() * allClubs.length)];
                const price = avgTicketPrice - 10 + Math.floor(Math.random() * 20);
                const zone = Math.random() > 0.7 ? secondaryZone : primaryZone;
                tickets.push({
                    date: matchDate.toLocaleDateString('fr-FR'),
                    match: `PSG vs ${opponent}`,
                    price: `${price} €`,
                    zone: zone,
                    seats: seatsPerMatch
                });
            }
            return tickets;
        };
        // Generate mock matches for popup
        const generateMatchDetails = () => {
            const matches = [];
            for (let i = 0; i < matchesAttended; i++) {
                const matchDate = new Date();
                matchDate.setDate(matchDate.getDate() - (i * 30) - Math.floor(Math.random() * 15));
                const opponent = i < 3 ? mostAttendedClubs[i % mostAttendedClubs.length] : allClubs[Math.floor(Math.random() * allClubs.length)];
                const result = Math.random() > 0.2 ? "Victoire" : (Math.random() > 0.5 ? "Nul" : "Défaite");
                const score = result === "Victoire" ? `${1 + Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 2)}` :
                    (result === "Nul" ? `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}` :
                        `${Math.floor(Math.random() * 2)}-${1 + Math.floor(Math.random() * 3)}`);
                matches.push({
                    date: matchDate.toLocaleDateString('fr-FR'),
                    match: `PSG vs ${opponent}`,
                    result: result,
                    score: score,
                    competition: Math.random() > 0.7 ? "Ligue 1" : (Math.random() > 0.5 ? "Coupe de France" : "Champions League")
                });
            }
            return matches;
        };
        // Create popup for showing details
        const showDetailsPopup = (title, items, columns) => {
            var _a;
            // Create modal container
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 flex items-center justify-center z-50';
            // Create backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'fixed inset-0 bg-black bg-opacity-50';
            backdrop.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            // Create modal content
            const content = document.createElement('div');
            content.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden relative z-10';
            // Create header
            const header = document.createElement('div');
            header.className = 'bg-gray-800 text-white px-6 py-4 flex justify-between items-center';
            header.innerHTML = `
        <h3 class="text-xl font-semibold">${title}</h3>
        <button class="text-white hover:text-gray-300">
          <i class="fas fa-times"></i>
        </button>
      `;
            (_a = header.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            // Create body with table
            const body = document.createElement('div');
            body.className = 'p-6 overflow-auto max-h-[calc(80vh-120px)]';
            // Create table
            const table = document.createElement('table');
            table.className = 'min-w-full divide-y divide-gray-200';
            // Create table header
            const thead = document.createElement('thead');
            thead.className = 'bg-gray-50';
            const headerRow = document.createElement('tr');
            columns.forEach(column => {
                const th = document.createElement('th');
                th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
                th.textContent = column;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            // Create table body
            const tbody = document.createElement('tbody');
            tbody.className = 'bg-white divide-y divide-gray-200';
            items.forEach((item, index) => {
                const row = document.createElement('tr');
                row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                columns.forEach(column => {
                    const td = document.createElement('td');
                    td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                    td.textContent = item[column.toLowerCase()] || '';
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            body.appendChild(table);
            // Assemble modal
            content.appendChild(header);
            content.appendChild(body);
            modal.appendChild(backdrop);
            modal.appendChild(content);
            document.body.appendChild(modal);
        };
        tabContent.innerHTML = `
      <table class="w-full">
        <tbody class="divide-y divide-gray-200">
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-ticket-alt text-gray-500 mr-3"></i>
                Billets achetés <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-tickets"></i>
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              <span>${ticketCount} billets</span>
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-futbol text-gray-500 mr-3"></i>
                Matchs assistés <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-matches"></i>
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              <span>${matchesAttended} matchs</span>
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-chair text-gray-500 mr-3"></i>
                Places moyennes par match
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${seatsPerMatch} place${seatsPerMatch > 1 ? 's' : ''}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-map-marker-alt text-gray-500 mr-3"></i>
                Zones préférées
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${primaryZone}, ${secondaryZone}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-clock text-gray-500 mr-3"></i>
                Arrivée moyenne avant match
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${arrivalMinutes} minutes</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-star text-gray-500 mr-3"></i>
                Oppositions fréquentes
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${mostAttendedClubs.join(', ')}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-thumbs-down text-gray-500 mr-3"></i>
                Oppositions évitées
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${leastAttendedClubs.slice(0, 3).join(', ')}${leastAttendedClubs.length > 3 ? '...' : ''}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-map text-gray-500 mr-3"></i>
                Distance du stade
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${distanceKm} km</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-car text-gray-500 mr-3"></i>
                Accès au stade
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">Voiture (${carMinutes} min), Transports (${publicTransportMinutes} min, ${publicTransportChanges} changement${publicTransportChanges > 1 ? 's' : ''})</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-tag text-gray-500 mr-3"></i>
                Prix moyen des places
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${avgTicketPrice} €</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-euro-sign text-gray-500 mr-3"></i>
                Dépense totale billetterie
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${ticketingSpending} €</td>
          </tr>
        </tbody>
      </table>
    `;
        // Add event listeners for the buttons
        setTimeout(() => {
            const viewTicketsButton = document.getElementById('view-tickets');
            if (viewTicketsButton) {
                viewTicketsButton.addEventListener('click', () => {
                    const ticketDetails = generateTicketDetails();
                    showDetailsPopup('Détail des billets achetés', ticketDetails, ['Date', 'Match', 'Zone', 'Seats', 'Price']);
                });
            }
            const viewMatchesButton = document.getElementById('view-matches');
            if (viewMatchesButton) {
                viewMatchesButton.addEventListener('click', () => {
                    const matchDetails = generateMatchDetails();
                    showDetailsPopup('Détail des matchs assistés', matchDetails, ['Date', 'Match', 'Competition', 'Result', 'Score']);
                });
            }
        }, 100);
    };
    // Setup fan profile handler functions
    const setupFanProfileHandlers = (fan) => {
        setupFanProfileButtons(fan);
        setupSegmentsEditor();
    };
    // Setup segments editor
    const setupSegmentsEditor = () => {
        const editButton = document.getElementById('edit-segments-btn');
        const segmentsList = document.getElementById('segments-list');
        let isEditMode = false;
        if (editButton && segmentsList) {
            editButton.addEventListener('click', () => {
                isEditMode = !isEditMode;
                if (isEditMode) {
                    // Change button text and style
                    editButton.innerHTML = '<i class="fas fa-check mr-2"></i><span>Terminer</span>';
                    editButton.classList.remove('bg-gray-200', 'hover:bg-gray-300');
                    editButton.classList.add('bg-green-100', 'hover:bg-green-200', 'text-green-700');
                    // Add delete icons to all segment items
                    const segmentItems = segmentsList.querySelectorAll('.segment-item');
                    segmentItems.forEach(item => {
                        item.classList.add('pr-7'); // Add padding for cross icon
                        item.innerHTML = item.textContent + '<i class="fas fa-times delete-segment ml-1"></i>';
                        // Add click handler for delete icon
                        const deleteIcon = item.querySelector('.delete-segment');
                        if (deleteIcon) {
                            deleteIcon.addEventListener('click', (e) => {
                                var _a;
                                e.stopPropagation();
                                const segmentName = ((_a = item.textContent) === null || _a === void 0 ? void 0 : _a.replace('×', '').trim()) || '';
                                const confirmDelete = confirm(`Voulez-vous supprimer le segment "${segmentName}" ?`);
                                if (confirmDelete) {
                                    item.remove();
                                }
                            });
                        }
                    });
                }
                else {
                    // Reset button
                    editButton.innerHTML = '<i class="fas fa-edit mr-2"></i><span>Modifier les segments</span>';
                    editButton.classList.remove('bg-green-100', 'hover:bg-green-200', 'text-green-700');
                    editButton.classList.add('bg-gray-200', 'hover:bg-gray-300');
                    // Remove delete icons
                    const segmentItems = segmentsList.querySelectorAll('.segment-item');
                    segmentItems.forEach(item => {
                        var _a;
                        item.classList.remove('pr-7');
                        item.innerHTML = ((_a = item.textContent) === null || _a === void 0 ? void 0 : _a.replace('×', '').trim()) || '';
                    });
                }
            });
        }
    };
    // Generate fan insight text based on demographics, location, and purchasing behavior
    const generateFanInsight = (fan) => {
        // Define templates with placeholders for dynamic content
        const templates = [
            `${fan.firstName} est une fanne âgée de 21-26 ans qui habite à Toulouse. Actuellement commercial, elle a précédemment travaillé comme consultant, ingénieur et se situe dans une tranche de revenus de 20,000€ - 30,000€. ${fan.firstName} vit dans un foyer de 4 personnes et dépense en moyenne 44€ par place. Sa préférence en matière de merchandising va pour les ballons et les objets collectors, avec un panier total de 17.86€ (dont 11€ en billetterie et 6€ en merchandising). Avec un score de proximité de ${fan.proximityRating}%, elle assiste régulièrement aux matchs contre LOSC Lille et Stade Rennais. Elle a reçu 8 campagnes de communication de notre part. Pour augmenter son engagement qui est actuellement modéré, nous suggérons de lui proposer des offres spéciales pour les matchs contre LOSC Lille. Des packs familiaux seraient également pertinents pour ce profil.`,
            `${fan.firstName} est un supporter loyal depuis 3 ans qui réside à 15km du stade. Avec une proximité de ${fan.proximityRating}%, il est parmi nos fans les plus engagés. Il achète en moyenne 2 places par match et préfère la Tribune Paris. Son panier moyen par saison est de ${fan.totalValue.toFixed(2)}€ dont 65% en billetterie et 35% en produits dérivés. Il préfère venir au stade en voiture (30 minutes) et arrive généralement 45 minutes avant le coup d'envoi. Son taux de réponse aux campagnes marketing est de 72%. Pour maximiser sa valeur, nous recommandons de proposer des offres d'abonnement premium et des invitations aux événements VIP du club.`,
            `Notre analyse montre que ${fan.firstName} est un fan à fort potentiel avec un score d'engagement de ${fan.proximityRating}%. Résidant à Paris, ${fan.gender === 'male' ? 'il' : 'elle'} a un historique d'achat stable avec une préférence pour les matchs contre l'OM et l'OL. Son panier moyen est de ${fan.totalValue.toFixed(2)}€, principalement en billetterie (70%). ${fan.gender === 'male' ? 'Il' : 'Elle'} utilise souvent notre application mobile et a participé à 3 enquêtes de satisfaction. Nos données indiquent qu'${fan.gender === 'male' ? 'il' : 'elle'} est sensible aux offres de dernière minute et préfère les places dans le Virage Auteuil. Nous recommandons de cibler ${fan.gender === 'male' ? 'ce supporter' : 'cette supportrice'} avec nos offres de produits exclusifs et des invitations aux avant-premières des nouveaux maillots.`
        ];
        // Create a consistent mapping of fan ID to template index to ensure the same fan always gets same template
        const fanTemplateIndices = window.fanTemplateIndices = window.fanTemplateIndices || {};
        fanTemplateIndices[fan.id] = fanTemplateIndices[fan.id] || fan.id % templates.length;
        // Return the template with some fan data to make it more personalized
        return templates[fanTemplateIndices[fan.id]];
    };
    // Handle view fan button clicks
    const handleViewFan = (fan) => {
        // Switch to fan profile view
        document.querySelectorAll('.flow-container').forEach(container => {
            container.classList.remove('active');
        });
        const fanProfileFlow = document.getElementById('fan-profile-flow');
        if (fanProfileFlow) {
            fanProfileFlow.classList.add('active');
        }
        // Populate the fan profile content
        populateFanProfile(fan);
        // Setup action buttons
        setupFanProfileButtons(fan);
    };
    // Display merchandising tab content
    const showMerchandisingTab = (fan, tabContent) => {
        // Generate mock data based on fan ID
        const productCount = 5 + Math.floor(fan.id % 20);
        const avgBasketValue = 80 + Math.floor(fan.id % 100);
        const avgItemPrice = Math.floor(avgBasketValue / ((2 + fan.id % 4)));
        const lastPurchaseDate = new Date();
        lastPurchaseDate.setDate(lastPurchaseDate.getDate() - Math.floor(fan.id % 60));
        // Preferred product types
        const productTypes = ["Maillot", "Écharpe", "Casquette", "Sweat", "T-shirt", "Short", "Poster", "Ballon", "Équipement d'entrainement"];
        const favoriteProductType = productTypes[fan.id % productTypes.length];
        const secondProductType = productTypes[(fan.id + 3) % productTypes.length];
        // Store locations
        const shopLocations = [
            "Boutique en ligne", "Boutique Parc des Princes", "Boutique Champs-Élysées",
            "Boutique Forum des Halles", "Revendeur partenaire"
        ];
        const preferredShop = shopLocations[fan.id % shopLocations.length];
        const secondaryShop = shopLocations[(fan.id + 2) % shopLocations.length];
        // Generate data for current cart products
        const generateCurrentCartProducts = () => {
            // Number of products in current cart
            const cartItemCount = 1 + Math.floor(fan.id % 4); // 1-4 items
            const cartProducts = [];
            // Product types and details
            const productNames = [
                "Maillot domicile 23/24",
                "Maillot extérieur 23/24",
                "Short domicile",
                "Écharpe classique",
                "Bonnet hiver",
                "Ballon replica",
                "T-shirt logo club",
                "Veste d'entraînement",
                "Pantalon d'entraînement",
                "Casquette logo",
                "Gourde club",
                "Poster équipe dédicacé"
            ];
            const prices = [89.99, 89.99, 39.99, 24.99, 19.99, 29.99, 34.99, 69.99, 59.99, 19.99, 14.99, 39.99];
            // Generate cart products
            for (let i = 0; i < cartItemCount; i++) {
                const productIndex = (fan.id + i) % productNames.length;
                const quantity = i === 0 && fan.id % 3 === 0 ? 2 : 1; // Sometimes add 2 of same item
                const price = prices[productIndex];
                const today = new Date();
                cartProducts.push({
                    name: productNames[productIndex],
                    price: price,
                    quantity: quantity,
                    total: price * quantity,
                    addedDate: today.toLocaleDateString('fr-FR')
                });
            }
            return cartProducts;
        };
        // Generate mock product details for popup
        const generateProductDetails = () => {
            const products = [];
            for (let i = 0; i < productCount; i++) {
                const purchaseDate = new Date();
                purchaseDate.setDate(purchaseDate.getDate() - (i * 15) - Math.floor(Math.random() * 30));
                const type = i % 3 === 0 ? favoriteProductType : (i % 3 === 1 ? secondProductType : productTypes[Math.floor(Math.random() * productTypes.length)]);
                const price = avgItemPrice - 10 + Math.floor(Math.random() * 20);
                const shop = i % 2 === 0 ? preferredShop : secondaryShop;
                const isBulkOrder = i % 5 === 0;
                products.push({
                    date: purchaseDate.toLocaleDateString('fr-FR'),
                    type: type,
                    description: `${type} PSG ${2020 + Math.floor(Math.random() * 4)}${Math.random() > 0.5 ? ' Domicile' : ' Extérieur'}`,
                    price: `${price} €`,
                    location: shop,
                    quantity: isBulkOrder ? 2 + Math.floor(Math.random() * 3) : 1
                });
            }
            return products;
        };
        // Generate mock basket details
        const generateBasketDetails = () => {
            const baskets = [];
            const basketCount = 3 + Math.floor(fan.id % 5);
            for (let i = 0; i < basketCount; i++) {
                const purchaseDate = new Date();
                purchaseDate.setDate(purchaseDate.getDate() - (i * 45) - Math.floor(Math.random() * 30));
                const itemCount = 1 + Math.floor(Math.random() * 4);
                const totalValue = avgBasketValue - 20 + Math.floor(Math.random() * 40);
                const shop = i % 2 === 0 ? preferredShop : secondaryShop;
                baskets.push({
                    date: purchaseDate.toLocaleDateString('fr-FR'),
                    items: itemCount,
                    value: `${totalValue} €`,
                    location: shop,
                    paymentmethod: Math.random() > 0.7 ? 'Carte Bancaire' : (Math.random() > 0.5 ? 'PayPal' : 'Apple Pay')
                });
            }
            return baskets;
        };
        // Create popup function (re-use from ticketing)
        const showDetailsPopup = (title, items, columns) => {
            var _a;
            // Create modal container
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 flex items-center justify-center z-50';
            // Create backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'fixed inset-0 bg-black bg-opacity-50';
            backdrop.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            // Create modal content
            const content = document.createElement('div');
            content.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden relative z-10';
            // Create header
            const header = document.createElement('div');
            header.className = 'bg-gray-800 text-white px-6 py-4 flex justify-between items-center';
            header.innerHTML = `
        <h3 class="text-xl font-semibold">${title}</h3>
        <button class="text-white hover:text-gray-300">
          <i class="fas fa-times"></i>
        </button>
      `;
            (_a = header.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
            // Create body with table
            const body = document.createElement('div');
            body.className = 'p-6 overflow-auto max-h-[calc(80vh-120px)]';
            // Create table
            const table = document.createElement('table');
            table.className = 'min-w-full divide-y divide-gray-200';
            // Create table header
            const thead = document.createElement('thead');
            thead.className = 'bg-gray-50';
            const headerRow = document.createElement('tr');
            columns.forEach(column => {
                const th = document.createElement('th');
                th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
                th.textContent = column;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            // Create table body
            const tbody = document.createElement('tbody');
            tbody.className = 'bg-white divide-y divide-gray-200';
            items.forEach((item, index) => {
                const row = document.createElement('tr');
                row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
                columns.forEach(column => {
                    const td = document.createElement('td');
                    td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                    td.textContent = item[column.toLowerCase()] || '';
                    row.appendChild(td);
                });
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            body.appendChild(table);
            // Assemble modal
            content.appendChild(header);
            content.appendChild(body);
            modal.appendChild(backdrop);
            modal.appendChild(content);
            document.body.appendChild(modal);
        };
        tabContent.innerHTML = `
      <table class="w-full">
        <tbody class="divide-y divide-gray-200">
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-shopping-bag text-gray-500 mr-3"></i>
                Produits achetés (all-time) <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-products"></i>
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              <span>${productCount} produits</span>
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-tshirt text-gray-500 mr-3"></i>
                Types de produits préférés
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${favoriteProductType}, ${secondProductType}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-money-bill-wave text-gray-500 mr-3"></i>
                Panier total merchandising
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${Math.floor(productCount * avgItemPrice)} €</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-shopping-cart text-gray-500 mr-3"></i>
                Détail du panier <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-baskets"></i>
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              <span>${avgBasketValue} € (moy.)</span>
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-tag text-gray-500 mr-3"></i>
                Prix moyen des articles achetés
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-green-600 text-right">${avgItemPrice} €</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-calendar-alt text-gray-500 mr-3"></i>
                Dernier achat
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${lastPurchaseDate.toLocaleDateString('fr-FR')}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-store text-gray-500 mr-3"></i>
                Boutiques préférées
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${preferredShop}, ${secondaryShop}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-clock text-gray-500 mr-3"></i>
                Temps sur site avant achat
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${5 + Math.floor(fan.id % 15)} minutes</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-shopping-cart text-gray-500 mr-3"></i>
                Articles dans le panier en attente <i class="fas fa-eye text-gray-500 ml-2 cursor-pointer" id="view-current-cart"></i>
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${1 + Math.floor(fan.id % 4)} articles</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-calendar-alt text-gray-500 mr-3"></i>
                Période d'achat principale <i class="fas fa-chart-bar text-gray-500 ml-2 cursor-pointer" id="view-purchase-periods"></i>
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${['Hiver', 'Printemps', 'Été', 'Automne'][fan.id % 4]}</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-map-marker-alt text-gray-500 mr-3"></i>
                Distance boutique physique
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">${3 + Math.floor(fan.id % 20)} km</td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-4 whitespace-nowrap text-[16px] font-normal text-gray-900 w-1/3 text-left">
              <span class="flex items-center">
                <i class="fas fa-route text-gray-500 mr-3"></i>
                Accès à la boutique
              </span>
            </td>
            <td class="py-4 whitespace-nowrap text-[16px] font-bold text-gray-900 text-right">
              ${fan.id % 3 === 0 ? 
                `Voiture: ${10 + Math.floor(fan.id % 15)} minutes` : 
                (fan.id % 3 === 1 ? 
                  `Transports: ${15 + Math.floor(fan.id % 20)} minutes, ${1 + Math.floor(fan.id % 3)} changements` : 
                  `À pied: ${5 + Math.floor(fan.id % 10)} minutes`)}
            </td>
          </tr>
        </tbody>
      </table>
    `;
        // Add event listeners for the buttons
        setTimeout(() => {
            const viewProductsButton = document.getElementById('view-products');
            if (viewProductsButton) {
                viewProductsButton.addEventListener('click', () => {
                    const productDetails = generateProductDetails();
                    showDetailsPopup('Détail des produits achetés', productDetails, ['Date', 'Type', 'Description', 'Price', 'Location', 'Quantity']);
                });
            }
            const viewBasketsButton = document.getElementById('view-baskets');
            if (viewBasketsButton) {
                viewBasketsButton.addEventListener('click', () => {
                    const cartProducts = generateCurrentCartProducts();
                    showDetailsPopup('Détail du panier en cours', cartProducts, ['Name', 'Price', 'Quantity', 'Total', 'AddedDate']);
                });
            }
            
            const viewCurrentCartButton = document.getElementById('view-current-cart');
            if (viewCurrentCartButton) {
                viewCurrentCartButton.addEventListener('click', () => {
                    const cartProducts = generateCurrentCartProducts();
                    showDetailsPopup('Articles dans le panier en attente', cartProducts, ['Name', 'Price', 'Quantity', 'Total', 'AddedDate']);
                });
            }
            
            const viewPurchasePeriodsButton = document.getElementById('view-purchase-periods');
            if (viewPurchasePeriodsButton) {
                viewPurchasePeriodsButton.addEventListener('click', () => {
                    // Generate purchase period data with a GitHub-like distribution
                    const periodData = [];
                    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
                    const currentMonth = new Date().getMonth();
                    
                    for (let i = 0; i < 12; i++) {
                        const monthIndex = (currentMonth - i + 12) % 12;
                        const purchases = i === (fan.id % 12) ? 5 + Math.floor(fan.id % 10) : 
                                         (i === ((fan.id + 3) % 12) ? 3 + Math.floor(fan.id % 7) : 
                                         Math.floor(fan.id % 5));
                        
                        periodData.push({
                            month: months[monthIndex],
                            purchases: purchases,
                            value: `${purchases * avgItemPrice} €`
                        });
                    }
                    
                    showDetailsPopup('Répartition des achats par période', periodData, ['Month', 'Purchases', 'Value']);
                });
            }
        }, 100);
    };
    // Generate campaign data based on fan ID for each type
    const generateCampaignData = (count, type) => {
        const campaigns = [];
        const today = new Date();
        const campaignPrefixes = {
            'all': ['Promo ', 'Offre ', 'Vente ', 'Match ', 'Événement '],
            'email': ['Newsletter ', 'Promo ', 'Annonce ', 'Invitation '],
            'google': ['Search ', 'Display ', 'Shopping ', 'YouTube '],
            'meta': ['Feed ', 'Story ', 'Carousel ', 'Collection '],
            'whatsapp': ['Flash ', 'Info ', 'Alerte ', 'Offre ']
        };
        const campaignSuffixes = [
            'Fin de saison', 'Black Friday', 'Maillot domicile', 'Merchandising',
            'Début de saison', 'Champions League', 'Billetterie', 'Derby', 'Joyeux Noël'
        ];
        const statusOptions = ['Actif', 'Terminé', 'Programmé', 'En pause'];
        const prefixes = campaignPrefixes[type] || campaignPrefixes['all'];
        for (let i = 0; i < count; i++) {
            const campaignDate = new Date();
            campaignDate.setDate(today.getDate() - Math.floor(Math.random() * 90));
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
            const suffix = campaignSuffixes[Math.floor(Math.random() * campaignSuffixes.length)];
            const name = prefix + suffix;
            const clicks = Math.floor(Math.random() * 200) + 5;
            const impressions = clicks * (5 + Math.floor(Math.random() * 20));
            const ctr = ((clicks / impressions) * 100).toFixed(2) + '%';
            const costPerClick = 0.5 + Math.random() * 4.5;
            const cost = (clicks * costPerClick).toFixed(2) + ' €';
            const conversionRate = Math.random() * 0.2;
            const conversions = Math.floor(clicks * conversionRate);
            const result = conversions + (conversions === 1 ? ' conversion' : ' conversions');
            const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
            campaigns.push({
                date: campaignDate.toLocaleDateString('fr-FR'),
                name: name,
                type: type === 'all' ?
                    ['Email', 'Google Ads', 'Meta Ads', 'WhatsApp'][Math.floor(Math.random() * 4)] :
                    type.charAt(0).toUpperCase() + type.slice(1),
                status: status,
                clicks: clicks,
                ctr: ctr,
                cost: cost,
                result: result
            });
        }
        // Sort by date (newest first)
        return campaigns.sort((a, b) => {
            const dateA = new Date(a.date.split('/').reverse().join('-'));
            const dateB = new Date(b.date.split('/').reverse().join('-'));
            return dateB.getTime() - dateA.getTime();
        });
    };
    // Function to display marketing campaign details
    const showMarketingDetailsPopup = (title, items, columns) => {
        var _a;
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center z-50';
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-black bg-opacity-50';
        backdrop.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // Create modal content
        const content = document.createElement('div');
        content.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden relative z-10';
        // Create header
        const header = document.createElement('div');
        header.className = 'bg-gray-800 text-white px-6 py-4 flex justify-between items-center';
        header.innerHTML = `
      <h3 class="text-xl font-semibold">${title}</h3>
      <button class="text-white hover:text-gray-300">
        <i class="fas fa-times"></i>
      </button>
    `;
        (_a = header.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // Create body with table
        const body = document.createElement('div');
        body.className = 'p-6 overflow-auto max-h-[calc(80vh-120px)]';
        // Create table
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        // Create table header
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50';
        const headerRow = document.createElement('tr');
        columns.forEach(column => {
            const th = document.createElement('th');
            th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            th.textContent = column;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Create table body
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            columns.forEach(column => {
                const td = document.createElement('td');
                // Handle action column
                if (column === 'Action') {
                    td.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
                    const actionButton = document.createElement('button');
                    actionButton.className = 'bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-xs font-medium flex items-center';
                    actionButton.innerHTML = '<i class="fas fa-eye mr-1"></i> Voir';
                    actionButton.addEventListener('click', () => {
                        alert(`Redirection vers la page de la campagne "${item.name}"`);
                        document.body.removeChild(modal);
                    });
                    td.appendChild(actionButton);
                }
                else {
                    td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                    td.textContent = item[column.toLowerCase()] || '';
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        body.appendChild(table);
        // Assemble modal
        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(backdrop);
        modal.appendChild(content);
        document.body.appendChild(modal);
    };
    // Function to display targeted campaigns with segments
    const showTargetedCampaignDetailsPopup = (title, items, fan) => {
        var _a;
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 flex items-center justify-center z-50';
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'fixed inset-0 bg-black bg-opacity-50';
        backdrop.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // Create modal content
        const content = document.createElement('div');
        content.className = 'bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden relative z-10';
        // Create header
        const header = document.createElement('div');
        header.className = 'bg-gray-800 text-white px-6 py-4 flex justify-between items-center';
        header.innerHTML = `
      <h3 class="text-xl font-semibold">${title}</h3>
      <button class="text-white hover:text-gray-300">
        <i class="fas fa-times"></i>
      </button>
    `;
        (_a = header.querySelector('button')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        // Create body with table
        const body = document.createElement('div');
        body.className = 'p-6 overflow-auto max-h-[calc(80vh-120px)]';
        // Get segments for this fan based on attributes
        const segments = [];
        // Basic segments based on fan data
        if (fan.totalValue > 500)
            segments.push('Haute valeur');
        if (fan.proximityRating > 70)
            segments.push('Fan local');
        if (fan.proximityRating > 80 && fan.totalValue > 400)
            segments.push('Collectionneur');
        if (Math.random() > 0.5)
            segments.push('Acheteur précoce');
        if (fan.gender === 'female' && fan.id % 40 + 18 >= 20 && fan.id % 40 + 18 <= 30)
            segments.push('Femme 20-30');
        if (fan.id % 40 + 18 < 25)
            segments.push('Étudiant');
        // Create table
        const table = document.createElement('table');
        table.className = 'min-w-full divide-y divide-gray-200';
        // Create table header
        const thead = document.createElement('thead');
        thead.className = 'bg-gray-50';
        const headerRow = document.createElement('tr');
        const columns = ['Date', 'Name', 'Status', 'Clicks', 'CTR', 'Cost', 'Result', 'Segments', 'Action'];
        columns.forEach(column => {
            const th = document.createElement('th');
            th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider';
            th.textContent = column;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
        // Create table body
        const tbody = document.createElement('tbody');
        tbody.className = 'bg-white divide-y divide-gray-200';
        items.forEach((campaign, index) => {
            // Pick random segments for this campaign (2-3 segments)
            const campaignSegments = [...segments];
            // Shuffle array
            for (let i = campaignSegments.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [campaignSegments[i], campaignSegments[j]] = [campaignSegments[j], campaignSegments[i]];
            }
            // Get 2-3 segments or all if less than 2
            const selectedSegments = campaignSegments.slice(0, Math.min(2 + Math.floor(Math.random() * 2), campaignSegments.length));
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            columns.forEach(column => {
                const td = document.createElement('td');
                // Special handling for segments column
                if (column === 'Segments') {
                    td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                    td.innerHTML = selectedSegments.map(segment => `<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-1">${segment}</span>`).join(' ');
                }
                // Handle action column
                else if (column === 'Action') {
                    td.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium';
                    const actionButton = document.createElement('button');
                    actionButton.className = 'bg-gray-700 hover:bg-gray-800 text-white px-3 py-1 rounded text-xs font-medium flex items-center';
                    actionButton.innerHTML = '<i class="fas fa-eye mr-1"></i> Voir';
                    actionButton.addEventListener('click', () => {
                        alert(`Redirection vers la page de la campagne "${campaign.name}"`);
                        document.body.removeChild(modal);
                    });
                    td.appendChild(actionButton);
                }
                else {
                    td.className = 'px-6 py-4 whitespace-nowrap text-sm text-gray-500';
                    td.textContent = campaign[column.toLowerCase()] || '';
                }
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        body.appendChild(table);
        // Assemble modal
        content.appendChild(header);
        content.appendChild(body);
        modal.appendChild(backdrop);
        modal.appendChild(content);
        document.body.appendChild(modal);
    };
    // Initialize the Segments table
    const initSegmentsTable = () => {
        // Generate mock data if not already generated
        if (segments.length === 0) {
            segments = generateSegmentData(20);
        }
        // Set up event listeners
        const rowsPerPageSelect = document.getElementById('segments-rows-per-page');
        const prevPageButton = document.getElementById('segments-prev-page');
        const nextPageButton = document.getElementById('segments-next-page');
        const searchInput = document.querySelector('#segments-flow input[placeholder="Search segments..."]');
        const selectButton = document.querySelector('#segments-flow button:has(.fa-check-square)');
        const addSegmentButton = document.querySelector('#segments-flow button:has(.fa-plus)');
        // Original segments array for filtering
        let originalSegments = [...segments];
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase().trim();
                if (searchTerm === '') {
                    // Reset to original data
                    segments = [...originalSegments];
                }
                else {
                    // Filter segments based on search term
                    segments = originalSegments.filter(segment => segment.name.toLowerCase().includes(searchTerm));
                }
                segmentsCurrentPage = 1; // Reset to first page when searching
                renderSegmentsTable();
            });
        }
        if (selectButton) {
            selectButton.addEventListener('click', () => {
                // Toggle selection mode
                toggleSegmentsSelectionMode(!segmentsSelectModeActive);
                // Important: Re-render the table when selection mode is toggled
                renderSegmentsTable();
            });
        }
        if (addSegmentButton) {
            addSegmentButton.addEventListener('click', () => {
                if (segmentsSelectModeActive && selectedSegments.length > 0) {
                    // Delete selected segments
                    const confirmDelete = confirm(`Are you sure you want to delete ${selectedSegments.length} segment(s)?`);
                    if (confirmDelete) {
                        segments = segments.filter(segment => !selectedSegments.includes(segment.id));
                        originalSegments = [...segments];
                        renderSegmentsTable();
                        // Remain in selection mode but clear selections
                        selectedSegments = [];
                        updateSegmentsSelectionUI();
                    }
                }
                else {
                    // In a real app, this would open a form to add a new segment
                    alert('This would open a form to add a new segment in a real app.');
                }
            });
        }
        if (rowsPerPageSelect) {
            rowsPerPageSelect.addEventListener('change', () => {
                segmentsRowsPerPage = parseInt(rowsPerPageSelect.value);
                segmentsCurrentPage = 1; // Reset to first page when changing rows per page
                renderSegmentsTable();
            });
        }
        if (prevPageButton) {
            prevPageButton.addEventListener('click', () => {
                if (segmentsCurrentPage > 1) {
                    segmentsCurrentPage--;
                    renderSegmentsTable();
                }
            });
        }
        if (nextPageButton) {
            nextPageButton.addEventListener('click', () => {
                if (segmentsCurrentPage < segmentsTotalPages) {
                    segmentsCurrentPage++;
                    renderSegmentsTable();
                }
            });
        }
        // Initial render
        renderSegmentsTable();
    };
    // Render the segments table with current state
    const renderSegmentsTable = () => {
        const tableBody = document.getElementById('segments-table-body');
        const paginationNumbers = document.getElementById('segments-pagination-numbers');
        const showingText = document.getElementById('segments-showing-text');
        if (!tableBody || !paginationNumbers || !showingText)
            return;
        // Calculate pagination
        segmentsTotalPages = Math.ceil(segments.length / segmentsRowsPerPage);
        const startIndex = (segmentsCurrentPage - 1) * segmentsRowsPerPage;
        const endIndex = Math.min(startIndex + segmentsRowsPerPage, segments.length);
        const currentSegments = segments.slice(startIndex, endIndex);
        // Calculate total fan count for percentage calculations
        const totalFanCount = segments.reduce((total, segment) => total + segment.fanCount, 0);
        // Update showing text
        showingText.textContent = `Showing ${startIndex + 1}-${endIndex} of ${segments.length} segments`;
        // Clear previous content
        tableBody.innerHTML = '';
        paginationNumbers.innerHTML = '';
        // Add table rows
        currentSegments.forEach(segment => {
            const row = document.createElement('tr');
            // Add selection checkbox if in selection mode
            if (segmentsSelectModeActive) {
                const isSelected = selectedSegments.includes(segment.id);
                const checkbox = document.createElement('td');
                checkbox.className = 'select-checkbox px-6 py-4 whitespace-nowrap w-12 text-center';
                checkbox.innerHTML = isSelected
                    ? `<div class="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center"><i class="fas fa-check text-xs"></i></div>`
                    : `<div class="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"></div>`;
                row.appendChild(checkbox);
                // Add selection styling
                if (isSelected) {
                    row.classList.add('bg-indigo-50');
                }
                // Add selection related classes
                row.classList.add('cursor-pointer', 'hover:bg-gray-50', 'select-row');
            }
            // Name column
            const nameCell = document.createElement('td');
            nameCell.className = 'px-6 py-4 whitespace-nowrap w-1/7';
            // Generate a consistent color based on the segment id
            const colors = [
                'blue', 'green', 'purple', 'yellow', 'red', 'indigo', 'pink', 'teal', 'orange'
            ];
            const colorIndex = segment.id % colors.length;
            const color = colors[colorIndex];
            nameCell.innerHTML = `
        <div class="flex items-center">
          <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-700">
            ${segment.name}
          </span>
        </div>
      `;
            // Fan Count column
            const fanCountCell = document.createElement('td');
            fanCountCell.className = 'px-6 py-4 whitespace-nowrap text-center w-1/7';
            fanCountCell.innerHTML = `
        <div class="text-gray-900 text-base font-medium">
          ${segment.fanCount.toLocaleString()}
        </div>
      `;
            // Profile percentage column (formerly Percentage column)
            const percentage = segment.profilePercentage;
            const percentageCell = document.createElement('td');
            percentageCell.className = 'px-6 py-4 whitespace-nowrap text-center w-1/7';
            // Determine color based on percentage
            let percentageClass = '';
            if (percentage < 40) {
                percentageClass = 'bg-orange-100 text-orange-800'; // Orange (0-40%)
            }
            else if (percentage < 60) {
                percentageClass = 'bg-yellow-100 text-yellow-800'; // Yellow (40-60%)
            }
            else if (percentage < 80) {
                percentageClass = 'bg-blue-100 text-blue-800'; // Blue (60-80%)
            }
            else {
                percentageClass = 'bg-green-100 text-green-800'; // Green (80%+)
            }
            percentageCell.innerHTML = `
        <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${percentageClass}">
          ${percentage.toFixed(0)}%
        </span>
      `;
            // Creation date column
            const dateCell = document.createElement('td');
            dateCell.className = 'px-6 py-4 whitespace-nowrap w-1/7';
            dateCell.innerHTML = `
        <div class="text-gray-500 text-base">
          ${segment.createdDate.getDate().toString().padStart(2, '0')}/${(segment.createdDate.getMonth() + 1).toString().padStart(2, '0')}/${segment.createdDate.getFullYear()}
        </div>
      `;
            // AI Insight column
            const insightCell = document.createElement('td');
            insightCell.className = 'px-6 py-4 whitespace-nowrap text-center w-1/7';
            // Check if this segment already has insights generated
            const isGenerated = generatedSegmentsInsights.includes(segment.id);
            insightCell.innerHTML = `
        <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm flex items-center space-x-1 mx-auto ${isGenerated ? 'generated' : ''}" data-insight-id="${segment.id}">
          <i class="fas fa-magic"></i>
          <span>Generate</span>
        </button>
      `;
            // Actions column
            const actionsCell = document.createElement('td');
            actionsCell.className = 'px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/7';
            actionsCell.innerHTML = `
        <div class="flex justify-end w-full">
          <button class="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded text-sm flex items-center space-x-1" data-id="${segment.id}">
            <i class="fas fa-eye"></i>
            <span>Voir</span>
          </button>
        </div>
      `;
            row.appendChild(nameCell);
            row.appendChild(fanCountCell);
            row.appendChild(percentageCell);
            row.appendChild(dateCell);
            row.appendChild(insightCell);
            row.appendChild(actionsCell);
            tableBody.appendChild(row);
        });
        // Add click event listeners to the "Voir" buttons
        const viewButtons = tableBody.querySelectorAll('button[data-id]');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const segmentId = e.currentTarget.getAttribute('data-id');
                const segmentIdNum = parseInt(segmentId || '0');
                const selectedSegment = segments.find(segment => segment.id === segmentIdNum);
                if (selectedSegment) {
                    showSegmentDetails(selectedSegment);
                }
            });
        });
        // Add click event listeners to the "Generate" insight buttons
        const generateButtons = tableBody.querySelectorAll('button[data-insight-id]');
        generateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const segmentId = e.currentTarget.getAttribute('data-insight-id');
                const segmentIdNum = parseInt(segmentId || '0');
                const selectedSegment = segments.find(segment => segment.id === segmentIdNum);
                if (!selectedSegment)
                    return;
                // If already generated, just show the modal
                if (button.classList.contains('generated')) {
                    showSegmentInsight(selectedSegment);
                    return;
                }
                // Show loading state
                button.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>`;
                button.disabled = true;
                button.classList.add('opacity-75');
                // Simulate AI generation delay 
                setTimeout(() => {
                    // Reset button state but mark as generated
                    button.innerHTML = `<i class="fas fa-magic"></i><span>Generate</span>`;
                    button.classList.remove('opacity-75');
                    button.disabled = false;
                    // Mark as generated but keep the original colors and hover effects
                    button.classList.add('generated');
                    // Show AI insight in modal
                    showSegmentInsight(selectedSegment);
                }, 1500);
            });
        });
        // Add pagination numbers
        // Always show first page
        addSegmentsPaginationButton(1, paginationNumbers);
        if (segmentsTotalPages <= 5) {
            // Show all pages if 5 or fewer
            for (let i = 2; i <= segmentsTotalPages; i++) {
                addSegmentsPaginationButton(i, paginationNumbers);
            }
        }
        else {
            // Show ellipsis for many pages
            if (segmentsCurrentPage > 2) {
                addSegmentsEllipsis(paginationNumbers);
            }
            // Show pages around current page
            for (let i = Math.max(2, segmentsCurrentPage - 1); i <= Math.min(segmentsTotalPages - 1, segmentsCurrentPage + 1); i++) {
                addSegmentsPaginationButton(i, paginationNumbers);
            }
            if (segmentsCurrentPage < segmentsTotalPages - 1) {
                addSegmentsEllipsis(paginationNumbers);
            }
            // Always show last page
            if (segmentsTotalPages > 1) {
                addSegmentsPaginationButton(segmentsTotalPages, paginationNumbers);
            }
        }
        // Update buttons state
        const prevPageBtn = document.getElementById('segments-prev-page');
        const nextPageBtn = document.getElementById('segments-next-page');
        if (prevPageBtn) {
            prevPageBtn.classList.toggle('opacity-50', segmentsCurrentPage === 1);
            prevPageBtn.classList.toggle('cursor-not-allowed', segmentsCurrentPage === 1);
        }
        if (nextPageBtn) {
            nextPageBtn.classList.toggle('opacity-50', segmentsCurrentPage === segmentsTotalPages);
            nextPageBtn.classList.toggle('cursor-not-allowed', segmentsCurrentPage === segmentsTotalPages);
        }
        // Re-add row selection listeners if in selection mode
        if (segmentsSelectModeActive) {
            addSegmentsRowSelectionListeners();
        }
    };
    // Helper function to add segments pagination button
    const addSegmentsPaginationButton = (pageNum, container) => {
        const button = document.createElement('button');
        button.className = `relative inline-flex items-center px-4 py-2 border ${pageNum === segmentsCurrentPage
            ? 'bg-gray-700 text-white border-gray-700'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} text-sm font-medium`;
        button.textContent = pageNum.toString();
        button.addEventListener('click', () => {
            segmentsCurrentPage = pageNum;
            renderSegmentsTable();
        });
        container.appendChild(button);
    };
    // Helper function to add ellipsis to pagination
    const addSegmentsEllipsis = (container) => {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700';
        ellipsis.textContent = '...';
        container.appendChild(ellipsis);
    };
    // Toggle segments selection mode
    const toggleSegmentsSelectionMode = (active) => {
        // Store the previous state to detect change
        const wasActive = segmentsSelectModeActive;
        // Update state
        segmentsSelectModeActive = active;
        // Reset selections if turning off selection mode
        if (!active) {
            selectedSegments = [];
        }
        
        // Get UI elements
        const selectButton = document.querySelector('#segments-flow button:has(.fa-check-square)') ||
            document.querySelector('#segments-flow button:has(.fa-times)');
        const addSegmentButton = document.querySelector('#segments-flow button:has(.fa-plus)') ||
            document.querySelector('#segments-flow button:has(.fa-trash)');
        const tableRows = document.querySelectorAll('#segments-table-body tr');
        const actionButtons = document.querySelectorAll('#segments-table-body button[data-id]');
        const exportButtonContainer = document.getElementById('segments-export-button-container');
        const tableHeaderCheckbox = document.getElementById('segments-header-checkbox');
        
        if (active) {
            // Update select button to Cancel
            if (selectButton) {
                selectButton.innerHTML = `
          <i class="fas fa-times"></i>
          <span>Cancel</span>
        `;
                selectButton.classList.remove('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
                selectButton.classList.add('bg-gray-700', 'hover:bg-gray-800', 'text-white');
            }
            
            // Add export button if it doesn't exist
            if (!document.getElementById('segments-export-button') && exportButtonContainer) {
                const exportButton = document.createElement('button');
                exportButton.id = 'segments-export-button';
                exportButton.className = 'bg-gray-300 text-gray-500 py-2 px-4 rounded flex items-center space-x-1 cursor-not-allowed transition-all duration-200';
                exportButton.innerHTML = `
          <i class="fas fa-file-export"></i>
          <span>Export</span>
        `;
                exportButton.disabled = true;
                exportButtonContainer.appendChild(exportButton);
                
                // Add click handler
                exportButton.addEventListener('click', () => {
                    if (selectedSegments.length === 0) return;
                    // In a real app, this would export the selected segments
                    alert(`Exporting ${selectedSegments.length} segment(s). In a real app, this would download a CSV or Excel file.`);
                });
            }
            
            // Change add segment button to delete segment
            if (addSegmentButton) {
                addSegmentButton.innerHTML = `
          <i class="fas fa-trash"></i>
          <span>Delete Segment</span>
        `;
                addSegmentButton.classList.remove('bg-indigo-100', 'hover:bg-indigo-200', 'text-indigo-700');
                addSegmentButton.classList.add('bg-red-100', 'hover:bg-red-200', 'text-red-700');
                
                // Disable delete button initially since no selections yet
                addSegmentButton.disabled = true;
                addSegmentButton.classList.add('opacity-50', 'cursor-not-allowed');
            }
            
            // Make rows selectable with pointer cursor
            tableRows.forEach(row => {
                row.classList.add('cursor-pointer', 'hover:bg-gray-50', 'select-row');
                // Add checkbox column if it doesn't exist
                if (!row.querySelector('.select-checkbox')) {
                    const checkbox = document.createElement('td');
                    checkbox.className = 'select-checkbox px-6 py-4 whitespace-nowrap w-12 text-center';
                    checkbox.innerHTML = `<div class="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center"></div>`;
                    row.insertBefore(checkbox, row.firstChild);
                }
            });
            
            // Add checkbox to table header if needed
            if (tableHeaderCheckbox) {
                tableHeaderCheckbox.style.display = 'table-cell';
            }
        }
        else {
            // Restore select button
            if (selectButton) {
                selectButton.innerHTML = `
          <i class="fas fa-check-square"></i>
          <span>Select</span>
        `;
                selectButton.classList.remove('bg-gray-700', 'hover:bg-gray-800', 'text-white');
                selectButton.classList.add('bg-gray-100', 'hover:bg-gray-200', 'text-gray-700');
            }
            
            // Reset add segment button
            if (addSegmentButton) {
                addSegmentButton.innerHTML = `
          <i class="fas fa-plus"></i>
          <span>Add Segment</span>
        `;
                addSegmentButton.classList.remove('bg-red-100', 'hover:bg-red-200', 'text-red-700', 'opacity-50', 'cursor-not-allowed');
                addSegmentButton.classList.add('bg-indigo-100', 'hover:bg-indigo-200', 'text-indigo-700');
                addSegmentButton.disabled = false;
            }
            
            // Remove export button
            const exportButton = document.getElementById('segments-export-button');
            if (exportButton && exportButtonContainer) {
                exportButtonContainer.removeChild(exportButton);
            }
            
            // Remove selection checkboxes and restore rows
            tableRows.forEach(row => {
                row.classList.remove('cursor-pointer', 'hover:bg-gray-50', 'select-row', 'bg-indigo-50');
                const checkbox = row.querySelector('.select-checkbox');
                if (checkbox) {
                    row.removeChild(checkbox);
                }
            });
            
            // Hide checkbox header if needed
            if (tableHeaderCheckbox) {
                tableHeaderCheckbox.style.display = 'none';
            }
        }
        
        // Add listeners to rows for selection if active
        if (active) {
            addSegmentsRowSelectionListeners();
        }
    };
    // Add click listeners for segment row selection
    const addSegmentsRowSelectionListeners = () => {
        const tableBody = document.getElementById('segments-table-body');
        if (!tableBody) return;
        
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                if (!segmentsSelectModeActive) return;
                
                // Don't trigger if click is on a button
                if (e.target.closest('button')) return;
                
                const checkboxCell = row.querySelector('.select-checkbox');
                if (!checkboxCell) return;
                
                const checkbox = checkboxCell.querySelector('div');
                const segmentId = parseInt(row.querySelector('button[data-id]')?.getAttribute('data-id') || '0');
                if (!segmentId) return;
                
                // Toggle selection
                if (selectedSegments.includes(segmentId)) {
                    // Deselect
                    selectedSegments = selectedSegments.filter(id => id !== segmentId);
                    row.classList.remove('bg-indigo-50');
                    if (checkbox) {
                        checkbox.className = 'w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center';
                        checkbox.innerHTML = '';
                    }
                } else {
                    // Select
                    selectedSegments.push(segmentId);
                    row.classList.add('bg-indigo-50');
                    if (checkbox) {
                        checkbox.className = 'w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center';
                        checkbox.innerHTML = '<i class="fas fa-check text-xs"></i>';
                    }
                }
                
                // Update UI based on selection count
                updateSegmentsSelectionUI();
            });
        });
    };
    // Show segment details
    const showSegmentDetails = (segment) => {
        // Get the segment profile flow container
        const segmentProfileFlow = document.getElementById('segment-profile-flow');
        if (segmentProfileFlow) {
            // Hide all other flows
            document.querySelectorAll('.flow-container').forEach(flow => {
                flow.classList.remove('active');
            });
            
            // Set segment name in the title with colorful bubble
            const segmentNameEl = document.getElementById('segment-profile-name');
            if (segmentNameEl) {
                // Generate a consistent color based on the segment id, same as in the table
                const colors = [
                    'blue', 'green', 'purple', 'yellow', 'red', 'indigo', 'pink', 'teal', 'orange'
                ];
                const colorIndex = segment.id % colors.length;
                const color = colors[colorIndex];
                
                // Update text content
                segmentNameEl.textContent = segment.name;
                
                // Apply color classes with smaller size and less bold font
                segmentNameEl.className = `text-xl font-medium px-3 py-1.5 rounded-full bg-${color}-100 text-${color}-700`;
            }
            
            // Show the segment profile flow
            segmentProfileFlow.classList.add('active');
            
            // Generate segment insight for display in the content area
            const segmentProfileContent = document.getElementById('segment-profile-content');
            if (segmentProfileContent) {
                // Generate segment insights data
                // Calculate fan data
                const percentOfTotal = ((segment.fanCount / segments.reduce((sum, s) => sum + s.fanCount, 0)) * 100).toFixed(1);
                const averageSegmentSize = Math.round(segments.reduce((sum, s) => sum + s.fanCount, 0) / segments.length);
                const comparisonToAverage = Math.round((segment.fanCount / averageSegmentSize) * 100 - 100);
                
                // Profile status text based on percentage
                let profileStatusText = '';
                let profileStatusClass = '';
                if (segment.profilePercentage < 40) {
                    profileStatusText = 'faible';
                    profileStatusClass = 'bg-orange-100 text-orange-800 border-orange-200';
                }
                else if (segment.profilePercentage < 60) {
                    profileStatusText = 'moyen';
                    profileStatusClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                }
                else if (segment.profilePercentage < 80) {
                    profileStatusText = 'bon';
                    profileStatusClass = 'bg-blue-100 text-blue-800 border-blue-200';
                }
                else {
                    profileStatusText = 'excellent';
                    profileStatusClass = 'bg-green-100 text-green-800 border-green-200';
                }
                
                // Generate random statistics for the segment
                const malePercentage = Math.floor(Math.random() * 40) + 30; // 30-70%
                const femalePercentage = 100 - malePercentage;
                const avgAge = Math.floor(Math.random() * 20) + 25; // 25-45
                const engagementRate = (Math.random() * 5 + 2).toFixed(1); // 2.0-7.0%
                const clickThroughRate = (Math.random() * 2 + 0.5).toFixed(1); // 0.5-2.5%
                const purchaseRate = (Math.random() * 1 + 0.2).toFixed(1); // 0.2-1.2%
                // Ticketing and matchday habits
                const avgTicketsPerSeason = Math.floor(Math.random() * 8) + 3; // 3-10 matches
                const avgTicketPrice = Math.floor(Math.random() * 40) + 25; // 25-65€
                const preferredStadiumZones = ['Tribune Paris', 'Tribune Borelli', 'Tribune Boulogne', 'Tribune Auteuil'][Math.floor(Math.random() * 4)];
                const arrivalTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes before match
                const oppositionTeamsAttendance = ['OL', 'Monaco', 'Lille', 'Marseille', 'Nantes'][Math.floor(Math.random() * 5)];
                // Merchandising habits
                const merchPurchaseFrequency = Math.floor(Math.random() * 3) + 1; // 1-3 items per season
                const avgItemPrice = Math.floor(Math.random() * 30) + 20; // 20-50€
                const preferredMerchItems = ['Écharpe', 'T-shirt', 'Maillot', 'Accessoires'][Math.floor(Math.random() * 4)];
                const totalSpentOnMerch = Math.floor(Math.random() * 150) + 50; // 50-200€
                const preferredStore = ['Boutique Parc des Princes', 'Boutique Forum des Halles', 'Boutique en ligne'][Math.floor(Math.random() * 3)];
                // Last update date
                const lastUpdate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
                
                // Generate segment description - use the same text as in showSegmentInsight
                const segmentDescription = `<p>Ce segment contient <strong>${segment.fanCount.toLocaleString()}</strong> fans, ce qui représente <strong>${percentOfTotal}%</strong> de votre base de fans totale. Il est <strong>${comparisonToAverage >= 0 ? `${comparisonToAverage}% plus grand` : `${Math.abs(comparisonToAverage)}% plus petit`}</strong> que la taille moyenne de vos segments. Le pourcentage de profils à jour dans ce segment est de <strong>${segment.profilePercentage}%</strong>, ce qui est considéré comme <strong>${profileStatusText}</strong>. La dernière mise à jour des profils a été effectuée le <strong>${lastUpdate}</strong>. La répartition démographique de ce segment montre <strong>${malePercentage}% d'hommes</strong> et <strong>${femalePercentage}% de femmes</strong>, avec un âge moyen de <strong>${avgAge} ans</strong>. En matière de billetterie, les fans de ce segment assistent en moyenne à <strong>${avgTicketsPerSeason} matches par saison</strong>, avec un prix moyen de <strong>${avgTicketPrice}€ par billet</strong>, préférant majoritairement la zone <strong>${preferredStadiumZones}</strong>. Ils arrivent typiquement <strong>${arrivalTime} minutes</strong> avant le début du match et sont particulièrement présents lors des rencontres contre <strong>${oppositionTeamsAttendance}</strong>. Concernant leur comportement d'achat de merchandising, ils acquièrent environ <strong>${merchPurchaseFrequency} articles par saison</strong> à un prix moyen de <strong>${avgItemPrice}€</strong>, avec une préférence pour les <strong>${preferredMerchItems}</strong>. Leur dépense annuelle moyenne en merchandising est de <strong>${totalSpentOnMerch}€</strong>, principalement dans la <strong>${preferredStore}</strong>. Les métriques d'engagement numériques pour ce segment sont les suivantes: un taux d'engagement de <strong>${engagementRate}%</strong>, un taux de clics de <strong>${clickThroughRate}%</strong>, et un taux d'achat de <strong>${purchaseRate}%</strong>.</p>`;
                
                // Generate recommendations - use the same text as in showSegmentInsight
                const recommendations = `<h4 class="text-lg font-semibold mt-5 mb-2">Recommandations</h4>
                <p>Créez des messages ciblés qui attirent l'audience ${malePercentage > femalePercentage ? 'majoritairement masculine' : 'majoritairement féminine'} de ce segment. Concentrez-vous sur des campagnes pour la tranche d'âge moyenne de ${avgAge} ans. ${segment.profilePercentage < 60 ? 'Améliorez le pourcentage de profils à jour pour obtenir de meilleures données démographiques.' : 'Maintenez le bon niveau de profils à jour pour garantir des données précises.'} ${parseFloat(engagementRate) > 4 ? 'Utilisez le taux d\'engagement élevé de ce segment pour les lancements de nouveaux produits.' : 'Travaillez à améliorer le taux d\'engagement de ce segment avec un contenu plus personnalisé.'} Proposez des offres spéciales pour les matches contre ${oppositionTeamsAttendance} qui attirent particulièrement ce segment. Développez des promotions sur les ${preferredMerchItems}, leur catégorie d'articles préférée, et envisagez des campagnes ciblées dans la ${preferredStore} où ces fans effectuent principalement leurs achats.</p>`;
                
                // Add the content to the segment profile content area
                segmentProfileContent.innerHTML = `
                <div class="grid grid-cols-3 gap-4">
                    <div class="col-span-2">
                        <div class="p-6 bg-white shadow-md rounded-lg h-full">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-xl font-semibold text-gray-800 flex items-center">
                                    <i class="fas fa-magic text-indigo-500 mr-2"></i>
                                    Description du segment
                                </h2>
                                <button id="regenerate-segment-insight" class="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded text-sm flex items-center space-x-1">
                                    <i class="fas fa-sync-alt"></i>
                                    <span>Régénérer</span>
                                </button>
                            </div>
                            
                            <div class="text-left mt-7 overflow-y-auto" style="max-height: 280px;">
                                ${segmentDescription}
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-span-1">
                        <div class="p-6 bg-white shadow-md rounded-lg h-full">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-xl font-semibold text-gray-800 flex items-center">
                                    <i class="fas fa-lightbulb text-yellow-500 mr-2"></i>
                                    Recommandations
                                </h2>
                            </div>
                            
                            <div class="text-left mt-7 overflow-y-auto" style="max-height: 280px;">
                                ${recommendations}
                            </div>
                        </div>
                    </div>
                </div>`;
                
                // Add event listener for regenerate button
                setTimeout(() => {
                    const regenerateButton = document.getElementById('regenerate-segment-insight');
                    if (regenerateButton) {
                        regenerateButton.addEventListener('click', () => {
                            // Show loading state
                            regenerateButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>Génération...</span>`;
                            regenerateButton.disabled = true;
                            
                            // Simulate regeneration delay
                            setTimeout(() => {
                                alert('Regénération des insights pour ce segment...');
                                
                                // Restore button state
                                regenerateButton.innerHTML = `<i class="fas fa-sync-alt"></i><span>Régénérer</span>`;
                                regenerateButton.disabled = false;
                            }, 1200);
                        });
                    }
                }, 100);
                
                // Generate fans table for this segment
                // Get a random subset of fans based on segment.fanCount
                const numFansToShow = Math.min(segment.fanCount, fans.length);
                const segmentFans = [];
                const fanIndices = new Set();
                
                // Ensure we get a random selection without duplicates
                while (fanIndices.size < numFansToShow) {
                    const randomIndex = Math.floor(Math.random() * fans.length);
                    fanIndices.add(randomIndex);
                }
                
                // Create fans array for this segment
                Array.from(fanIndices).forEach(index => {
                    segmentFans.push(fans[index]);
                });
                
                // Variables for fan table pagination
                let segmentFansRowsPerPage = 10;
                let segmentFansCurrentPage = 1;
                
                // Helper function to add pagination buttons
                const addSegmentFansPaginationButton = (pageNum, container) => {
                    const isActive = pageNum === segmentFansCurrentPage;
                    const button = document.createElement('button');
                    button.className = `relative inline-flex items-center px-4 py-2 border ${isActive ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-300 bg-white text-gray-700'} text-sm font-medium`;
                    button.textContent = pageNum;
                    
                    button.addEventListener('click', () => {
                        segmentFansCurrentPage = pageNum;
                        renderSegmentFansTable();
                    });
                    
                    container.appendChild(button);
                };
                
                // Helper function to add ellipsis
                const addSegmentFansEllipsis = (container) => {
                    const span = document.createElement('span');
                    span.className = 'relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700';
                    span.innerHTML = '&hellip;';
                    container.appendChild(span);
                };
                
                // Setup event listeners for the fans table
                const setupSegmentFansEventListeners = () => {
                    // Add event listeners to the "Voir" buttons
                    const viewButtons = document.querySelectorAll('.view-fan-btn');
                    viewButtons.forEach(button => {
                        button.addEventListener('click', (e) => {
                            const fanId = e.currentTarget.getAttribute('data-id');
                            const fanIdNum = parseInt(fanId || '0');
                            const selectedFan = fans.find(fan => fan.id === fanIdNum);
                            if (selectedFan) {
                                showFanProfile(selectedFan);
                            }
                        });
                    });
                    
                    // Add event listeners to the "Generate" insight buttons
                    const generateButtons = document.querySelectorAll('#segment-fans-table-body button[data-insight-id]');
                    generateButtons.forEach(button => {
                        button.addEventListener('click', (e) => {
                            const fanId = e.currentTarget.getAttribute('data-insight-id');
                            const fanIdNum = parseInt(fanId || '0');
                            const selectedFan = fans.find(fan => fan.id === fanIdNum);
                            if (!selectedFan) return;
                            
                            // If already generated, just show the modal
                            if (button.classList.contains('generated')) {
                                showAIInsight(selectedFan);
                                return;
                            }
                            
                            // Show loading state
                            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i><span>Generating...</span>`;
                            button.disabled = true;
                            button.classList.add('opacity-75');
                            
                            // Simulate AI generation delay 
                            setTimeout(() => {
                                // Reset button state but mark as generated
                                button.innerHTML = `<i class="fas fa-magic"></i><span>Generate</span>`;
                                button.classList.remove('opacity-75');
                                button.disabled = false;
                                // Mark as generated but keep the original colors and hover effects
                                button.classList.add('generated');
                                // Show AI insight in modal
                                showAIInsight(selectedFan);
                            }, 1500);
                        });
                    });
                    
                    // Add event listeners for next/prev buttons
                    const prevPageBtn = document.getElementById('segment-fans-prev-page');
                    const nextPageBtn = document.getElementById('segment-fans-next-page');
                    
                    if (prevPageBtn) {
                        prevPageBtn.addEventListener('click', () => {
                            if (segmentFansCurrentPage > 1) {
                                segmentFansCurrentPage--;
                                renderSegmentFansTable();
                            }
                        });
                    }
                    
                    if (nextPageBtn) {
                        nextPageBtn.addEventListener('click', () => {
                            const totalPages = Math.ceil(segmentFans.length / segmentFansRowsPerPage);
                            if (segmentFansCurrentPage < totalPages) {
                                segmentFansCurrentPage++;
                                renderSegmentFansTable();
                            }
                        });
                    }
                    
                    // Add event listener for rows per page selector
                    const rowsSelector = document.getElementById('segment-fans-rows-per-page');
                    if (rowsSelector) {
                        rowsSelector.addEventListener('change', (e) => {
                            segmentFansRowsPerPage = parseInt(e.target.value);
                            segmentFansCurrentPage = 1; // Reset to first page
                            renderSegmentFansTable();
                        });
                    }
                };
                
                // Function to render segment fans table with pagination
                const renderSegmentFansTable = () => {
                    // Calculate pagination
                    const totalPages = Math.ceil(segmentFans.length / segmentFansRowsPerPage);
                    const startIndex = (segmentFansCurrentPage - 1) * segmentFansRowsPerPage;
                    const endIndex = Math.min(startIndex + segmentFansRowsPerPage, segmentFans.length);
                    const currentFansPage = segmentFans.slice(startIndex, endIndex);
                    
                    // Update showing text
                    const showingText = document.getElementById('segment-fans-showing-text');
                    if (showingText) {
                        showingText.textContent = `Showing ${startIndex + 1}-${endIndex} of ${segmentFans.length} fans`;
                    }
                    
                    // Update table body
                    const tableBody = document.getElementById('segment-fans-table-body');
                    if (tableBody) {
                        let tableHTML = '';
                        
                        // Generate rows for current page
                        currentFansPage.forEach(fan => {
                            // Determine proximity class
                            let proximityClass = '';
                            if (fan.proximityRating < 30) {
                                proximityClass = 'bg-red-100 text-red-800';
                            } else if (fan.proximityRating < 55) {
                                proximityClass = 'bg-yellow-100 text-yellow-800';
                            } else if (fan.proximityRating < 85) {
                                proximityClass = 'bg-blue-100 text-blue-800';
                            } else {
                                proximityClass = 'bg-green-100 text-green-800';
                            }
                            
                            // Determine gender class
                            const genderClass = fan.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800';
                            
                            // Format date
                            const formattedDate = `${fan.createdDate.getDate().toString().padStart(2, '0')}/${(fan.createdDate.getMonth() + 1).toString().padStart(2, '0')}/${fan.createdDate.getFullYear()}`;
                            
                            // Check if insight is generated
                            const isGenerated = generatedSegmentsInsights.includes(fan.id) ? 'generated' : '';
                            
                            tableHTML += `
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap w-1/7">
                                    <div class="flex items-center">
                                        <div class="w-full">
                                            <div class="font-medium text-gray-900 text-base truncate max-w-[150px]">
                                                ${fan.firstName} ${fan.lastName.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center w-1/7">
                                    <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${genderClass}">
                                        ${fan.gender}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center w-1/7">
                                    <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${proximityClass}">
                                        ${fan.proximityRating}%
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap w-1/7">
                                    <div class="text-gray-500 text-base">
                                        ${formattedDate}
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-base w-1/7">
                                    <div class="font-medium text-gray-900 text-base">
                                        ${fan.totalValue.toFixed(2)} €
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-center w-1/7">
                                    <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded text-sm flex items-center space-x-1 mx-auto ${isGenerated}" data-insight-id="${fan.id}">
                                        <i class="fas fa-magic"></i>
                                        <span>Generate</span>
                                    </button>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-1/7">
                                    <div class="flex justify-end w-full">
                                        <button class="bg-gray-700 hover:bg-gray-800 text-white py-2 px-4 rounded text-sm flex items-center space-x-1 view-fan-btn" data-id="${fan.id}">
                                            <i class="fas fa-eye"></i>
                                            <span>Voir</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>`;
                        });
                        
                        tableBody.innerHTML = tableHTML;
                    }
                    
                    // Update pagination
                    const paginationNumbers = document.getElementById('segment-fans-pagination-numbers');
                    if (paginationNumbers) {
                        paginationNumbers.innerHTML = '';
                        
                        // Add pagination buttons
                        if (totalPages <= 5) {
                            // Show all pages if 5 or fewer
                            for (let i = 1; i <= totalPages; i++) {
                                addSegmentFansPaginationButton(i, paginationNumbers);
                            }
                        } else {
                            // Show ellipsis for many pages
                            addSegmentFansPaginationButton(1, paginationNumbers);
                            
                            if (segmentFansCurrentPage > 2) {
                                addSegmentFansEllipsis(paginationNumbers);
                            }
                            
                            // Show pages around current page
                            for (let i = Math.max(2, segmentFansCurrentPage - 1); i <= Math.min(totalPages - 1, segmentFansCurrentPage + 1); i++) {
                                addSegmentFansPaginationButton(i, paginationNumbers);
                            }
                            
                            if (segmentFansCurrentPage < totalPages - 1) {
                                addSegmentFansEllipsis(paginationNumbers);
                            }
                            
                            // Always show last page
                            if (totalPages > 1) {
                                addSegmentFansPaginationButton(totalPages, paginationNumbers);
                            }
                        }
                    }
                    
                    // Set up event listeners for buttons
                    setupSegmentFansEventListeners();
                };
                
                // Append a fans table below the component grid
                segmentProfileContent.innerHTML += `
                <div class="mt-8">
                    <div class="bg-white rounded-lg shadow-md overflow-hidden">
                        <!-- Table Header with controls -->
                        <div class="p-4 border-b border-gray-200 flex justify-between items-center">
                            <div class="text-xl font-semibold">Fans in this Segment (${segmentFans.length})</div>
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center">
                                    <label for="segment-fans-rows-per-page" class="mr-2 text-sm text-gray-600">Rows:</label>
                                    <select id="segment-fans-rows-per-page" class="border border-gray-300 rounded px-2 py-1 text-sm">
                                        <option value="10">10</option>
                                        <option value="25">25</option>
                                        <option value="50">50</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Table Content -->
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            Name
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            Gender
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            Proximity
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            Created
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            Value
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            AI Insight
                                        </th>
                                        <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/7">
                                            <div class="flex justify-end w-full">
                                                Actions
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody id="segment-fans-table-body" class="bg-white divide-y divide-gray-200">
                                    <!-- Table rows will be dynamically populated -->
                                </tbody>
                            </table>
                        </div>
                        
                        <!-- Pagination Controls -->
                        <div class="px-4 py-3 border-t border-gray-200 sm:px-6">
                            <div class="flex items-center justify-between">
                                <div class="flex-1 flex justify-between sm:hidden">
                                    <button id="segment-fans-prev-page" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                        Previous
                                    </button>
                                    <button id="segment-fans-next-page" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                        Next
                                    </button>
                                </div>
                                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p id="segment-fans-showing-text" class="text-sm text-gray-700">
                                            Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">20</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            <div id="segment-fans-pagination-numbers" class="flex space-x-1">
                                                <!-- Pagination numbers will be dynamically populated -->
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="h-[200px]"></div>`;
                
                // Render the initial table
                renderSegmentFansTable();
            }
            
            // Setup back button handler
            const backButton = document.getElementById('back-to-segments-btn');
            if (backButton) {
                backButton.addEventListener('click', () => {
                    // Hide segment profile flow
                    segmentProfileFlow.classList.remove('active');
                    
                    // Show segments flow
                    const segmentsFlow = document.getElementById('segments-flow');
                    if (segmentsFlow) {
                        segmentsFlow.classList.add('active');
                    }
                });
            }
            
            // Setup export button handler
            const exportButton = document.getElementById('export-segment-btn');
            if (exportButton) {
                exportButton.addEventListener('click', () => {
                    alert(`Exporting segment "${segment.name}" with ${segment.fanCount} fans.`);
                });
            }
            
            // Setup delete button handler
            const deleteButton = document.getElementById('delete-segment-btn');
            if (deleteButton) {
                deleteButton.addEventListener('click', () => {
                    if (confirm(`Are you sure you want to delete segment "${segment.name}"?`)) {
                        alert(`Segment "${segment.name}" has been deleted.`);
                        
                        // Hide segment profile flow
                        segmentProfileFlow.classList.remove('active');
                        
                        // Show segments flow
                        const segmentsFlow = document.getElementById('segments-flow');
                        if (segmentsFlow) {
                            segmentsFlow.classList.add('active');
                        }
                    }
                });
            }
        }
    };
    // Show segment insight
    const showSegmentInsight = (segment) => {
        // Add to generated segments array if not already included
        if (!generatedSegmentsInsights.includes(segment.id)) {
            generatedSegmentsInsights.push(segment.id);
        }
        // Create a modal to display the insight
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center';
        modal.id = 'segment-insight-modal';
        const modalWidth = window.innerWidth > 768 ? 'max-w-2xl' : 'max-w-full mx-4';
        // Calculate fan data
        const percentOfTotal = ((segment.fanCount / segments.reduce((sum, s) => sum + s.fanCount, 0)) * 100).toFixed(1);
        const averageSegmentSize = Math.round(segments.reduce((sum, s) => sum + s.fanCount, 0) / segments.length);
        const comparisonToAverage = Math.round((segment.fanCount / averageSegmentSize) * 100 - 100);
        // Profile status text based on percentage
        let profileStatusText = '';
        let profileStatusClass = '';
        if (segment.profilePercentage < 40) {
            profileStatusText = 'faible';
            profileStatusClass = 'bg-orange-100 text-orange-800 border-orange-200';
        }
        else if (segment.profilePercentage < 60) {
            profileStatusText = 'moyen';
            profileStatusClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
        else if (segment.profilePercentage < 80) {
            profileStatusText = 'bon';
            profileStatusClass = 'bg-blue-100 text-blue-800 border-blue-200';
        }
        else {
            profileStatusText = 'excellent';
            profileStatusClass = 'bg-green-100 text-green-800 border-green-200';
        }
        // Generate random statistics for the segment
        const malePercentage = Math.floor(Math.random() * 40) + 30; // 30-70%
        const femalePercentage = 100 - malePercentage;
        const avgAge = Math.floor(Math.random() * 20) + 25; // 25-45
        const engagementRate = (Math.random() * 5 + 2).toFixed(1); // 2.0-7.0%
        const clickThroughRate = (Math.random() * 2 + 0.5).toFixed(1); // 0.5-2.5%
        const purchaseRate = (Math.random() * 1 + 0.2).toFixed(1); // 0.2-1.2%
        // Ticketing and matchday habits
        const avgTicketsPerSeason = Math.floor(Math.random() * 8) + 3; // 3-10 matches
        const avgTicketPrice = Math.floor(Math.random() * 40) + 25; // 25-65€
        const preferredStadiumZones = ['Tribune Paris', 'Tribune Borelli', 'Tribune Boulogne', 'Tribune Auteuil'][Math.floor(Math.random() * 4)];
        const arrivalTime = Math.floor(Math.random() * 30) + 15; // 15-45 minutes before match
        const oppositionTeamsAttendance = ['OL', 'Monaco', 'Lille', 'Marseille', 'Nantes'][Math.floor(Math.random() * 5)];
        // Merchandising habits
        const merchPurchaseFrequency = Math.floor(Math.random() * 3) + 1; // 1-3 items per season
        const avgItemPrice = Math.floor(Math.random() * 30) + 20; // 20-50€
        const preferredMerchItems = ['Écharpe', 'T-shirt', 'Maillot', 'Accessoires'][Math.floor(Math.random() * 4)];
        const totalSpentOnMerch = Math.floor(Math.random() * 150) + 50; // 50-200€
        const preferredStore = ['Boutique Parc des Princes', 'Boutique Forum des Halles', 'Boutique en ligne'][Math.floor(Math.random() * 3)];
        // Last update date
        const lastUpdate = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');
        modal.innerHTML = `
      <div class="relative ${modalWidth} bg-white rounded-lg shadow-xl">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-gray-900">Segment Insight: ${segment.name}</h3>
            <button class="text-gray-400 hover:text-gray-500" id="close-insight-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="border-t border-gray-200 pt-4">
            <div class="prose prose-sm text-gray-700">
              <p>Ce segment contient <strong>${segment.fanCount.toLocaleString()}</strong> fans, ce qui représente <strong>${percentOfTotal}%</strong> de votre base de fans totale. Il est <strong>${comparisonToAverage >= 0 ? `${comparisonToAverage}% plus grand` : `${Math.abs(comparisonToAverage)}% plus petit`}</strong> que la taille moyenne de vos segments. Le pourcentage de profils à jour dans ce segment est de <strong>${segment.profilePercentage}%</strong>, ce qui est considéré comme <strong>${profileStatusText}</strong>. La dernière mise à jour des profils a été effectuée le <strong>${lastUpdate}</strong>. La répartition démographique de ce segment montre <strong>${malePercentage}% d'hommes</strong> et <strong>${femalePercentage}% de femmes</strong>, avec un âge moyen de <strong>${avgAge} ans</strong>. En matière de billetterie, les fans de ce segment assistent en moyenne à <strong>${avgTicketsPerSeason} matches par saison</strong>, avec un prix moyen de <strong>${avgTicketPrice}€ par billet</strong>, préférant majoritairement la zone <strong>${preferredStadiumZones}</strong>. Ils arrivent typiquement <strong>${arrivalTime} minutes</strong> avant le début du match et sont particulièrement présents lors des rencontres contre <strong>${oppositionTeamsAttendance}</strong>. Concernant leur comportement d'achat de merchandising, ils acquièrent environ <strong>${merchPurchaseFrequency} articles par saison</strong> à un prix moyen de <strong>${avgItemPrice}€</strong>, avec une préférence pour les <strong>${preferredMerchItems}</strong>. Leur dépense annuelle moyenne en merchandising est de <strong>${totalSpentOnMerch}€</strong>, principalement dans la <strong>${preferredStore}</strong>. Les métriques d'engagement numériques pour ce segment sont les suivantes: un taux d'engagement de <strong>${engagementRate}%</strong>, un taux de clics de <strong>${clickThroughRate}%</strong>, et un taux d'achat de <strong>${purchaseRate}%</strong>.</p>
              
              <h4 class="text-lg font-semibold mt-5 mb-2">Recommandations</h4>
              <p>Créez des messages ciblés qui attirent l'audience ${malePercentage > femalePercentage ? 'majoritairement masculine' : 'majoritairement féminine'} de ce segment. Concentrez-vous sur des campagnes pour la tranche d'âge moyenne de ${avgAge} ans. ${segment.profilePercentage < 60 ? 'Améliorez le pourcentage de profils à jour pour obtenir de meilleures données démographiques.' : 'Maintenez le bon niveau de profils à jour pour garantir des données précises.'} ${parseFloat(engagementRate) > 4 ? 'Utilisez le taux d\'engagement élevé de ce segment pour les lancements de nouveaux produits.' : 'Travaillez à améliorer le taux d\'engagement de ce segment avec un contenu plus personnalisé.'} Proposez des offres spéciales pour les matches contre ${oppositionTeamsAttendance} qui attirent particulièrement ce segment. Développez des promotions sur les ${preferredMerchItems}, leur catégorie d'articles préférée, et envisagez des campagnes ciblées dans la ${preferredStore} où ces fans effectuent principalement leurs achats.</p>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end">
            <button class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded flex items-center space-x-1" id="regenerate-insight">
              <i class="fas fa-sync-alt mr-2"></i> Régénérer
            </button>
          </div>
        </div>
      </div>
    `;
        document.body.appendChild(modal);
        // Add close behavior
        const closeButton = document.getElementById('close-insight-modal');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                document.body.removeChild(modal);
            });
        }
        // Close on click outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        // Regenerate button functionality
        const regenerateButton = document.getElementById('regenerate-insight');
        if (regenerateButton) {
            regenerateButton.addEventListener('click', () => {
                // Show loading state
                const originalContent = regenerateButton.innerHTML;
                regenerateButton.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> Génération...`;
                regenerateButton.classList.add('opacity-75');
                regenerateButton.disabled = true;
                // Simulate AI generation delay then show new insights
                setTimeout(() => {
                    document.body.removeChild(modal);
                    setTimeout(() => {
                        showSegmentInsight(segment);
                    }, 100);
                }, 1000);
            });
        }
    };
    // Update UI based on segment selection count
    const updateSegmentsSelectionUI = () => {
        const deleteSegmentButton = document.querySelector('#segments-flow button:has(.fa-trash)');
        const exportButton = document.getElementById('segments-export-button');
        
        if (selectedSegments.length > 0) {
            // Enable delete button
            if (deleteSegmentButton) {
                deleteSegmentButton.disabled = false;
                deleteSegmentButton.classList.remove('opacity-50', 'cursor-not-allowed');
                deleteSegmentButton.innerHTML = `
          <i class="fas fa-trash"></i>
          <span>Delete Segment${selectedSegments.length > 1 ? 's' : ''}</span>
        `;
            }
            
            // Enable export button
            if (exportButton) {
                exportButton.disabled = false;
                exportButton.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                exportButton.classList.add('bg-green-100', 'text-green-700', 'hover:bg-green-200');
                exportButton.innerHTML = `
          <i class="fas fa-file-export"></i>
          <span>Export${selectedSegments.length > 0 ? ` (${selectedSegments.length})` : ''}</span>
        `;
            }
        } else {
            // Disable delete button
            if (deleteSegmentButton) {
                deleteSegmentButton.disabled = true;
                deleteSegmentButton.classList.add('opacity-50', 'cursor-not-allowed');
                deleteSegmentButton.innerHTML = `
          <i class="fas fa-trash"></i>
          <span>Delete Segment</span>
        `;
            }
            
            // Disable export button
            if (exportButton) {
                exportButton.disabled = true;
                exportButton.classList.remove('bg-green-100', 'text-green-700', 'hover:bg-green-200');
                exportButton.classList.add('bg-gray-300', 'text-gray-500', 'cursor-not-allowed');
                exportButton.innerHTML = `
          <i class="fas fa-file-export"></i>
          <span>Export</span>
        `;
            }
        }
    };
    // ... existing code ...
});
//# sourceMappingURL=client.js.map