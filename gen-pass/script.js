document.addEventListener('DOMContentLoaded', () => {
    const passwordLengthInput = document.getElementById('passwordLength');
    const includeUppercaseCheckbox = document.getElementById('includeUppercase');
    const includeLowercaseCheckbox = document.getElementById('includeLowercase');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeSymbolsCheckbox = document.getElementById('includeSymbols');
    const generateButton = document.getElementById('generateButton');
    const generatedPasswordInput = document.getElementById('generatedPassword');
    const copyButton = document.getElementById('copyButton');
    const messageElement = document.getElementById('message');

    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const symbolChars = '!@#$%^&*()_-+=[]{}|;:,.<>?';

    generateButton.addEventListener('click', generatePassword);
    copyButton.addEventListener('click', copyPassword);

    function generatePassword() {
        const length = parseInt(passwordLengthInput.value);
        let characters = '';
        let generatedPassword = '';

        messageElement.textContent = ''; // メッセージをクリア

        if (includeUppercaseCheckbox.checked) {
            characters += uppercaseChars;
        }
        if (includeLowercaseCheckbox.checked) {
            characters += lowercaseChars;
        }
        if (includeNumbersCheckbox.checked) {
            characters += numberChars;
        }
        if (includeSymbolsCheckbox.checked) {
            characters += symbolChars;
        }

        if (characters.length === 0) {
            messageElement.textContent = '少なくとも1種類の文字タイプを選択してください。';
            generatedPasswordInput.value = '';
            return;
        }

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            generatedPassword += characters[randomIndex];
        }

        generatedPasswordInput.value = generatedPassword;
    }

    function copyPassword() {
        generatedPasswordInput.select();
        generatedPasswordInput.setSelectionRange(0, 99999); // モバイルデバイス用

        try {
            document.execCommand('copy');
            messageElement.textContent = 'パスワードがコピーされました！';
            messageElement.style.color = '#28a745'; // 成功メッセージの色
        } catch (err) {
            messageElement.textContent = 'パスワードのコピーに失敗しました。手動でコピーしてください。';
            messageElement.style.color = '#dc3545'; // エラーメッセージの色
            console.error('Copy command failed:', err);
        }
        setTimeout(() => {
            messageElement.textContent = '';
            messageElement.style.color = '#dc3545'; // 元の色に戻す
        }, 3000); // 3秒後にメッセージを消す
    }

    // 初期生成
    generatePassword();
});
