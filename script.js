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
        <p>${item.organization}</p>
        <p>${item.category}</p>
        <a href="${item.url}"
           target="_blank">
           Visit Resource
        </a>
      </div>
    `;

  });
}
