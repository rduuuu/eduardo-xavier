import pg from 'pg';
import promptSync from 'prompt-sync';

const { Client } = pg;
const prompt = promptSync();

function criarCliente() {
    return new Client({
        host:     'localhost',
        port:     5432,
        user:     'postgres',
        password: 'root',
        database: 'controledeestoque'
    });
}

async function verificarEstoque() {

    const client = criarCliente();
    try {


        await client.connect();
        const resultado = await client.query('SELECT * FROM itens');
        console.log(resultado.rows);

    } catch (erro) {

        console.log('Erro:', erro.message);

    } finally {

        await client.end();

    }
}

async function cadastrarItem() {

    const client = criarCliente();
    try {

        await client.connect();

        console.log('\nCADASTRAR NOVO ITEM\n');

        const nome      = prompt('Nome do item: ');
        const categoria = prompt('Tipo (Utilidade/Ferramenta): ');
        const valorunit = prompt('Preço unitário: ');
        const quant     = prompt('Estoque inicial: ');

        if (!nome || !categoria || !valorunit) {
            console.log('ERRO: Nome, tipo e preço são obrigatórios.');
            return; 
        }

        const resultado = await client.query(
            `INSERT INTO itens (nome, categoria, valorunit, quant)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [nome, categoria, valorunit, quant]
        );

        console.log('\n Item cadastrado com sucesso!');
        console.log(`   ID gerado pelo banco: ${resultado.rows[0].id}`);
        console.log(`   ${resultado.rows[0].nome} adicionado à loja.`);

    } catch (erro) {

        console.log(' Erro ao cadastrar item:', erro.message);

    } finally {

        await client.end();

    }
}

async function atualizarEstoque() {

    const client = criarCliente();
    try {

        await client.connect();

        const lista = await client.query(
            'SELECT id, nome, quant FROM itens ORDER BY nome'
        );

        console.log('\nATUALIZAR ESTOQUE\n');
        lista.rows.forEach(item => {
            console.log(`[${item.id}] ${item.nome} — Estoque atual: ${item.quant}`);
        });

        console.log('');
        const id          = prompt('ID do item: ');
        const novoEstoque = prompt('Novo estoque: ');

        const resultado = await client.query(
            `UPDATE itens
             SET quant = $1
             WHERE id = $2
             RETURNING nome, quant`,
            [novoEstoque, id]
        );

        if (resultado.rows.length === 0) {
            console.log('ERRO: Item não encontrado. Verifique o ID.');
        } else {
            console.log(`\nEstoque atualizado!`);
            console.log(`   ${resultado.rows[0].nome}: ${resultado.rows[0].quant} unidades`);
        }

    } catch (erro) {

        console.log('Erro ao atualizar estoque:', erro.message);

    } finally {

        await client.end();

    }
}

async function removerItem() {

    const client = criarCliente();
    try {

        await client.connect();

        const lista = await client.query(
            'SELECT id, nome, categoria FROM itens ORDER BY id'
        );

        console.log('\nREMOVER ITEM\n');
        lista.rows.forEach(item => {
            console.log(`[${item.id}] ${item.nome} (${item.categoria})`);
        });

        console.log('');
        const id = prompt('ID do item a remover: ');


        const busca = await client.query(
            'SELECT nome FROM itens WHERE id = $1',
            [id]
        );

        if (busca.rows.length === 0) {
            console.log('ERRO: Item não encontrado.');
            return;
        }

        const confirmacao = prompt(
            `!!! Remover "${busca.rows[0].nome}"? Isso não pode ser desfeito. (s/n): `
        );

        if (confirmacao.toLowerCase() !== 's') {
            console.log('Operação cancelada.');
            return;
        }

        await client.query('DELETE FROM itens WHERE id = $1', [id]);

        console.log(`\nSUCESSO: "${busca.rows[0].nome}" removido da loja.`);

    } catch (erro) {

        console.log('Erro ao remover item:', erro.message);

    } finally {

        await client.end();

    }
}

async function menu() {

    const client = criarCliente();
    let rodando = true;

    while (rodando) {

        console.log('\n╔════════════════════════════════════════╗');
        console.log('║       Controle de Estoque              ║');
        console.log('╠════════════════════════════════════════╣');
        console.log('║  1 - Ver itens em estoque              ║');
        console.log('║  2 - Cadastrar novo item               ║');
        console.log('║  3 - Atualizar estoque                 ║');
        console.log('║  4 - Remover item                      ║');
        console.log('║  0 - Fechar a loja                     ║');
        console.log('╚════════════════════════════════════════╝');

        const opcao = prompt('\nEscolha uma opção: ');

        switch (opcao) {
            case '1': await verificarEstoque();      break;
            case '2': await cadastrarItem();    break;
            case '3': await atualizarEstoque(); break;
            case '4': await removerItem();      break;
            case '0':
                rodando = false;
                console.log('\nDesligando Sistema...\n');
                break;
            default:
                console.log('ERRO: Opção inválida. Tente novamente.');
        }
    }
}

menu();
