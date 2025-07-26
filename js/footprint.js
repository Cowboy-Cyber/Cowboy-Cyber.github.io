// footprint.js
// 只负责渲染地图和列表，地点数据由 index.md 传入

window.renderFootprintMap = function(footprints) {
  // 自定义更小的 marker 图标
  const smallIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [16, 26], // 比默认小
    iconAnchor: [8, 26],
    popupAnchor: [1, -24]
  });
  const map = L.map('leaflet-map', { scrollWheelZoom: false }).setView([35.8617, 104.1954], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: ''
  }).addTo(map);

  // 添加右上角重置控件
  const resetDiv = L.DomUtil.create('div', 'leaflet-reset-control');
  resetDiv.style.position = 'absolute';
  resetDiv.style.top = '12px';
  resetDiv.style.right = '12px';
  resetDiv.style.zIndex = 1000;
  resetDiv.style.width = '32px';
  resetDiv.style.height = '32px';
  resetDiv.style.background = '#fff';
  resetDiv.style.borderRadius = '3px';
  resetDiv.style.border = '2px solid #9B9995';
  // resetDiv.style.boxShadow = '0 2px 6px #';
  resetDiv.style.display = 'flex';
  resetDiv.style.alignItems = 'center';
  resetDiv.style.justifyContent = 'center';
  resetDiv.style.cursor = 'pointer';
  resetDiv.title = 'Reset Map View';
  resetDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm1-13h-2v6h4v-2h-2V7z"/></svg>';
  resetDiv.onclick = function() {
    map.setView([35.8617, 104.1954], 2);
  };
  map.getContainer().appendChild(resetDiv);

  let markers = [];
  function renderMarkers() {
    markers.forEach(m => map.removeLayer(m));
    markers = footprints.map(fp => {
      let popupContent = fp.name;
      if (fp.img) {
        popupContent += `<br><img src='${fp.img}' class='no-lightbox' style='max-width:10px;' alt=''>`;
      }
      const marker = L.marker([fp.lat, fp.lng], { icon: smallIcon, title: '' }).addTo(map).bindPopup(popupContent);
      // 移除 marker 图标的 title/aria-label 和 SVG <title>
      if (marker._icon) {
        marker._icon.removeAttribute('title');
        marker._icon.removeAttribute('aria-label');
        const svgTitle = marker._icon.querySelector('title');
        if (svgTitle) svgTitle.remove();
      }
      return marker;
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
      // 如果有图片，插入并禁用 lightbox
      if (fp.img) {
        const img = document.createElement('img');
        img.src = fp.img;
        img.className = 'no-lightbox';
        img.style.maxWidth = '80px';
        img.style.marginLeft = '10px';
        li.appendChild(img);
      }
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
