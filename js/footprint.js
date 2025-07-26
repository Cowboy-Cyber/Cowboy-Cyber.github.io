// footprint.js
// 只负责渲染地图和列表，地点数据由 index.md 传入

window.renderFootprintMap = function(footprints) {
  const map = L.map('leaflet-map', { scrollWheelZoom: false }).setView([35.8617, 104.1954], 3);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  }).addTo(map);

  let markers = [];
  function renderMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = footprints.map(fp => {
      return L.marker([fp.lat, fp.lng]).addTo(map).bindPopup(fp.name);
    });
  }
  renderMarkers();

  function renderList() {
    const ul = document.getElementById('footprint-list');
    if (!ul) return;
    ul.innerHTML = '';
    footprints.forEach((fp, idx) => {
      const li = document.createElement('li');
      li.textContent = `${fp.name} (${fp.lat}, ${fp.lng})`;
      const delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.style.marginLeft = '10px';
      delBtn.onclick = () => {
        footprints.splice(idx, 1);
        renderList();
        renderMarkers();
      };
      li.appendChild(delBtn);
      ul.appendChild(li);
    });
  }
  renderList();

  const form = document.getElementById('footprint-form');
  if (form) {
    form.onsubmit = function(e) {
      e.preventDefault();
      const name = document.getElementById('fp-name').value.trim();
      const lat = parseFloat(document.getElementById('fp-lat').value);
      const lng = parseFloat(document.getElementById('fp-lng').value);
      if (name && !isNaN(lat) && !isNaN(lng)) {
        footprints.push({ name, lat, lng });
        renderList();
        renderMarkers();
        this.reset();
      }
    };
  }
};
