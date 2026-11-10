/**
 * EcoLixo - Lógica da Página Inicial (main.js)
 * Focado em Pontos Reais de Porto Velho - RO
 */

document.addEventListener('DOMContentLoaded', async () => {
    const searchForm = document.getElementById('home-search-form');
    const searchInput = document.getElementById('home-search-input');
    const pointsGrid = document.getElementById('home-points-grid');
    const resultsCount = document.getElementById('results-count');
    const cityTagsContainer = document.getElementById('city-tags');

    // Tags com bairros e regiões de Porto Velho
    function loadPortoVelhoTags() {
        if (!cityTagsContainer) return;
        const regioes = [
            { label: '📍 Todos em Porto Velho', termo: 'Porto Velho' },
            { label: 'Bairro Industrial (Prefeitura)', termo: 'Industrial' },
            { label: 'Flodoaldo Pontes Pinto (Shopping / IFRO)', termo: 'Flodoaldo' },
            { label: 'Centro (SEMA)', termo: 'Centro' },
            { label: 'Zona Sul (Jatuarana)', termo: 'Jatuarana' },
            { label: 'Vila Princesa (CATANORTE)', termo: 'Vila Princesa' }
        ];

        let html = '<span>Regiões e Bairros:</span>';
        regioes.forEach(r => {
            html += `<button type="button" class="city-tag" data-termo="${r.termo}">${r.label}</button>`;
        });
        cityTagsContainer.innerHTML = html;

        cityTagsContainer.querySelectorAll('.city-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const termo = tag.getAttribute('data-termo');
                if (searchInput) searchInput.value = termo === 'Porto Velho' ? '' : termo;
                loadPoints({ termo });
            });
        });
    }

    // Carrega e renderiza os cards de pontos de coleta
    async function loadPoints(filters = {}) {
        if (!pointsGrid) return;
        pointsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="loading-spinner" style="border-top-color: var(--primary); width: 32px; height: 32px; margin-bottom: 1rem;"></div>
                <div class="empty-title">Consultando pontos de coleta em Porto Velho...</div>
            </div>
        `;

        try {
            const pontos = await window.api.getPontos(filters);

            if (resultsCount) {
                resultsCount.textContent = `${pontos.length} ponto${pontos.length !== 1 ? 's' : ''} em Porto Velho - RO`;
            }

            if (pontos.length === 0) {
                pointsGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📍</div>
                        <h3 class="empty-title">Nenhum ponto encontrado</h3>
                        <p class="empty-desc">Não encontramos pontos para este termo em Porto Velho. Tente pesquisar por termos como "Shopping", "Prefeitura", "Industrial" ou "Centro".</p>
                        <button type="button" id="btn-reset-search" class="btn btn-outline btn-sm">Ver todos os pontos de Porto Velho</button>
                    </div>
                `;

                const btnReset = document.getElementById('btn-reset-search');
                if (btnReset) {
                    btnReset.addEventListener('click', () => {
                        if (searchInput) searchInput.value = '';
                        loadPoints();
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
                            ${(p.materiais || []).slice(0, 3).map(m => `
                                <span class="material-badge">${m}</span>
                            `).join('')}
                            ${(p.materiais && p.materiais.length > 3) ? `
                                <span class="material-badge" style="background: var(--primary-light); color: var(--primary-dark); font-weight: 700;">+${p.materiais.length - 3}</span>
                            ` : ''}
                        </div>
                    </div>
                    <div class="point-card-footer">
                        <span style="font-size: 0.8rem; color: var(--accent); font-weight: 600;">✓ Ponto Ativo</span>
                        <button type="button" class="btn btn-primary btn-sm btn-ver-detalhes" data-id="${p.id_ponto}">
                            Ver Detalhes
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

        } catch (e) {
            console.error('Erro ao listar pontos:', e);
            pointsGrid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3 class="empty-title">Erro ao carregar dados</h3>
                    <p class="empty-desc">${e.message}</p>
                </div>
            `;
        }
    }

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const val = searchInput ? searchInput.value.trim() : '';
            loadPoints({ termo: val });
        });
    }

    // Modal de Detalhes do Ponto (UC04 / RF04)
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

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
        });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });

    loadPortoVelhoTags();
    await loadPoints();
});
