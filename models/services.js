const moment = require('moment')
const conexao = require('../infrastructure/connection')
const formatoDataHora = 'YYYY-MM-DD HH:mm:ss'

const padronizaDataHora = (dataHora) => {
    return moment(dataHora, 'DD/MM/YYYY').format(formatoDataHora);
}

const geraDataHoraAtual = () => {
    return moment().format(formatoDataHora);
}

const conexaoFinal = (sql, dados = null, res ) => {
    conexao.query(sql, dados, (erro, resultados) => {
        
        if (!dados) dados = resultados
        
        if(erro){
            res.status(400).json(erro);
        } else {
            res.status(200).json(dados);
        }
    });
}

class Atendimento {
    adiciona(atendimento, res){    
        const dataCriacao = geraDataHoraAtual();
        const dataMoment = padronizaDataHora(atendimento.data);

        const dataEhValida = moment(dataMoment).isSameOrAfter(dataCriacao);
        const clienteEhValido = atendimento.cliente.length >= 5;

        const validacoes = [
            {
                nome: 'data',
                mensagem: 'Data deve ser posterior a data atual',
                valido: dataEhValida
            },
            {
                nome: 'cliente',
                mensagem: 'Nome do cliente deve ter mais de 5 caracteres.',
                valido: clienteEhValido
            }
        ];

        const erros = validacoes.filter(campo => !campo.valido);
        const existemErros = erros.length;

        if(existemErros){
            res.status(400).json(erros)
        } else {
            const atendimentoDatado = {...atendimento, dataCriacao, data: dataMoment}
            const sql = 'INSERT INTO Atendimentos SET ?'
            conexaoFinal(sql, [atendimentoDatado], res);
        }
    }

    lista(res){
        const sql = 'SELECT * FROM Atendimentos';

        conexaoFinal(sql, null, res);
    }

    buscaPorId(id, res){
        const sql = `SELECT * FROM Atendimentos WHERE id=${id}`;

        conexaoFinal(sql, null, res);
    }

    altera(id, valores, res){
        if (valores.data) {
            valores.data = moment(valores.data, 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss');
        }
        const sql = `UPDATE Atendimentos SET ? WHERE id=${id}`

        conexaoFinal(sql, [valores], res);
    }

    delete(id, res){
        const sql = `DELETE FROM Atendimentos WHERE id=${id}`;

        conexaoFinal(sql, [{id}], res);
    }
}

module.exports = new Atendimento; 