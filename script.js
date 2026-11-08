let allResources = [];

const searchBox = document.getElementById("search");
const resultsContainer = document.getElementById("results");

async function loadResources() {
    try {
        const response = await fetch("./data/resources.json");

        if (!response.ok) {
            throw new Error(`Could not load resources.json: ${response.status}`);
        }

        allResources = await response.json();

        showResults(allResources);

        searchBox.addEventListener("input", searchResources);

    } catch (error) {
        console.error("Database loading error:", error);

        resultsContainer.textContent =
            "Sorry, the resource database could not be loaded. Please check the JSON file and try again.";
    }
}

function searchResources() {
    const searchValue = searchBox.value.trim().toLowerCase();

    const filteredResources = allResources.filter(resource => {
        return JSON.stringify(resource)
            .toLowerCase()
            .includes(searchValue);
    });

    showResults(filteredResources);
}

function showResults(results) {
    resultsContainer.innerHTML = "";

    if (results.length === 0) {
        resultsContainer.textContent =
            "No resources found. Try a different search.";
        return;
    }

    results.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";

        const title = document.createElement("h3");
        title.textContent = item.resource_name || "Unnamed Resource";
        card.appendChild(title);

        const fields = [
            ["Organization", item.organization],
            ["Municipality", item.municipality],
            ["Category", item.category],
            ["Subcategory", item.subcategory],
            ["Resource Type", item.resource_level],
            ["Availability", item.description],
            ["Populations Served", (item.populations || []).join(", ")]
        ];

        fields.forEach(([label, value]) => {
            if (value) {
                const paragraph = document.createElement("p");
                const strong = document.createElement("strong");

                strong.textContent = label + ": ";
                paragraph.appendChild(strong);
                paragraph.appendChild(
                    document.createTextNode(value)
                );

                card.appendChild(paragraph);
            }
        });

        if (item.url && /^https?:\/\//i.test(item.url)) {
            const link = document.createElement("a");

            link.href = item.url;
            link.textContent = "Visit Resource";
            link.target = "_blank";
            link.rel = "noopener noreferrer";

            card.appendChild(link);
        }

        resultsContainer.appendChild(card);
    });
}

loadResources();
