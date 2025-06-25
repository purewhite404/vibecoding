document.addEventListener('DOMContentLoaded', () => {
    const addEducationButton = document.getElementById('add-education');
    const nameInput = document.getElementById('name');
    const birthdateInput = document.getElementById('birthdate');
    const emailInput = document.getElementById('email');
    const educationEntries = document.getElementById('education-entries');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const skillsInput = document.getElementById('skills');
    const selfPrInput = document.getElementById('self-pr');
    const motivationInput = document.getElementById('motivation');
    const addInternMotivationCheckbox = document.getElementById('add-intern-motivation');
    const internMotivationContainer = document.getElementById('intern-motivation-container');
    const internMotivationInput = document.getElementById('intern-motivation');
    const currentResearchInput = document.getElementById('current-research');

    // プレビュー要素の取得
    const previewName = document.getElementById('preview-name');
    const previewBirthdate = document.getElementById('preview-birthdate');
    const previewEmail = document.getElementById('preview-email');
    const previewPhone = document.getElementById('preview-phone');
    const previewAddress = document.getElementById('preview-address');
    const previewEducation = document.getElementById('preview-education');
    const previewSkills = document.getElementById('preview-skills');
    const previewSelfPr = document.getElementById('preview-self-pr');
    const previewCurrentResearch = document.getElementById('preview-current-research');
    const previewMotivation = document.getElementById('preview-motivation');
    const previewInternMotivation = document.getElementById('preview-intern-motivation');

    // 顔写真関連の要素取得
    const photoUploadInput = document.getElementById('photo-upload');
    const previewPhotoImg = document.getElementById('preview-photo'); // アップロード入力欄の下のプレビュー
    const noPhotoText = document.getElementById('no-photo-text');
    const finalPreviewPhotoImg = document.getElementById('final-preview-photo'); // 最終プレビューセクションの画像

    // 各セクションの親要素（表示/非表示制御用）
    const personalInfoSection = previewName.closest('.preview-section-item');
    const educationSection = previewEducation.closest('.preview-section-item');
    const skillsSection = previewSkills.closest('.preview-section-item');
    const selfPrSection = previewSelfPr.closest('.preview-section-item');
    const motivationSection = previewMotivation.closest('.preview-section-item');
    const internMotivationSection = previewInternMotivation.closest('.preview-section-item');
    const currentResearchSection = previewCurrentResearch.closest('.preview-section-item');

    // PDFダウンロード機能
    const downloadPdfButton = document.getElementById('download-pdf');

    let educationCount = 1; // 初期値が1つあるため

    // 学歴の動的な追加
    addEducationButton.addEventListener('click', () => {
        const newEducationEntry = document.createElement('div');
        newEducationEntry.classList.add('education-entry');
        newEducationEntry.innerHTML = `
            <label for="education-school-${educationCount}">学校名:</label>
            <input type="text" class="education-school" id="education-school-${educationCount}" placeholder="〇〇大学">
            <label for="education-degree-${educationCount}">学部・学科:</label>
            <input type="text" class="education-degree" id="education-degree-${educationCount}" placeholder="△△学部□□学科">
            <label for="education-period-${educationCount}">在学期間:</label>
            <input type="text" class="education-period" id="education-period-${educationCount}" placeholder="20XX年4月 - 20YY年3月">
            <button type="button" class="remove-education">削除</button>
        `;
        educationEntries.appendChild(newEducationEntry);

        newEducationEntry.querySelector('.remove-education').addEventListener('click', (event) => {
            event.target.closest('.education-entry').remove();
            updatePreview();
            saveData();
        });

        // 新しく追加された入力フィールドにもイベントリスナーを設定
        newEducationEntry.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', updatePreview);
        });

        educationCount++;
        updatePreview(); // 新しいフィールドが追加されたらプレビューを更新
        saveData();
    });

    downloadPdfButton.addEventListener('click', async () => { // asyncを追加
        const resumePreview = document.getElementById('resume-preview');

        // まず、一時的にボタンを非表示にする（PDFに含めないため）
        downloadPdfButton.style.display = 'none';
        
        // プレビューセクションのスクロールバーなどを一時的に隠す（PDFの見た目を良くするため）
        // preview-section に overflow: hidden; を一時的に設定するCSSクラスを追加することもできます
        // ここでは簡単に要素のスタイルを直接操作します
        const originalPreviewOverflow = resumePreview.style.overflow;
        resumePreview.style.overflow = 'visible'; // スクロールバーを一時的に非表示に

        // html2canvasを使ってHTML要素をCanvasに変換
        // scale: 履歴書の品質を向上させるためにスケールを上げる
        // useCORS: 外部画像がある場合に必要
        html2canvas(resumePreview, {
            scale: 2, // 2倍の解像度でレンダリング
            useCORS: true,
            logging: false, // コンソールログを非表示
        }).then(canvas => {
            // PDFオブジェクトを生成
            // window.jsPDF は CDN で読み込んだ jsPDF のグローバルオブジェクト
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4'); // 'p': 縦向き, 'mm': 単位ミリメートル, 'a4': A4サイズ

            const imgData = canvas.toDataURL('image/png'); // CanvasをPNG画像データに変換
            const imgWidth = 210; // A4サイズ（横）
            const pageHeight = 297; // A4サイズ（縦）

            const imgHeight = (canvas.height * imgWidth) / canvas.width; // 画像のアスペクト比を保ちつつ高さを計算

            let heightLeft = imgHeight;
            let position = 0; // PDFのY座標

            // PDFに画像を追加
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // 複数ページにわたる場合に対応
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // PDFをダウンロード
            pdf.save('履歴書.pdf');

            // 非表示にしたボタンとオーバーフローを元に戻す
            downloadPdfButton.style.display = 'block';
            resumePreview.style.overflow = originalPreviewOverflow;
        }).catch(error => {
            console.error('PDF生成エラー:', error);
            alert('PDFの生成に失敗しました。');
            // エラーが発生した場合もボタンを元に戻す
            downloadPdfButton.style.display = 'block';
            resumePreview.style.overflow = originalPreviewOverflow;
        });
    });

    const downloadHtmlButton = document.getElementById('download-html');
    downloadHtmlButton.addEventListener('click', () => {
        const resumePreview = document.getElementById('resume-preview');

        // #resume-preview のHTMLコンテンツを取得
        const previewContent = resumePreview.innerHTML;

        // 現在のCSSスタイルを取得（CSSファイルの内容をコピーして新しいウィンドウに適用する）
        let styles = '';
        const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
        stylesheets.forEach(sheet => {
            // style.css の内容を直接読み込むか、新しいウィンドウにリンクさせる
            // 簡単にするため、今回は style.css の内容を直接コピーします
            // 実際の運用では、CSSファイルをサーバから取得して埋め込むか、
            // 新しいウィンドウにも <link> タグを挿入する方が良い場合もあります。
            // 今回は非常にシンプルなアプリなので、CSSの内容を直接取得する方法を試します。
            if (sheet.href.includes('style.css')) {
                // Fetch API を使って style.css の内容を非同期で読み込む
                fetch(sheet.href)
                    .then(response => response.text())
                    .then(cssText => {
                        styles = `<style>${cssText}</style>`;
                        openPrintWindow(previewContent, styles);
                    })
                    .catch(error => {
                        console.error('Failed to load CSS:', error);
                        // CSS読み込み失敗時はCSSなしで開くか、エラーメッセージを表示
                        openPrintWindow(previewContent, '');
                    });
                return; // style.cssを見つけたらループを抜ける
            }
        });

        // CSSが読み込まれるのを待ってから印刷ウィンドウを開く関数
        const openPrintWindow = (content, css) => {
            // 新しいウィンドウを開く
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                alert('ポップアップがブロックされました。ブラウザの設定を確認してください。');
                return;
            }

            // 新しいウィンドウにHTMLコンテンツを書き込む
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="ja">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>履歴書印刷プレビュー</title>
                    ${css}
                    <style>
                        /* 印刷時に不要な要素を非表示にする（例: 印刷ボタン、ヘッダーなど） */
                        @media print {
                            body {
                                margin: 0; /* 印刷時のデフォルト余白をなくす */
                                padding: 0;
                            }
                            /* 必要に応じて、特定の要素を印刷時に非表示にするCSSを追加 */
                        }
                        /* #resume-preview 自体の余白はstyle.cssで設定済みなのでここでは不要 */
                    </style>
                </head>
                <body>
                    <div id="resume-preview" style="box-shadow: none;">
                        ${content}
                    </div>
                    <script>
                        // ページが完全にロードされてから印刷ダイアログを開く
                        window.onload = function() {
                            window.print();
                            // 印刷ダイアログが閉じられた後にウィンドウを閉じる (オプション)
                            // ただし、ブラウザによって動作が異なる場合があります
                            // window.close();
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close(); // ドキュメントの書き込みを終了
        };
    });

    // 顔写真のアップロード処理
    photoUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target.result;
                previewPhotoImg.src = imageUrl;
                finalPreviewPhotoImg.src = imageUrl;

                previewPhotoImg.style.display = 'block';
                finalPreviewPhotoImg.style.display = 'block';
                noPhotoText.style.display = 'none'; // テキストを非表示に

                updatePreview(); // 画像が変更されたらプレビューを更新
                saveData();
            };
            reader.readAsDataURL(file); // ファイルをData URLとして読み込む
        } else {
            // ファイルが選択されなかった場合
            previewPhotoImg.src = '';
            finalPreviewPhotoImg.src = '';
            previewPhotoImg.style.display = 'none';
            finalPreviewPhotoImg.style.display = 'none';
            noPhotoText.style.display = 'block'; // テキストを表示
            updatePreview();
            saveData();
        }
    });

    // データの保存（Save Data）
    const saveData = () => {
        const data = {
            name: document.getElementById('name').value,
            birthdate: document.getElementById('birthdate').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            skills: document.getElementById('skills').value,
            selfPr: document.getElementById('self-pr').value,
            currentResearch: document.getElementById('current-research').value, // 追加
            motivation: document.getElementById('motivation').value,
            addInternMotivationChecked: document.getElementById('add-intern-motivation').checked,
            internMotivation: document.getElementById('intern-motivation').value,
            
            // 学歴のデータを取得
            education: [],
            // .education-entry クラスを持つ各 div をループ
            // ここで input 要素を直接取得しているため、id を使わずに class で取得
            // 削除された要素は含まれない
            ...Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
                school: entry.querySelector('.education-school').value,
                degree: entry.querySelector('.education-degree').value,
                period: entry.querySelector('.education-period').value
            }))
        };
        localStorage.setItem('resumeData', JSON.stringify(data));
        console.log('データを保存しました。');
    };

    // データの読み込み（Load Data）
    const loadData = () => {
        const savedData = localStorage.getItem('resumeData');
        if (savedData) {
            const data = JSON.parse(savedData);
            document.getElementById('name').value = data.name || '';
            document.getElementById('birthdate').value = data.birthdate || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('address').value = data.address || '';
            document.getElementById('skills').value = data.skills || '';
            document.getElementById('self-pr').value = data.selfPr || '';
            document.getElementById('current-research').value = data.currentResearch || ''; // 追加
            document.getElementById('motivation').value = data.motivation || '';
            document.getElementById('add-intern-motivation').checked = data.addInternMotivationChecked || false;
            document.getElementById('intern-motivation').value = data.internMotivation || '';

            // 学歴データの読み込み
            // 既存の学歴エントリーをクリア
            const educationEntriesContainer = document.getElementById('education-entries');
            educationEntriesContainer.innerHTML = '';
            // 保存されたデータに基づいて学歴エントリーを再構築
            if (data.education && data.education.length > 0) {
                data.education.forEach((edu, index) => {
                    const newEducationEntry = document.createElement('div');
                    newEducationEntry.classList.add('education-entry');
                    newEducationEntry.innerHTML = `
                        <label for="education-school-${index}">学校名:</label>
                        <input type="text" class="education-school" id="education-school-${index}" placeholder="〇〇大学" value="${edu.school || ''}">
                        <label for="education-degree-${index}">学部・学科:</label>
                        <input type="text" class="education-degree" id="education-degree-${index}" placeholder="△△学部□□学科" value="${edu.degree || ''}">
                        <label for="education-period-${index}">在学期間:</label>
                        <input type="text" class="education-period" id="education-period-${index}" placeholder="20XX年4月 - 20YY年3月" value="${edu.period || ''}">
                        <button type="button" class="remove-education">削除</button>
                    `;
                    educationEntriesContainer.appendChild(newEducationEntry);

                    // 新しく追加された要素にもイベントリスナーを設定
                    newEducationEntry.querySelector('.remove-education').addEventListener('click', (event) => {
                        event.target.closest('.education-entry').remove();
                        updatePreview();
                        saveData(); // データ削除時も保存
                    });
                    newEducationEntry.querySelectorAll('input').forEach(input => {
                        input.addEventListener('input', () => {
                            updatePreview();
                            saveData(); // データ変更時も保存
                        });
                    });
                });
                // educationCount の更新 (最後のインデックス + 1)
                educationCount = data.education.length;
            } else {
                // 保存された学歴がない場合は、初期の空の学歴エントリーを1つ追加
                const initialEducationEntry = document.createElement('div');
                initialEducationEntry.classList.add('education-entry');
                initialEducationEntry.innerHTML = `
                    <label for="education-school-0">学校名:</label>
                    <input type="text" class="education-school" id="education-school-0" placeholder="〇〇大学">
                    <label for="education-degree-0">学部・学科:</label>
                    <input type="text" class="education-degree" id="education-degree-0" placeholder="△△学部□□学科">
                    <label for="education-period-0">在学期間:</label>
                    <input type="text" class="education-period" id="education-period-0" placeholder="20XX年4月 - 20YY年3月">
                `;
                educationEntriesContainer.appendChild(initialEducationEntry);
                initialEducationEntry.querySelectorAll('input').forEach(input => {
                    input.addEventListener('input', () => {
                        updatePreview();
                        saveData();
                    });
                });
                educationCount = 1; // 初期状態に戻す
            }

            // 顔写真のデータはFileReaderで読み込むため、srcは保存しない。
            // しかし、ファイルが選択されていた状態は維持できないため、再アップロードが必要。
            // （ローカルファイルパスはセキュリティ上の理由でブラウザが取得できないため）
            // アップロードされていない場合はプレビュー非表示
            if (document.getElementById('photo-upload').files.length === 0) {
                 document.getElementById('preview-photo').style.display = 'none';
                 document.getElementById('final-preview-photo').style.display = 'none';
                 document.getElementById('no-photo-text').style.display = 'block';
            } else {
                 document.getElementById('no-photo-text').style.display = 'none';
            }

            console.log('データを読み込みました。');
        } else {
            console.log('保存されたデータがありません。');
            // データがない場合も、初期の学歴エントリーにイベントリスナーを設定
            document.querySelectorAll('.education-entry input').forEach(input => {
                input.addEventListener('input', () => {
                    updatePreview();
                    saveData();
                });
            });
        }
    };

    // 全ての入力フィールドの変更を監視し、プレビューを更新する関数
    function updatePreview() {
        // 個人情報
        previewName.textContent = nameInput.value;
        previewBirthdate.textContent = birthdateInput.value;
        previewEmail.textContent = emailInput.value;
        previewPhone.textContent = phoneInput.value;
        previewAddress.textContent = addressInput.value;

        // 学歴
        let educationHtml = '';
        const educationInputs = document.querySelectorAll('.education-entry');
        educationInputs.forEach(entryDiv => {
            const school = entryDiv.querySelector('.education-school').value;
            const degree = entryDiv.querySelector('.education-degree').value;
            const period = entryDiv.querySelector('.education-period').value;
            if (school || degree || period) {
                educationHtml += `<div><p><strong>${school}</strong></p><p>${degree} (${period})</p></div>`;
            }
        });
        previewEducation.innerHTML = educationHtml;

        // スキル
        previewSkills.innerHTML = `<p>${skillsInput.value.replace(/\n/g, '<br>')}</p>`;

        // 自己PR
        previewSelfPr.innerHTML = `<p>${selfPrInput.value.replace(/\n/g, '<br>')}</p>`;

        // 現在の研究テーマ
        previewCurrentResearch.innerHTML = `<p>${currentResearchInput.value.replace(/\n/g, '<br>')}</p>`;

        // 志望理由
        previewMotivation.innerHTML = `<p>${motivationInput.value.replace(/\n/g, '<br>')}</p>`;

        // インターンで学びたいこと
        if (addInternMotivationCheckbox.checked) {
            internMotivationContainer.style.display = 'block';
            previewInternMotivation.innerHTML = `<p>${internMotivationInput.value.replace(/\n/g, '<br>')}</p>`;
        } else {
            internMotivationContainer.style.display = 'none';
            internMotivationInput.value = ''; // チェックを外したら内容をクリア
            previewInternMotivation.innerHTML = '';
        }

        // 顔写真セクションの表示/非表示を制御
        // 個人情報セクション全体をコントロールしている .personal-info-with-photo があるので、
        // その中の画像要素の表示を制御すれば十分です。
        // 個人情報が何も入力されていなくても写真がある場合は表示したいので、別途チェックします。
        const hasPersonalInfo = nameInput.value || birthdateInput.value || emailInput.value || phoneInput.value || addressInput.value;
        const hasPhoto = photoUploadInput.files.length > 0;

        personalInfoSection.style.display = (hasPersonalInfo || hasPhoto) ? 'flex' : 'none'; // flexに設定

        if (hasPhoto) {
            finalPreviewPhotoImg.style.display = 'block';
        } else {
            finalPreviewPhotoImg.style.display = 'none';
        }

        // 各セクションの表示/非表示を制御
        //personalInfoSection.style.display = (nameInput.value || emailInput.value || phoneInput.value || addressInput.value) ? 'block' : 'none';
        educationSection.style.display = educationHtml ? 'block' : 'none';
        skillsSection.style.display = skillsInput.value ? 'block' : 'none';
        selfPrSection.style.display = selfPrInput.value ? 'block' : 'none';
        currentResearchSection.style.display = currentResearchInput.value ? 'block' : 'none';
        motivationSection.style.display = motivationInput.value ? 'block' : 'none';
        internMotivationSection.style.display = (addInternMotivationCheckbox.checked && internMotivationInput.value) ? 'block' : 'none';
    }

    // 初期ロード時に画像が選択されていないことを確認し、非表示にする
    if (!photoUploadInput.files.length) {
        previewPhotoImg.style.display = 'none';
        finalPreviewPhotoImg.style.display = 'none';
        noPhotoText.style.display = 'block';
    }

    // 全ての入力フィールドにイベントリスナーを設定
    document.querySelectorAll('input:not(#add-intern-motivation), textarea').forEach(input => {
        input.addEventListener('input', () => {
            updatePreview();
            saveData();
        });
    });

    // チェックボックスの変更も監視
    addInternMotivationCheckbox.addEventListener('change', () => {
        updatePreview();
        saveData(); // チェックボックスの変更時に保存
    });

    // 初期ロード時に全てのプレビューを更新
    loadData();
    updatePreview();
});
