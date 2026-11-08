let allResources = [];

const searchBox = document.getElementById("search");
const municipalityFilter = document.getElementById("municipality-filter");
const categoryFilter = document.getElementById("category-filter");
const levelFilter = document.getElementById("level-filter");
const clearButton = document.getElementById("clear-filters");
const resultsContainer = document.getElementById("results");
const resultsCount = document.getElementById("results-count");

// Make category names easier to read.
function formatLabel(value) {
    return String(value || "")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, letter => letter.toUpperCase());
}

// Safely create a text element.
function addTextElement(parent, tag, text, className = "") {
    if (text === undefined || text === null || text === "") {
        return;
    }

    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    parent.appendChild(element);
    return element;
}

// Populate a dropdown with unique values from the database.
function populateFilter(selectElement, values, defaultLabel) {
    const uniqueValues = [...new Set(
        values
            .filter(value => value !== undefined && value !== null)
            .map(value => String(value).trim())
            .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    selectElement.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = defaultLabel;
    selectElement.appendChild(defaultOption);

    uniqueValues.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = formatLabel(value);
        selectElement.appendChild(option);
    });
}

// Load the resource database.
async function loadResources() {
    try {
        const response = await fetch("./data/resources.json");

        if (!response.ok) {
            throw new Error(`Database request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("The resource database must contain a JSON array.");
        }

        allResources = data;

        populateFilter(
            municipalityFilter,
            allResources.map(item => item.municipality),
            "All communities"
        );

        populateFilter(
            categoryFilter,
            allResources.map(item => item.category),
            "All categories"
        );

        populateFilter(
            levelFilter,
            allResources.map(item => item.resource_level),
            "All resource types"
        );

        searchBox.addEventListener("input", filterResources);
        municipalityFilter.addEventListener("change", filterResources);
        categoryFilter.addEventListener("change", filterResources);
        levelFilter.addEventListener("change", filterResources);

        clearButton.addEventListener("click", clearFilters);

        filterResources();

    } catch (error) {
        console.error("Directory loading error:", error);

        resultsCount.textContent = "Resources could not be loaded.";

        resultsContainer.innerHTML = "";

        addTextElement(
            resultsContainer,
            "p",
            "Sorry, the resource directory could not be loaded. Please try refreshing the page. If the problem continues, check the resources.json file.",
            "error-message"
        );
    }
}

// Apply search and all selected filters together.
function filterResources() {
    const searchValue = searchBox.value.trim().toLowerCase();
    const selectedMunicipality = municipalityFilter.value;
    const selectedCategory = categoryFilter.value;
    const selectedLevel = levelFilter.value;

    const filteredResources = allResources.filter(resource => {
        const searchableText = JSON.stringify(resource).toLowerCase();

        const matchesSearch =
            !searchValue || searchableText.includes(searchValue);

        const matchesMunicipality =
            !selectedMunicipality ||
            resource.municipality === selectedMunicipality;

        const matchesCategory =
            !selectedCategory ||
            resource.category === selectedCategory;

        const matchesLevel =
            !selectedLevel ||
            resource.resource_level === selectedLevel;

        return (
            matchesSearch &&
            matchesMunicipality &&
            matchesCategory &&
            matchesLevel
        );
    });

    displayResults(filteredResources);
}

// Reset all filters.
function clearFilters() {
    searchBox.value = "";
    municipalityFilter.value = "";
    categoryFilter.value = "";
    levelFilter.value = "";

    filterResources();
}

// Display matching resources.
function displayResults(resources) {
    resultsContainer.innerHTML = "";

    resultsCount.textContent =
        `Showing ${resources.length} of ${allResources.length} resources`;

    if (resources.length === 0) {
        addTextElement(
            resultsContainer,
            "p",
            "No resources found. Try changing your search or clearing your filters.",
            "empty-message"
        );
        return;
    }

    resources.forEach(resource => {
        const card = document.createElement("article");
        card.className = "resource-card";

        const category = document.createElement("span");
        category.className = "category-tag";
        category.textContent = formatLabel(resource.category || "Resource");
        card.appendChild(category);

        addTextElement(
            card,
            "h3",
            resource.resource_name || "Unnamed Resource",
            "resource-title"
        );

        if (resource.organization) {
            addTextElement(
                card,
                "p",
                resource.organization,
                "organization"
            );
        }

        const details = document.createElement("dl");
        details.className = "resource-details";

        const fields = [
            ["Community", resource.municipality],
            ["Subcategory", formatLabel(resource.subcategory)],
            ["Resource type", formatLabel(resource.resource_level)],
            ["Availability", resource.description],
            [
                "Populations served",
                Array.isArray(resource.populations)
                    ? resource.populations.join(", ")
                    : resource.populations
            ],
            ["Contact", resource.contact],
            ["Email", resource.email],
            ["Phone", resource.phone]
        ];

        fields.forEach(([label, value]) => {
            if (value) {
                const group = document.createElement("div");
                group.className = "detail-row";

                addTextElement(group, "dt", label);
                addTextElement(group, "dd", value);

                details.appendChild(group);
            }
        });

        if (details.children.length > 0) {
            card.appendChild(details);
        }

        // Only create links with valid HTTP or HTTPS addresses.
        if (resource.url) {
            try {
                const url = new URL(resource.url);

                if (url.protocol === "https:" || url.protocol === "http:") {
                    const link = document.createElement("a");
                    link.href = url.href;
                    link.textContent = "Visit resource website";
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.className = "resource-link";

                    card.appendChild(link);
                }
            } catch (error) {
                console.warn(
                    "Invalid resource URL:",
                    resource.resource_name,
                    resource.url
                );
            }
        }

        resultsContainer.appendChild(card);
    });
}

// Start the directory.
loadResources();
