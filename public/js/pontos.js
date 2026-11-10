/**
 * EcoLixo - Lógica da Página de Pesquisa de Pontos de Coleta (pontos.js)
 * Foco em Pontos Reais de Porto Velho - RO
 */

document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('search-input');
    const citySelect = document.getElementById('city-select');
    const filterButtons = document.querySelectorAll('.filter-chip');
    const pointsGrid = document.getElementById('points-grid');
    const resultsCount = document.getElementById('results-count');
    const searchTiming = document.getElementById('search-timing');

    let currentFilterMaterial = 'todos';
    let debounceTimer = null;

    async function loadCitiesDropdown() {
        if (!citySelect) return;
        citySelect.innerHTML = `
            <option value="">Todos os Bairros de Porto Velho</option>
            <option value="Industrial">Bairro Industrial</option>
            <option value="Flodoaldo">Flodoaldo Pontes Pinto</option>
            <option value="Centro">Centro</option>
            <option value="Pedrinhas">Pedrinhas</option>
            <option value="Nova Floresta">Nova Floresta (Zona Sul)</option>
            <option value="Vila Princesa">Vila Princesa (BR-364)</option>
        `;
    }

    async function fetchPoints() {
        if (!pointsGrid) return;

        const startTime = performance.now();
        pointsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="loading-spinner" style="border-top-color: var(--primary); width: 32px; height: 32px; margin-bottom: 1rem;"></div>
                <div class="empty-title">Pesquisando pontos em Porto Velho - RO...</div>
            </div>
        `;

        const filtroRegiao = citySelect ? citySelect.value : '';
        const termoValor = searchInput ? searchInput.value.trim() : '';

        try {
            let pontos = await window.api.getPontos({
                cidade: 'Porto Velho',
                termo: termoValor || filtroRegiao
            });

            if (currentFilterMaterial && currentFilterMaterial !== 'todos') {
                const matLower = currentFilterMaterial.toLowerCase();
                pontos = pontos.filter(p => 
                    p.materiais && p.materiais.some(m => m.toLowerCase().includes(matLower))
                );
            }

            const endTime = performance.now();
            const elapsedMs = Math.round(endTime - startTime);

            if (resultsCount) {
                resultsCount.textContent = `${pontos.length} ponto${pontos.length !== 1 ? 's' : ''} em Porto Velho - RO`;
            }

            if (searchTiming) {
                searchTiming.textContent = `Tempo de resposta: ${elapsedMs}ms (RNF05: < 3s)`;
            }

            if (pontos.length === 0) {
                pointsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3 class="empty-title">Nenhum ponto encontrado</h3>
                        <p class="empty-desc">Nenhum ponto de coleta atende aos filtros atuais em Porto Velho. Tente limpar os filtros ou selecionar outro tipo de material.</p>
                        <button type="button" id="btn-clear-filters" class="btn btn-outline btn-sm">Limpar Filtros</button>
                    </div>
                `;

                const btnClear = document.getElementById('btn-clear-filters');
                if (btnClear) {
                    btnClear.addEventListener('click', () => {
                        if (searchInput) searchInput.value = '';
                        if (citySelect) citySelect.value = '';
                        currentFilterMaterial = 'todos';
                        filterButtons.forEach(b => b.classList.toggle('active', b.dataset.material === 'todos'));
                        fetchPoints();
                    });
                }
                return;
            }

            pointsGrid.innerHTML = pontos.map(p => `
                <div class="point-card">
                    <div>
                        <div class="point-card-header">
                            <h3 class="point-title">${p.nome}</h3>
                            <span class="city-badge">Porto Velho - RO</span>
                        </div>
                        <p class="point-address">
                            <span>📍</span>
                            <span>${p.endereco}</span>
                        </p>
                        <div class="point-materials-title">Materiais Aceitos:</div>
                        <div class="materials-badges">
                            ${(p.materiais || []).map(m => `
                                <span class="material-badge">${m}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="point-card-footer">
                        <span style="font-size: 0.8rem; color: var(--accent); font-weight: 600;">✓ Posto Ativo</span>
                        <button type="button" class="btn btn-primary btn-sm btn-ver-detalhes" data-id="${p.id_ponto}">
                            Ver Detalhes (UC04)
                        </button>
                    </div>
                </div>
            `).join('');

            pointsGrid.querySelectorAll('.btn-ver-detalhes').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.getAttribute('data-id');
                    openDetailsModal(id);
                });
            });

        } catch (err) {
            console.error('Erro na pesquisa de pontos:', err);
            pointsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3 class="empty-title">Falha na pesquisa</h3>
                    <p class="empty-desc">${err.message}</p>
                </div>
            `;
        }
    }

    async function openDetailsModal(id) {
        const modalOverlay = document.getElementById('modal-details');
        if (!modalOverlay) return;

        try {
            const ponto = await window.api.getPontoById(id);
            if (!ponto) return;

            document.getElementById('modal-point-title').textContent = ponto.nome;
            document.getElementById('modal-point-city').textContent = ponto.cidade + ' - RO';
            document.getElementById('modal-point-address').textContent = ponto.endereco;

            const materialsContainer = document.getElementById('modal-point-materials');
            if (materialsContainer) {
                materialsContainer.innerHTML = (ponto.materiais || []).map(m => `
                    <li style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
                        <span style="color: var(--primary); font-weight: bold;">✔</span>
                        <span>${m}</span>
                    </li>
                `).join('') || '<li>Nenhum material cadastrado</li>';
            }

            const mapsBtn = document.getElementById('modal-maps-link');
            if (mapsBtn) {
                const query = encodeURIComponent(`${ponto.nome}, ${ponto.endereco}`);
                mapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
            }

            modalOverlay.classList.add('active');
        } catch (err) {
            window.api.showToast('Erro ao carregar detalhes do ponto.', 'error');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetchPoints, 250);
        });
    }

    if (citySelect) {
        citySelect.addEventListener('change', fetchPoints);
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilterMaterial = btn.getAttribute('data-material');
            fetchPoints();
        });
    });

    document.querySelectorAll('[data-close-modal]').forEach(b => {
        b.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    await loadCitiesDropdown();
    await fetchPoints();
});
