document.addEventListener('DOMContentLoaded', () => {
    const daysInput = document.getElementById('daysInput');
    const monthsInput = document.getElementById('monthsInput');
    const calculateButton = document.getElementById('calculateButton');
    const resultCard = document.getElementById('result-card'); // IDを'result-card'に変更

    // 曜日を日本語で表示するための配列
    const weekdays = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];

    calculateButton.addEventListener('click', () => {
        const days = parseInt(daysInput.value, 10) || 0; // 日数を取得、数値に変換。未入力なら0
        const months = parseInt(monthsInput.value, 10) || 0; // 月数を取得、数値に変換。未入力なら0

        // 今日の日付を取得 (実行時の日付と時刻を使用)
        const currentDate = new Date();

        // 月数を加算
        currentDate.setMonth(currentDate.getMonth() + months);

        // 日数を加算
        currentDate.setDate(currentDate.getDate() + days);

        // 結果の取得
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // 月は0から始まるため+1
        const day = currentDate.getDate();
        const weekday = weekdays[currentDate.getDay()]; // 曜日を取得

        // 結果をresult-card内の<p>タグに表示
        resultCard.innerHTML = `<p>${year}年 ${month}月 ${day}日 ${weekday}</p>`;
    });

    // アプリロード時に初期結果を表示 (オプション)
    // calculateButton.click(); // これを有効にすると、ロード時に0日後0ヶ月後が表示されます
});
