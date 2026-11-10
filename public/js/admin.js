/**
 * EcoLixo - Painel de Administração (admin.js)
 * Casos de Uso: UC05 (Cadastrar ponto) e UC06 (Atualizar ponto)
 * Requisitos: RNF02 (Validação servidor), RNF03 (Apenas Admin)
 */

document.addEventListener('DOMContentLoaded', async () => {
    // RNF03: Garante que apenas Administradores autenticados tenham acesso
    window.auth.requireAdminPage();

    const pointsTableBody = document.getElementById('admin-points-tbody');
    const searchInput = document.getElementById('admin-search-input');
    const btnNewPoint = document.getElementById('btn-new-point');
    const modalForm = document.getElementById('modal-point-form');
    const pointForm = document.getElementById('point-form');
    const modalFormTitle = document.getElementById('modal-form-title');
    const formErrorAlert = document.getElementById('form-error-alert');

    // Estatísticas
    const statTotalPoints = document.getElementById('stat-total-points');
    const statTotalCities = document.getElementById('stat-total-cities');
    const statTotalMaterials = document.getElementById('stat-total-materials');

    let pointsCache = [];

    // Carrega pontos para a tabela do administrador
    async function loadAdminPoints() {
        if (!pointsTableBody) return;
        pointsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 2rem;">
                    <div class="loading-spinner" style="border-top-color: var(--primary); margin: 0 auto 0.5rem auto;"></div>
                    <div>Carregando pontos de coleta...</div>
                </td>
            </tr>
        `;

        try {
            const pontos = await window.api.getPontos();
            pointsCache = pontos;

            updateStats(pontos);
            renderTable(pontos);
        } catch (err) {
            pointsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: var(--danger);">
                        Erro ao carregar dados: ${err.message}
                    </td>
                </tr>
            `;
        }
    }

    function updateStats(pontos) {
        if (statTotalPoints) statTotalPoints.textContent = pontos.length;

        const cidades = new Set(pontos.map(p => p.cidade));
        if (statTotalCities) statTotalCities.textContent = cidades.size;

        const materiais = new Set();
        pontos.forEach(p => {
            (p.materiais || []).forEach(m => materiais.add(m));
        });
        if (statTotalMaterials) statTotalMaterials.textContent = materiais.size;
    }

    function renderTable(pontos) {
        if (!pointsTableBody) return;

        if (pontos.length === 0) {
            pointsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                        Nenhum ponto de coleta cadastrado.
                    </td>
                </tr>
            `;
            return;
        }

        pointsTableBody.innerHTML = pontos.map(p => `
            <tr>
                <td style="font-weight: bold; color: var(--text-muted);">#${p.id_ponto}</td>
                <td>
                    <strong>${p.nome}</strong>
                </td>
                <td>
                    <span class="city-badge">${p.cidade}</span>
                </td>
                <td style="max-width: 250px; font-size: 0.85rem; color: var(--text-secondary);">
                    ${p.endereco}
                </td>
                <td>
                    <div class="materials-badges" style="margin: 0;">
                        ${(p.materiais || []).slice(0, 2).map(m => `<span class="material-badge">${m}</span>`).join('')}
                        ${(p.materiais && p.materiais.length > 2) ? `<span class="material-badge">+${p.materiais.length - 2}</span>` : ''}
                    </div>
                </td>
                <td>
                    <div class="actions-cell">
                        <button type="button" class="btn btn-secondary btn-sm btn-edit-point" data-id="${p.id_ponto}">
                            ✏️ Editar (UC06)
                        </button>
                        <button type="button" class="btn btn-danger btn-sm btn-delete-point" data-id="${p.id_ponto}">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        // Listeners para botões da tabela
        pointsTableBody.querySelectorAll('.btn-edit-point').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });

        pointsTableBody.querySelectorAll('.btn-delete-point').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                confirmDeletePoint(id);
            });
        });
    }

    // Filtro na tabela
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase();
            const filtrados = pointsCache.filter(p =>
                p.nome.toLowerCase().includes(query) ||
                p.cidade.toLowerCase().includes(query) ||
                p.endereco.toLowerCase().includes(query)
            );
            renderTable(filtrados);
        });
    }

    // ==========================================================
    // MODAL DE CADASTRO (UC05 / RF05) & EDIÇÃO (UC06 / RF06)
    // ==========================================================
    function resetForm() {
        if (!pointForm) return;
        pointForm.reset();
        document.getElementById('point-id').value = '';
        if (formErrorAlert) formErrorAlert.style.display = 'none';

        // Desmarca checkboxes
        pointForm.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
    }

    function openCreateModal() {
        resetForm();
        if (modalFormTitle) modalFormTitle.textContent = 'Cadastrar Novo Ponto de Coleta (UC05)';
        if (modalForm) modalForm.classList.add('active');
    }

    async function openEditModal(id) {
        resetForm();
        if (modalFormTitle) modalFormTitle.textContent = 'Atualizar Ponto de Coleta (UC06)';

        try {
            const ponto = await window.api.getPontoById(id);
            if (!ponto) return;

            document.getElementById('point-id').value = ponto.id_ponto;
            document.getElementById('point-nome').value = ponto.nome;
            document.getElementById('point-cidade').value = ponto.cidade;
            document.getElementById('point-endereco').value = ponto.endereco;

            // Marca os materiais aceitos já existentes
            const mats = ponto.materiais || [];
            const checkboxes = pointForm.querySelectorAll('input[type="checkbox"][name="materiais"]');
            const customMats = [];

            checkboxes.forEach(cb => {
                if (mats.includes(cb.value)) {
                    cb.checked = true;
                }
            });

            // Materiais que não correspondem a nenhuma checkbox padrão
            const standardValues = Array.from(checkboxes).map(c => c.value);
            mats.forEach(m => {
                if (!standardValues.includes(m)) {
                    customMats.push(m);
                }
            });

            const extraInput = document.getElementById('point-materiais-extras');
            if (extraInput) extraInput.value = customMats.join(', ');

            if (modalForm) modalForm.classList.add('active');
        } catch (err) {
            window.api.showToast('Erro ao carregar dados do ponto para edição.', 'error');
        }
    }

    if (btnNewPoint) {
        btnNewPoint.addEventListener('click', openCreateModal);
    }

    // Submissão do formulário (UC05 / UC06 / RNF02)
    if (pointForm) {
        pointForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (formErrorAlert) formErrorAlert.style.display = 'none';

            const id = document.getElementById('point-id').value;
            const nome = document.getElementById('point-nome').value.trim();
            const cidade = document.getElementById('point-cidade').value.trim();
            const endereco = document.getElementById('point-endereco').value.trim();

            // Coleta os materiais selecionados
            const materiaisSelecionados = [];
            pointForm.querySelectorAll('input[type="checkbox"][name="materiais"]:checked').forEach(cb => {
                materiaisSelecionados.push(cb.value);
            });

            const extraInput = document.getElementById('point-materiais-extras');
            if (extraInput && extraInput.value.trim()) {
                const extras = extraInput.value.split(',').map(m => m.trim()).filter(Boolean);
                materiaisSelecionados.push(...extras);
            }

            // Validação no cliente
            if (materiaisSelecionados.length === 0) {
                if (formErrorAlert) {
                    formErrorAlert.textContent = 'Selecione ao menos um material aceito para descarte.';
                    formErrorAlert.style.display = 'block';
                }
                return;
            }

            const btnSubmit = pointForm.querySelector('button[type="submit"]');
            const originalText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<div class="loading-spinner"></div> Gravando no banco...';
            btnSubmit.disabled = true;

            try {
                if (id) {
                    // UC06: Atualizar ponto existente (CA06)
                    await window.api.updatePonto(id, {
                        nome,
                        cidade,
                        endereco,
                        materiais: materiaisSelecionados
                    });
                    window.api.showToast('Ponto de coleta atualizado com sucesso no banco de dados!', 'success');
                } else {
                    // UC05: Cadastrar novo ponto (CA05)
                    await window.api.createPonto({
                        nome,
                        cidade,
                        endereco,
                        materiais: materiaisSelecionados
                    });
                    window.api.showToast('Novo ponto de coleta cadastrado e gravado no banco!', 'success');
                }

                if (modalForm) modalForm.classList.remove('active');
                await loadAdminPoints();
            } catch (err) {
                if (formErrorAlert) {
                    formErrorAlert.textContent = err.message || 'Erro ao salvar ponto.';
                    formErrorAlert.style.display = 'block';
                }
            } finally {
                btnSubmit.innerHTML = originalText;
                btnSubmit.disabled = false;
            }
        });
    }

    // Exclusão de ponto
    async function confirmDeletePoint(id) {
        if (!confirm(`Tem certeza que deseja excluir o ponto de coleta #${id}? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            await window.api.deletePonto(id);
            window.api.showToast('Ponto de coleta removido com sucesso.', 'info');
            await loadAdminPoints();
        } catch (err) {
            window.api.showToast(`Erro ao excluir: ${err.message}`, 'error');
        }
    }

    // Fechamento de modal
    document.querySelectorAll('[data-close-modal]').forEach(btn => {
        btn.addEventListener('click', () => {
            if (modalForm) modalForm.classList.remove('active');
        });
    });

    await loadAdminPoints();
});
