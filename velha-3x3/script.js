// 1. Variáveis de estado do jogo
let jogadorAtual = 'X';
let tabuleiro = ['', '', '', '', '', '', '', '', ''];
let jogoAtivo = true;

// 2. Mapeamento de todas as combinações possíveis para vencer o jogo (3x3)
// Cada número representa o índice (posição) das casinhas do tabuleiro
const combinacoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas horizontais
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Linhas verticais
    [0, 4, 8], [2, 4, 6]             // Diagonais
];

// 3. Seleção dos elementos do HTML
const celulas = document.querySelectorAll('.cell');

// 4. Função principal disparada no clique de qualquer célula
function celulaClicada(evento) {
    const celulaAlvo = evento.target;
    const indiceClicado = parseInt(celulaAlvo.getAttribute('data-index'));

    // Bloqueia o clique se a casa já estiver ocupada ou se o jogo acabou
    if (tabuleiro[indiceClicado] !== '' || !jogoAtivo) {
        return;
    }

    // Executa a jogada
    fazerJogada(celulaAlvo, indiceClicado);
    
    // Verifica o status do jogo após o movimento
    verificarResultado();
}

// 5. Função que registra a jogada e muda o turno
function fazerJogada(celula, indice) {
    tabuleiro[indice] = jogadorAtual;
    celula.textContent = jogadorAtual;
    
    // Aplica uma cor diferente para o X e para o O no visual
    if (jogadorAtual === 'X') {
        celula.style.color = '#00f3ff'; // Ciano para o X
        celula.style.textShadow = '0 0 10px #00f3ff';
    } else {
        celula.style.color = '#ff007f'; // Rosa para o O
        celula.style.textShadow = '0 0 10px #ff007f';
    }
}

// 6. O "Coração" da lógica: checar se o jogo acabou
function verificarResultado() {
    let rodadaGanhou = false;

    // Passa um "pente fino" por todas as 8 combinações de vitória possíveis
    for (let i = 0; i < combinacoesVitoria.length; i++) {
        const combinacao = combinacoesVitoria[i];
        let a = tabuleiro[combinacao[0]];
        let b = tabuleiro[combinacao[1]];
        let c = tabuleiro[combinacao[2]];

        // Se qualquer uma das 3 posições estiver vazia, pula para a próxima combinação
        if (a === '' || b === '' || c === '') {
            continue;
        }

        // Se as 3 posições tiverem exatamente a mesma letra (X ou O), temos um vencedor!
        if (a === b && b === c) {
            rodadaGanhou = true;
            break;
        }
    }

    // Se alguém ganhou, para o jogo e exibe o alerta
    if (rodadaGanhou) {
        // Como nós alternamos o jogador logo após a jogada, precisamos descobrir quem acabou de jogar
        const vencedor = jogadorAtual; 
        alert(`Fim de jogo! O jogador ${vencedor} venceu!`);
        jogoAtivo = false;
        return;
    }

    // Se não há vencedor, mas todas as casinhas foram preenchidas, deu Velha (Empate)
    let deuVelha = !tabuleiro.includes('');
    if (deuVelha) {
        alert('Deu Velha! O jogo empatou.');
        jogoAtivo = false;
        return;
    }

    // Se ninguém ganhou e não empatou, o jogo continua e passa a vez
    jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
}

// 7. Ativa o ouvinte de clique em cada um dos quadradinhos do tabuleiro
celulas.forEach(celula => {
    celula.addEventListener('click', celulaClicada);
});