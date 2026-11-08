fetch('data/resources.json')
  .then(res => res.json())
  .then(data => {

    const searchBox =
      document.getElementById('search');

    searchBox.addEventListener('input', () => {

      const value =
        searchBox.value.toLowerCase();

      const results =
        data.filter(item =>
          JSON.stringify(item)
            .toLowerCase()
            .includes(value)
        );

      showResults(results);

    });

    showResults(data);

  });

function showResults(results){

  const container =
    document.getElementById('results');

  container.innerHTML='';

  results.forEach(item => {

    container.innerHTML += `
      <div class="card">
        <h3>${item.resource_name}</h3>

        <p><strong>Organization:</strong>
           ${item.organization}</p>

        <p><strong>Municipality:</strong>
           ${item.municipality}</p>

        <p><strong>Category:</strong>
           ${item.category}</p>

        <p><strong>Population:</strong>
           ${item.populations.join(', ')}</p>

        <p>${item.description}</p>

        <a href="${item.url}" target="_blank">
          Visit Resource
        </a>
      </div>
    `;

  });

}
