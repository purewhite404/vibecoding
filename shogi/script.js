const boardElement = document.getElementById('shogi-board');
const senteKomadai = document.getElementById('sente-komadai');
const goteKomadai = document.getElementById('gote-komadai');

// 駒の初期配置データ
const initialBoard = [
    ['香', '桂', '銀', '金', '王', '金', '銀', '桂', '香'],
    ['', '飛', '', '', '', '', '', 角', ''],
    ['歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩'],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''],
    ['歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩', '歩'],
    ['', '角', '', '', '', '', '', 飛', ''],
    ['香', '桂', '銀', '金', '玉', '金', '銀', '桂', '香']
];

// 駒の種類と表示名（例：王と玉）
const pieceMap = {
    '香': '香', '桂': '桂', '銀': '銀', '金': '金', '王': '王', '玉': '玉', '飛': '飛', '角': '角', '歩': '歩',
    '成香': '杏', '成桂': '圭', '成銀': '全', '竜': '竜', '馬': '馬', 'と': 'と'
};

// 盤面を初期化する関数
function initializeBoard() {
    boardElement.innerHTML = ''; // 既存の要素をクリア
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const square = document.createElement('div');
            square.classList.add('square');
            square.dataset.row = r;
            square.dataset.col = c;

            const pieceName = initialBoard[r][c];
            if (pieceName) {
                const piece = document.createElement('div');
                piece.classList.add('piece');
                piece.textContent = pieceMap[pieceName];
                // 先手と後手の駒を区別する
                if (r < 3) { // 上3段は後手の駒
                    piece.classList.add('gote');
                } else if (r > 5) { // 下3段は先手の駒
                    piece.classList.add('sente');
                }
                piece.dataset.pieceType = pieceName; // 駒の種類をデータとして持たせる
                square.appendChild(piece);
            }
            boardElement.appendChild(square);
        }
    }
}

initializeBoard();

// script.js に追記

let selectedSquare = null; // 選択されたマス
let selectedPieceElement = null; // 選択された駒のDOM要素
let currentTurn = 'sente'; // 現在の手番 ('sente' または 'gote')

// 駒の動きの定義（非常に簡略化された例）
// 実際にはもっと複雑なロジックが必要です
const pieceMoves = {
    '歩': {
        'sente': [[-1, 0]], // 先手は上に1マス
        'gote': [[1, 0]]    // 後手は下に1マス
    },
    '香': {
        'sente': (r, c) => {
            const moves = [];
            for (let i = 1; i < 9; i++) {
                if (r - i >= 0) moves.push([r - i, c]);
                else break;
            }
            return moves;
        },
        'gote': (r, c) => {
            const moves = [];
            for (let i = 1; i < 9; i++) {
                if (r + i < 9) moves.push([r + i, c]);
                else break;
            }
            return moves;
        }
    },
    // 他の駒の動きも同様に定義
};

boardElement.addEventListener('click', (event) => {
    const targetSquare = event.target.closest('.square');
    if (!targetSquare) return;

    const row = parseInt(targetSquare.dataset.row);
    const col = parseInt(targetSquare.dataset.col);

    if (selectedSquare) {
        // 駒が選択されている場合、移動を試みる
        const fromRow = parseInt(selectedSquare.dataset.row);
        const fromCol = parseInt(selectedSquare.dataset.col);

        // 移動が有効な場合のみ処理
        if (isValidMove(fromRow, fromCol, row, col)) {
            movePiece(selectedPieceElement, targetSquare);
            toggleTurn();
        }

        // 選択状態を解除
        selectedSquare.classList.remove('selected');
        selectedSquare = null;
        selectedPieceElement = null;
        clearHighlight();
    } else {
        // 駒が選択されていない場合、選択する
        const clickedPiece = targetSquare.querySelector('.piece');
        if (clickedPiece) {
            // 現在の手番の駒のみ選択可能
            if ((currentTurn === 'sente' && clickedPiece.classList.contains('sente')) ||
                (currentTurn === 'gote' && clickedPiece.classList.contains('gote'))) {
                selectedSquare = targetSquare;
                selectedPieceElement = clickedPiece;
                selectedSquare.classList.add('selected');
                highlightPossibleMoves(row, col, clickedPiece.dataset.pieceType);
            }
        }
    }
});

function highlightPossibleMoves(row, col, pieceType) {
    clearHighlight();
    const possibleMoves = getPossibleMoves(row, col, pieceType, currentTurn);
    possibleMoves.forEach(([r, c]) => {
        const targetSquare = document.querySelector(`.square[data-row="${r}"][data-col="${c}"]`);
        if (targetSquare) {
            targetSquare.classList.add('highlight');
        }
    });
}

function clearHighlight() {
    document.querySelectorAll('.square.highlight').forEach(square => {
        square.classList.remove('highlight');
    });
}

function getPossibleMoves(row, col, pieceType, turn) {
    const moves = [];
    // 駒の種類と手番に基づいて移動可能なマスを計算
    // これは非常に簡略化されたロジックで、将棋の全ルールをカバーしていません
    if (pieceType === '歩') {
        const direction = (turn === 'sente') ? -1 : 1;
        if (row + direction >= 0 && row + direction < 9) {
            // 移動先に駒がないか、相手の駒があるかを確認
            const targetSquare = document.querySelector(`.square[data-row="${row + direction}"][data-col="${col}"]`);
            if (targetSquare && !targetSquare.querySelector('.piece')) {
                moves.push([row + direction, col]);
            } else if (targetSquare && targetSquare.querySelector('.piece') && !targetSquare.querySelector('.piece').classList.contains(turn)) {
                // 相手の駒を取る場合
                moves.push([row + direction, col]);
            }
        }
    } else if (pieceType === '香') {
        const direction = (turn === 'sente') ? -1 : 1;
        for (let i = 1; i < 9; i++) {
            const targetRow = row + direction * i;
            if (targetRow >= 0 && targetRow < 9) {
                const targetSquare = document.querySelector(`.square[data-row="${targetRow}"][data-col="${col}"]`);
                if (targetSquare) {
                    const targetPiece = targetSquare.querySelector('.piece');
                    if (targetPiece) {
                        if (!targetPiece.classList.contains(turn)) {
                            // 相手の駒があれば取れる
                            moves.push([targetRow, col]);
                        }
                        // 自分の駒があればそれ以上進めない
                        break;
                    } else {
                        moves.push([targetRow, col]);
                    }
                }
            } else {
                break;
            }
        }
    }
    // 他の駒も同様に実装
    return moves;
}


function isValidMove(fromRow, fromCol, toRow, toCol) {
    // 選択された駒の種類を取得
    const pieceType = selectedPieceElement.dataset.pieceType;

    // 駒の移動ロジック（非常に簡略化されたもの）
    const possibleMoves = getPossibleMoves(fromRow, fromCol, pieceType, currentTurn);
    return possibleMoves.some(([r, c]) => r === toRow && c === toCol);
}

function movePiece(pieceElement, targetSquare) {
    const fromSquare = pieceElement.closest('.square');
    const targetPiece = targetSquare.querySelector('.piece');

    // 打ち歩詰め、二歩などのルールチェックもここで行う
    // 成りの判定
    const pieceType = pieceElement.dataset.pieceType;
    let shouldPromote = false;
    if (pieceType === '歩' || pieceType === '香' || pieceType === '桂' || pieceType === '銀' || pieceType === '角' || pieceType === '飛') {
        const promotionZone = (currentTurn === 'sente') ? [0, 1, 2] : [6, 7, 8];
        if (promotionZone.includes(targetSquare.dataset.row) || promotionZone.includes(fromSquare.dataset.row)) {
            // 成るかどうか尋ねる（今回は自動で成る例）
            shouldPromote = confirm('成りますか？');
        }
    }


    if (targetPiece) {
        // 取った駒を駒台へ移動
        targetSquare.removeChild(targetPiece);
        if (targetPiece.classList.contains('sente')) {
            goteKomadai.appendChild(targetPiece); // 先手の駒が取られたら後手の駒台へ
        } else {
            senteKomadai.appendChild(targetPiece); // 後手の駒が取られたら先手の駒台へ
        }
        // 駒台の駒はクリックイベントを削除し、クラス名を調整するなど
        targetPiece.classList.remove('sente', 'gote');
        targetPiece.classList.add('captured'); // 駒台の駒であることを示す
        targetPiece.style.transform = ''; // 回転を元に戻す
        targetPiece.onclick = null; // クリックできないように
    }

    fromSquare.removeChild(pieceElement);
    targetSquare.appendChild(pieceElement);

    // 成りの処理
    if (shouldPromote) {
        const promotedPieceType = getPromotedPieceType(pieceType);
        if (promotedPieceType) {
            pieceElement.dataset.pieceType = promotedPieceType;
            pieceElement.textContent = pieceMap[promotedPieceType];
        }
    }
}

function getPromotedPieceType(originalPieceType) {
    const promotedMap = {
        '歩': 'と',
        '香': '成香',
        '桂': '成桂',
        '銀': '成銀',
        '角': '馬',
        '飛': '竜'
    };
    return promotedMap[originalPieceType];
}

function toggleTurn() {
    currentTurn = (currentTurn === 'sente') ? 'gote' : 'sente';
    console.log(`現在の手番: ${currentTurn}`);
    // ここで手番の表示を更新するなど
}
