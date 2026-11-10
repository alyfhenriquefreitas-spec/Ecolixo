const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticate, requireAdmin } = require('../middleware/auth');

// ==========================================================
// Rota Auxiliar: Lista de cidades disponíveis
// ==========================================================
router.get('/cidades', async (req, res) => {
    try {
        const cidades = await db.getCidades();
        return res.status(200).json({
            sucesso: true,
            cidades
        });
    } catch (err) {
        console.error('Erro ao listar cidades:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro ao buscar cidades.'
        });
    }
});

// ==========================================================
// UC03 / RF03 - Pesquisar pontos cadastrados por cidade
// CA03 / RF03 - Retornar pontos da cidade pesquisada
// RNF05 - Resposta ágil (< 3 segundos)
// ==========================================================
router.get('/', async (req, res) => {
    const inicio = Date.now();
    try {
        const { cidade, termo } = req.query;

        const pontos = await db.getPontos({ cidade, termo });

        const tempoRespostaMs = Date.now() - inicio;

        return res.status(200).json({
            sucesso: true,
            total: pontos.length,
            tempoRespostaMs,
            pontos
        });
    } catch (err) {
        console.error('Erro ao buscar pontos de coleta:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao consultar pontos de coleta.'
        });
    }
});

// ==========================================================
// UC04 / RF04 - Consultar detalhes de um ponto
// CA04 / RF04 - Exibir endereço e materiais aceitos
// ==========================================================
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const ponto = await db.getPontoById(id);

        if (!ponto) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ponto de coleta não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            ponto
        });
    } catch (err) {
        console.error('Erro ao obter detalhes do ponto:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao consultar ponto de coleta.'
        });
    }
});

// ==========================================================
// UC05 / RF05 - Cadastrar ponto de coleta (Administrador)
// CA05 / RF05 - Salvar no banco com dados válidos
// RNF02 - Validação no servidor
// RNF03 - Apenas administradores autenticados
// ==========================================================
router.post('/', authenticate, requireAdmin, async (req, res) => {
    try {
        const { nome, cidade, endereco, materiais } = req.body;

        // RNF02: Validação rigorosa no servidor
        const erros = [];

        if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
            erros.push('O nome do ponto deve conter pelo menos 3 caracteres.');
        }

        if (!cidade || typeof cidade !== 'string' || cidade.trim().length < 2) {
            erros.push('A cidade deve ser informada.');
        }

        if (!endereco || typeof endereco !== 'string' || endereco.trim().length < 5) {
            erros.push('O endereço completo deve ser informado.');
        }

        let listaMateriais = [];
        if (Array.isArray(materiais)) {
            listaMateriais = materiais.filter(m => typeof m === 'string' && m.trim().length > 0);
        } else if (typeof materiais === 'string' && materiais.trim().length > 0) {
            listaMateriais = materiais.split(',').map(m => m.trim()).filter(Boolean);
        }

        if (listaMateriais.length === 0) {
            erros.push('Selecione ou informe ao menos um material aceito para descarte.');
        }

        if (erros.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro de validação nos dados do ponto.',
                erros
            });
        }

        const novoPonto = await db.createPonto({
            nome: nome.trim(),
            cidade: cidade.trim(),
            endereco: endereco.trim(),
            id_admin: req.user.id_usuario,
            materiais: listaMateriais
        });

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Ponto de coleta cadastrado com sucesso no banco de dados!',
            ponto: novoPonto
        });

    } catch (err) {
        console.error('Erro ao cadastrar ponto de coleta:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao cadastrar ponto de coleta.'
        });
    }
});

// ==========================================================
// UC06 / RF06 - Atualizar ponto de coleta (Administrador)
// CA06 / RF06 - Mostrar dados atualizados na consulta
// RNF02 - Validação no servidor
// RNF03 - Apenas administradores autenticados
// ==========================================================
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, cidade, endereco, materiais } = req.body;

        // RNF02: Validação no servidor
        const erros = [];

        if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
            erros.push('O nome do ponto deve conter pelo menos 3 caracteres.');
        }

        if (!cidade || typeof cidade !== 'string' || cidade.trim().length < 2) {
            erros.push('A cidade deve ser informada.');
        }

        if (!endereco || typeof endereco !== 'string' || endereco.trim().length < 5) {
            erros.push('O endereço deve ser informado.');
        }

        let listaMateriais = [];
        if (Array.isArray(materiais)) {
            listaMateriais = materiais.filter(m => typeof m === 'string' && m.trim().length > 0);
        } else if (typeof materiais === 'string' && materiais.trim().length > 0) {
            listaMateriais = materiais.split(',').map(m => m.trim()).filter(Boolean);
        }

        if (listaMateriais.length === 0) {
            erros.push('Selecione ou informe ao menos um material aceito.');
        }

        if (erros.length > 0) {
            return res.status(400).json({
                sucesso: false,
                mensagem: 'Erro de validação ao atualizar ponto.',
                erros
            });
        }

        const pontoAtualizado = await db.updatePonto(id, {
            nome: nome.trim(),
            cidade: cidade.trim(),
            endereco: endereco.trim(),
            materiais: listaMateriais
        });

        if (!pontoAtualizado) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ponto de coleta não encontrado para atualização.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Ponto de coleta atualizado com sucesso!',
            ponto: pontoAtualizado
        });

    } catch (err) {
        console.error('Erro ao atualizar ponto:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao atualizar ponto de coleta.'
        });
    }
});

// ==========================================================
// Exclusão de ponto de coleta (Administrador)
// ==========================================================
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const removido = await db.deletePonto(id);

        if (!removido) {
            return res.status(404).json({
                sucesso: false,
                mensagem: 'Ponto de coleta não encontrado.'
            });
        }

        return res.status(200).json({
            sucesso: true,
            mensagem: 'Ponto de coleta removido com sucesso!'
        });
    } catch (err) {
        console.error('Erro ao deletar ponto:', err);
        return res.status(500).json({
            sucesso: false,
            mensagem: 'Erro interno ao remover ponto de coleta.'
        });
    }
});

module.exports = router;
