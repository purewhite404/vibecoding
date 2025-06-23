document.addEventListener('DOMContentLoaded', () => {
    const barcodeDataInput = document.getElementById('barcodeData');
    const barcodeTypeSelect = document.getElementById('barcodeType');
    const addBarcodeButton = document.getElementById('addBarcodeButton');
    const barcodeList = document.getElementById('barcodeList');
    const errorMessage = document.getElementById('errorMessage');
    const noBarcodesMessage = document.getElementById('noBarcodesMessage');

    // バーコードをリアルタイムで生成
    barcodeDataInput.addEventListener('input', generatePreviewBarcode);
    barcodeTypeSelect.addEventListener('change', generatePreviewBarcode);
    addBarcodeButton.addEventListener('click', addBarcodeToList);

    // 初期化時にプレビューバーコードを生成
    generatePreviewBarcode();

    function generatePreviewBarcode() {
        const data = barcodeDataInput.value.trim();
        const type = barcodeTypeSelect.value;

        errorMessage.textContent = ''; // エラーメッセージをクリア

        if (data === '') {
            // データがない場合はエラーメッセージを表示し、生成は行わない
            errorMessage.textContent = 'バーコードにしたいデータを入力してください。';
            // プレビュー表示用の場所があればクリアする処理を追加することも可能
            return;
        }

        try {
            // JsBarcodeでデータを検証し、エラーがあればキャッチする
            // プレビューとしては、生成しないがエラーは表示したいので、実際には生成しないがバリデーションの目的で利用
            // JsBarcodeの仕様上、直接バリデーション関数がないため、生成を試みることでエラーを検出
            const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            JsBarcode(tempSvg, data, {
                format: type,
                displayValue: false // プレビューなので値は表示しない
            });
            // ここまで来たら有効なデータ
            errorMessage.textContent = ''; // 成功したらエラーメッセージをクリア
        } catch (error) {
            errorMessage.textContent = `入力データまたは種類が不正です: ${error.message}`;
        }
    }

    function addBarcodeToList() {
        const data = barcodeDataInput.value.trim();
        const type = barcodeTypeSelect.value;

        errorMessage.textContent = ''; // エラーメッセージをクリア

        if (data === '') {
            errorMessage.textContent = 'バーコードにしたいデータを入力してください。';
            return;
        }

        try {
            // 新しいバーコードアイテムを作成
            const barcodeItem = document.createElement('div');
            barcodeItem.classList.add('barcode-item');

            const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgElement.id = `barcode-${Date.now()}`; // 一意のIDを付与

            // JsBarcodeでバーコードを生成し、SVG要素に描画
            JsBarcode(svgElement, data, {
                format: type,
                lineColor: "#000",
                width: 2,
                height: 80, // 一覧表示なので少し小さめに
                displayValue: true
            });

            const dataParagraph = document.createElement('p');
            dataParagraph.textContent = `データ: ${data}`;

            const typeParagraph = document.createElement('p');
            typeParagraph.textContent = `種類: ${type}`;

            const removeButton = document.createElement('button');
            removeButton.classList.add('remove-button');
            removeButton.textContent = 'x';
            removeButton.title = 'このバーコードを削除';
            removeButton.addEventListener('click', () => {
                barcodeItem.remove();
                checkNoBarcodesMessage();
            });

            barcodeItem.appendChild(removeButton);
            barcodeItem.appendChild(svgElement);
            barcodeItem.appendChild(dataParagraph);
            barcodeItem.appendChild(typeParagraph);

            barcodeList.prepend(barcodeItem); // 最新のものを上に追加
            noBarcodesMessage.style.display = 'none'; // メッセージを非表示に

            // 入力欄をクリア
            barcodeDataInput.value = '';
            generatePreviewBarcode(); // クリア後にプレビューも更新（エラーメッセージが消える）

        } catch (error) {
            errorMessage.textContent = `バーコードの追加に失敗しました: ${error.message}。データまたは種類を確認してください。`;
            console.error("Barcode generation error:", error);
        }
    }

    function checkNoBarcodesMessage() {
        if (barcodeList.children.length === 1 && barcodeList.children[0].id === 'noBarcodesMessage') {
            // noBarcodesMessage 以外の要素がない場合
            noBarcodesMessage.style.display = 'block';
        } else if (barcodeList.children.length === 0) {
            // 子要素が全くない場合（念のため）
             noBarcodesMessage.style.display = 'block';
        }
    }

    // 初期ロード時にメッセージ表示をチェック
    checkNoBarcodesMessage();
});
